const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const statusEl = document.getElementById("guardStatus");
const textEl = document.getElementById("presenceText");
const scoresEl = document.getElementById("scores");
const overlay = document.getElementById("sirenOverlay");

let started = false;
let detector = null;
let lastFrame = null;
let calibratedFrame = null;
let lastPresentAt = Date.now();
let lastAlertAt = 0;
let sirenOn = false;
let settings = {};
let state = {};
let autoCalibrated = false;

function send(type, payload = {}) { return chrome.runtime.sendMessage({ type, ...payload }); }
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}

async function loadState() {
  const r = await send("GET_STATE");
  if (r && r.ok) {
    state = r.state || {};
    settings = r.settings || {};
    document.getElementById("alwaysOn").checked = !!settings.presenceGuardAlwaysOn;
    document.getElementById("missingSeconds").value = settings.presenceMissingSeconds || 18;
  }
}

async function saveGuardSettings() {
  settings.presenceGuardAlwaysOn = document.getElementById("alwaysOn").checked;
  settings.presenceMissingSeconds = clamp(parseInt(document.getElementById("missingSeconds").value,10)||18,5,90);
  await send("SAVE_SETTINGS", { settings });
}

function grayFrame() {
  canvas.width = 160; canvas.height = 120;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const g = new Uint8Array(canvas.width * canvas.height);
  let mean = 0;
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    const y = (rgba[i] * 0.299 + rgba[i+1] * 0.587 + rgba[i+2] * 0.114) | 0;
    g[j] = y; mean += y;
  }
  mean /= g.length;
  return { g, mean };
}

function avgDiff(a, b) {
  if (!a || !b || a.length !== b.length) return 255;
  let d = 0;
  for (let i = 0; i < a.length; i += 3) d += Math.abs(a[i] - b[i]);
  return d / (a.length / 3);
}

function calcMotion(current) {
  const motion = lastFrame ? avgDiff(current.g, lastFrame) : 999;
  lastFrame = current.g.slice();
  return motion;
}

function calcMatch(current) {
  if (!calibratedFrame) return 0;
  const diff = avgDiff(current.g, calibratedFrame);
  return clamp(1 - diff / 58, 0, 1);
}

async function detectFace() {
  if (!detector) return false;
  try {
    const faces = await detector.detect(video);
    return faces && faces.length > 0;
  } catch {
    return false;
  }
}

function setSiren(on, reason = "") {
  if (on && !sirenOn) {
    sirenOn = true;
    overlay.classList.add("active");
    RetroAudio.startSiren().catch(() => {});
    send("PRESENCE_ALERT", { reason }).catch(() => {});
  }
  if (!on && sirenOn) {
    sirenOn = false;
    overlay.classList.remove("active");
    RetroAudio.stopSiren();
  }
}

async function calibrate() {
  if (!started || video.readyState < 2) return;
  const f = grayFrame();
  calibratedFrame = f.g.slice();
  autoCalibrated = true;
  lastPresentAt = Date.now();
  setSiren(false);
  statusEl.textContent = "Calibrated to your study position.";
  textEl.textContent = "CALIBRATED";
}

async function startGuard() {
  await RetroAudio.unlock().catch(() => {});
  await loadState();

  try {
    if ("FaceDetector" in window) detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
  } catch { detector = null; }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    started = true;
    lastPresentAt = Date.now();
    statusEl.textContent = detector ? "Guard online: face + body/motion hybrid." : "Guard online: body/motion hybrid.";
    textEl.textContent = "ONLINE";
    setTimeout(calibrate, 1800);
  } catch (err) {
    statusEl.textContent = "Camera failed: " + (err.message || err);
    textEl.textContent = "ERROR";
  }
}

async function tick() {
  await loadState().catch(() => {});
  if (!started || video.readyState < 2) return;

  const alwaysOn = !!settings.presenceGuardAlwaysOn;
  const focusMode = state.mode === "focus";
  const armed = alwaysOn || focusMode;

  const current = grayFrame();
  const motion = calcMotion(current);
  const match = calcMatch(current);
  const face = await detectFace();

  if (!autoCalibrated && Date.now() - lastPresentAt > 2000) await calibrate();

  const cameraBlocked = current.mean < 8;
  const strongMotion = motion > 3.0 && motion < 90;
  const sceneMatch = match > 0.42;
  const present = !cameraBlocked && (face || sceneMatch || strongMotion);

  if (present) {
    lastPresentAt = Date.now();
    if (sirenOn) setSiren(false);
  }

  const missingFor = Math.round((Date.now() - lastPresentAt) / 1000);
  const missingLimit = clamp(Number(settings.presenceMissingSeconds || 18), 5, 90);

  scoresEl.textContent = `face: ${face ? "yes" : "no"} | motion: ${motion.toFixed(1)} | match: ${Math.round(match*100)}% | missing: ${missingFor}s`;

  if (!armed) {
    statusEl.textContent = "Guard watching, siren standby. Enable always-on or start focus.";
    textEl.textContent = present ? "PRESENT" : "WATCHING";
    setSiren(false);
    return;
  }

  if (present) {
    statusEl.textContent = "Presence OK. Small head movement is accepted.";
    textEl.textContent = face ? "FACE OK" : (sceneMatch ? "BODY OK" : "MOTION OK");
    return;
  }

  if (cameraBlocked) {
    statusEl.textContent = "Camera looks blocked/dark.";
    textEl.textContent = "CAM BLOCKED";
  } else {
    statusEl.textContent = `No reliable presence for ${missingFor}s. Siren at ${missingLimit}s.`;
    textEl.textContent = "MISSING";
  }

  if ((cameraBlocked && missingFor > 5) || missingFor >= missingLimit) {
    setSiren(true, cameraBlocked ? "Camera is blocked or dark." : "Presence missing from camera guard.");
  }
}

document.getElementById("startCam").onclick = startGuard;
document.getElementById("calibrate").onclick = calibrate;
document.getElementById("testSiren").onclick = () => setSiren(true, "Manual siren test.");
document.getElementById("stopSiren").onclick = () => setSiren(false);
document.getElementById("imBack").onclick = async () => { setSiren(false); await calibrate(); };
document.getElementById("alwaysOn").onchange = saveGuardSettings;
document.getElementById("missingSeconds").onchange = saveGuardSettings;

window.addEventListener("beforeunload", e => {
  if (started && !sirenOn) {
    e.preventDefault();
    e.returnValue = "Camera guard is running.";
  }
});

loadState();
setInterval(() => tick().catch(() => {}), 1200);
