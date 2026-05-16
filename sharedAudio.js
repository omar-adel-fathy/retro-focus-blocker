window.RetroAudio = (() => {
  let ctx;
  let sirenInterval = null;

  function audioCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  async function unlock() {
    const a = audioCtx();
    if (a.state === "suspended") {
      try { await a.resume(); } catch {}
    }
  }

  async function burst(kind = "complete") {
    await unlock();
    const a = audioCtx();
    const now = a.currentTime;
    const master = a.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.exponentialRampToValueAtTime(0.95, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    master.connect(a.destination);

    const freqs = kind === "siren"
      ? [520, 980, 520, 980, 520, 980, 520, 980]
      : kind === "rest"
        ? [440, 660, 880]
        : [880, 660, 440];

    freqs.forEach((f, i) => {
      const t = now + i * 0.2;
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.type = kind === "siren" ? "sawtooth" : "square";
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  async function startSiren() {
    await unlock();
    if (sirenInterval) return;
    burst("siren");
    sirenInterval = setInterval(() => burst("siren"), 1600);
  }

  function stopSiren() {
    if (sirenInterval) clearInterval(sirenInterval);
    sirenInterval = null;
  }

  return { unlock, burst, startSiren, stopSiren };
})();
