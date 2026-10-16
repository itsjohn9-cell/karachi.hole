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

  // Comical cartoon sound when a corrupt politician gets devoured!
  playPoliticianSwallow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Slide whistle / comical boing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);

    // Cash register cha-ching chime!
    [1046.50, 1318.51, 1567.98].forEach((f, idx) => {
      const bell = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      const bellTime = t + 0.15 + idx * 0.08;

      bell.type = 'sine';
      bell.frequency.setValueAtTime(f, bellTime);

      bGain.gain.setValueAtTime(0.25, bellTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.25);

      bell.connect(bGain);
      bGain.connect(this.ctx.destination);
      bell.start(bellTime);
      bell.stop(bellTime + 0.25);
    });

    this.vibrate([40, 20, 80, 20, 100]);
  }

  // Desi stray dog barking sound (Woof! Woof!)
  playDogBark() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.14].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + offset;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, st);
      osc.frequency.exponentialRampToValueAtTime(110, st + 0.1);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.1);
    });
  }

  // Street cat meow sound
  playCatMeow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.linearRampToValueAtTime(780, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.3);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Sewer rat squeak sound
  playRatSqueak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Street Justice: Robber Devoured with Police Siren & Heroic Victory Punch!
  playRobberDevour() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Siren sweeps (Wee-woo!)
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + i * 0.18;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, st);
      osc.frequency.linearRampToValueAtTime(1100, st + 0.09);
      osc.frequency.linearRampToValueAtTime(650, st + 0.18);

      gain.gain.setValueAtTime(0.28, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.18);
    }

    // Heavy justice punch impact thud
    const punch = this.ctx.createOscillator();
    const pGain = this.ctx.createGain();
    punch.type = 'triangle';
    punch.frequency.setValueAtTime(180, t + 0.15);
    punch.frequency.exponentialRampToValueAtTime(40, t + 0.45);

    pGain.gain.setValueAtTime(0.5, t + 0.15);
    pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    punch.connect(pGain);
    pGain.connect(this.ctx.destination);
    punch.start(t + 0.15);
    punch.stop(t + 0.45);

    this.vibrate([80, 40, 100, 40, 150]);
  }

  // Open Gutter Wet Splash & Slosh Sound
  playGutterSplash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.16);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Water Tanker Mafia Devoured: Huge rushing water splash & air horn explosion
  playWaterTankerDevour() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Air horn blare cut off
    const horn = this.ctx.createOscillator();
    const hGain = this.ctx.createGain();
    horn.type = 'sawtooth';
    horn.frequency.setValueAtTime(320, t);
    horn.frequency.exponentialRampToValueAtTime(70, t + 0.35);
    hGain.gain.setValueAtTime(0.4, t);
    hGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    horn.connect(hGain);
    hGain.connect(this.ctx.destination);
    horn.start(t);
    horn.stop(t + 0.35);

    // Deep water flood crash
    const splash = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    splash.type = 'triangle';
    splash.frequency.setValueAtTime(160, t + 0.1);
    splash.frequency.exponentialRampToValueAtTime(35, t + 0.55);
    sGain.gain.setValueAtTime(0.5, t + 0.1);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    splash.connect(sGain);
    sGain.connect(this.ctx.destination);
    splash.start(t + 0.1);
    splash.stop(t + 0.55);

    this.vibrate([70, 30, 90, 30, 140]);
  }

  // VIP Protocol Hooter Siren (PAAN-PAAN!)
  playVIPHooter() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.18].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + offset;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, st);
      osc.frequency.linearRampToValueAtTime(450, st + 0.12);
      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.12);
    });
  }

  // Burns Road Bun Kabab Tawa Sizzle & Chutney Turbo Boost chime
  playBunKababSizzle() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pleasant bright upbeat chimes (G4, C5, E5, G5)
    [392.00, 523.25, 659.25, 783.99].forEach((f, idx) => {
      const bell = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      const bellTime = t + idx * 0.07;
      bell.type = 'sine';
      bell.frequency.setValueAtTime(f, bellTime);
      bGain.gain.setValueAtTime(0.3, bellTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.22);
      bell.connect(bGain);
      bGain.connect(this.ctx.destination);
      bell.start(bellTime);
      bell.stop(bellTime + 0.22);
    });
    this.vibrate([25, 20, 45]);
  }

  // Crowd Cheering & Whistling ("Karachi Zindabad!")
  playCrowdCheer() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // High happy crowd whistles
    [1200, 1600, 1900].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.linearRampToValueAtTime(freq * 1.3, st + 0.15);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.25);
    });
  }

  // Pothole / Broken Road Repaired Crushing Sound
  playPotholeDevour() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.25);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
    this.vibrate(35);
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
