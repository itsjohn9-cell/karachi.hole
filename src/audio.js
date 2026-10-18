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

    // Direct lifecycle listeners: Automatically mute and stop music when tab/screen/app is inactive
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden || document.visibilityState === 'hidden') {
          this.pauseAudio();
        } else {
          if (typeof window !== 'undefined' && window.game && window.game.isGameStarted && !window.game.isPaused && !window.game.isGameOver) {
            this.resumeAudio();
          }
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => {
        this.pauseAudio();
      });
      window.addEventListener('focus', () => {
        if (window.game && window.game.isGameStarted && !window.game.isPaused && !window.game.isGameOver) {
          this.resumeAudio();
        }
      });
      window.addEventListener('pagehide', () => {
        this.pauseAudio();
      });
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

  // Triumphant Karachi Civic Crisis Resolved Fanfare!
  playChallengeSuccess() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Majestic bright arpeggio: C5 (523), E5 (659), G5 (784), C6 (1046)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });

    // Shimmering bell top
    const topBell = this.ctx.createOscillator();
    const topGain = this.ctx.createGain();
    topBell.type = 'sine';
    topBell.frequency.setValueAtTime(1318.51, t + 0.36); // E6
    topGain.gain.setValueAtTime(0.4, t + 0.36);
    topGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    topBell.connect(topGain);
    topGain.connect(this.ctx.destination);
    topBell.start(t + 0.36);
    topBell.stop(t + 0.85);

    this.vibrate([40, 30, 60, 30, 120]);
  }

  // Kid-Friendly Educational Quiz Opening Chime (G4, C5, E5, G5 bright marimba)
  playQuizOpen() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.32, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.3);
    });
    this.vibrate([20, 20, 30]);
  }

  // Gentle, warm cartoon boing for kids when an answer needs reconsideration
  playQuizTryAgain() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.28);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
    this.vibrate(25);
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

  // K-Electric Kunda Electric Spark / Zap Sound
  playKESpark() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Fast crackle / high frequency zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.22);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
    this.vibrate([20, 20, 40]);
  }

  // China Cutting Demolish / Concrete Rubble Sound
  playChinaCuttingDemolish() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
    this.vibrate([40, 25, 60]);
  }

  // Bhatta Parchi Confiscated Sound
  playBhattaConfiscate() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [400, 600, 300].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.06;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.12);
    });
    this.vibrate(30);
  }

  // Reckless One-Wheeler Impounded Motorbike Sputter
  playOneWheelerImpound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.32);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
    this.vibrate([35, 20, 50]);
  }

  // Quetta Alamgir Karak Chai Slurp / Energy Chime
  playChaiSip() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.28, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.22);
    });
    this.vibrate([25, 15, 35]);
  }

  // Innocent Citizen Cheering
  playCitizenCheer() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.18);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
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

  // Grand District Cleared Victory Fanfare & Anthem
  playDistrictClearedFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant royal brass chords: C4, G4, C5, E5, G5, C6 with sustain & flourish
    const chords = [
      { f: [261.63, 392.00, 523.25], d: 0.28, delay: 0 },
      { f: [293.66, 440.00, 587.33], d: 0.28, delay: 0.24 },
      { f: [329.63, 493.88, 659.25], d: 0.35, delay: 0.48 },
      { f: [523.25, 659.25, 783.99, 1046.50], d: 0.95, delay: 0.80 }
    ];

    chords.forEach(c => {
      const startTime = t + c.delay;
      c.f.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + c.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + c.d);
      });
    });

    this.vibrate([100, 50, 100, 50, 250]);
  }

  // Uplifting Civic Cleanse Transformation Chime (Before ➔ After Renovation)
  playCleanseTransformation() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.18, st + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.45);
    });

    this.vibrate([40, 20, 60]);
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

  // Coastal Arabian Sea Wave Splash & Spray (Triggered at water corners & seawall)
  playWaterSplash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. White Noise Wave Crash & Spray
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.45);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(t);
    whiteNoise.stop(t + 0.46);

    // 2. Water Droplet Plops & Bubbles
    [
      { f1: 320, f2: 640, delay: 0.02, dur: 0.12, vol: 0.28 },
      { f1: 460, f2: 880, delay: 0.08, dur: 0.14, vol: 0.22 }
    ].forEach(plop => {
      const pOsc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();
      const pt = t + plop.delay;

      pOsc.type = 'sine';
      pOsc.frequency.setValueAtTime(plop.f1, pt);
      pOsc.frequency.exponentialRampToValueAtTime(plop.f2, pt + plop.dur);

      pGain.gain.setValueAtTime(plop.vol, pt);
      pGain.gain.exponentialRampToValueAtTime(0.001, pt + plop.dur);

      pOsc.connect(pGain);
      pGain.connect(this.ctx.destination);
      pOsc.start(pt);
      pOsc.stop(pt + plop.dur + 0.01);
    });

    // 3. Deep Ocean Swell Rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.36);

    // Haptics: Double wave splash pulse
    this.vibrate([40, 25, 60]);
  }

  // Joyous celebration when a citizen is saved from a robbery!
  playRescuedCitizenCheer() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending happy fanfare arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.001, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.28, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.24);
    });

    // Joyful crowd cheer noise
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.28));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, t);
    filter.Q.setValueAtTime(3.0, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.18, t + 0.15);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(t + 0.15);

    this.vibrate([25, 20, 45]);
  }

  // Rhythmic celebratory car honking when VIP protocol is crushed and traffic is freed!
  playTrafficFreedCelebration() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Rhythmic Karachi celebratory horn pattern: "Pip-pip-pi-pip-pip!"
    const timings = [0, 0.09, 0.20, 0.30, 0.42];
    const freqs = [466.16, 554.37, 466.16, 554.37, 622.25]; // Dual-tone horn

    timings.forEach((startTime, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freqs[idx % freqs.length], t + startTime);

      gain.gain.setValueAtTime(0.24, t + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, t + startTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + startTime);
      osc.stop(t + startTime + 0.08);
    });

    this.vibrate([20, 30, 20, 30, 40]);
  }

  // Gushing pressurized freshwater fountain when tanker mafia is devoured!
  playFreshwaterEruption() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending whoosh
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    this.vibrate([30, 20, 50]);
  }

  // Agile Parkour Jump Whoosh (Space / Jump button)
  playJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.16);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
    this.vibrate(12);
  }

  // Melodic Citizen Dialogue Chime (Warm Sitar/Accordion chime)
  playDialogueChime() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [440, 660].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.2, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.35);
    });
    this.vibrate(20);
  }

  // Sparkling Civic Restoration Arpeggio (Pothole repaired, tap water flowing)
  playCivicRestore() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.25, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.4);
    });
    this.vibrate([25, 15, 35]);
  }

  // Metallic Heavy Slam (Heavy iron manhole cover slamming shut, industrial valve shut)
  playMetallicSlam() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Dual harmonic impact
    [180, 520, 840].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.35), t + 0.32);
      gain.gain.setValueAtTime(0.45 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
    this.vibrate([40, 20, 50]);
  }

  // Sudden Vehicle Brake Screech & Roadblock Halt
  playBrakeScreech() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // High frequency screeching friction
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(750, t + 0.28);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    // Deep thud of vehicle stopping
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(120, t + 0.15);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.38);
    thudGain.gain.setValueAtTime(0.5, t + 0.15);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thud.start(t + 0.15);
    thud.stop(t + 0.38);

    this.vibrate([30, 40, 70]);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  pauseAudio() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend();
      } catch (e) {}
    }
  }

  resumeAudio() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {}
    }
    if (this.musicEnabled && !this.isPlayingMusic) {
      this.startMusic();
    }
  }

  // Arcade Power-Up Chime: Ascending joyful arpeggio
  playPowerUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.2, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.25);
    });
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
