const $=id=>document.getElementById(id); let state={},settings={},played=false;
function send(type,p={}){return chrome.runtime.sendMessage({type,...p})}
function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),sec=s%60;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`}
function param(){return new URLSearchParams(location.search).get("mode")||""}
async function refresh(){const r=await send("GET_STATE"); if(r.ok){state=r.state;settings=r.settings;render();}}
function render(){const mode=state.mode||"idle", q=param(), running=mode==="rest"&&state.endAt&&Date.now()<state.endAt;
 if(mode==="restPrompt"||q==="suggest"){const m=state.suggestedRestMins||5;$("mode").textContent="FOCUS COMPLETE";$("headline").textContent="Take a real rest.";$("timer").textContent=`${m}m`;$("msg").textContent=`Suggested recovery: ${m} minutes.`;$("restMins").value=m;if(!played){played=true;RetroAudio.burst("complete").catch(()=>{})}return;}
 if(running){$("mode").textContent="REST ACTIVE";$("headline").textContent="Do not scroll.";$("timer").textContent=fmt(state.endAt-Date.now());$("msg").textContent=settings.blockDuringRest?"Social is still blocked.":"Rest timer running.";return;}
 $("mode").textContent=q==="breakDone"?"BREAK OVER":"REST COMPLETE";$("headline").textContent="Back to study.";$("timer").textContent="DONE";$("msg").textContent="Start the next block.";if(!played){played=true;RetroAudio.startSiren().catch(()=>{});setTimeout(()=>RetroAudio.stopSiren(),5000)}}
$("startRest").onclick=async()=>{await RetroAudio.burst("rest").catch(()=>{});await send("START_REST",{restMins:parseInt($("restMins").value,10)||5});refresh();}
$("study25").onclick=async()=>{await send("START_FOCUS",{durationMins:25,settings});window.close();}
$("sound").onclick=()=>RetroAudio.burst("siren").catch(()=>{});
$("close").onclick=()=>{RetroAudio.stopSiren();window.close();};
refresh(); setInterval(refresh,1000);
