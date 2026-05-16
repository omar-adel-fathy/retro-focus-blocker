const time=document.getElementById("time"), blank=document.getElementById("blank");
function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),sec=s%60;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}
async function tick(){const d=await chrome.storage.local.get(["focusState"]);const st=d.focusState||{};if(!["focus","rest","bioBreak"].includes(st.mode)||!st.endAt||Date.now()>=st.endAt){time.textContent="DONE";return;}time.textContent=`${st.mode.toUpperCase()} ${fmt(st.endAt-Date.now())}`;}
blank.onclick=()=>location.href="about:blank"; tick(); setInterval(tick,1000);
