// Conch and temple bell synthesized with Web Audio (no recordings, so nothing to license).
let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new AudioContext());

export function ringBell(strikes = 3) {
  const c = ac();
  for (let s = 0; s < strikes; s++) {
    const t0 = c.currentTime + s * 0.9;
    [[880, 0.35], [1320, 0.18], [2210, 0.1], [2970, 0.06]].forEach(([f, g]) => {
      const o = c.createOscillator(), v = c.createGain();
      o.frequency.value = f!; v.gain.setValueAtTime(0, t0); v.gain.linearRampToValueAtTime(g!, t0 + 0.005); v.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);
      o.connect(v).connect(c.destination); o.start(t0); o.stop(t0 + 2.7);
    });
  }
}

export function blowConch(seconds = 3.5) {
  const c = ac(), t0 = c.currentTime;
  const o = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), v = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
  o.type = "sawtooth"; o2.type = "sawtooth"; o.frequency.value = 233; o2.frequency.value = 466;
  lfo.frequency.value = 5; lg.gain.value = 3; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  o.frequency.setValueAtTime(220, t0); o.frequency.linearRampToValueAtTime(233, t0 + 0.6);
  lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 4;
  v.gain.setValueAtTime(0, t0); v.gain.linearRampToValueAtTime(0.18, t0 + 0.8); v.gain.setValueAtTime(0.18, t0 + seconds - 0.8); v.gain.linearRampToValueAtTime(0, t0 + seconds);
  o.connect(lp); o2.connect(lp); lp.connect(v).connect(c.destination);
  [o, o2, lfo].forEach((x) => { x.start(t0); x.stop(t0 + seconds); });
}
