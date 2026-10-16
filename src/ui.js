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
          <div class="combo-pill" id="hud-combo" style="display: none;">
            COMBO x<span id="hud-combo-val">2</span>! 🔥
          </div>
        </div>

        <div class="hud-right">
          <!-- Realtime Leaderboard -->
          <div class="leaderboard-card">
            <div class="leaderboard-header">LEADERBOARD</div>
            <div class="leaderboard-list" id="hud-leaderboard">
              <!-- Dynamically populated -->
            </div>
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

  updateHUD({ player, timeLeft, rankedHoles, gameMode }) {
    // Score & Politician VIP Count
    document.getElementById('hud-score').textContent = player.score.toLocaleString();
    const polCountEl = document.getElementById('hud-politicians');
    if (polCountEl) {
      polCountEl.textContent = player.politiciansDevoured || 0;
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
}
