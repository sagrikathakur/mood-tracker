// Web Audio API Retro 8-bit & Cozy Chimes (Zero external audio file dependencies)

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted =
      typeof window !== "undefined" &&
      (localStorage.getItem("calmme_sound_muted") === "true" ||
        localStorage.getItem("mindspace_sound_muted") === "true");

    // Auto-unlock AudioContext on first user gesture without throwing autoplay policy warnings
    if (typeof window !== "undefined") {
      const unlock = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
        ["click", "pointerdown", "keydown", "touchstart"].forEach((evt) =>
          window.removeEventListener(evt, unlock, true)
        );
      };

      ["click", "pointerdown", "keydown", "touchstart"].forEach((evt) =>
        window.addEventListener(evt, unlock, { passive: true, capture: true, once: true })
      );
    }
  }

  init() {
    if (this.isMuted || typeof window === "undefined") return false;
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx && this.ctx.state === "running";
    } catch {
      return false;
    }
  }

  isReady() {
    return !this.isMuted && this.ctx && this.ctx.state === "running";
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("calmme_sound_muted", this.isMuted ? "true" : "false");
      localStorage.removeItem("mindspace_sound_muted");
    }
    return this.isMuted;
  }

  // Soft tactile click
  playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context restricted or muted
    }
  }

  // Short crisp retro blip (star ratings, counters, tabs)
  playBlip(freq = 440, duration = 0.04) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // Cheerful tactile pop (toggle checkbox, bubble click, pet pet)
  playPop(freq = 440) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Sweet 8-bit positive chime (habit complete / mood saved)
  playSuccess() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  // Sparkling fanfare celebration (goal accomplished, contact sent)
  playCelebration() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch (e) {}
  }

  // Gentle zen breathing tone
  playCalmTone(freq = 432, duration = 2.5) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const attack = Math.min(0.4, duration * 0.3);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // Hazard / Hurt sound (retro saw buzz)
  playHazard() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  // Retro Game Over sound (descending sad melody)
  playGameOver() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.isReady()) return;
      const now = this.ctx.currentTime;
      const notes = [330, 293.66, 261.63, 196]; // E4, D4, C4, G3

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0.12, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.28);
      });
    } catch (e) {}
  }
}

export const sounds = new SoundManager();
