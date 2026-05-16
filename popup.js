const $ = id => document.getElementById(id);
let state = {}, settings = {};

function send(type, payload = {}) { return chrome.runtime.sendMessage({ type, ...payload }); }
function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),sec=s%60,h=Math.floor(m/60);return h?`${h}:${String(m%60).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}
function mins(id, fb, min, max){const n=parseInt($(id).value,10);return Math.max(min,Math.min(max,Number.isFinite(n)?n:fb));}

function readSettings(){
  return {
    hardMode:$("hardMode").checked,
    blockDuringRest:$("blockDuringRest").checked,
    openSpotifyOnStart:$("openSpotify").checked,
    presenceGuardAlwaysOn:$("presenceAlways").checked,
    presenceMissingSeconds:mins("presenceMissingSeconds",18,5,90),
    spotifyUrl:$("spotifyUrl").value.trim(),
    blockedSites:$("blockedSites").value.split("\n").map(x=>x.trim()).filter(Boolean)
  };
}

function setForm(s){
  $("hardMode").checked=!!s.hardMode;
  $("blockDuringRest").checked=!!s.blockDuringRest;
  $("openSpotify").checked=!!s.openSpotifyOnStart;
  $("presenceAlways").checked=!!s.presenceGuardAlwaysOn;
  $("presenceMissingSeconds").value=s.presenceMissingSeconds || 18;
  $("spotifyUrl").value=s.spotifyUrl || "";
  $("blockedSites").value=(s.blockedSites||[]).join("\n");
}

function label(m){return m==="focus"?"LOCKED IN":m==="rest"?"REST TIMER":m==="restPrompt"?"REST SUGGESTED":m==="bioBreak"?"2M BREAK":"READY";}
function sub(){return state.mode==="focus"?"Blocked sites are locked.":state.mode==="rest"?"Resting.":state.mode==="bioBreak"?"Water/bathroom only.":state.mode==="restPrompt"?`Suggested rest: ${state.suggestedRestMins||5}m.`:"Choose a timer."; }

function render(){
  $("statusText").textContent=label(state.mode);
  $("subStatus").textContent=sub();
  const running=["focus","rest","bioBreak"].includes(state.mode)&&state.endAt&&Date.now()<state.endAt;
  $("stopBtn").disabled=!running||!!settings.hardMode;
  $("bioBreakBtn").disabled=state.mode!=="focus";
  $("startRestBtn").disabled=state.mode==="focus"||state.mode==="bioBreak";
  if(!running){$("countdown").textContent=state.mode==="restPrompt"?`${state.suggestedRestMins||5}m`:"--:--";$("meterFill").style.width="0%";return;}
  const left=state.endAt-Date.now(), total=Math.max(1,state.endAt-state.startAt);
  $("countdown").textContent=fmt(left);
  $("meterFill").style.width=`${Math.min(100,Math.max(0,(total-left)/total*100))}%`;
}

async function refresh(){
  const r=await send("GET_STATE"); if(!r.ok) throw new Error(r.error);
  state=r.state; settings=r.settings; setForm(settings); render();
}
async function save(){
  const r=await send("SAVE_SETTINGS",{settings:readSettings()}); if(r.ok){state=r.state;settings=r.settings;render();}
}
async function startFocus(n){
  const r=await send("START_FOCUS",{durationMins:n,settings:readSettings()}); if(r.ok){state=r.state;settings=r.settings;render();window.close();}
}
async function startRest(){
  const r=await send("START_REST",{restMins:mins("restMins",state.suggestedRestMins||5,1,60)}); if(r.ok){state=r.state;settings=r.settings;render();}
}

document.querySelectorAll("[data-mins]").forEach(b=>b.onclick=e=>{e.preventDefault();startFocus(parseInt(b.dataset.mins,10));});
$("startCustom").onclick=e=>{e.preventDefault();startFocus(mins("customMins",45,1,480));};
$("customMins").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();startFocus(mins("customMins",45,1,480));}};
$("saveBtn").onclick=save;
$("stopBtn").onclick=async()=>{const r=await send("STOP_SESSION"); if(r.ok&&!r.blocked){state=r.state;settings=r.settings;render();}};
$("startRestBtn").onclick=startRest;
$("bioBreakBtn").onclick=async()=>{const r=await send("START_BIO_BREAK"); if(r.ok&&!r.blocked){state=r.state;settings=r.settings;render();}};
$("presenceBtn").onclick=()=>send("OPEN_PRESENCE_GUARD");

refresh().catch(e=>{$("statusText").textContent="ERROR";$("subStatus").textContent=String(e.message||e);});
setInterval(()=>{render(); if(state.endAt&&Date.now()>=state.endAt) refresh().catch(()=>{});},1000);
