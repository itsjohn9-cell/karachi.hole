// Pure Web Audio API Sound Synthesizer & Music Engine (Zero External Dependencies)
class AudioManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.hapticsEnabled = true;
    this.isPlayingMusic = false;
    this.musicInterval = null;
    this.musicStep = 0;

    // Load saved preferences
    try {
      this.soundEnabled = localStorage.getItem('hole_karachi_sfx') !== 'false';
      this.musicEnabled = localStorage.getItem('hole_karachi_music') !== 'false';
      this.hapticsEnabled = localStorage.getItem('hole_karachi_haptics') !== 'false';
    } catch (e) {
      // fallback
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactile Android vibration
  vibrate(pattern = 20) {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // ignore
    }
  }

  // Object swallowed sound - pitch varies dynamically with object tier
  playSwallow(tier = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch inversely proportional to size: Small = cute high pop; Large = deep bass gulp
    const baseFreq = tier === 1 ? 520 : tier === 2 ? 380 : tier === 3 ? 240 : tier === 4 ? 140 : 85;
    const endFreq = tier === 1 ? 260 : tier === 2 ? 180 : tier === 3 ? 90 : 45;
    const duration = tier >= 4 ? 0.35 : 0.18;

    osc.type = tier >= 3 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration * 0.8);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);

    // Haptics for swallow
    if (tier >= 4) {
      this.vibrate([40, 30, 60]);
    } else if (tier >= 3) {
      this.vibrate([30, 20, 30]);
    } else {
      this.vibrate(15);
    }
  }

  // Level up fanfare sound
  playLevelUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.28, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });

    this.vibrate([60, 40, 80, 40, 120]);
  }

  // Combo burst sound
  playCombo(comboCount = 2) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 440 * Math.min(2.5, 1 + comboCount * 0.15);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Player swallowed bot or was swallowed
  playHoleKill(isVictim = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isVictim) {
      // Descending sad whoosh
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.6);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      this.vibrate([100, 50, 100]);
    } else {
      // Glorious explosion / victory chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.25);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      this.vibrate([80, 40, 120]);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Subtle button click
  playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Dynamic procedural upbeat synth loop
  startMusic() {
    if (!this.musicEnabled || this.isPlayingMusic) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.musicStep = 0;

    // Upbeat Karachi Arcade melody (D minor / Bhairavi scale feel: D, Eb, F, G, A, Bb, C)
    const melody = [
      293.66, 329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63,
      293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 392.00, 293.66
    ];
    const bass = [146.83, 146.83, 174.61, 196.00];

    const stepIntervalMs = 180; // ~166 BPM 8th notes

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.isPlayingMusic || !this.ctx) return;

      const t = this.ctx.currentTime;
      const noteIdx = this.musicStep % melody.length;
      const freq = melody[noteIdx];

      // Play lead note
      if (noteIdx % 2 === 0 || noteIdx === 3 || noteIdx === 7) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
      }

      // Play rhythmic bass kick every 4 steps
      if (this.musicStep % 4 === 0) {
        const bassFreq = bass[Math.floor(this.musicStep / 4) % bass.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bassFreq, t);
        bOsc.frequency.exponentialRampToValueAtTime(40, t + 0.22);

        bGain.gain.setValueAtTime(0.12, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);

        bOsc.start(t);
        bOsc.stop(t + 0.23);
      }

      this.musicStep++;
    }, stepIntervalMs);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('hole_karachi_sfx', this.soundEnabled);
    } catch (e) {}
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('hole_karachi_music', this.musicEnabled);
    } catch (e) {}
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  toggleHaptics() {
    this.hapticsEnabled = !this.hapticsEnabled;
    try {
      localStorage.setItem('hole_karachi_haptics', this.hapticsEnabled);
    } catch (e) {}
    return this.hapticsEnabled;
  }
}

export const audio = new AudioManager();
