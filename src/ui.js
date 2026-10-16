import { LEVEL_CONFIG } from './hole.js';
import { audio } from './audio.js';

export class UIManager {
  constructor({ onSelectSkin, onRestartGame, onSelectMode, onSelectDifficulty }) {
    this.onSelectSkin = onSelectSkin;
    this.onRestartGame = onRestartGame;
    this.onSelectMode = onSelectMode;
    this.onSelectDifficulty = onSelectDifficulty;

    this.currentSkin = 'gutter';
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.difficulty = 'kidsEasy'; // 'kidsEasy' or 'classic'

    this.createHUD();
    this.createSkinModal();
    this.createGameOverModal();
    this.createDistrictClearedModal();
    this.bindEvents();
  }

  createHUD() {
    this.hud = document.createElement('div');
    this.hud.id = 'game-hud';
    this.hud.innerHTML = `
      <!-- Top Status Bar -->
      <div class="hud-top-bar">
        <div class="hud-left">
          <div class="karachi-badge">
            <span class="urdu-title">کراچی</span>
            <span class="game-title">HOLE.IO</span>
          </div>
          <div class="level-indicator">
            <span class="level-badge" id="hud-level-badge">LV 1</span>
            <div class="level-info">
              <span class="level-name" id="hud-level-title">Gali Vacuum</span>
              <div class="xp-bar-track">
                <div class="xp-bar-fill" id="hud-xp-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="hud-center">
          <div class="timer-pill" id="hud-timer">02:00</div>
          <div class="score-pill">
            <span class="score-label">SCORE</span>
            <span class="score-val" id="hud-score">0</span>
          </div>
          <div class="politician-pill" title="Pakistani Politicians Devoured">
            <span>💰 VIPs:</span>
            <span id="hud-politicians" class="pol-count">0</span>
          </div>
          <div class="civic-pill" id="hud-civic-pill" title="Karachi Cleansed from Evils & Mafia">
            <span class="civic-icon">🧹</span>
            <span class="civic-label">CLEANSED:</span>
            <span id="hud-civic-pct" class="civic-val">0%</span>
            <div class="civic-track">
              <div class="civic-fill" id="hud-civic-fill" style="width: 0%"></div>
            </div>
          </div>
          <div class="combo-pill" id="hud-combo" style="display: none;">
            COMBO x<span id="hud-combo-val">2</span>! 🔥
          </div>
        </div>

        <div class="hud-right">
          <!-- Interactive Karachi Civic Mini-Map (Radar HUD) -->
          <div class="minimap-card" id="hud-minimap-card">
            <div class="minimap-header">
              <span class="minimap-title">🗺️ RADAR / نقشہ</span>
              <span class="minimap-badge" id="minimap-target-badge">14 LEFT</span>
            </div>
            <div class="minimap-canvas-wrapper">
              <canvas id="minimap-canvas" width="144" height="144"></canvas>
            </div>
          </div>

          <!-- Realtime Leaderboard -->
          <div class="leaderboard-card">
            <div class="leaderboard-header">LEADERBOARD</div>
            <div class="leaderboard-list" id="hud-leaderboard">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>

      <!-- Live Crime Radar Compass Bar (Instantly guides player to active crimes/evils!) -->
      <div class="crime-radar-bar" id="hud-crime-radar"></div>

      <!-- District Mission Objective Banner -->
      <div class="district-mission-banner" id="district-mission-banner">
        <div class="district-meta-left">
          <span class="district-badge-pill" id="hud-district-badge">DISTRICT 1</span>
          <span class="district-name-text" id="hud-district-title">Tariq Road & PECHS (طرق روڈ)</span>
        </div>
        <div class="district-counter-center">
          <div class="district-counter-pill" id="hud-district-counter">
            <span class="counter-icon">🎯</span>
            <span class="counter-num" id="hud-district-remaining-num">14</span>
            <span class="counter-text">EVILS REMAINING</span>
          </div>
          <div class="district-progress-track">
            <div class="district-progress-fill" id="hud-district-progress" style="width: 0%"></div>
          </div>
        </div>
        <div class="district-targets-right" id="hud-district-breakdown">
          <!-- Dynamic remaining targets breakdown chips -->
        </div>
      </div>

      <!-- Before ➔ After Civic Transformation Toast -->
      <div class="before-after-toast" id="hud-before-after-toast" style="opacity: 0">
        <div class="ba-badge">✨ CIVIC TRANSFORMATION / شہری بحالی ✨</div>
        <div class="ba-row">
          <div class="ba-side ba-before">
            <span class="ba-tag">BEFORE:</span>
            <span class="ba-text" id="ba-before-text">Broken Pothole</span>
          </div>
          <div class="ba-arrow">➔</div>
          <div class="ba-side ba-after">
            <span class="ba-tag">AFTER:</span>
            <span class="ba-text" id="ba-after-text">Smooth Repaired Road!</span>
          </div>
        </div>
      </div>

      <!-- Center Announcement Overlay -->
      <div class="announcement-banner" id="hud-announcement" style="opacity: 0"></div>

      <!-- Floating Feedbacks Container -->
      <div id="floating-feedbacks"></div>

      <!-- Bottom Floating Action Bar -->
      <div class="hud-bottom-bar">
        <div class="bottom-left-controls">
          <button class="icon-btn ui-interactive" id="btn-toggle-sound" title="Toggle Sound">🔊</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-music" title="Toggle Music">🎵</button>
          <button class="icon-btn ui-interactive" id="btn-open-skins" title="Change Skin">🎨 Skins</button>
          <button class="pill-btn ui-interactive highlight-btn" id="btn-diff-toggle" title="Toggle Difficulty">🎈 Easy (Kids)</button>
          <button class="pill-btn ui-interactive" id="btn-mode-toggle">Mode: 2 Min</button>
        </div>

        <div class="bottom-right-controls">
          <button class="boost-btn ui-interactive" id="btn-boost" title="Turbo Boost">
            ⚡ TURBO
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.hud);
  }

  createSkinModal() {
    this.skinModal = document.createElement('div');
    this.skinModal.className = 'modal-backdrop';
    this.skinModal.id = 'modal-skins';
    this.skinModal.style.display = 'none';

    this.skinModal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h2>Select Hole Skin / رنگ منتخب کریں</h2>
          <button class="close-btn ui-interactive" id="btn-close-skins">&times;</button>
        </div>
        <div class="skin-grid">
          <div class="skin-card ui-interactive active" data-skin="gutter">
            <div class="skin-preview skin-gutter"></div>
            <div class="skin-info">
              <h3>KMC Open Gutter (کھلا گٹر)</h3>
              <p>Authentic Karachi sewer manhole with iron cleats & murky sludge</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="truckArt">
            <div class="skin-preview skin-truck-art"></div>
            <div class="skin-info">
              <h3>Truck Art Chamak</h3>
              <p>Authentic Pakistani floral truck art with peacock motifs</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="ajrak">
            <div class="skin-preview skin-ajrak"></div>
            <div class="skin-info">
              <h3>Sindh Ajrak</h3>
              <p>Royal indigo & crimson traditional Sindhi star block print</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="emerald">
            <div class="skin-preview skin-emerald"></div>
            <div class="skin-info">
              <h3>Sea View Emerald</h3>
              <p>Bioluminescent Arabian Sea coastal waves</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="quaid">
            <div class="skin-preview skin-quaid"></div>
            <div class="skin-info">
              <h3>Mazar White & Gold</h3>
              <p>Majestic white marble and golden calligraphy rim</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="neon">
            <div class="skin-preview skin-neon"></div>
            <div class="skin-info">
              <h3>Chundrigar Cyber Neon</h3>
              <p>Electric cyberpunk pink & cyan glow</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.skinModal);
  }

  createGameOverModal() {
    this.gameOverModal = document.createElement('div');
    this.gameOverModal.className = 'modal-backdrop';
    this.gameOverModal.id = 'modal-game-over';
    this.gameOverModal.style.display = 'none';

    this.gameOverModal.innerHTML = `
      <div class="modal-card results-card">
        <div class="results-header">
          <h1 id="results-headline">VICTORY! / مبارک ہو</h1>
          <div class="results-sub" id="results-sub">Karachi Match Finished</div>
        </div>

        <div class="podium-section" id="results-podium">
          <!-- 2nd, 1st, 3rd podium -->
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-label">FINAL SCORE</span>
            <span class="stat-num" id="stat-score">0</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">MAX LEVEL</span>
            <span class="stat-num" id="stat-level">Lv 1</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">OBJECTS SWALLOWED</span>
            <span class="stat-num" id="stat-swallowed">0</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">HOLE KILLS</span>
            <span class="stat-num" id="stat-kills">0</span>
          </div>
        </div>

        <button class="primary-btn ui-interactive" id="btn-play-again">
          PLAY AGAIN / دوبارہ کھیلیں
        </button>
      </div>
    `;
    document.body.appendChild(this.gameOverModal);
  }

  createDistrictClearedModal() {
    this.districtClearedModal = document.createElement('div');
    this.districtClearedModal.className = 'modal-backdrop district-cleared-modal-backdrop';
    this.districtClearedModal.id = 'modal-district-cleared';
    this.districtClearedModal.style.display = 'none';

    this.districtClearedModal.innerHTML = `
      <div class="modal-card district-cleared-card">
        <div class="trophy-glow-icon">🏆</div>
        <div class="dc-title" id="dc-modal-title">DISTRICT 1 CLEARED!</div>
        <div class="dc-urdu" id="dc-modal-urdu">طرق روڈ مکمل صاف!</div>
        <div class="dc-desc" id="dc-modal-desc">
          You devoured all criminals & cleansed the neighborhood! Citizens are rejoicing!
        </div>

        <div class="dc-rewards-grid">
          <div class="dc-reward-box highlight-box">
            <span class="dc-reward-label">NEW CIVIC RANK</span>
            <span class="dc-reward-val" id="dc-modal-herotitle">Street Vigilante (گلی محافظ)</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">BONUS SCORE</span>
            <span class="dc-reward-val gold-text" id="dc-modal-bonus">+2,500 XP</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">BONUS TIME</span>
            <span class="dc-reward-val cyan-text" id="dc-modal-time">+50 SEC</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">HOLE RADIUS</span>
            <span class="dc-reward-val green-text" id="dc-modal-radius">EXPANDED 🌀</span>
          </div>
        </div>

        <div class="dc-next-preview">
          <span class="next-label">NEXT LEVEL:</span>
          <span class="next-name" id="dc-modal-nextname">District 2: Saddar & Empress Market (صدر و ایمپریس مارکیٹ)</span>
        </div>

        <button class="primary-btn ui-interactive dc-advance-btn" id="btn-next-district">
          🚀 ENTER NEXT DISTRICT / آگے بڑھیں
        </button>
      </div>
    `;

    document.body.appendChild(this.districtClearedModal);
  }

  bindEvents() {
    // Sound & Music
    const btnSound = document.getElementById('btn-toggle-sound');
    btnSound.addEventListener('click', () => {
      const enabled = audio.toggleSound();
      btnSound.textContent = enabled ? '🔊' : '🔇';
    });

    const btnMusic = document.getElementById('btn-toggle-music');
    btnMusic.addEventListener('click', () => {
      const enabled = audio.toggleMusic();
      btnMusic.textContent = enabled ? '🎵' : '⏹';
    });

    // Skins Modal
    const btnSkins = document.getElementById('btn-open-skins');
    btnSkins.addEventListener('click', () => {
      audio.playClick();
      this.skinModal.style.display = 'flex';
    });

    const btnCloseSkins = document.getElementById('btn-close-skins');
    btnCloseSkins.addEventListener('click', () => {
      audio.playClick();
      this.skinModal.style.display = 'none';
    });

    // Skin card selection
    const cards = this.skinModal.querySelectorAll('.skin-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const skinName = card.dataset.skin;
        this.currentSkin = skinName;
        if (this.onSelectSkin) this.onSelectSkin(skinName);
        setTimeout(() => {
          this.skinModal.style.display = 'none';
        }, 150);
      });
    });

    // Difficulty Toggle (Kids / Easy by default)
    const btnDiff = document.getElementById('btn-diff-toggle');
    btnDiff.addEventListener('click', () => {
      audio.playClick();
      if (this.difficulty === 'kidsEasy') {
        this.difficulty = 'classic';
        btnDiff.textContent = '🕹️ Classic';
        btnDiff.classList.remove('highlight-btn');
      } else {
        this.difficulty = 'kidsEasy';
        btnDiff.textContent = '🎈 Easy (Kids)';
        btnDiff.classList.add('highlight-btn');
      }
      if (this.onSelectDifficulty) this.onSelectDifficulty(this.difficulty);
    });

    // Mode Toggle
    const btnMode = document.getElementById('btn-mode-toggle');
    btnMode.addEventListener('click', () => {
      audio.playClick();
      if (this.gameMode === 'battleRoyale') {
        this.gameMode = 'sandbox';
        btnMode.textContent = 'Mode: Sandbox';
        document.getElementById('hud-timer').textContent = '∞ FREE ROAM';
      } else {
        this.gameMode = 'battleRoyale';
        btnMode.textContent = 'Mode: 2 Min';
        document.getElementById('hud-timer').textContent = '02:00';
      }
      if (this.onSelectMode) this.onSelectMode(this.gameMode);
    });

    // Boost button
    const btnBoost = document.getElementById('btn-boost');
    btnBoost.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.isBoostPressed = true;
    });
    btnBoost.addEventListener('touchend', (e) => {
      e.preventDefault();
      window.isBoostPressed = false;
    });
    btnBoost.addEventListener('mousedown', () => { window.isBoostPressed = true; });
    btnBoost.addEventListener('mouseup', () => { window.isBoostPressed = false; });

    // Play Again button
    document.getElementById('btn-play-again').addEventListener('click', () => {
      audio.playClick();
      this.gameOverModal.style.display = 'none';
      if (this.onRestartGame) this.onRestartGame();
    });
  }

  updateHUD({
    player,
    timeLeft,
    rankedHoles,
    gameMode,
    civicPercent = 0,
    frenzyActive = false,
    nearestEvils = [],
    districtConfig = null,
    districtRemaining = 0,
    districtTotal = 0,
    targetBreakdown = [],
    districtEvils = [],
    recentCleaned = []
  }) {
    // District Mission Banner & Remaining Targets
    if (districtConfig) {
      const badgeEl = document.getElementById('hud-district-badge');
      const titleEl = document.getElementById('hud-district-title');
      const remNumEl = document.getElementById('hud-district-remaining-num');
      const counterEl = document.getElementById('hud-district-counter');
      const progressEl = document.getElementById('hud-district-progress');
      const breakdownEl = document.getElementById('hud-district-breakdown');

      if (badgeEl) badgeEl.textContent = `DISTRICT ${districtConfig.level}`;
      if (titleEl) titleEl.textContent = `${districtConfig.name} (${districtConfig.urdu})`;
      if (remNumEl) remNumEl.textContent = districtRemaining;

      const pct = districtTotal > 0 ? Math.min(100, Math.round(((districtTotal - districtRemaining) / districtTotal) * 100)) : 0;
      if (progressEl) progressEl.style.width = `${pct}%`;

      if (counterEl) {
        if (districtRemaining <= 3 && districtRemaining > 0) {
          counterEl.classList.add('final-hunt');
        } else {
          counterEl.classList.remove('final-hunt');
        }
      }

      if (breakdownEl && targetBreakdown) {
        breakdownEl.innerHTML = '';
        targetBreakdown.forEach(tb => {
          if (tb.count <= 0) return;
          const chip = document.createElement('span');
          chip.className = `target-chip chip-${tb.type}`;
          chip.innerHTML = `${tb.icon} ${tb.count} ${tb.name.split(' ')[0]}`;
          breakdownEl.appendChild(chip);
        });
      }
    }

    // Score & Politician VIP Count
    document.getElementById('hud-score').textContent = player.score.toLocaleString();
    const polCountEl = document.getElementById('hud-politicians');
    if (polCountEl) {
      polCountEl.textContent = player.politiciansDevoured || 0;
    }

    // Civic Cleanser Meter
    const civicPctEl = document.getElementById('hud-civic-pct');
    const civicFillEl = document.getElementById('hud-civic-fill');
    const civicPillEl = document.getElementById('hud-civic-pill');
    if (civicPctEl && civicFillEl) {
      const rounded = Math.min(100, Math.round(civicPercent));
      civicPctEl.textContent = `${rounded}%`;
      civicFillEl.style.width = `${rounded}%`;
      if (civicPillEl) {
        if (frenzyActive) {
          civicPillEl.classList.add('frenzy-active');
        } else {
          civicPillEl.classList.remove('frenzy-active');
        }
      }
    }

    // Level & XP Bar
    const currentConfig = LEVEL_CONFIG[player.level - 1];
    document.getElementById('hud-level-badge').textContent = `LV ${player.level}`;
    document.getElementById('hud-level-title').textContent = currentConfig.title;

    const prevXP = player.level === 1 ? 0 : LEVEL_CONFIG[player.level - 2].maxXP;
    const nextXP = currentConfig.maxXP;
    const progress = Math.min(100, Math.max(0, ((player.xp - prevXP) / (nextXP - prevXP)) * 100));
    document.getElementById('hud-xp-fill').style.width = `${progress}%`;

    // Timer
    if (gameMode === 'battleRoyale') {
      const minutes = Math.floor(Math.max(0, timeLeft) / 60);
      const seconds = Math.floor(Math.max(0, timeLeft) % 60);
      document.getElementById('hud-timer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      document.getElementById('hud-timer').textContent = '∞ FREE ROAM';
    }

    // Combo Pill
    const comboEl = document.getElementById('hud-combo');
    if (player.comboCount >= 2) {
      comboEl.style.display = 'block';
      document.getElementById('hud-combo-val').textContent = player.comboCount;
    } else {
      comboEl.style.display = 'none';
    }

    // Leaderboard
    const lbContainer = document.getElementById('hud-leaderboard');
    lbContainer.innerHTML = '';
    const topHoles = rankedHoles.slice(0, 5);
    topHoles.forEach((hole, idx) => {
      const row = document.createElement('div');
      row.className = `leaderboard-item ${hole.isPlayer ? 'is-player' : ''}`;
      row.innerHTML = `
        <span class="lb-rank">${idx === 0 ? '👑 1' : idx + 1}</span>
        <span class="lb-name">${hole.name}</span>
        <span class="lb-score">${hole.score}</span>
      `;
      lbContainer.appendChild(row);
    });

    // Live Crime Radar Compass Bar (Instantly guides player to crimes happening nearby!)
    const radarContainer = document.getElementById('hud-crime-radar');
    if (radarContainer && nearestEvils) {
      radarContainer.innerHTML = '';
      nearestEvils.forEach(evil => {
        const item = document.createElement('div');
        item.className = `radar-evil-badge evil-${evil.evilType}`;
        let arrow = "➔";
        if (Math.abs(evil.dx) > Math.abs(evil.dz)) {
          arrow = evil.dx > 0 ? "➔ Right" : "⬅ Left";
        } else {
          arrow = evil.dz < 0 ? "⬆ Ahead" : "⬇ Behind";
        }
        item.innerHTML = `
          <span class="radar-icon">${evil.icon}</span>
          <span class="radar-name">${evil.name.split('(')[0].trim()}</span>
          <span class="radar-dist">${evil.dist}m ${arrow}</span>
        `;
        radarContainer.appendChild(item);
      });
    }

    // Render Realtime Interactive Mini-Map (Radar HUD)
    this.drawMiniMap({
      player,
      districtEvils,
      holes: rankedHoles,
      districtConfig,
      recentCleaned
    });
  }

  // Interactive High-Tech Karachi Civic Mini-Map (Radar HUD)
  drawMiniMap({
    player,
    districtEvils = [],
    holes = [],
    districtConfig = null,
    recentCleaned = []
  }) {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas || !player) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const R = (width / 2) - 6; // Radar circle radius
    const maxRadarDist = 65; // 65 meters radius coverage
    const scale = R / maxRadarDist;
    const now = performance.now();

    ctx.clearRect(0, 0, width, height);

    // 1. Radar Glass Background
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    // Dark high-tech sci-fi glass gradient
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(12, 22, 36, 0.94)');
    grad.addColorStop(0.7, 'rgba(8, 16, 26, 0.96)');
    grad.addColorStop(1, 'rgba(3, 8, 14, 0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Coastal Arabian Sea indicator in the south (z > 80 in world)
    const seaWorldZ = 85;
    const seaRelZ = (seaWorldZ - player.position.z) * scale;
    if (cy + seaRelZ < height) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.22)';
      ctx.fillRect(0, Math.max(0, cy + seaRelZ), width, height);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.75)';
      ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 ARABIAN SEA', cx, Math.min(height - 4, cy + seaRelZ + 10));
    }

    // Concentric Range Rings (20m and 45m)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    [20, 45].forEach(dist => {
      const ringR = dist * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.stroke();

    // North Indicator
    ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.font = '900 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - R + 11);

    // 2. Rotating Radar Sweep Beam
    this.radarAngle = (this.radarAngle || 0) + 0.038;
    const sweepAngle = this.radarAngle;
    const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
    sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, sweepAngle - 0.45, sweepAngle);
    ctx.closePath();
    ctx.fill();

    // 3. Recently Cleaned Locations (Sparkling green checkmarks fading out)
    if (recentCleaned && recentCleaned.length > 0) {
      recentCleaned.forEach(item => {
        const age = (now - item.time) / 1000;
        if (age < 8.0) {
          const alpha = 1.0 - (age / 8.0);
          const rdx = (item.x - player.position.x) * scale;
          const rdz = (item.z - player.position.z) * scale;
          const rdist = Math.hypot(rdx, rdz);
          if (rdist < R - 5) {
            ctx.fillStyle = `rgba(0, 230, 118, ${alpha})`;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✓', cx + rdx, cy + rdz);
          }
        }
      });
    }

    // 4. Other AI Holes (small subtle amber dots)
    holes.forEach(h => {
      if (h.isPlayer || !h.isAlive) return;
      const hdx = (h.position.x - player.position.x) * scale;
      const hdz = (h.position.z - player.position.z) * scale;
      const hdist = Math.hypot(hdx, hdz);
      if (hdist < R - 4) {
        ctx.fillStyle = 'rgba(255, 171, 0, 0.65)';
        ctx.beginPath();
        ctx.arc(cx + hdx, cy + hdz, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Active District Evils (Target Pips & Off-Screen Edge Pointers!)
    const activeEvils = districtEvils.filter(b => b.state !== 'swallowed');
    const evilPalette = {
      robber: { color: '#ff1744', icon: '🔫' },
      vip: { color: '#00e5ff', icon: '🚨' },
      tanker: { color: '#29b6f6', icon: '💧' },
      politician: { color: '#ffd700', icon: '💰' },
      ke: { color: '#ffea00', icon: '⚡' },
      gutka: { color: '#e040fb', icon: '🛑' },
      pothole: { color: '#ff9100', icon: '🕳️' },
      trash: { color: '#90a4ae', icon: '🗑️' },
      bhatta: { color: '#d500f9', icon: '📜' },
      onewheeler: { color: '#00e676', icon: '🏍️' },
      chinacutting: { color: '#ff6d00', icon: '📐' }
    };

    activeEvils.forEach(e => {
      const ex = e.mesh.position.x;
      const ez = e.mesh.position.z;
      const edx = ex - player.position.x;
      const edz = ez - player.position.z;
      const worldDist = Math.hypot(edx, edz);
      const angle = Math.atan2(edz, edx);
      const meta = evilPalette[e.evilType] || { color: '#ff1744', icon: '⚠️' };

      const pipDist = worldDist * scale;

      if (pipDist <= R - 8) {
        // Within radar circle: draw glowing pip and icon!
        const px = cx + edx * scale;
        const py = cy + edz * scale;

        // Glowing outer halo
        ctx.fillStyle = meta.color;
        ctx.globalAlpha = 0.35 + Math.sin(now * 0.006) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Pip dot
        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Target Emoji
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon, px, py - 7);
      } else {
        // OFF-SCREEN / FAR TARGET: Clamped to radar perimeter with directional arrow & meters!
        const clampR = R - 8;
        const px = cx + Math.cos(angle) * clampR;
        const py = cy + Math.sin(angle) * clampR;

        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Directional arrowhead
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(-4, -3);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Distance text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textOffsetR = clampR - 11;
        const tx = cx + Math.cos(angle) * textOffsetR;
        const ty = cy + Math.sin(angle) * textOffsetR;
        ctx.fillText(`${Math.round(worldDist)}m`, tx, ty);
      }
    });

    // 6. Player Hole at Center
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player Directional Heading Chevron (based on movement vector)
    const moveLen = Math.hypot(player.moveVector?.x || 0, player.moveVector?.y || 0);
    if (moveLen > 0.05) {
      const headingAngle = Math.atan2(player.moveVector.y, player.moveVector.x);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(headingAngle);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(4, -3.5);
      ctx.lineTo(4, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // End clipping

    // 7. Outer Radar Bezel
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Update target count badge
    const badgeEl = document.getElementById('minimap-target-badge');
    if (badgeEl) {
      badgeEl.textContent = `${activeEvils.length} LEFT`;
      if (activeEvils.length <= 3 && activeEvils.length > 0) {
        badgeEl.classList.add('urgent');
      } else {
        badgeEl.classList.remove('urgent');
      }
    }
  }

  showBeforeAfterToast(beforeText, afterText) {
    const toast = document.getElementById('hud-before-after-toast');
    if (!toast) return;

    document.getElementById('ba-before-text').textContent = beforeText;
    document.getElementById('ba-after-text').textContent = afterText;

    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0) scale(1.04)';

    clearTimeout(this.beforeAfterTimeout);
    this.beforeAfterTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -12px) scale(0.96)';
    }, 2800);
  }

  showAnnouncement(text, color = '#ffd700') {
    const el = document.getElementById('hud-announcement');
    el.innerHTML = text;
    el.style.color = color;
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, 0) scale(1.1)';

    clearTimeout(this.announcementTimeout);
    this.announcementTimeout = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -10px) scale(0.95)';
    }, 1800);
  }

  showFloatingFeedback(text, x, y) {
    const container = document.getElementById('floating-feedbacks');
    const el = document.createElement('div');
    el.className = 'floating-feedback';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    container.appendChild(el);
    setTimeout(() => {
      container.removeChild(el);
    }, 1000);
  }

  showGameOver({ rankedHoles, player }) {
    const modal = this.gameOverModal;
    const playerRank = rankedHoles.findIndex(h => h.isPlayer) + 1;

    const headline = playerRank === 1 ? '👑 1ST PLACE CHAMPION! 👑' :
                     playerRank === 2 ? '🥈 2ND PLACE! SHABASH!' :
                     playerRank === 3 ? '🥉 3RD PLACE!' : 'MATCH COMPLETED';

    document.getElementById('results-headline').textContent = headline;
    document.getElementById('results-sub').textContent = `Ranked #${playerRank} in Karachi City Battle`;

    document.getElementById('stat-score').textContent = player.score.toLocaleString();
    document.getElementById('stat-level').textContent = `Lv ${player.level} (${LEVEL_CONFIG[player.level - 1].title})`;
    document.getElementById('stat-swallowed').textContent = player.swallowedCount;
    document.getElementById('stat-kills').textContent = player.kills;

    // Podium HTML
    const podiumEl = document.getElementById('results-podium');
    podiumEl.innerHTML = '';
    const top3 = [rankedHoles[1], rankedHoles[0], rankedHoles[2]]; // 2nd, 1st, 3rd arrangement
    const ranks = [2, 1, 3];

    top3.forEach((hole, idx) => {
      if (!hole) return;
      const rankNum = ranks[idx];
      const pCol = document.createElement('div');
      pCol.className = `podium-col rank-${rankNum} ${hole.isPlayer ? 'is-player' : ''}`;
      pCol.innerHTML = `
        <div class="podium-avatar">${rankNum === 1 ? '👑' : rankNum === 2 ? '🥈' : '🥉'}</div>
        <div class="podium-name">${hole.name}</div>
        <div class="podium-score">${hole.score} pts</div>
        <div class="podium-block">#${rankNum}</div>
      `;
      podiumEl.appendChild(pCol);
    });

    modal.style.display = 'flex';
  }

  showDistrictClearedModal({
    level,
    districtName,
    districtUrdu,
    heroTitle,
    bonusScore,
    timeBonus,
    nextDistrictName,
    nextDistrictUrdu,
    isFinalDistrict = false,
    onNextDistrict
  }) {
    document.getElementById('dc-modal-title').textContent = isFinalDistrict
      ? `🌟 ULTIMATE VICTORY! ALL DISTRICTS SAVED! 🌟`
      : `DISTRICT ${level} CLEARED!`;
    document.getElementById('dc-modal-urdu').textContent = isFinalDistrict
      ? `شہرِ قائد مکمل آزاد و محفوظ!`
      : `${districtName} (${districtUrdu}) مکمل صاف!`;
    document.getElementById('dc-modal-desc').textContent = isFinalDistrict
      ? `Congratulations! You fulfilled Quaid-e-Azam's vision! Karachi is 100% clean, peaceful, and glorious!`
      : `You eliminated all mobile snatchers, mafias & rubbish! Rescued citizens are dancing with joy!`;

    document.getElementById('dc-modal-herotitle').textContent = heroTitle;
    document.getElementById('dc-modal-bonus').textContent = `+${bonusScore.toLocaleString()} XP`;
    document.getElementById('dc-modal-time').textContent = `+${timeBonus} SEC`;
    document.getElementById('dc-modal-nextname').textContent = isFinalDistrict
      ? `Karachi Civic Grand Champion`
      : `${nextDistrictName} (${nextDistrictUrdu})`;

    const nextBtn = document.getElementById('btn-next-district');
    nextBtn.textContent = isFinalDistrict
      ? `👑 CELEBRATE VICTORY / جشن منائیں`
      : `🚀 ENTER NEXT DISTRICT / اگلے ضلع میں داخل ہوں`;

    nextBtn.onclick = () => {
      audio.playClick();
      this.hideDistrictClearedModal();
      if (onNextDistrict) onNextDistrict();
    };

    this.districtClearedModal.style.display = 'flex';
  }

  hideDistrictClearedModal() {
    if (this.districtClearedModal) {
      this.districtClearedModal.style.display = 'none';
    }
  }
}
