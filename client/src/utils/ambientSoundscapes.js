/**
 * Procedural Web Audio Ambient Soundscapes (Zero external audio file dependencies)
 * Generates Rain, Brown Noise (Deep Focus), Ocean Waves, and Lo-Fi Chords directly in browser memory.
 */

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = {
      rain: null,
      waves: null,
      brown: null,
      lofi: null,
    };
    this.lofiInterval = null;
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Generate pink/white noise buffer
  createNoiseBuffer(type = "pink", seconds = 4) {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "white") {
        data[i] = white * 0.3;
      } else if (type === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      } else if (type === "brown") {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }
    }
    return buffer;
  }

  // 1. Gentle Rain (Filtered Pink/White noise + Bandpass variation)
  startRain(vol = 0.35) {
    this.stopRain();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const buffer = this.createNoiseBuffer("pink", 5);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.4, ctx.currentTime + 1.2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      this.activeNodes.rain = { source, gain, filter };
    } catch {}
  }

  stopRain() {
    if (this.activeNodes.rain) {
      try {
        const { source, gain } = this.activeNodes.rain;
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          try { source.stop(); source.disconnect(); } catch {}
        }, 700);
      } catch {}
      this.activeNodes.rain = null;
    }
  }

  // 2. Brown Noise (Deep Focus & ADHD calm)
  startBrownNoise(vol = 0.35) {
    this.stopBrownNoise();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const buffer = this.createNoiseBuffer("brown", 5);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + 1.2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      this.activeNodes.brown = { source, gain, filter };
    } catch {}
  }

  stopBrownNoise() {
    if (this.activeNodes.brown) {
      try {
        const { source, gain } = this.activeNodes.brown;
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          try { source.stop(); source.disconnect(); } catch {}
        }, 700);
      } catch {}
      this.activeNodes.brown = null;
    }
  }

  // 3. Ocean Waves (LFO modulated sweep)
  startWaves(vol = 0.35) {
    this.stopWaves();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const buffer = this.createNoiseBuffer("pink", 6);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // LFO for rhythmic swell
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.45, ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
      this.activeNodes.waves = { source, gain, lfo, lfoGain };
    } catch {}
  }

  stopWaves() {
    if (this.activeNodes.waves) {
      try {
        const { source, gain, lfo } = this.activeNodes.waves;
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          try {
            source.stop();
            lfo.stop();
            source.disconnect();
          } catch {}
        }, 900);
      } catch {}
      this.activeNodes.waves = null;
    }
  }

  // 4. Lo-Fi 7th Chords (Warm analog piano chords)
  startLoFi(vol = 0.35) {
    this.stopLoFi();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || this.ctx.state !== "running") return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(620, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol * 0.06, now + 0.35 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + 2.7);
      });
    };

    playChord();
    this.lofiInterval = setInterval(playChord, 2800);
    this.activeNodes.lofi = true;
  }

  stopLoFi() {
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    this.activeNodes.lofi = null;
  }

  stopAll() {
    this.stopRain();
    this.stopBrownNoise();
    this.stopWaves();
    this.stopLoFi();
  }
}

export const ambientSound = new AmbientSoundEngine();
export default ambientSound;

