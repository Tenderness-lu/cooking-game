// Sizzle & Serve — procedural sound with WebAudio. No audio files: every
// effect is an oscillator or filtered noise built at runtime, and the music
// is a tiny step sequencer. Created lazily on the first user gesture so
// browsers allow it; M or the speaker button toggles mute.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.sizzleNodes = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
    if (muted) this.stopSizzle();
  }

  tone(freq, dur, type = 'sine', vol = 0.2, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noiseBurst(dur = 0.08, vol = 0.25, filterFreq = 1800) {
    if (!this.ctx || this.muted) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
  }

  pickup() { this.tone(520, 0.07, 'triangle', 0.18); }
  place() { this.tone(340, 0.06, 'triangle', 0.15); this.tone(680, 0.05, 'sine', 0.1, 0.03); }
  chop() { this.noiseBurst(0.07, 0.3, 2400); this.tone(180, 0.05, 'square', 0.08); }
  chopDone() { this.tone(660, 0.08, 'triangle', 0.18); this.tone(880, 0.1, 'triangle', 0.15, 0.07); }
  ding() { this.tone(880, 0.12, 'sine', 0.22); this.tone(1318, 0.22, 'sine', 0.2, 0.1); }
  coin() { this.tone(988, 0.08, 'square', 0.1); this.tone(1319, 0.14, 'square', 0.1, 0.07); }
  buzz() { this.tone(140, 0.25, 'sawtooth', 0.18); this.tone(110, 0.3, 'sawtooth', 0.15, 0.05); }
  tick() { this.tone(1000, 0.04, 'square', 0.06); }
  dayEnd() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.18, i * 0.12)); }

  startSizzle() {
    if (!this.ctx || this.muted || this.sizzleNodes) return;
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.045;
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    this.sizzleNodes = { src, gain };
  }

  stopSizzle() {
    if (this.sizzleNodes) {
      try { this.sizzleNodes.src.stop(); } catch (_) { /* already stopped */ }
      this.sizzleNodes = null;
    }
  }

  // A cheerful 16-step loop: walking bass plus a plucked melody.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const bass = [131, 0, 165, 0, 196, 0, 165, 0, 131, 0, 165, 0, 220, 196, 165, 147];
    const lead = [523, 0, 659, 784, 0, 659, 523, 0, 587, 0, 698, 880, 784, 659, 587, 523];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const i = this.musicStep % 16;
      if (bass[i]) this.tone(bass[i], 0.16, 'triangle', 0.12);
      if (lead[i]) this.tone(lead[i], 0.14, 'sine', 0.07);
      if (i % 4 === 0) this.noiseBurst(0.03, 0.04, 6000);
      this.musicStep++;
    }, 150);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
