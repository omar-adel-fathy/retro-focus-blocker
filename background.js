const DEFAULT_BLOCKED_SITES = [
  "studio.youtube.com", "youtube.com", "instagram.com", "tiktok.com",
  "linkedin.com", "facebook.com", "x.com", "twitter.com", "reddit.com",
  "discord.com", "discord.gg", "web.whatsapp.com", "whatsapp.com"
];

const DEFAULT_SETTINGS = {
  blockedSites: DEFAULT_BLOCKED_SITES,
  spotifyUrl: "https://open.spotify.com/collection/tracks",
  openSpotifyOnStart: true,
  hardMode: false,
  blockDuringRest: true,
  bioBreakMins: 2,
  presenceGuardAlwaysOn: true,
  presenceMissingSeconds: 18
};

const DEFAULT_STATE = {
  mode: "idle",
  startAt: null,
  endAt: null,
  durationMins: null,
  focusStartAt: null,
  focusEndAt: null,
  focusDurationMins: null,
  suggestedRestMins: null,
  originalFocusEndAt: null
};

const RULE_ID_START = 1000;

function cleanDomain(input) {
  let value = String(input || "").trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split("?")[0];
  value = value.replace(/^\*\./, "");
  return value.includes(".") ? value : null;
}

async function getSettings() {
  const d = await chrome.storage.local.get(["focusSettings"]);
  return { ...DEFAULT_SETTINGS, ...(d.focusSettings || {}) };
}

async function getState() {
  const d = await chrome.storage.local.get(["focusState"]);
  return { ...DEFAULT_STATE, ...(d.focusState || {}) };
}

async function setState(state) {
  await chrome.storage.local.set({ focusState: state });
}

function suggestRestMins(focusMins) {
  const m = Number(focusMins || 25);
  if (m >= 120) return 20;
  if (m >= 90) return 15;
  if (m >= 50) return 10;
  return 5;
}

function shouldBlock(state, settings) {
  if (state.mode === "focus" || state.mode === "bioBreak") return true;
  if (state.mode === "rest") return Boolean(settings.blockDuringRest);
  return false;
}

async function clearRules() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  const ids = rules.map(r => r.id);
  if (ids.length) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ids });
}

async function applyRules(active, sites) {
  await clearRules();
  if (!active) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }

  const domains = [...new Set((sites || []).map(cleanDomain).filter(Boolean))];
  const addRules = domains.map((domain, i) => ({
    id: RULE_ID_START + i,
    priority: 1,
    action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
    condition: { urlFilter: `||${domain}^`, resourceTypes: ["main_frame"] }
  }));

  if (addRules.length) await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
  await chrome.action.setBadgeText({ text: "ON" });
  await chrome.action.setBadgeBackgroundColor({ color: "#111111" });
}

async function notify(title, message, id) {
  try {
    await chrome.notifications.create(id || String(Date.now()), {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title,
      message,
      priority: 2
    });
  } catch {}
}

async function openWindow(path, width = 470, height = 650) {
  try {
    await chrome.windows.create({
      url: chrome.runtime.getURL(path),
      type: "popup",
      focused: true,
      width,
      height
    });
  } catch {}
}

async function startFocus(durationMins, settingsPatch = {}) {
  const settings = { ...(await getSettings()), ...settingsPatch };
  const mins = Math.max(1, Math.min(480, parseInt(durationMins, 10) || 25));
  const now = Date.now();
  const endAt = now + mins * 60000;
  const state = {
    ...DEFAULT_STATE,
    mode: "focus",
    startAt: now,
    endAt,
    durationMins: mins,
    focusStartAt: now,
    focusEndAt: endAt,
    focusDurationMins: mins
  };

  await chrome.storage.local.set({ focusSettings: settings, focusState: state });
  await applyRules(true, settings.blockedSites);
  chrome.alarms.clearAll();
  chrome.alarms.create("focusEnd", { when: endAt });

  if (settings.openSpotifyOnStart && settings.spotifyUrl) {
    try { await chrome.tabs.create({ url: settings.spotifyUrl, active: false }); } catch {}
  }

  return { state, settings };
}

async function completeFocus() {
  const settings = await getSettings();
  const old = await getState();
  const restMins = suggestRestMins(old.focusDurationMins || old.durationMins || 25);
  const state = { ...DEFAULT_STATE, mode: "restPrompt", suggestedRestMins: restMins };
  await setState(state);
  chrome.alarms.clearAll();
  await applyRules(false, settings.blockedSites);
  await notify("Focus complete", `Suggested rest: ${restMins} minutes.`, "focus-complete");
  await openWindow("rest.html?mode=suggest", 470, 650);
  return { state, settings };
}

async function startRest(restMins) {
  const settings = await getSettings();
  const mins = Math.max(1, Math.min(60, parseInt(restMins, 10) || 5));
  const now = Date.now();
  const state = { ...DEFAULT_STATE, mode: "rest", startAt: now, endAt: now + mins * 60000, durationMins: mins };
  await setState(state);
  chrome.alarms.clearAll();
  chrome.alarms.create("restEnd", { when: state.endAt });
  await applyRules(Boolean(settings.blockDuringRest), settings.blockedSites);
  await notify("Rest started", `${mins} minute rest. No doomscrolling.`, "rest-started");
  return { state, settings };
}

async function completeRest() {
  const settings = await getSettings();
  const state = { ...DEFAULT_STATE };
  await setState(state);
  chrome.alarms.clearAll();
  await applyRules(false, settings.blockedSites);
  await notify("Rest complete", "Back to study.", "rest-complete");
  await openWindow("rest.html?mode=done", 470, 600);
  return { state, settings };
}

async function startBioBreak() {
  const settings = await getSettings();
  const old = await getState();
  if (old.mode !== "focus" || !old.endAt) return { blocked: true, reason: "No focus session running.", state: old, settings };

  const mins = Math.max(1, Math.min(10, parseInt(settings.bioBreakMins, 10) || 2));
  const now = Date.now();
  const extendedEnd = old.endAt + mins * 60000;
  const state = {
    ...old,
    mode: "bioBreak",
    startAt: now,
    endAt: now + mins * 60000,
    durationMins: mins,
    originalFocusEndAt: extendedEnd,
    focusEndAt: extendedEnd
  };

  await setState(state);
  chrome.alarms.clearAll();
  chrome.alarms.create("bioBreakEnd", { when: state.endAt });
  await applyRules(true, settings.blockedSites);
  await notify("2-minute break started", "Water/bathroom only. Blockers stay on.", "bio-break-start");
  return { state, settings };
}

async function completeBioBreak() {
  const settings = await getSettings();
  const old = await getState();
  const now = Date.now();
  const resumeEndAt = Math.max(now + 1000, old.originalFocusEndAt || old.focusEndAt || now + 25 * 60000);
  const state = {
    ...old,
    mode: "focus",
    startAt: old.focusStartAt || now,
    endAt: resumeEndAt,
    durationMins: old.focusDurationMins || 25,
    focusEndAt: resumeEndAt,
    originalFocusEndAt: null
  };

  await setState(state);
  chrome.alarms.clearAll();
  chrome.alarms.create("focusEnd", { when: resumeEndAt });
  await applyRules(true, settings.blockedSites);
  await notify("Break over", "Back to the chair.", "bio-break-end");
  await openWindow("rest.html?mode=breakDone", 470, 580);
  return { state, settings };
}

async function stopSession(force = false) {
  const settings = await getSettings();
  const state = await getState();
  if (!force && settings.hardMode && ["focus", "bioBreak", "rest"].includes(state.mode)) {
    return { blocked: true, state, settings };
  }

  const next = { ...DEFAULT_STATE };
  await setState(next);
  chrome.alarms.clearAll();
  await applyRules(false, settings.blockedSites);
  return { state: next, settings };
}

async function ensureReady() {
  const data = await chrome.storage.local.get(["focusSettings", "focusState"]);
  if (!data.focusSettings) await chrome.storage.local.set({ focusSettings: DEFAULT_SETTINGS });
  if (!data.focusState) await chrome.storage.local.set({ focusState: DEFAULT_STATE });

  const state = await getState();
  const settings = await getSettings();

  if (state.endAt && Date.now() >= state.endAt) {
    if (state.mode === "focus") return completeFocus();
    if (state.mode === "rest") return completeRest();
    if (state.mode === "bioBreak") return completeBioBreak();
  }

  chrome.alarms.clearAll();
  if (state.mode === "focus" && state.endAt) chrome.alarms.create("focusEnd", { when: state.endAt });
  if (state.mode === "rest" && state.endAt) chrome.alarms.create("restEnd", { when: state.endAt });
  if (state.mode === "bioBreak" && state.endAt) chrome.alarms.create("bioBreakEnd", { when: state.endAt });
  await applyRules(shouldBlock(state, settings), settings.blockedSites);
}

chrome.runtime.onInstalled.addListener(ensureReady);
chrome.runtime.onStartup.addListener(ensureReady);

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "focusEnd") completeFocus();
  if (alarm.name === "restEnd") completeRest();
  if (alarm.name === "bioBreakEnd") completeBioBreak();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "GET_STATE") {
      const state = await getState();
      if (state.endAt && Date.now() >= state.endAt) {
        if (state.mode === "focus") return sendResponse({ ok: true, ...(await completeFocus()) });
        if (state.mode === "rest") return sendResponse({ ok: true, ...(await completeRest()) });
        if (state.mode === "bioBreak") return sendResponse({ ok: true, ...(await completeBioBreak()) });
      }
      return sendResponse({ ok: true, state, settings: await getSettings() });
    }

    if (message.type === "START_FOCUS") return sendResponse({ ok: true, ...(await startFocus(message.durationMins, message.settings || {})) });
    if (message.type === "START_REST") return sendResponse({ ok: true, ...(await startRest(message.restMins)) });
    if (message.type === "START_BIO_BREAK") return sendResponse({ ok: true, ...(await startBioBreak()) });
    if (message.type === "STOP_SESSION") return sendResponse({ ok: true, ...(await stopSession(Boolean(message.force))) });

    if (message.type === "SAVE_SETTINGS") {
      const settings = { ...(await getSettings()), ...(message.settings || {}) };
      await chrome.storage.local.set({ focusSettings: settings });
      const state = await getState();
      await applyRules(shouldBlock(state, settings), settings.blockedSites);
      return sendResponse({ ok: true, state, settings });
    }

    if (message.type === "OPEN_PRESENCE_GUARD") {
      await openWindow("presence.html", 520, 760);
      return sendResponse({ ok: true, state: await getState(), settings: await getSettings() });
    }

    if (message.type === "PRESENCE_ALERT") {
      await notify("SIREN: You are missing", message.reason || "Get back to the chair.", "presence-alert");
      return sendResponse({ ok: true });
    }

    sendResponse({ ok: false, error: "Unknown message" });
  })().catch(err => sendResponse({ ok: false, error: String(err.message || err) }));

  return true;
});

ensureReady();
