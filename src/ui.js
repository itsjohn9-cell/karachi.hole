import { LEVEL_CONFIG } from './hole.js';
import { audio } from './audio.js';
import {
  AGE_TIERS,
  CIVIC_BADGES,
  EDUCATIONAL_CHALLENGES,
  getChallengesByAge,
  getChallengeByCategoryAndTier,
  getRandomChallenge
} from './educationalChallenges.js';
import { saveManager } from './saveManager.js';
import { CITIZEN_DIALOGUES, dialogueSystem } from './dialogueSystem.js';

if (typeof window !== 'undefined') {
  window.getChallengeByCategoryAndTier = getChallengeByCategoryAndTier;
}

export class UIManager {
  constructor({
    onStartGame,
    onSelectSkin,
    onRestartGame,
    onSelectMode,
    onSelectDifficulty,
    onOpenEducationalQuiz,
    onResolveEducationalQuiz,
    onResumeGame,
    onPauseGame,
    onNextLevel,
    onJump,
    onInteractCitizen,
    onOpenMissionJournal,
    onContinueCareer,
    onSelectDistrict,
    onReturnToMainMenu
  }) {
    this.onStartGame = onStartGame;
    this.onSelectSkin = onSelectSkin;
    this.onRestartGame = onRestartGame;
    this.onSelectMode = onSelectMode;
    this.onSelectDifficulty = onSelectDifficulty;
    this.onOpenEducationalQuiz = onOpenEducationalQuiz;
    this.onResolveEducationalQuiz = onResolveEducationalQuiz;
    this.onResumeGame = onResumeGame;
    this.onPauseGame = onPauseGame;
    this.onNextLevel = onNextLevel;
    this.onJump = onJump;
    this.onInteractCitizen = onInteractCitizen;
    this.onOpenMissionJournal = onOpenMissionJournal;
    this.onContinueCareer = onContinueCareer;
    this.onSelectDistrict = onSelectDistrict;
    this.onReturnToMainMenu = onReturnToMainMenu;

    this.playerName = 'Karachi Hero';
    this.currentSkin = 'gutter';
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.difficulty = 'kidsEasy'; // 'kidsEasy' or 'classic'
    this.currentAgeTier = 'kids'; // 'kids', 'junior', 'senior'
    this.selectedDistrictLevel = 1; // Default: District 1 (DHA & Clifton)
    this.unlockedBadges = new Set(['water_guardian']);
    this.completedQuizIds = new Set();
    this.activeQuizChallenge = null;
    this.isAutoPaused = false;
    this.activeDialogueCitizen = null;
    this.civicQuizEnabled = (typeof localStorage !== 'undefined' && localStorage.getItem('hole_karachi_civic_quiz_enabled') === 'true');

    this.createStartMissionModal();
    this.createHUD();
    this.createSkinModal();
    this.createGoodVsBadModal();
    this.createEducationalQuizModal();
    this.createAutoPauseModal();
    this.createGameMenuModal();
    this.createGameOverModal();
    this.createDistrictClearedModal();
    this.createCitizenDialogueModal();
    this.createMissionJournalModal();
    this.bindEvents();
  }

  // 1. Initial Start Screen / Onboarding Modal
  createStartMissionModal() {
    this.startModal = document.createElement('div');
    this.startModal.className = 'modal-backdrop start-mission-backdrop';
    this.startModal.id = 'modal-start-mission';
    this.startModal.style.display = 'flex'; // Visible on initial load

    this.startModal.innerHTML = `
      <div class="modal-card start-mission-card">
        <div class="start-hero-header">
          <div class="city-crest">🇵🇰</div>
          <h1 class="start-title">PAKISTAN STREET HERO</h1>
          <p class="start-tagline">3D Third-Person Street Patrol &amp; Civic Hero Mission</p>
        </div>

        <div class="start-form-section">
          <!-- Player / Game Name Input -->
          <div class="form-group start-name-group">
            <label class="form-label" for="player-name-input">👤 PLAYER / HERO NAME:</label>
            <div class="input-with-icon">
              <span class="input-icon">👑</span>
              <input type="text" id="player-name-input" class="text-input" value="Karachi Hero" maxlength="18" placeholder="Enter your player name..." />
            </div>
          </div>

          <!-- District / Level Selection -->
          <div class="form-group start-district-group">
            <label class="form-label">📍 SELECT PATROL DISTRICT (LEVEL):</label>
            <div class="district-selection-grid" id="start-district-grid">
              <div class="district-card active ui-interactive" data-level="1" id="start-dist-1">
                <div class="d-header-row">
                  <span class="d-badge">LV 1</span>
                  <span class="d-status unlocked-tag">SELECTED</span>
                </div>
                <span class="d-title">DHA &amp; Clifton Sea View</span>
                <span class="d-sub">Water Tankers, Snatchers &amp; Craters</span>
              </div>
              <div class="district-card ui-interactive" data-level="2" id="start-dist-2">
                <div class="d-header-row">
                  <span class="d-badge lv2-badge">LV 2</span>
                  <span class="d-status unlocked-tag">AVAILABLE</span>
                </div>
                <span class="d-title">Lyari Football &amp; Culture</span>
                <span class="d-sub">Bhatta Mafia, Racers &amp; Peace</span>
              </div>
              <div class="district-card ui-interactive" data-level="3" id="start-dist-3">
                <div class="d-header-row">
                  <span class="d-badge lv3-badge">LV 3</span>
                  <span class="d-status unlocked-tag">AVAILABLE</span>
                </div>
                <span class="d-title">Saddar &amp; Empress Market</span>
                <span class="d-sub">Heritage, VIPs &amp; Encroachments</span>
              </div>
            </div>
          </div>

          <!-- Age Group Selection -->
          <div class="form-group start-age-group">
            <label class="form-label">👶 SELECT YOUR AGE GROUP:</label>
            <div class="age-selection-grid" id="start-age-grid">
              <div class="age-card active ui-interactive" data-age="kids">
                <span class="age-card-icon">🐣</span>
                <span class="age-card-title">Kids</span>
                <span class="age-card-sub">Ages 5–8</span>
                <span class="age-card-desc">Visual picture cues</span>
              </div>
              <div class="age-card ui-interactive" data-age="junior">
                <span class="age-card-icon">🎒</span>
                <span class="age-card-title">Junior</span>
                <span class="age-card-sub">Ages 9–12</span>
                <span class="age-card-desc">Street safety &amp; civic rules</span>
              </div>
              <div class="age-card ui-interactive" data-age="senior">
                <span class="age-card-icon">🏆</span>
                <span class="age-card-title">Teens &amp; Adults</span>
                <span class="age-card-sub">Ages 13+</span>
                <span class="age-card-desc">City leadership &amp; ethics</span>
              </div>
            </div>
          </div>

          <!-- 3D Karachi Avatar Selection -->
          <div class="form-group start-avatar-group">
            <label class="form-label">🦸 CHOOSE 3D KARACHI HERO AVATAR:</label>
            <div class="avatar-selection-grid" id="start-avatar-grid">
              <div class="avatar-card active ui-interactive" data-avatar="tariq">
                <span class="avatar-card-icon">🇵🇰</span>
                <span class="avatar-card-title">Tariq</span>
                <span class="avatar-card-sub">Shalwar Kameez</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="ayesha">
                <span class="avatar-card-icon">🌸</span>
                <span class="avatar-card-title">Ayesha</span>
                <span class="avatar-card-sub">Ajrak Scarf</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="farooq">
                <span class="avatar-card-icon">👮‍♂️</span>
                <span class="avatar-card-title">Farooq</span>
                <span class="avatar-card-sub">Traffic Police</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="bilal">
                <span class="avatar-card-icon">🚑</span>
                <span class="avatar-card-title">Bilal</span>
                <span class="avatar-card-sub">Rescue 1122</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="zain">
                <span class="avatar-card-icon">🎒</span>
                <span class="avatar-card-title">Zain</span>
                <span class="avatar-card-sub">Eco Cadet</span>
              </div>
            </div>
          </div>

          <!-- Compact Mission Guidance -->
          <div class="start-hint-strip">
            <span>🛡️ Drive directly on top of road craters, water tankers &amp; robbers to restore Karachi!</span>
          </div>
        </div>

        <div class="start-action-row" id="start-actions-container">
          <button class="primary-btn ui-interactive start-mission-btn pulse-glow" id="btn-start-patrol">
            🚀 START PATROL (LEVEL 1) ➔
          </button>
          <button class="secondary-btn ui-interactive continue-career-btn" id="btn-continue-career" style="display: none;">
            💾 CONTINUE CAREER (Lv. <span id="continue-career-level">1</span>)
          </button>
        </div>
      </div>
    `;

    // Check if previous career save exists and update continue button
    try {
      if (saveManager && saveManager.hasExistingProgress()) {
        const savedData = saveManager.get();
        const continueBtn = this.startModal.querySelector('#btn-continue-career');
        const levelSpan = this.startModal.querySelector('#continue-career-level');
        if (continueBtn) {
          if (levelSpan) levelSpan.textContent = savedData.player.level || 1;
          continueBtn.style.display = 'inline-block';
        }
      }
    } catch (e) {
      console.warn("Save manager check:", e);
    }

    document.body.appendChild(this.startModal);
  }

  // 2. Non-Overlapping Game Tracking HUD & Scoreboard
  createHUD() {
    this.hud = document.createElement('div');
    this.hud.id = 'game-hud';
    this.hud.innerHTML = `
      <!-- Top Fixed Header Bar (z-index: 100) -->
      <div class="hud-top-bar">
        <div class="hud-left">
          <div class="karachi-badge">
            <span class="game-logo-icon" id="hud-avatar-icon">🇵🇰</span>
            <div class="player-title-col">
              <span class="game-title" id="hud-player-name">KARACHI HERO</span>
              <span class="hero-tag-sub" id="hud-level-title">Street Patrol Hero</span>
            </div>
          </div>
          <div class="level-indicator">
            <span class="level-badge" id="hud-level-badge">LV 1</span>
            <div class="xp-bar-track">
              <div class="xp-bar-fill" id="hud-xp-fill" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <div class="hud-center">
          <div class="timer-pill" id="hud-timer">04:00</div>
          <div class="score-pill">
            <span class="score-label">SCORE</span>
            <span class="score-val" id="hud-score">0</span>
          </div>
          <div class="nav-target-pill" id="hud-nav-target" style="display: none;">
            <span class="nav-target-badge">🎯 TARGET</span>
            <span class="nav-target-icon" id="hud-nav-icon">🕳️</span>
            <span class="nav-target-name" id="hud-nav-name">Pothole</span>
            <span class="nav-target-dist" id="hud-nav-dist">7m</span>
            <span class="nav-target-arrow" id="hud-nav-arrow">⬆️</span>
          </div>
          <div class="combo-pill" id="hud-combo" style="display: none;">
            COMBO x<span id="hud-combo-val">2</span>! 🔥
          </div>
        </div>

        <div class="hud-top-controls">
          <button class="menu-pill-btn ui-interactive" id="btn-open-game-menu" title="Open Game Menu & Settings [Esc]">☰ MENU</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-sound" title="Toggle Sound">🔊</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-music" title="Toggle Music">🎵</button>
          <button class="icon-btn ui-interactive" id="btn-open-skins" title="Select Hero Outfit">🎨</button>
          <button class="icon-btn ui-interactive" id="btn-open-guide" title="Civic Guide">❓</button>
          <button class="icon-btn ui-interactive" id="btn-top-journal" title="Civic Mission Journal & District Gauges [J]">📜</button>
          <button class="icon-btn ui-interactive" id="btn-open-quiz" title="Civic Academy Challenge">🎓</button>
          <button class="icon-btn ui-interactive" id="btn-manual-pause" title="Pause Game [Esc]">⏸️</button>
        </div>
      </div>

      <!-- Left Panel: District Missions Checklist Card (Collapsible, top: 72px, left: 16px) -->
      <div class="hud-mission-card collapsed" id="district-mission-banner">
        <div class="mission-card-header" id="mission-card-header-toggle" title="Tap to expand/collapse missions">
          <span class="district-badge-pill" id="hud-district-badge">DISTRICT 1</span>
          <span class="district-name-text" id="hud-district-title">Tariq Road &amp; PECHS</span>
          <span class="district-mini-counter" id="hud-district-mini-counter">🎯 5 LEFT</span>
          <button class="mission-toggle-btn ui-interactive" id="btn-toggle-mission-card" title="Collapse / Expand Missions">▼</button>
        </div>

        <!-- Dynamic Mission Checklist Items -->
        <div class="mission-checklist" id="hud-mission-list">
          <div class="mission-item">
            <span class="m-check">⏳</span>
            <span class="m-title">Loading district missions...</span>
          </div>
        </div>

        <div class="mission-card-footer">
          <div class="district-counter-pill" id="hud-district-counter">
            <span class="counter-icon">🎯</span>
            <span class="counter-num" id="hud-district-remaining-num">5</span>
            <span class="counter-text">LEFT</span>
          </div>
          <div class="district-progress-track">
            <div class="district-progress-fill" id="hud-district-progress" style="width: 0%"></div>
          </div>
        </div>

        <!-- Integrated Active Crisis Sub-card (Kept inside for test assertion & clean hierarchy) -->
        <div class="active-crisis-card" id="hud-active-crisis" style="display: none;">
          <div class="crisis-badge-row">
            <span class="crisis-tag-pill">🚨 ACTIVE CRISIS</span>
            <span class="crisis-reward-pill" id="crisis-reward-text">+1,400 XP</span>
          </div>
          <div class="crisis-title-row">
            <span class="crisis-icon" id="crisis-icon">🚰</span>
            <span class="crisis-title" id="crisis-title">Water Tanker Extortion</span>
          </div>
          <div class="crisis-desc" id="crisis-desc">Stop the tanker to restore tap water!</div>
          <div class="crisis-status-box">
            <span class="crisis-count" id="crisis-count">0/1</span>
          </div>
        </div>
      </div>

      <!-- Right Panel: Live Competitor Scoreboard (top: 72px, right: 16px) -->
      <div class="leaderboard-card" id="hud-scoreboard-card">
        <div class="leaderboard-header">
          <span>🏆 LIVE SCOREBOARD</span>
          <span class="rank-tag" id="hud-player-rank">RANK #1</span>
        </div>
        <div class="leaderboard-list" id="hud-leaderboard">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- Bottom-Left: Circular GTA Radar Mini-Map (bottom: 18px, left: 18px) -->
      <div class="minimap-card gta-radar-card" id="hud-minimap-card">
        <div class="minimap-header">
          <span class="minimap-title">🗺️ GTA RADAR</span>
          <span class="minimap-badge" id="minimap-target-badge">PATROL</span>
        </div>
        <div class="minimap-canvas-wrapper">
          <canvas id="minimap-canvas" width="130" height="130"></canvas>
        </div>
      </div>

      <!-- Bottom-Right: Traversal & Mission Controls (bottom: 18px, right: 18px) -->
      <div class="hud-controls-bottom-right">
        <button class="jump-btn ui-interactive" id="btn-jump" title="Parkour Jump Traversal [Space]">🦘 JUMP</button>
        <button class="sprint-btn ui-interactive" id="btn-sprint" title="Sprint Boost [Shift]">⚡ SPRINT</button>
        <button class="journal-btn ui-interactive" id="btn-journal" title="Mission Journal & District Gauges [J]">📜 JOURNAL</button>
      </div>

      <!-- Proximity Action Prompt (Appears dynamically when near friendly citizens) -->
      <div class="hud-interaction-prompt" id="hud-talk-prompt" style="display: none;">
        <button class="talk-prompt-btn ui-interactive" id="btn-talk">💬 TALK [E]</button>
      </div>

      <!-- Before ➔ After Civic Transformation Toast -->
      <div class="before-after-toast" id="hud-before-after-toast" style="opacity: 0">
        <div class="ba-badge">✨ CIVIC TRANSFORMATION ✨</div>
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

      <!-- Dramatic Action Resolution Impact Banner -->
      <div class="action-resolution-banner" id="hud-action-resolution" style="opacity: 0; pointer-events: none;">
        <div class="action-res-icon" id="action-res-icon">🛑</div>
        <div class="action-res-content">
          <div class="action-res-tag" id="action-res-tag">THREAT INTERCEPTED</div>
          <div class="action-res-title" id="action-res-title">VIP PROTOCOL CONVOY HALTED</div>
          <div class="action-res-desc" id="action-res-desc">Route Reopened for Citizen Traffic!</div>
        </div>
      </div>

      <!-- Floating Civic Restoration Progress Meter (Dwell Animation) -->
      <div class="hud-intervention-pill" id="hud-intervention-progress" style="display: none;">
        <span class="intervention-icon" id="intervention-icon">🔧</span>
        <div class="intervention-text-col">
          <div class="intervention-top-row">
            <span class="intervention-title" id="intervention-title">REPAIRING HAZARD...</span>
            <span class="intervention-pct" id="intervention-pct">0%</span>
          </div>
          <div class="intervention-bar-track">
            <div class="intervention-bar-fill" id="intervention-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- Floating Feedbacks Container -->
      <div id="floating-feedbacks"></div>

    `;

    document.body.appendChild(this.hud);
  }

  // 3. Auto-Pause Overlay Modal
  createAutoPauseModal() {
    this.autoPauseModal = document.createElement('div');
    this.autoPauseModal.className = 'modal-backdrop auto-pause-backdrop';
    this.autoPauseModal.id = 'modal-auto-pause';
    this.autoPauseModal.style.display = 'none';

    this.autoPauseModal.innerHTML = `
      <div class="modal-card pause-card">
        <div class="pause-icon">⏸️</div>
        <h2 class="pause-title">GAME PAUSED</h2>
        <p class="pause-desc">You switched tabs or moved away from the screen. Karachi patrol is safely on hold.</p>
        <div class="pause-actions-col">
          <button class="primary-btn ui-interactive resume-patrol-btn" id="btn-auto-resume">
            ▶ RESUME PATROL
          </button>
          <button class="secondary-btn ui-interactive" id="btn-pause-open-menu">
            ☰ OPEN GAME MENU &amp; SETTINGS
          </button>
          <button class="ghost-btn ui-interactive" id="btn-pause-exit-title">
            🏠 RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.autoPauseModal);
  }

  // 3b. Comprehensive Game Menu & Settings Modal
  createGameMenuModal() {
    this.gameMenuModal = document.createElement('div');
    this.gameMenuModal.className = 'modal-backdrop game-menu-backdrop';
    this.gameMenuModal.id = 'modal-game-menu';
    this.gameMenuModal.style.display = 'none';

    this.gameMenuModal.innerHTML = `
      <div class="modal-card game-menu-card">
        <div class="game-menu-header">
          <div class="menu-title-block">
            <span class="menu-crest-icon">🎮</span>
            <div>
              <h2 class="menu-title">GAME MENU &amp; SETTINGS</h2>
              <p class="menu-subtitle" id="menu-hero-summary">Karachi Street Hero • Civic Vice Hub</p>
            </div>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-game-menu">&times;</button>
        </div>

        <!-- Hero & Career Summary Strip -->
        <div class="menu-hero-card">
          <div class="menu-hero-badge" id="menu-avatar-icon">🇵🇰</div>
          <div class="menu-hero-details">
            <div class="menu-hero-name-row">
              <span class="menu-hero-name" id="menu-player-name">Karachi Hero</span>
              <span class="menu-badge" id="menu-level-badge">LV 1</span>
            </div>
            <div class="menu-hero-badges-row">
              <span class="menu-tag" id="menu-district-badge">District 1: DHA</span>
              <span class="menu-tag score-tag" id="menu-score-badge">SCORE: 0</span>
              <span class="menu-tag age-tag" id="menu-age-badge">KIDS (5-8)</span>
            </div>
          </div>
        </div>

        <!-- Primary Action Navigation -->
        <div class="menu-primary-actions">
          <button class="primary-btn ui-interactive menu-action-btn" id="btn-menu-resume">
            ▶ RESUME PATROL
          </button>
          <button class="secondary-btn ui-interactive menu-action-btn" id="btn-menu-restart">
            🔄 RESTART DISTRICT
          </button>
          <button class="danger-btn ui-interactive menu-action-btn" id="btn-menu-exit-title">
            🏠 MAIN MENU
          </button>
        </div>

        <!-- Hub to Access All Other Game Screens -->
        <div class="menu-section-header">
          <span class="menu-section-title">🗺️ ALL GAME MENUS &amp; MODES</span>
        </div>
        <div class="menu-hub-grid">
          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-journal">
            <span class="hub-tile-icon">📜</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Mission Journal</span>
              <span class="hub-tile-sub">4 District Restoration Gauges</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-skins">
            <span class="hub-tile-icon">🎭</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Hero Avatars</span>
              <span class="hub-tile-sub">Change 3D Karachi Character</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-quiz">
            <span class="hub-tile-icon">🎓</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Civic Academy</span>
              <span class="hub-tile-sub">Educational Dilemmas &amp; XP</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-guide">
            <span class="hub-tile-icon">❓</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">How to Play</span>
              <span class="hub-tile-sub">Good vs Bad &amp; Street Rules</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>
        </div>

        <!-- Level / District Quick Select -->
        <div class="menu-section-header">
          <span class="menu-section-title">📍 PATROL DISTRICT / LEVEL SELECT</span>
        </div>
        <div class="menu-level-select-row" id="menu-level-select-row">
          <button class="level-select-btn ui-interactive" data-level="1" id="btn-menu-level-1">
            <span class="lvl-num">LV 1</span>
            <span class="lvl-name">DHA &amp; Clifton</span>
          </button>
          <button class="level-select-btn ui-interactive" data-level="2" id="btn-menu-level-2">
            <span class="lvl-num">LV 2</span>
            <span class="lvl-name">Lyari Football</span>
          </button>
          <button class="level-select-btn ui-interactive" data-level="3" id="btn-menu-level-3">
            <span class="lvl-num">LV 3</span>
            <span class="lvl-name">Saddar Empress</span>
          </button>
        </div>

        <!-- Interactive Settings Panel -->
        <div class="menu-section-header">
          <span class="menu-section-title">⚙️ AUDIO &amp; GAMEPLAY SETTINGS</span>
        </div>
        <div class="menu-settings-container">
          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Sound Effects (SFX)</span>
              <span class="settings-hint">Sirens, celebrations, whistles, and chatter</span>
            </div>
            <button class="setting-pill-toggle ui-interactive active" id="btn-menu-toggle-sfx">
              🔊 SFX: ON
            </button>
          </div>

          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Background Music</span>
              <span class="settings-hint">Energetic Karachi street beats &amp; tunes</span>
            </div>
            <button class="setting-pill-toggle ui-interactive active" id="btn-menu-toggle-music">
              🎵 MUSIC: ON
            </button>
          </div>

          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Civic Moral Questions &amp; Dilemmas</span>
              <span class="settings-hint">Optional interactive quizzes after solving crises (Default: OFF)</span>
            </div>
            <button class="setting-pill-toggle ui-interactive ${this.civicQuizEnabled ? 'active' : ''}" id="btn-menu-toggle-quiz">
              ${this.civicQuizEnabled ? '🎓 QUIZ: ON' : '🎓 QUIZ: OFF'}
            </button>
          </div>

          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Age Group &amp; Tier</span>
              <span class="settings-hint">Customizes quiz dilemmas and guidance speed</span>
            </div>
            <div class="tier-pill-group" id="menu-age-pills">
              <button class="tier-pill-btn active ui-interactive" data-age="kids">🐣 Kids (5-8)</button>
              <button class="tier-pill-btn ui-interactive" data-age="junior">🎒 Junior (9-12)</button>
              <button class="tier-pill-btn ui-interactive" data-age="senior">🏆 Teens (13+)</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Camera Perspective</span>
              <span class="settings-hint">Toggle between Street Chase &amp; Elevated Wide view</span>
            </div>
            <div class="tier-pill-group" id="menu-camera-pills">
              <button class="tier-pill-btn active ui-interactive" id="btn-cam-street">Street Chase</button>
              <button class="tier-pill-btn ui-interactive" id="btn-cam-wide">Extra Wide Drone</button>
            </div>
          </div>
        </div>

        <div class="menu-footer">
          <button class="primary-btn ui-interactive close-menu-footer-btn" id="btn-menu-footer-close">
            CLOSE &amp; CONTINUE PATROL
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.gameMenuModal);
  }

  // 4. Hole Skin Selection Modal
  createSkinModal() {
    this.skinModal = document.createElement('div');
    this.skinModal.className = 'modal-backdrop';
    this.skinModal.id = 'modal-skins';
    this.skinModal.style.display = 'none';

    this.skinModal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h2>Select Hero Outfit</h2>
          <button class="close-btn ui-interactive" id="btn-close-skins">&times;</button>
        </div>
        <div class="skin-grid">
          <div class="skin-card ui-interactive active" data-skin="gutter">
            <div class="skin-preview skin-gutter"></div>
            <div class="skin-info">
              <h3>KMC Open Gutter</h3>
              <p>Authentic Karachi sewer manhole with iron cleats &amp; murky sludge</p>
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
              <p>Royal indigo &amp; crimson traditional Sindhi star block print</p>
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
              <h3>Mazar White &amp; Gold</h3>
              <p>Majestic white marble and golden calligraphy rim</p>
            </div>
          </div>

          <div class="skin-card ui-interactive" data-skin="neon">
            <div class="skin-preview skin-neon"></div>
            <div class="skin-info">
              <h3>Chundrigar Cyber Neon</h3>
              <p>Electric cyberpunk pink &amp; cyan glow</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.skinModal);
  }

  // 5. Educational Quiz Modal (Pictorial, Non-skippable, Auto-resume on correct answer)
  createEducationalQuizModal() {
    this.quizModal = document.createElement('div');
    this.quizModal.className = 'modal-backdrop quiz-modal-backdrop';
    this.quizModal.id = 'modal-quiz';
    this.quizModal.style.display = 'none';

    this.quizModal.innerHTML = `
      <div class="modal-card quiz-modal-card">
        <!-- Header: No close button until answered correctly! -->
        <div class="modal-header quiz-modal-header">
          <div class="quiz-title-block">
            <div class="quiz-title-top">
              <span class="quiz-school-badge">🏫 KARACHI JUNIOR CIVIC ACADEMY</span>
              <span class="quiz-edu-pill">📖 LEARN &amp; WIN</span>
            </div>
            <h2 class="quiz-title">🌟 City Hero Dilemma</h2>
          </div>
          <!-- Notice: Close button removed to make questions non-skippable as requested! -->
        </div>

        <!-- Age Tier Selector Bar -->
        <div class="quiz-age-bar">
          <span class="quiz-age-label">👶 AGE GROUP:</span>
          <div class="quiz-age-tabs" id="quiz-age-tabs">
            <button class="age-tab active ui-interactive" data-age="kids">🐣 Kids (5–8)</button>
            <button class="age-tab ui-interactive" data-age="junior">🎒 Junior (9–12)</button>
            <button class="age-tab ui-interactive" data-age="senior">🏆 Teens &amp; Adults (13+)</button>
          </div>
        </div>

        <!-- Dilemma Challenge Card -->
        <div class="quiz-dilemma-card" id="quiz-dilemma-card">
          <div class="dilemma-topic-row">
            <span class="dilemma-topic-badge" id="quiz-topic-badge">🚰 Water Conservation</span>
            <span class="dilemma-reward-badge" id="quiz-reward-badge">🎁 +500 XP &amp; +25s TIME BONUS</span>
          </div>

          <!-- Scenario Presentation with Pictorial Header -->
          <div class="dilemma-scenario-box">
            <div class="dilemma-icon-large" id="quiz-scenario-icon">🚰</div>
            <div class="dilemma-scenario-texts">
              <div class="scenario-text" id="quiz-scenario-en">Loading scenario...</div>
              <div class="scenario-visual-pill" id="quiz-scenario-visual">💧 🚰 Visual picture cue</div>
            </div>
          </div>

          <!-- Question Prompt -->
          <div class="dilemma-question-box">
            <h3 class="question-en" id="quiz-question-en">Which picture shows the right choice?</h3>
          </div>

          <!-- Interactive Choices Container (Large Pictorial Cards) -->
          <div class="quiz-options-container" id="quiz-options-container">
            <!-- Populated dynamically with pictorial cards -->
          </div>

          <!-- Positive Reinforcement / Feedback Box (Celebration before auto-resume) -->
          <div class="quiz-feedback-box" id="quiz-feedback-box" style="display: none;">
            <div class="feedback-badge" id="feedback-badge">🌟 EXCELLENT CIVIC HERO! CORRECT! 🌟</div>
            <div class="feedback-badge-unlocked" id="feedback-badge-unlocked">
              <span class="badge-icon" id="feedback-badge-icon">🚰</span>
              <span class="badge-text" id="feedback-badge-text">New Medal Unlocked: Water Guardian</span>
            </div>
            <div class="feedback-text-wrap">
              <p class="feedback-desc" id="feedback-desc"></p>
            </div>
            <div class="auto-resume-notice">
              <span>🚀 Returning to game in 1 second...</span>
            </div>
          </div>

          <!-- Gentle Encouragement Note for incorrect tap -->
          <div class="quiz-encouragement-toast" id="quiz-encouragement-toast" style="display: none;">
            <span class="enc-icon">💡</span>
            <div class="enc-txt">
              <strong>Try again!</strong>
              <span id="quiz-enc-text">Look closely at the pictures and tap the correct civic choice to continue!</span>
            </div>
          </div>
        </div>

        <!-- Earned Civic Badges Ribbon -->
        <div class="quiz-badges-ribbon">
          <div class="ribbon-title">🏅 YOUR EARNED CIVIC MEDALS:</div>
          <div class="badges-row" id="quiz-badges-row">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.quizModal);
  }

  // 6. Good vs Bad Guide Modal
  createGoodVsBadModal() {
    this.guideModal = document.createElement('div');
    this.guideModal.className = 'modal-backdrop';
    this.guideModal.id = 'modal-guide';
    this.guideModal.style.display = 'none';

    this.guideModal.innerHTML = `
      <div class="modal-card guide-modal-card">
        <div class="modal-header guide-modal-header">
          <div class="guide-title-block">
            <h2 class="guide-title">👶 WHAT TO DEVOUR?</h2>
            <p class="guide-subtitle">A Visual Guide to Pakistan Street Hero: Only Takedown the Bad Guys!</p>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-guide">&times;</button>
        </div>

        <!-- Visual Rule Summary Pill -->
        <div class="guide-summary-banner">
          <div class="summary-pill pill-bad">
            <span class="sum-icon">🔴</span>
            <div class="sum-txt">
              <strong>RED RINGS &amp; ARROWS 🔻</strong>
              <span>BAD GUYS ➔ DEVOUR THEM ALL!</span>
            </div>
          </div>
          <div class="summary-arrow">⚡ VS ⚡</div>
          <div class="summary-pill pill-good">
            <span class="sum-icon">🟢</span>
            <div class="sum-txt">
              <strong>GREEN HALOS &amp; BADGES 💚</strong>
              <span>GOOD FRIENDS ➔ PROTECT THEM!</span>
            </div>
          </div>
        </div>

        <div class="guide-columns">
          <!-- LEFT COLUMN: BAD GUYS (DEVOUR) -->
          <div class="guide-col col-bad">
            <div class="col-header bad-header">
              <span class="col-icon">😈</span>
              <div class="col-title-wrap">
                <h3>🔴 BAD GUYS (DEVOUR THEM!)</h3>
                <span class="urdu-sub">Eliminate these evils to save Karachi</span>
              </div>
            </div>
            <div class="guide-list">
              <div class="guide-item item-bad">
                <div class="item-icon">📱</div>
                <div class="item-info">
                  <h4>Mobile Snatchers</h4>
                  <p>Armed thugs on 70cc motorbikes stealing phones from citizens. Devour them to restore street peace!</p>
                  <span class="item-tag tag-bad">Devour for +120 XP</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">🚨</div>
                <div class="item-info">
                  <h4>VIP Protocol Convoy</h4>
                  <p>Heavy black SUVs with flashing red-blue police beacons causing 2-hour traffic jams. Devour them to free traffic!</p>
                  <span class="item-tag tag-bad">Devour for +350 XP</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">🛢️</div>
                <div class="item-info">
                  <h4>Water Tanker Mafia</h4>
                  <p>Giant blue tankers stealing tap water and selling it at extortionate rates. Devour them to erupt free tap water!</p>
                  <span class="item-tag tag-bad">Devour for +450 XP &amp; Geyser</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">📜</div>
                <div class="item-info">
                  <h4>Bhatta Extortion Gang</h4>
                  <p>Criminals waving extortion slips demanding money from honest shopkeepers. Swallowing them brings peace!</p>
                  <span class="item-tag tag-bad">Devour for +180 XP</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">🏍️</div>
                <div class="item-info">
                  <h4>Reckless One-Wheelers</h4>
                  <p>Speeding bikes without silencers doing stunts in public streets. Swallowing them secures pedestrians!</p>
                  <span class="item-tag tag-bad">Devour for +140 XP</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">🕳️</div>
                <div class="item-info">
                  <h4>Broken Road Potholes</h4>
                  <p>Deep craters in asphalt damaging cars. Devour them to transform them into smooth carpet roads!</p>
                  <span class="item-tag tag-bad">Devour for +60 XP</span>
                </div>
              </div>

              <div class="guide-item item-bad">
                <div class="item-icon">🗑️</div>
                <div class="item-info">
                  <h4>Overflowing Garbage</h4>
                  <p>Smelly trash bags and plastic piles blocking footpaths. Devour them to plant fresh green flora!</p>
                  <span class="item-tag tag-bad">Devour for +50 XP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: GOOD FRIENDS (DO NOT DEVOUR!) -->
          <div class="guide-col col-good">
            <div class="col-header good-header">
              <span class="col-icon">😇</span>
              <div class="col-title-wrap">
                <h3>🟢 GOOD FRIENDS (PROTECT THEM!)</h3>
                <span class="urdu-sub">These are Karachi's beloved friends</span>
              </div>
            </div>
            <div class="guide-list">
              <div class="guide-item item-good">
                <div class="item-icon">💚</div>
                <div class="item-info">
                  <h4>Innocent Citizens</h4>
                  <p>Everyday people in shalwar kameez. <strong>Your hole cannot eat them!</strong> Touch them to hear blessings &amp; green love hearts!</p>
                  <span class="item-tag tag-good">Blessings &amp; Hearts Burst 💚</span>
                </div>
              </div>

              <div class="guide-item item-good">
                <div class="item-icon">🍔</div>
                <div class="item-info">
                  <h4>Burns Road Bun Kabab Cart</h4>
                  <p>Legendary Karachi egg-shami burger cart. <strong>Touch it for a FREE Turbo Speed Boost</strong> with spicy chutney!</p>
                  <span class="item-tag tag-good">⚡ Gives Instant Turbo Boost!</span>
                </div>
              </div>

              <div class="guide-item item-good">
                <div class="item-icon">☕</div>
                <div class="item-info">
                  <h4>Quetta Karak Chai Dhaba</h4>
                  <p>Traditional tea stall with silver samovar and charpais. <strong>Touch it for Dudh Patti energy recharge!</strong></p>
                  <span class="item-tag tag-good">⚡ Gives Chai Energy Recharge!</span>
                </div>
              </div>

              <div class="guide-item item-good">
                <div class="item-icon">🐕</div>
                <div class="item-info">
                  <h4>Friendly Stray Puppies</h4>
                  <p>Desi street dogs wagging their tails. <strong>Touch them to pet them!</strong> They woof happily and shower you with heart sparkles!</p>
                  <span class="item-tag tag-good">🐕 Pet for Happy Tail Wags!</span>
                </div>
              </div>

              <div class="guide-item item-good">
                <div class="item-icon">🐈</div>
                <div class="item-info">
                  <h4>Street Kittens</h4>
                  <p>Playful orange tabby kittens roaming Karachi footpaths. <strong>Touch to pet them</strong> for affectionate purrs!</p>
                  <span class="item-tag tag-good">🐈 Pet for Purrs &amp; Hearts!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="guide-modal-footer">
          <button class="pill-btn ui-interactive guide-play-btn" id="btn-close-guide-footer">
            🚀 Got It! Let's Clean Karachi!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.guideModal);
  }

  // 7. District Cleared Modal with Unmissable "GO TO NEXT LEVEL ➔" Button
  createDistrictClearedModal() {
    this.districtClearedModal = document.createElement('div');
    this.districtClearedModal.className = 'modal-backdrop district-cleared-modal-backdrop';
    this.districtClearedModal.id = 'modal-district-cleared';
    this.districtClearedModal.style.display = 'none';

    this.districtClearedModal.innerHTML = `
      <div class="modal-card district-cleared-card">
        <div class="trophy-glow-icon">🏆</div>
        <div class="dc-title" id="dc-modal-title">DISTRICT 1 CLEARED!</div>
        <div class="dc-desc" id="dc-modal-desc">
          You eliminated all street criminals, mafias &amp; debris! Karachi citizens are celebrating!
        </div>

        <div class="dc-rewards-grid">
          <div class="dc-reward-box highlight-box">
            <span class="dc-reward-label">NEW CIVIC RANK</span>
            <span class="dc-reward-val" id="dc-modal-herotitle">Street Vigilante</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">BONUS SCORE</span>
            <span class="dc-reward-val gold-text" id="dc-modal-bonus">+2,500 XP</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">BONUS TIME</span>
            <span class="dc-reward-val cyan-text" id="dc-modal-time">+60 SEC</span>
          </div>
          <div class="dc-reward-box">
            <span class="dc-reward-label">HOLE SIZE</span>
            <span class="dc-reward-val green-text" id="dc-modal-radius">EXPANDED 🌀</span>
          </div>
        </div>

        <!-- Detailed Breakdown of Resolved Street Crises & Interventions -->
        <div class="dc-resolved-breakdown" id="dc-modal-breakdown">
          <div class="dc-breakdown-heading">🛡️ RESOLVED CRISES &amp; CIVIC REFORMS:</div>
          <div class="dc-breakdown-list" id="dc-modal-threat-list">
            <!-- Dynamically populated -->
          </div>
        </div>

        <div class="dc-next-preview">
          <span class="next-label">NEXT LEVEL DESTINATION:</span>
          <span class="next-name" id="dc-modal-nextname">District 2: Lyari Football &amp; Culture</span>
        </div>

        <!-- The Prominent Next Level Button requested by user -->
        <button class="primary-btn ui-interactive dc-advance-btn pulse-glow" id="btn-next-district">
          🚀 GO TO NEXT LEVEL: LEVEL 2 ➔
        </button>

        <!-- Direct Level Select Options -->
        <div class="dc-level-selector-row" id="dc-level-selector-row">
          <button class="dc-level-pill ui-interactive" data-level="1">Replay Lv 1</button>
          <button class="dc-level-pill ui-interactive active-pill" data-level="2">Advance to Lv 2</button>
          <button class="dc-level-pill ui-interactive" data-level="3">Jump to Lv 3</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.districtClearedModal);
  }

  // 8. Game Over / Match Results Modal
  createGameOverModal() {
    this.gameOverModal = document.createElement('div');
    this.gameOverModal.className = 'modal-backdrop';
    this.gameOverModal.id = 'modal-game-over';
    this.gameOverModal.style.display = 'none';

    this.gameOverModal.innerHTML = `
      <div class="modal-card results-card">
        <div class="results-header">
          <h1 id="results-headline">MISSION FINISHED!</h1>
          <div class="results-sub" id="results-sub">Karachi Street Patrol Complete</div>
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

        <div class="results-button-row">
          <button class="primary-btn ui-interactive dc-advance-btn" id="btn-results-next" style="display: none;">
            🚀 PROCEED TO NEXT LEVEL ➔
          </button>
          <button class="secondary-btn ui-interactive" id="btn-play-again">
            🔄 REPLAY DISTRICT
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(this.gameOverModal);
  }

  // Handle Opening Quiz
  openEducationalQuiz(category = null) {
    if (this.onPauseGame) this.onPauseGame();

    const challenge = getChallengeByCategoryAndTier(category, this.currentAgeTier);
    this.renderQuizChallenge(challenge);

    this.quizModal.style.display = 'flex';
    audio.playQuizOpen();
  }

  renderQuizChallenge(challenge) {
    if (!challenge) return;
    this.activeQuizChallenge = challenge;

    const topicEl = document.getElementById('quiz-topic-badge');
    if (topicEl) topicEl.textContent = `${challenge.icon} ${challenge.topic}`;

    const rewardEl = document.getElementById('quiz-reward-badge');
    if (rewardEl) rewardEl.textContent = `🎁 +${challenge.rewardXP} XP & +${challenge.rewardTime}s TIME`;

    const iconEl = document.getElementById('quiz-scenario-icon');
    if (iconEl) iconEl.textContent = challenge.icon;

    const scenarioEn = document.getElementById('quiz-scenario-en');
    if (scenarioEn) scenarioEn.textContent = challenge.scenario;

    const visualPill = document.getElementById('quiz-scenario-visual');
    if (visualPill) visualPill.textContent = challenge.pictureEmoji || `${challenge.icon} Look at the pictures below!`;

    const qEn = document.getElementById('quiz-question-en');
    if (qEn) qEn.textContent = challenge.question;

    // Reset feedback, toast & answered card state
    const dilemmaCard = document.getElementById('quiz-dilemma-card');
    if (dilemmaCard) dilemmaCard.classList.remove('answered');

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const encToast = document.getElementById('quiz-encouragement-toast');
    if (feedbackBox) feedbackBox.style.display = 'none';
    if (encToast) encToast.style.display = 'none';

    // Populate large pictorial options or interactive mini-puzzles
    const container = document.getElementById('quiz-options-container');
    if (container) {
      container.innerHTML = '';

      if (challenge.type === 'puzzle_waste_sorter' && challenge.items) {
        // 1. Waste Sorter Puzzle for Kids
        const puzzleWrap = document.createElement('div');
        puzzleWrap.className = 'puzzle-container';

        const itemsRow = document.createElement('div');
        itemsRow.className = 'puzzle-item-row';
        let sortedCount = 0;

        challenge.items.forEach((item) => {
          const chip = document.createElement('button');
          chip.className = 'quiz-option-btn puzzle-item-chip ui-interactive';
          chip.innerHTML = `${item.icon} ${item.name}`;
          chip.addEventListener('click', () => {
            chip.classList.add('sorted');
            chip.innerHTML = `✅ ${item.name}`;
            audio.playClick();
            sortedCount++;
            if (sortedCount >= challenge.items.length) {
              this.handleQuizSuccess(challenge);
            }
          });
          itemsRow.appendChild(chip);
        });

        const binsRow = document.createElement('div');
        binsRow.className = 'puzzle-bins-row';
        binsRow.innerHTML = `
          <div class="puzzle-bin-card bin-recycle">
            <span class="bin-icon">🟦</span>
            <span class="bin-title">Recycle Bin</span>
            <span class="bin-desc">Plastics &amp; Cans</span>
          </div>
          <div class="puzzle-bin-card bin-compost">
            <span class="bin-icon">🟩</span>
            <span class="bin-title">Compost Bin</span>
            <span class="bin-desc">Peels &amp; Scraps</span>
          </div>
        `;

        puzzleWrap.appendChild(itemsRow);
        puzzleWrap.appendChild(binsRow);
        container.appendChild(puzzleWrap);
      } else if (challenge.type === 'puzzle_pipe_flow' && challenge.segments) {
        // 2. Pipe Alignment Puzzle for Junior
        const puzzleWrap = document.createElement('div');
        puzzleWrap.className = 'puzzle-container';

        const pipeRow = document.createElement('div');
        pipeRow.className = 'puzzle-pipe-row';

        const hubStart = document.createElement('div');
        hubStart.className = 'pipe-segment-card connected';
        hubStart.innerHTML = `🚰`;
        pipeRow.appendChild(hubStart);

        challenge.segments.forEach((seg) => {
          let currentRot = seg.initialRotation;
          const card = document.createElement('button');
          card.className = `quiz-option-btn pipe-segment-card ui-interactive ${currentRot === 0 ? 'connected' : ''}`;
          card.style.transform = `rotate(${currentRot}deg)`;
          card.innerHTML = seg.icon;

          card.addEventListener('click', () => {
            currentRot = (currentRot + 90) % 360;
            card.style.transform = `rotate(${currentRot}deg)`;
            audio.playClick();
            if (currentRot === 0 || currentRot === 180) {
              card.classList.add('connected');
            } else {
              card.classList.remove('connected');
            }

            const allConnected = [...pipeRow.querySelectorAll('.pipe-segment-card')].every(c => c.classList.contains('connected'));
            if (allConnected) {
              this.handleQuizSuccess(challenge);
            }
          });
          pipeRow.appendChild(card);
        });

        const hubEnd = document.createElement('div');
        hubEnd.className = 'pipe-segment-card connected';
        hubEnd.innerHTML = `🏠`;
        pipeRow.appendChild(hubEnd);

        puzzleWrap.appendChild(pipeRow);
        container.appendChild(puzzleWrap);
      } else if (challenge.type === 'puzzle_emergency_dispatch' && challenge.steps) {
        // 3. Emergency Dispatch Puzzle for Teens/Adults
        const puzzleWrap = document.createElement('div');
        puzzleWrap.className = 'puzzle-container';

        let currentStep = 1;
        challenge.steps.forEach((st) => {
          const btn = document.createElement('button');
          btn.className = 'quiz-option-btn pictorial-option-card ui-interactive';
          btn.innerHTML = `
            <div class="pictorial-icon-box">${st.icon}</div>
            <div class="pictorial-texts">
              <div class="pictorial-desc">${st.label}</div>
            </div>
          `;

          btn.addEventListener('click', () => {
            if (st.correctStep === currentStep) {
              btn.classList.add('option-correct');
              audio.playClick();
              currentStep++;
              if (currentStep > challenge.steps.length) {
                this.handleQuizSuccess(challenge);
              }
            } else {
              btn.classList.add('option-wrong');
              setTimeout(() => btn.classList.remove('option-wrong'), 500);
            }
          });
          puzzleWrap.appendChild(btn);
        });
        container.appendChild(puzzleWrap);
      } else if (challenge.options) {
        // Standard Pictorial Quiz Options
        challenge.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.className = 'quiz-option-btn pictorial-option-card ui-interactive';
          btn.dataset.id = opt.id;
          btn.innerHTML = `
            <div class="pictorial-icon-box">${opt.icon}</div>
            <div class="pictorial-texts">
              <div class="pictorial-label">${opt.picture || ''}</div>
              <div class="pictorial-desc">${opt.text}</div>
            </div>
          `;

          btn.addEventListener('click', () => {
            this.handleQuizOption(opt, btn, challenge);
          });

          container.appendChild(btn);
        });
      }
    }

    this.updateBadgesRibbon();
  }

  // Handle Quiz Option Selection
  handleQuizOption(option, btnElement, challenge) {
    const encToast = document.getElementById('quiz-encouragement-toast');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const dilemmaCard = document.getElementById('quiz-dilemma-card');

    if (option.isCorrect) {
      // Correct answer!
      audio.playChallengeSuccess();
      btnElement.classList.add('option-correct');
      if (dilemmaCard) dilemmaCard.classList.add('answered');

      // Disable other buttons
      const allBtns = document.querySelectorAll('.quiz-option-btn');
      allBtns.forEach(b => {
        if (b !== btnElement) b.classList.add('option-disabled');
      });

      // Unlock badge
      if (challenge.badgeId) {
        this.unlockedBadges.add(challenge.badgeId);
      }
      this.completedQuizIds.add(challenge.id);

      // Populate celebration feedback
      if (encToast) encToast.style.display = 'none';
      if (feedbackBox) {
        feedbackBox.style.display = 'flex';
        feedbackBox.classList.add('feedback-bounce-in');
      }

      const badgeObj = CIVIC_BADGES.find(b => b.id === challenge.badgeId);
      const unlockedEl = document.getElementById('feedback-badge-unlocked');
      if (badgeObj && unlockedEl) {
        unlockedEl.style.display = 'flex';
        const iconEl = document.getElementById('feedback-badge-icon');
        if (iconEl) iconEl.textContent = badgeObj.icon;
        const textEl = document.getElementById('feedback-badge-text');
        if (textEl) textEl.textContent = `New Medal: ${badgeObj.name}`;
      } else if (unlockedEl) {
        unlockedEl.style.display = 'none';
      }

      const descEl = document.getElementById('feedback-desc');
      if (descEl) descEl.textContent = challenge.explanation;

      this.updateBadgesRibbon();

      // Trigger callback to reward player
      if (this.onResolveEducationalQuiz) {
        this.onResolveEducationalQuiz(challenge);
      }

      // CRITICAL REQUIREMENT: Automatic return to game after 1.2s on correct answer!
      clearTimeout(this.quizAutoResumeTimeout);
      this.quizAutoResumeTimeout = setTimeout(() => {
        this.closeEducationalQuiz();
      }, 1200);

    } else {
      // Gentle encouragement without closing or skipping
      audio.playQuizTryAgain();
      btnElement.classList.add('option-wrong');
      setTimeout(() => btnElement.classList.remove('option-wrong'), 500);

      if (encToast) {
        encToast.style.display = 'flex';
        encToast.classList.add('enc-shake');
        setTimeout(() => encToast.classList.remove('enc-shake'), 600);
      }
    }
  }

  handleQuizSuccess(challenge) {
    audio.playChallengeSuccess();
    const dilemmaCard = document.getElementById('quiz-dilemma-card');
    if (dilemmaCard) dilemmaCard.classList.add('answered');

    if (challenge.badgeId) {
      this.unlockedBadges.add(challenge.badgeId);
    }
    this.completedQuizIds.add(challenge.id);

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const encToast = document.getElementById('quiz-encouragement-toast');
    if (encToast) encToast.style.display = 'none';
    if (feedbackBox) {
      feedbackBox.style.display = 'flex';
      feedbackBox.classList.add('feedback-bounce-in');
    }

    const badgeObj = CIVIC_BADGES.find(b => b.id === challenge.badgeId);
    const unlockedEl = document.getElementById('feedback-badge-unlocked');
    if (badgeObj && unlockedEl) {
      unlockedEl.style.display = 'flex';
      const iconEl = document.getElementById('feedback-badge-icon');
      if (iconEl) iconEl.textContent = badgeObj.icon;
      const textEl = document.getElementById('feedback-badge-text');
      if (textEl) textEl.textContent = `New Medal: ${badgeObj.name}`;
    }

    const descEl = document.getElementById('feedback-desc');
    if (descEl) {
      descEl.textContent = challenge.feedback || 'Outstanding civic work! Karachi streets are cleaner and safer thanks to you!';
    }

    this.updateBadgesRibbon();

    if (this.onResolveEducationalQuiz) {
      this.onResolveEducationalQuiz(challenge);
    }

    clearTimeout(this.quizAutoResumeTimeout);
    this.quizAutoResumeTimeout = setTimeout(() => {
      this.closeEducationalQuiz();
    }, 1200);
  }

  closeEducationalQuiz() {
    clearTimeout(this.quizAutoResumeTimeout);
    if (this.quizModal) {
      this.quizModal.style.display = 'none';
    }
    if (this.onResumeGame) {
      this.onResumeGame();
    }
  }

  updateBadgesRibbon() {
    const row = document.getElementById('quiz-badges-row');
    if (!row) return;
    row.innerHTML = '';

    CIVIC_BADGES.forEach(badge => {
      const isUnlocked = this.unlockedBadges.has(badge.id);
      const chip = document.createElement('div');
      chip.className = `badge-chip ${isUnlocked ? 'unlocked' : 'locked'}`;
      chip.title = `${badge.name}: ${badge.desc}`;
      chip.innerHTML = `
        <span class="badge-chip-icon">${badge.icon}</span>
        <span class="badge-chip-name">${badge.name}</span>
        ${isUnlocked ? '<span class="badge-check">✓</span>' : '<span class="badge-lock">🔒</span>'}
      `;
      row.appendChild(chip);
    });
  }

  // Create Citizen Dialogue Modal
  createCitizenDialogueModal() {
    this.dialogueModal = document.createElement('div');
    this.dialogueModal.className = 'modal-backdrop citizen-dialogue-backdrop';
    this.dialogueModal.id = 'modal-citizen-dialogue';
    this.dialogueModal.style.display = 'none';

    this.dialogueModal.innerHTML = `
      <div class="modal-card citizen-dialogue-card">
        <div class="citizen-dialogue-header">
          <div class="citizen-avatar-badge" id="dialogue-citizen-icon">☕</div>
          <div class="citizen-info-col">
            <h2 class="citizen-name" id="dialogue-citizen-name">Uncle Shamim</h2>
            <span class="citizen-role" id="dialogue-citizen-role">Burns Road Food Street Master</span>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-dialogue">&times;</button>
        </div>

        <div class="citizen-speech-bubble">
          <div class="speech-urdu" id="dialogue-text-urdu">"السلام علیکم بیٹا! گرما گرم کڑک چائے پیو..."</div>
          <div class="speech-english" id="dialogue-text-english">"Assalam-o-Alaikum son! Have a hot cup of Karak Chai..."</div>
        </div>

        <div class="dialogue-feedback-banner" id="dialogue-feedback-banner" style="display: none;"></div>

        <div class="dialogue-choices-list" id="dialogue-choices-container">
          <!-- Populated dynamically -->
        </div>

        <div class="dialogue-footer-hint">
          <span>💡 Street Wisdom: Speak with local residents to discover district problems and earn bonus XP!</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.dialogueModal);
  }

  // Create Mission Journal & District Restoration Gauges Modal
  createMissionJournalModal() {
    this.journalModal = document.createElement('div');
    this.journalModal.className = 'modal-backdrop mission-journal-backdrop';
    this.journalModal.id = 'modal-mission-journal';
    this.journalModal.style.display = 'none';

    this.journalModal.innerHTML = `
      <div class="modal-card mission-journal-card">
        <div class="modal-header journal-header">
          <div class="journal-title-row">
            <span class="journal-crest">📜</span>
            <div>
              <h2 class="journal-main-title">KARACHI CIVIC JOURNAL</h2>
              <span class="journal-sub-title" id="journal-district-subtitle">District 1: Tariq Road & PECHS</span>
            </div>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-journal">&times;</button>
        </div>

        <!-- District Restoration Gauges -->
        <div class="journal-section restoration-section">
          <h3 class="section-title">🏙️ DISTRICT RESTORATION GAUGES</h3>
          <div class="restoration-grid">
            <div class="gauge-card">
              <div class="gauge-head">
                <span>🧹 Cleanliness</span>
                <span class="gauge-pct" id="gauge-cleanliness-val">65%</span>
              </div>
              <div class="gauge-bar-track">
                <div class="gauge-bar-fill fill-cleanliness" id="gauge-cleanliness-bar" style="width: 65%"></div>
              </div>
            </div>

            <div class="gauge-card">
              <div class="gauge-head">
                <span>🚧 Infrastructure</span>
                <span class="gauge-pct" id="gauge-infra-val">50%</span>
              </div>
              <div class="gauge-bar-track">
                <div class="gauge-bar-fill fill-infra" id="gauge-infra-bar" style="width: 50%"></div>
              </div>
            </div>

            <div class="gauge-card">
              <div class="gauge-head">
                <span>🚦 Traffic Flow</span>
                <span class="gauge-pct" id="gauge-traffic-val">70%</span>
              </div>
              <div class="gauge-bar-track">
                <div class="gauge-bar-fill fill-traffic" id="gauge-traffic-bar" style="width: 70%"></div>
              </div>
            </div>

            <div class="gauge-card">
              <div class="gauge-head">
                <span>🕊️ Peace & Safety</span>
                <span class="gauge-pct" id="gauge-safety-val">80%</span>
              </div>
              <div class="gauge-bar-track">
                <div class="gauge-bar-fill fill-safety" id="gauge-safety-bar" style="width: 80%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Missions Checklist -->
        <div class="journal-section">
          <h3 class="section-title">🎯 DISTRICT CIVIC TASKS</h3>
          <div class="journal-missions-list" id="journal-missions-list">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Civic Badges Showcase -->
        <div class="journal-section">
          <h3 class="section-title">🎖️ KARACHI CIVIC BADGES</h3>
          <div class="journal-badges-grid" id="journal-badges-grid">
            <!-- Populated dynamically -->
          </div>
        </div>

        <div class="journal-footer">
          <button class="primary-btn ui-interactive" id="btn-journal-resume">
            ▶ RESUME STREET PATROL
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.journalModal);
  }

  setTalkPrompt(visible, citizenName = '') {
    const prompt = document.getElementById('hud-talk-prompt');
    const btnTalk = document.getElementById('btn-talk');
    if (!prompt) return;
    if (visible) {
      const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
      const keySuffix = isMobile ? '' : ' [E]';
      if (btnTalk) {
        btnTalk.textContent = citizenName
          ? `💬 TALK TO ${citizenName.toUpperCase()}${keySuffix}`
          : `💬 TALK${keySuffix}`;
      }
      prompt.style.display = 'block';
    } else {
      prompt.style.display = 'none';
    }
  }

  showCitizenDialogue(citizenId, onReward, onClose) {
    const citizen = CITIZEN_DIALOGUES[citizenId];
    if (!citizen || !this.dialogueModal) return;

    audio.playDialogueChime();
    this.activeDialogueCitizen = citizenId;
    this.onDialogueReward = onReward;
    this.onDialogueClose = onClose;

    const iconEl = document.getElementById('dialogue-citizen-icon');
    const nameEl = document.getElementById('dialogue-citizen-name');
    const roleEl = document.getElementById('dialogue-citizen-role');
    const urduEl = document.getElementById('dialogue-text-urdu');
    const engEl = document.getElementById('dialogue-text-english');
    const feedbackEl = document.getElementById('dialogue-feedback-banner');
    const choicesContainer = document.getElementById('dialogue-choices-container');

    if (iconEl) iconEl.textContent = citizen.avatarEmoji || '👤';
    if (nameEl) nameEl.textContent = citizen.name;
    if (roleEl) roleEl.textContent = `${citizen.role} • ${citizen.neighborhood}`;
    if (urduEl) urduEl.textContent = `"${citizen.dialogue.greetingUrdu}"`;
    if (engEl) engEl.textContent = `"${citizen.dialogue.greetingEn}"`;
    if (feedbackEl) feedbackEl.style.display = 'none';

    if (choicesContainer) {
      choicesContainer.innerHTML = '';
      citizen.dialogue.choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'dialogue-choice-btn ui-interactive';
        btn.innerHTML = `
          <div class="choice-text-col">
            <span class="choice-text-en">${ch.textEn}</span>
            <span class="choice-text-urdu">${ch.textUrdu}</span>
          </div>
          <span class="choice-xp-pill">+${ch.xpBonus || 50} XP</span>
        `;
        btn.addEventListener('click', () => {
          audio.playClick();
          if (urduEl) urduEl.textContent = `"${ch.responseUrdu}"`;
          if (engEl) engEl.textContent = `"${ch.responseEn}"`;
          if (feedbackEl) {
            feedbackEl.innerHTML = `<span>${ch.civicTip}</span>`;
            feedbackEl.style.display = 'block';
          }
          if (this.onDialogueReward) {
            this.onDialogueReward(citizenId, ch);
          }
        });
        choicesContainer.appendChild(btn);
      });
    }

    this.dialogueModal.style.display = 'flex';
  }

  closeCitizenDialogue() {
    if (this.dialogueModal) {
      this.dialogueModal.style.display = 'none';
    }
    this.activeDialogueCitizen = null;
    if (this.onDialogueClose) {
      this.onDialogueClose();
    }
  }

  showMissionJournal(districtData, careerStats, badges, onClose) {
    if (!this.journalModal) return;
    audio.playClick();
    this.onJournalClose = onClose;

    const subTitle = document.getElementById('journal-district-subtitle');
    if (subTitle && districtData) {
      subTitle.textContent = `${districtData.name || 'District 1'} • ${districtData.subtitle || 'Karachi'}`;
    }

    // Gauges
    const gauges = (districtData && districtData.gauges) || {
      cleanliness: 65,
      infrastructure: 50,
      trafficFlow: 70,
      safety: 80
    };

    const setGauge = (idVal, idBar, val) => {
      const vEl = document.getElementById(idVal);
      const bEl = document.getElementById(idBar);
      const clampVal = Math.max(0, Math.min(100, Math.round(val)));
      if (vEl) vEl.textContent = `${clampVal}%`;
      if (bEl) bEl.style.width = `${clampVal}%`;
    };

    setGauge('gauge-cleanliness-val', 'gauge-cleanliness-bar', gauges.cleanliness);
    setGauge('gauge-infra-val', 'gauge-infra-bar', gauges.infrastructure);
    setGauge('gauge-traffic-val', 'gauge-traffic-bar', gauges.trafficFlow);
    setGauge('gauge-safety-val', 'gauge-safety-bar', gauges.safety);

    // Missions List
    const mList = document.getElementById('journal-missions-list');
    if (mList && districtData && districtData.missions) {
      mList.innerHTML = '';
      districtData.missions.forEach(m => {
        const item = document.createElement('div');
        item.className = `journal-mission-row ${m.completed ? 'completed' : 'pending'}`;
        item.innerHTML = `
          <span class="jm-icon">${m.completed ? '✅' : '⏳'}</span>
          <div class="jm-info">
            <span class="jm-title">${m.title}</span>
            <span class="jm-desc">${m.desc}</span>
          </div>
          <span class="jm-reward">+${m.rewardXP || 200} XP</span>
        `;
        mList.appendChild(item);
      });
    }

    // Badges Showcase
    const bGrid = document.getElementById('journal-badges-grid');
    if (bGrid) {
      bGrid.innerHTML = '';
      CIVIC_BADGES.forEach(badge => {
        const hasIt = badges ? badges.has(badge.id) : this.unlockedBadges.has(badge.id);
        const card = document.createElement('div');
        card.className = `journal-badge-card ${hasIt ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <span class="jb-icon">${badge.icon}</span>
          <span class="jb-name">${badge.name}</span>
          <span class="jb-desc">${badge.desc}</span>
          <span class="jb-status">${hasIt ? 'UNLOCKED' : 'LOCKED'}</span>
        `;
        bGrid.appendChild(card);
      });
    }

    this.journalModal.style.display = 'flex';
  }

  closeMissionJournal() {
    if (this.journalModal) {
      this.journalModal.style.display = 'none';
    }
    if (this.onJournalClose) {
      this.onJournalClose();
    }
  }

  // Bind All Event Listeners
  bindEvents() {
    // 1. Start Mission Button
    const btnStartPatrol = document.getElementById('btn-start-patrol');
    if (btnStartPatrol) {
      btnStartPatrol.addEventListener('click', () => {
        audio.playClick();
        const input = document.getElementById('player-name-input');
        if (input && input.value.trim()) {
          this.playerName = input.value.trim().slice(0, 18);
        }
        this.startModal.style.display = 'none';
        if (this.onStartGame) {
          this.onStartGame({
            playerName: this.playerName,
            ageTier: this.currentAgeTier,
            avatarId: this.selectedAvatar || 'tariq',
            districtLevel: this.selectedDistrictLevel || 1
          });
        }
      });
    }

    // Continue Career Button
    const btnContinueCareer = document.getElementById('btn-continue-career');
    if (btnContinueCareer) {
      btnContinueCareer.addEventListener('click', () => {
        audio.playClick();
        this.startModal.style.display = 'none';
        if (this.onContinueCareer) {
          this.onContinueCareer(saveManager.get());
        } else if (this.onStartGame) {
          this.onStartGame({
            playerName: this.playerName,
            ageTier: this.currentAgeTier,
            avatarId: this.selectedAvatar || 'tariq',
            districtLevel: this.selectedDistrictLevel || 1
          });
        }
      });
    }

    // District / Level Cards selection on start modal
    const startDistrictCards = document.querySelectorAll('#start-district-grid .district-card');
    startDistrictCards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        startDistrictCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedDistrictLevel = parseInt(card.dataset.level) || 1;
        if (btnStartPatrol) {
          btnStartPatrol.textContent = `🚀 START PATROL (LEVEL ${this.selectedDistrictLevel}) ➔`;
        }
      });
    });

    // Age cards selection on start modal
    const startAgeCards = document.querySelectorAll('#start-age-grid .age-card');
    startAgeCards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        startAgeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentAgeTier = card.dataset.age;

        // Sync tab on quiz modal
        const quizTabs = document.querySelectorAll('.age-tab');
        quizTabs.forEach(t => {
          if (t.dataset.age === this.currentAgeTier) t.classList.add('active');
          else t.classList.remove('active');
        });
      });
    });

    // 3D Avatar Selection Cards on start modal
    const startAvatarCards = document.querySelectorAll('#start-avatar-grid .avatar-card');
    startAvatarCards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        startAvatarCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedAvatar = card.dataset.avatar;
      });
    });

    // Sprint Button
    const btnSprint = document.getElementById('btn-sprint');
    if (btnSprint) {
      btnSprint.addEventListener('mousedown', () => { window.isBoostPressed = true; });
      btnSprint.addEventListener('mouseup', () => { window.isBoostPressed = false; });
      btnSprint.addEventListener('touchstart', (e) => { e.preventDefault(); window.isBoostPressed = true; });
      btnSprint.addEventListener('touchend', (e) => { e.preventDefault(); window.isBoostPressed = false; });
    }

    // Jump Button (Mobile Traversal)
    const btnJump = document.getElementById('btn-jump');
    if (btnJump) {
      const doJump = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        audio.playJump();
        if (this.onJump) this.onJump();
      };
      btnJump.addEventListener('click', doJump);
      btnJump.addEventListener('touchstart', doJump, { passive: false });
    }

    // Talk Button Prompt (Interactive Citizen Dialogues)
    const btnTalk = document.getElementById('btn-talk');
    if (btnTalk) {
      const doTalk = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (this.onInteractCitizen) this.onInteractCitizen();
      };
      btnTalk.addEventListener('click', doTalk);
      btnTalk.addEventListener('touchstart', doTalk, { passive: false });
    }

    // Toggle Collapse / Expand District Missions Card
    const missionCard = document.getElementById('district-mission-banner');
    const btnToggleMission = document.getElementById('btn-toggle-mission-card');
    const headerToggle = document.getElementById('mission-card-header-toggle');

    const toggleMissionCard = () => {
      if (!missionCard) return;
      const isCollapsed = missionCard.classList.toggle('collapsed');
      if (btnToggleMission) {
        btnToggleMission.textContent = isCollapsed ? '▼' : '▲';
        btnToggleMission.title = isCollapsed ? 'Expand Missions' : 'Collapse Missions';
      }
    };

    if (btnToggleMission) {
      btnToggleMission.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMissionCard();
      });
    }
    if (headerToggle) {
      headerToggle.addEventListener('click', toggleMissionCard);
    }

    // On mobile screens or touch devices, collapse by default to unblock screen
    if (window.innerWidth <= 768 || ('ontouchstart' in window)) {
      if (missionCard) {
        missionCard.classList.add('collapsed');
        if (btnToggleMission) btnToggleMission.textContent = '▼';
      }
    }

    // Mission Journal Buttons
    const openJournal = () => {
      audio.playClick();
      if (this.onOpenMissionJournal) this.onOpenMissionJournal();
    };
    const btnJournal = document.getElementById('btn-journal');
    if (btnJournal) btnJournal.addEventListener('click', openJournal);
    const btnTopJournal = document.getElementById('btn-top-journal');
    if (btnTopJournal) btnTopJournal.addEventListener('click', openJournal);

    const closeJournal = () => {
      audio.playClick();
      this.closeMissionJournal();
    };
    const btnCloseJournal = document.getElementById('btn-close-journal');
    if (btnCloseJournal) btnCloseJournal.addEventListener('click', closeJournal);
    const btnJournalResume = document.getElementById('btn-journal-resume');
    if (btnJournalResume) btnJournalResume.addEventListener('click', closeJournal);

    const btnCloseDialogue = document.getElementById('btn-close-dialogue');
    if (btnCloseDialogue) {
      btnCloseDialogue.addEventListener('click', () => {
        audio.playClick();
        this.closeCitizenDialogue();
      });
    }

    // 2. Sound & Music
    const btnSound = document.getElementById('btn-toggle-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const enabled = audio.toggleSound();
        btnSound.textContent = enabled ? '🔊' : '🔇';
      });
    }

    const btnMusic = document.getElementById('btn-toggle-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        const enabled = audio.toggleMusic();
        btnMusic.textContent = enabled ? '🎵' : '⏹';
      });
    }

    // 3. Skins Modal
    const btnSkins = document.getElementById('btn-open-skins');
    if (btnSkins) {
      btnSkins.addEventListener('click', () => {
        audio.playClick();
        if (this.onPauseGame) this.onPauseGame();
        if (this.skinModal) this.skinModal.style.display = 'flex';
      });
    }

    const btnCloseSkins = document.getElementById('btn-close-skins');
    if (btnCloseSkins) {
      btnCloseSkins.addEventListener('click', () => {
        audio.playClick();
        if (this.skinModal) this.skinModal.style.display = 'none';
        if (this.onResumeGame) this.onResumeGame();
      });
    }

    // 4. Good vs Bad Guide Modal
    const btnOpenGuide = document.getElementById('btn-open-guide');
    if (btnOpenGuide) {
      btnOpenGuide.addEventListener('click', () => {
        audio.playClick();
        if (this.onPauseGame) this.onPauseGame();
        if (this.guideModal) this.guideModal.style.display = 'flex';
      });
    }

    const btnCloseGuide = document.getElementById('btn-close-guide');
    if (btnCloseGuide) {
      btnCloseGuide.addEventListener('click', () => {
        audio.playClick();
        if (this.guideModal) this.guideModal.style.display = 'none';
        if (this.onResumeGame) this.onResumeGame();
      });
    }

    const btnCloseGuideFooter = document.getElementById('btn-close-guide-footer');
    if (btnCloseGuideFooter) {
      btnCloseGuideFooter.addEventListener('click', () => {
        audio.playClick();
        if (this.guideModal) this.guideModal.style.display = 'none';
        if (this.onResumeGame) this.onResumeGame();
      });
    }

    // 5. Educational Quiz Modal Buttons
    const btnOpenQuiz = document.getElementById('btn-open-quiz');
    if (btnOpenQuiz) {
      btnOpenQuiz.addEventListener('click', () => {
        audio.playClick();
        this.openEducationalQuiz();
      });
    }

    // Age Tier Tab Selection in Quiz Modal
    const ageTabs = document.querySelectorAll('.age-tab');
    ageTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audio.playClick();
        ageTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentAgeTier = tab.dataset.age;
        const newChallenge = getRandomChallenge(this.currentAgeTier);
        this.renderQuizChallenge(newChallenge);
      });
    });

    // Skin card selection
    if (this.skinModal) {
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
            if (this.skinModal) this.skinModal.style.display = 'none';
            if (this.onResumeGame) this.onResumeGame();
          }, 150);
        });
      });
    }

    // Difficulty Toggle (Kids / Easy by default)
    const btnDiff = document.getElementById('btn-diff-toggle');
    if (btnDiff) {
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
    }

    // Manual Pause button on HUD (Opens full Game Menu & Settings)
    const btnManualPause = document.getElementById('btn-manual-pause');
    if (btnManualPause) {
      btnManualPause.addEventListener('click', () => {
        audio.playClick();
        this.showGameMenuModal();
      });
    }

    // Auto-Resume button on pause modal
    const btnAutoResume = document.getElementById('btn-auto-resume');
    if (btnAutoResume) {
      btnAutoResume.addEventListener('click', () => {
        this.hideAutoPauseModal();
      });
    }

    // Auto-Pause modal actions: Open Menu & Exit to Main Menu
    const btnPauseOpenMenu = document.getElementById('btn-pause-open-menu');
    if (btnPauseOpenMenu) {
      btnPauseOpenMenu.addEventListener('click', () => {
        this.hideAutoPauseModal();
        this.showGameMenuModal();
      });
    }

    const btnPauseExitTitle = document.getElementById('btn-pause-exit-title');
    if (btnPauseExitTitle) {
      btnPauseExitTitle.addEventListener('click', () => {
        this.hideAutoPauseModal();
        if (this.onReturnToMainMenu) {
          this.onReturnToMainMenu();
        } else {
          this.returnToMainMenu();
        }
      });
    }

    // 7. Comprehensive Game Menu & Settings Hub Buttons
    const btnOpenGameMenu = document.getElementById('btn-open-game-menu');
    if (btnOpenGameMenu) {
      btnOpenGameMenu.addEventListener('click', () => {
        this.showGameMenuModal();
      });
    }

    const btnCloseGameMenu = document.getElementById('btn-close-game-menu');
    if (btnCloseGameMenu) {
      btnCloseGameMenu.addEventListener('click', () => {
        this.hideGameMenuModal();
      });
    }

    const btnMenuResume = document.getElementById('btn-menu-resume');
    if (btnMenuResume) {
      btnMenuResume.addEventListener('click', () => {
        this.hideGameMenuModal();
      });
    }

    const btnMenuFooterClose = document.getElementById('btn-menu-footer-close');
    if (btnMenuFooterClose) {
      btnMenuFooterClose.addEventListener('click', () => {
        this.hideGameMenuModal();
      });
    }

    const btnMenuRestart = document.getElementById('btn-menu-restart');
    if (btnMenuRestart) {
      btnMenuRestart.addEventListener('click', () => {
        this.hideGameMenuModal();
        if (this.onRestartGame) this.onRestartGame();
      });
    }

    const btnMenuExitTitle = document.getElementById('btn-menu-exit-title');
    if (btnMenuExitTitle) {
      btnMenuExitTitle.addEventListener('click', () => {
        if (this.onReturnToMainMenu) {
          this.onReturnToMainMenu();
        } else {
          this.returnToMainMenu();
        }
      });
    }

    // Game Menu Hub Navigation to other sub-menus
    const btnMenuJournal = document.getElementById('btn-menu-open-journal');
    if (btnMenuJournal) {
      btnMenuJournal.addEventListener('click', () => {
        this.hideGameMenuModal();
        openJournal();
      });
    }

    const btnMenuSkins = document.getElementById('btn-menu-open-skins');
    if (btnMenuSkins) {
      btnMenuSkins.addEventListener('click', () => {
        this.hideGameMenuModal();
        if (this.skinModal) this.skinModal.style.display = 'flex';
      });
    }

    const btnMenuQuiz = document.getElementById('btn-menu-open-quiz');
    if (btnMenuQuiz) {
      btnMenuQuiz.addEventListener('click', () => {
        this.hideGameMenuModal();
        this.openEducationalQuiz();
      });
    }

    const btnMenuGuide = document.getElementById('btn-menu-open-guide');
    if (btnMenuGuide) {
      btnMenuGuide.addEventListener('click', () => {
        this.hideGameMenuModal();
        if (this.guideModal) this.guideModal.style.display = 'flex';
      });
    }

    // District / Level Direct Select inside Game Menu
    [1, 2, 3].forEach(lvl => {
      const btn = document.getElementById(`btn-menu-level-${lvl}`);
      if (btn) {
        btn.addEventListener('click', () => {
          audio.playClick();
          this.hideGameMenuModal();
          if (window.game && window.game.loadDistrictLevel) {
            window.game.loadDistrictLevel(lvl);
          }
        });
      }
    });

    // Settings SFX & Music toggles inside Game Menu
    const btnMenuToggleSfx = document.getElementById('btn-menu-toggle-sfx');
    if (btnMenuToggleSfx) {
      btnMenuToggleSfx.addEventListener('click', () => {
        const enabled = audio.toggleSound();
        btnMenuToggleSfx.textContent = enabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
        btnMenuToggleSfx.classList.toggle('active', enabled);
        if (btnSound) btnSound.textContent = enabled ? '🔊' : '🔇';
      });
    }

    const btnMenuToggleMusic = document.getElementById('btn-menu-toggle-music');
    if (btnMenuToggleMusic) {
      btnMenuToggleMusic.addEventListener('click', () => {
        const enabled = audio.toggleMusic();
        btnMenuToggleMusic.textContent = enabled ? '🎵 MUSIC: ON' : '⏹ MUSIC: OFF';
        btnMenuToggleMusic.classList.toggle('active', enabled);
        if (btnMusic) btnMusic.textContent = enabled ? '🎵' : '⏹';
      });
    }

    // Civic Moral Dilemmas / Quiz Toggle (Default: OFF per user instruction)
    const btnMenuToggleQuiz = document.getElementById('btn-menu-toggle-quiz');
    if (btnMenuToggleQuiz) {
      btnMenuToggleQuiz.addEventListener('click', () => {
        audio.playClick();
        this.civicQuizEnabled = !this.civicQuizEnabled;
        try {
          localStorage.setItem('hole_karachi_civic_quiz_enabled', this.civicQuizEnabled ? 'true' : 'false');
        } catch (e) {}
        if (window.game) {
          window.game.civicQuizEnabled = this.civicQuizEnabled;
        }
        btnMenuToggleQuiz.textContent = this.civicQuizEnabled ? '🎓 QUIZ: ON' : '🎓 QUIZ: OFF';
        btnMenuToggleQuiz.classList.toggle('active', this.civicQuizEnabled);
        this.showAnnouncement(
          this.civicQuizEnabled ? '🎓 Civic Moral Dilemmas Enabled' : '🎓 Civic Questions Disabled (Patrol Flow Focus)',
          this.civicQuizEnabled ? '#00e5ff' : '#94a3b8'
        );
      });
    }

    // Age Tier Pills inside Game Menu
    const menuAgePills = document.querySelectorAll('#menu-age-pills .tier-pill-btn');
    menuAgePills.forEach(pill => {
      pill.addEventListener('click', () => {
        audio.playClick();
        menuAgePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentAgeTier = pill.dataset.age;
        this.difficulty = (this.currentAgeTier === 'kids') ? 'kidsEasy' : 'classic';
        if (this.onSelectDifficulty) this.onSelectDifficulty(this.difficulty);

        const ageBadge = document.getElementById('menu-age-badge');
        if (ageBadge) {
          const labels = { kids: 'KIDS (5-8)', junior: 'JUNIOR (9-12)', senior: 'TEENS (13+)' };
          ageBadge.textContent = labels[this.currentAgeTier] || 'KIDS (5-8)';
        }

        const startAgeCards = document.querySelectorAll('#start-age-grid .age-card');
        startAgeCards.forEach(c => {
          if (c.dataset.age === this.currentAgeTier) c.classList.add('active');
          else c.classList.remove('active');
        });
        const quizTabs = document.querySelectorAll('.age-tab');
        quizTabs.forEach(t => {
          if (t.dataset.age === this.currentAgeTier) t.classList.add('active');
          else t.classList.remove('active');
        });
      });
    });

    // Camera Perspective mode inside Game Menu
    const btnCamStreet = document.getElementById('btn-cam-street');
    const btnCamWide = document.getElementById('btn-cam-wide');
    if (btnCamStreet && btnCamWide) {
      btnCamStreet.addEventListener('click', () => {
        audio.playClick();
        btnCamStreet.classList.add('active');
        btnCamWide.classList.remove('active');
        if (window.game) window.game.cameraWideMode = false;
      });
      btnCamWide.addEventListener('click', () => {
        audio.playClick();
        btnCamWide.classList.add('active');
        btnCamStreet.classList.remove('active');
        if (window.game) window.game.cameraWideMode = true;
      });
    }

    // Keyboard shortcut [Esc] for toggling Game Menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (this.gameMenuModal && this.gameMenuModal.style.display !== 'none') {
          this.hideGameMenuModal();
        } else if (this.autoPauseModal && this.autoPauseModal.style.display !== 'none') {
          this.hideAutoPauseModal();
        } else if (this.skinModal && this.skinModal.style.display !== 'none') {
          this.skinModal.style.display = 'none';
          if (this.onResumeGame) this.onResumeGame();
        } else if (this.guideModal && this.guideModal.style.display !== 'none') {
          this.guideModal.style.display = 'none';
          if (this.onResumeGame) this.onResumeGame();
        } else if (this.journalModal && this.journalModal.style.display !== 'none') {
          this.closeMissionJournal();
        } else if (this.quizModal && this.quizModal.style.display !== 'none') {
          this.closeEducationalQuiz();
        } else if (window.game && window.game.isGameStarted && !this.isAutoPaused) {
          this.showGameMenuModal();
        }
      }
    });

    // Boost button
    const btnBoost = document.getElementById('btn-boost');
    if (btnBoost) {
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
    }

    // Play Again button
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        audio.playClick();
        if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        if (this.onRestartGame) this.onRestartGame();
      });
    }

    // Next Level button on Game Over
    const btnResultsNext = document.getElementById('btn-results-next');
    if (btnResultsNext) {
      btnResultsNext.addEventListener('click', () => {
        audio.playClick();
        if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        if (this.onNextLevel) this.onNextLevel();
      });
    }

    // CRITICAL REQUIREMENT: Robust Auto-Pause when user switches tabs, minimizes window, or moves away
    const triggerAutoPause = () => {
      // Unconditionally silence audio whenever the user moves away
      audio.pauseAudio();
      // If the game has not started yet or is already over, do not auto-pause
      if (window.game && (!window.game.isGameStarted || window.game.isGameOver)) return;
      this.showAutoPauseModal();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerAutoPause();
      }
    });

    window.addEventListener('blur', () => {
      triggerAutoPause();
    });

    window.addEventListener('pagehide', () => {
      triggerAutoPause();
    });
  }

  showAutoPauseModal() {
    // Don't auto pause if already on start modal, game over, or district cleared
    if (this.startModal && this.startModal.style.display !== 'none') return;
    if (this.gameOverModal && this.gameOverModal.style.display !== 'none') return;
    if (this.districtClearedModal && this.districtClearedModal.style.display !== 'none') return;
    if (window.game && (!window.game.isGameStarted || window.game.isGameOver)) return;

    this.isAutoPaused = true;
    if (this.onPauseGame) this.onPauseGame();
    if (this.autoPauseModal) {
      this.autoPauseModal.style.display = 'flex';
    }
  }

  hideAutoPauseModal() {
    this.isAutoPaused = false;
    if (this.autoPauseModal) {
      this.autoPauseModal.style.display = 'none';
    }
    if (this.onResumeGame) {
      this.onResumeGame();
    }
  }

  showGameMenuModal() {
    if (!this.gameMenuModal) return;
    audio.playClick();
    if (this.onPauseGame) this.onPauseGame();

    // Sync current player stats
    if (window.game && window.game.player) {
      const p = window.game.player;
      const avatarIcons = { tariq: '🇵🇰', ayesha: '🌸', farooq: '👮', bilal: '🚑', zain: '🎒' };
      const iconEl = document.getElementById('menu-avatar-icon');
      if (iconEl) iconEl.textContent = avatarIcons[p.avatarId] || '🇵🇰';
      const nameEl = document.getElementById('menu-player-name');
      if (nameEl) nameEl.textContent = p.name || 'Karachi Hero';
      const lvlEl = document.getElementById('menu-level-badge');
      if (lvlEl) lvlEl.textContent = `LV ${p.level || 1}`;
      const scoreEl = document.getElementById('menu-score-badge');
      if (scoreEl) scoreEl.textContent = `SCORE: ${p.score || 0}`;
      const distEl = document.getElementById('menu-district-badge');
      if (distEl) distEl.textContent = `District ${window.game.currentDistrictLevel || 1}`;
      const summaryEl = document.getElementById('menu-hero-summary');
      if (summaryEl) summaryEl.textContent = `${p.heroTitle || 'Street Patrol Hero'} • District ${window.game.currentDistrictLevel || 1}`;
    }

    // Sync SFX / Music buttons
    const sfxBtn = document.getElementById('btn-menu-toggle-sfx');
    if (sfxBtn) {
      const sOn = audio.soundEnabled;
      sfxBtn.textContent = sOn ? '🔊 SFX: ON' : '🔇 SFX: OFF';
      sfxBtn.classList.toggle('active', sOn);
    }
    const musBtn = document.getElementById('btn-menu-toggle-music');
    if (musBtn) {
      const mOn = audio.musicEnabled;
      musBtn.textContent = mOn ? '🎵 MUSIC: ON' : '⏹ MUSIC: OFF';
      musBtn.classList.toggle('active', mOn);
    }

    const quizToggleBtn = document.getElementById('btn-menu-toggle-quiz');
    if (quizToggleBtn) {
      quizToggleBtn.textContent = this.civicQuizEnabled ? '🎓 QUIZ: ON' : '🎓 QUIZ: OFF';
      quizToggleBtn.classList.toggle('active', this.civicQuizEnabled);
    }

    // Sync Age pills
    const agePills = document.querySelectorAll('#menu-age-pills .tier-pill-btn');
    agePills.forEach(pill => {
      if (pill.dataset.age === this.currentAgeTier) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    // Sync Camera pills
    const camWide = window.game && window.game.cameraWideMode;
    const btnStreet = document.getElementById('btn-cam-street');
    const btnWide = document.getElementById('btn-cam-wide');
    if (btnStreet) btnStreet.classList.toggle('active', !camWide);
    if (btnWide) btnWide.classList.toggle('active', !!camWide);

    // Sync District / Level direct buttons
    const curLevel = (window.game && window.game.currentDistrictLevel) || 1;
    [1, 2, 3].forEach(lvl => {
      const btn = document.getElementById(`btn-menu-level-${lvl}`);
      if (btn) {
        btn.classList.toggle('active', curLevel === lvl);
      }
    });

    this.gameMenuModal.style.display = 'flex';
  }

  hideGameMenuModal() {
    if (!this.gameMenuModal) return;
    audio.playClick();
    this.gameMenuModal.style.display = 'none';
    if (this.onResumeGame) this.onResumeGame();
  }

  returnToMainMenu() {
    if (this.gameMenuModal) this.gameMenuModal.style.display = 'none';
    if (this.autoPauseModal) this.autoPauseModal.style.display = 'none';
    if (this.skinModal) this.skinModal.style.display = 'none';
    if (this.guideModal) this.guideModal.style.display = 'none';
    if (this.quizModal) this.quizModal.style.display = 'none';
    if (this.journalModal) this.journalModal.style.display = 'none';
    if (this.citizenDialogueModal) this.citizenDialogueModal.style.display = 'none';

    if (this.onPauseGame) this.onPauseGame();
    if (window.game) window.game.isGameStarted = false;

    // Refresh Continue Career button on start modal
    try {
      if (typeof saveManager !== 'undefined' && saveManager.get) {
        const save = saveManager.get();
        const btnContinue = document.getElementById('btn-continue-career');
        const continueLevel = document.getElementById('continue-career-level');
        if (btnContinue && save && save.player) {
          btnContinue.style.display = 'flex';
          if (continueLevel) continueLevel.textContent = save.player.level || 1;
        }
      }
    } catch (e) {}

    if (this.startModal) {
      this.startModal.style.display = 'flex';
    }
  }

  updateHUD({
    player,
    timeLeft,
    rankedHoles,
    gameMode,
    civicPercent = 0,
    frenzyActive = false,
    nearestEvils = [],
    targetObjective = null,
    districtConfig = null,
    districtRemaining = 0,
    districtTotal = 0,
    targetBreakdown = [],
    districtEvils = [],
    recentCleaned = [],
    activeCrisis = null,
    missions = null
  }) {
    // Player Name & 3D Avatar Icon in Header
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl && player && player.name) {
      nameEl.textContent = player.name.toUpperCase();
    }
    const avatarIconEl = document.getElementById('hud-avatar-icon');
    if (avatarIconEl && player) {
      const avatarIcons = {
        tariq: '🦺',
        ayesha: '👩‍⚕️',
        farooq: '👮‍♂️',
        bilal: '🏏',
        zain: '🏍️'
      };
      avatarIconEl.textContent = avatarIcons[player.avatarId] || '🇵🇰';
    }

    // Top-Center Navigation Target Compass Pill
    const navPill = document.getElementById('hud-nav-target');
    if (navPill) {
      if (targetObjective) {
        navPill.style.display = 'flex';
        const navIcon = document.getElementById('hud-nav-icon');
        const navName = document.getElementById('hud-nav-name');
        const navDist = document.getElementById('hud-nav-dist');
        const navArrow = document.getElementById('hud-nav-arrow');

        if (navIcon) {
          const evilIcons = {
            pothole: '🕳️',
            robber: '📱',
            tanker: '🚰',
            gutka: '🛑',
            vip: '🚑',
            ke: '⚡',
            trash: '🧹',
            bhatta: '📜',
            onewheeler: '🏍️'
          };
          navIcon.textContent = evilIcons[targetObjective.evilType] || '🎯';
        }
        if (navName) navName.textContent = targetObjective.name || 'Objective';
        if (navDist) navDist.textContent = `${targetObjective.dist}m`;

        if (navArrow) {
          const camAngle = (window.game && window.game.camAngle !== undefined) ? window.game.camAngle : Math.PI;
          let relAngle = targetObjective.targetAngle - camAngle;
          while (relAngle > Math.PI) relAngle -= Math.PI * 2;
          while (relAngle < -Math.PI) relAngle += Math.PI * 2;

          let arrowChar = '⬆️';
          if (relAngle > -Math.PI / 8 && relAngle <= Math.PI / 8) {
            arrowChar = '⬆️';
          } else if (relAngle > Math.PI / 8 && relAngle <= (3 * Math.PI) / 8) {
            arrowChar = '↗️';
          } else if (relAngle > (3 * Math.PI) / 8 && relAngle <= (5 * Math.PI) / 8) {
            arrowChar = '➡️';
          } else if (relAngle > (5 * Math.PI) / 8 && relAngle <= (7 * Math.PI) / 8) {
            arrowChar = '↘️';
          } else if (relAngle <= -Math.PI / 8 && relAngle > (-3 * Math.PI) / 8) {
            arrowChar = '↖️';
          } else if (relAngle <= (-3 * Math.PI) / 8 && relAngle > (-5 * Math.PI) / 8) {
            arrowChar = '⬅️';
          } else if (relAngle <= (-5 * Math.PI) / 8 && relAngle > (-7 * Math.PI) / 8) {
            arrowChar = '↙️';
          } else {
            arrowChar = '⬇️';
          }
          navArrow.textContent = arrowChar;
        }
      } else {
        navPill.style.display = 'none';
      }
    }

    // Active Civic Crisis Challenge Card
    const crisisCard = document.getElementById('hud-active-crisis');
    if (crisisCard) {
      if (activeCrisis) {
        crisisCard.style.display = 'flex';
        const iconEl = document.getElementById('crisis-icon');
        const titleEl = document.getElementById('crisis-title');
        const descEl = document.getElementById('crisis-desc');
        const rewardEl = document.getElementById('crisis-reward-text');
        const countEl = document.getElementById('crisis-count');
        const fillEl = document.getElementById('crisis-progress-fill');

        if (iconEl) iconEl.textContent = activeCrisis.icon || '🚨';
        if (titleEl) titleEl.textContent = activeCrisis.title;
        if (descEl) descEl.textContent = activeCrisis.description;
        if (rewardEl) rewardEl.textContent = `+${activeCrisis.xpReward} XP REWARD`;
        if (countEl) countEl.textContent = `${activeCrisis.current || 0}/${activeCrisis.targetCount || 1}`;
        if (fillEl) {
          const pct = Math.min(100, Math.round(((activeCrisis.current || 0) / Math.max(1, activeCrisis.targetCount || 1)) * 100));
          fillEl.style.width = `${pct}%`;
        }
      } else {
        crisisCard.style.display = 'none';
      }
    }

    // District Mission Banner & Multi-Mission Checklist
    if (districtConfig) {
      const badgeEl = document.getElementById('hud-district-badge');
      const titleEl = document.getElementById('hud-district-title');
      const remNumEl = document.getElementById('hud-district-remaining-num');
      const counterEl = document.getElementById('hud-district-counter');
      const progressEl = document.getElementById('hud-district-progress');
      const breakdownEl = document.getElementById('hud-district-breakdown');
      const missionListEl = document.getElementById('hud-mission-list');

      if (badgeEl) badgeEl.textContent = `DISTRICT ${districtConfig.level}`;
      if (titleEl) titleEl.textContent = districtConfig.name;
      if (remNumEl) remNumEl.textContent = districtRemaining;
      const miniRemEl = document.getElementById('hud-district-mini-counter');
      if (miniRemEl) miniRemEl.textContent = `🎯 ${districtRemaining} LEFT`;

      const pct = districtTotal > 0 ? Math.min(100, Math.round(((districtTotal - districtRemaining) / districtTotal) * 100)) : 0;
      if (progressEl) progressEl.style.width = `${pct}%`;

      if (counterEl) {
        if (districtRemaining <= 3 && districtRemaining > 0) {
          counterEl.classList.add('final-hunt');
        } else {
          counterEl.classList.remove('final-hunt');
        }
      }

      // Populate Mission Checklist Items
      if (missionListEl) {
        const activeMissions = missions || districtConfig.missions || districtConfig.challenges || [];
        if (activeMissions && activeMissions.length > 0) {
          missionListEl.innerHTML = '';
          activeMissions.forEach(m => {
            const isDone = m.completed || (m.current >= m.targetCount);
            const mRow = document.createElement('div');
            mRow.className = `mission-item ${isDone ? 'completed' : ''}`;
            mRow.innerHTML = `
              <span class="m-check">${isDone ? '✅' : '⬜'}</span>
              <span class="m-icon">${m.icon || '🎯'}</span>
              <span class="m-title">${m.title}</span>
              <span class="m-progress">${Math.min(m.targetCount, m.current || 0)}/${m.targetCount}</span>
            `;
            missionListEl.appendChild(mRow);
          });
        }
      }

      if (breakdownEl && targetBreakdown) {
        breakdownEl.innerHTML = '';
        targetBreakdown.forEach(tb => {
          if (tb.count <= 0) return;
          const chip = document.createElement('span');
          chip.className = `target-chip chip-${tb.type}`;
          const label = (tb.label || tb.name || tb.type || '').split(' ')[0];
          chip.innerHTML = `${tb.icon} ${tb.count} ${label}`;
          breakdownEl.appendChild(chip);
        });
      }
    }

    // Score & Level
    document.getElementById('hud-score').textContent = player.score.toLocaleString();

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

    // Timer (Standard 4 Minutes Match)
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

    // Dedicated Realtime Scoreboard
    const lbContainer = document.getElementById('hud-leaderboard');
    if (lbContainer) {
      lbContainer.innerHTML = '';
      const topHoles = rankedHoles.slice(0, 5);
      const playerRankIdx = rankedHoles.findIndex(h => h.isPlayer);
      const rankTag = document.getElementById('hud-player-rank');
      if (rankTag) {
        rankTag.textContent = playerRankIdx >= 0 ? `RANK #${playerRankIdx + 1}` : 'RANK #1';
      }

      topHoles.forEach((hole, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-item ${hole.isPlayer ? 'is-player' : ''}`;
        row.innerHTML = `
          <span class="lb-rank">${idx === 0 ? '👑 1' : idx + 1}</span>
          <span class="lb-name">${hole.name} [Lv.${hole.level}]</span>
          <span class="lb-score">${hole.score}</span>
        `;
        lbContainer.appendChild(row);
      });
    }

    // Live Crime Radar Compass Bar
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
          <span class="radar-name">${(evil.name || evil.evilType || 'Target').split('(')[0].trim()}</span>
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

  // Interactive Mini-Map (Radar HUD)
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
    const R = (width / 2) - 5;
    const maxRadarDist = 65; // 65 meters radius coverage
    const scale = R / maxRadarDist;
    const now = performance.now();

    ctx.clearRect(0, 0, width, height);

    // 1. Radar Glass Background
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(12, 22, 36, 0.94)');
    grad.addColorStop(0.7, 'rgba(8, 16, 26, 0.96)');
    grad.addColorStop(1, 'rgba(3, 8, 14, 0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

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

    // 1b. City Street Network & Urban Road Corridors
    const roadGrid = [-96, -48, 0, 48, 96];
    const roadW = 14 * scale;

    // Draw Dark Asphalt Road Corridors
    ctx.fillStyle = 'rgba(38, 52, 70, 0.85)';
    roadGrid.forEach(rx => {
      const roadX = cx + (rx - player.position.x) * scale;
      if (roadX >= cx - R - 15 && roadX <= cx + R + 15) {
        ctx.fillRect(roadX - roadW / 2, cy - R, roadW, R * 2);
      }
    });
    roadGrid.forEach(rz => {
      const roadZ = cy + (rz - player.position.z) * scale;
      if (roadZ >= cy - R - 15 && roadZ <= cy + R + 15) {
        ctx.fillRect(cx - R, roadZ - roadW / 2, R * 2, roadW);
      }
    });

    // Center dashed lane markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    roadGrid.forEach(rx => {
      const roadX = cx + (rx - player.position.x) * scale;
      if (roadX >= cx - R && roadX <= cx + R) {
        ctx.beginPath();
        ctx.moveTo(roadX, cy - R);
        ctx.lineTo(roadX, cy + R);
        ctx.stroke();
      }
    });
    roadGrid.forEach(rz => {
      const roadZ = cy + (rz - player.position.z) * scale;
      if (roadZ >= cy - R && roadZ <= cy + R) {
        ctx.beginPath();
        ctx.moveTo(cx - R, roadZ);
        ctx.lineTo(cx + R, roadZ);
        ctx.stroke();
      }
    });
    ctx.setLineDash([]);

    // 1c. Active Navigation Waypoint Path on Radar
    const currentNav = window.game && window.game.currentTargetObjective;
    if (currentNav && currentNav.waypoints && currentNav.waypoints.length > 0) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      currentNav.waypoints.forEach(wp => {
        const wpx = cx + (wp.x - player.position.x) * scale;
        const wpz = cy + (wp.z - player.position.z) * scale;
        ctx.lineTo(wpx, wpz);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

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

    // 3. Recently Cleaned Locations
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

    // 4. Other AI Holes
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

    // 5. Active District Evils
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
        const px = cx + edx * scale;
        const py = cy + edz * scale;

        ctx.fillStyle = meta.color;
        ctx.globalAlpha = 0.35 + Math.sin(now * 0.006) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon, px, py - 7);
      } else {
        const clampR = R - 8;
        const px = cx + Math.cos(angle) * clampR;
        const py = cy + Math.sin(angle) * clampR;

        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

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

    // 6. Player Heading Directional Chevron at Center
    ctx.save();
    ctx.translate(cx, cy);
    const facing = (player.facingAngle !== undefined) ? player.facingAngle : 0;
    ctx.rotate(facing);

    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5.5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5.5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // 7. Outer Radar Bezel
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

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

  showActionResolution({ icon = '🛑', tag = 'THREAT RESOLVED', title = '', desc = '', color = '#00e5ff' } = {}) {
    const banner = document.getElementById('hud-action-resolution');
    if (!banner) return;

    const iconEl = document.getElementById('action-res-icon');
    const tagEl = document.getElementById('action-res-tag');
    const titleEl = document.getElementById('action-res-title');
    const descEl = document.getElementById('action-res-desc');

    if (iconEl) iconEl.textContent = icon;
    if (tagEl) {
      tagEl.textContent = tag;
      tagEl.style.color = color;
      tagEl.style.borderColor = color;
    }
    if (titleEl) {
      titleEl.textContent = title;
      titleEl.style.textShadow = `0 0 16px ${color}88`;
    }
    if (descEl) descEl.textContent = desc;

    banner.style.display = 'flex';
    banner.style.borderColor = color;
    banner.style.boxShadow = `0 12px 36px ${color}55, 0 0 24px rgba(0,0,0,0.85)`;
    banner.style.opacity = '1';
    banner.style.transform = 'translate(-50%, 0) scale(1.04)';

    clearTimeout(this.actionResolutionTimeout);
    this.actionResolutionTimeout = setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, -20px) scale(0.92)';
      setTimeout(() => {
        if (banner.style.opacity === '0') banner.style.display = 'none';
      }, 300);
    }, 2800);
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

  showInterventionProgress(evilType, progressRatio) {
    const el = document.getElementById('hud-intervention-progress');
    if (!el) return;
    const iconEl = document.getElementById('intervention-icon');
    const titleEl = document.getElementById('intervention-title');
    const fillEl = document.getElementById('intervention-fill');
    const pctEl = document.getElementById('intervention-pct');

    const titles = {
      pothole: '🕳️ BOLTING MANHOLE COVER...',
      tanker: '🚰 IMPOUNDING WATER TANKER...',
      robber: '📱 CORNERING MOBILE SNATCHER...',
      vip: '🛑 HALTING VIP PROTOCOL CONVOY...',
      bhatta: '📜 CONFISCATING BHATTA PARCHI...',
      onewheeler: '🏍️ GROUNDING RECKLESS RACER...',
      trash: '🌿 ENCLOSING TRASH DUMP...',
      ke: '⚡ DISCONNECTING DANGEROUS KUNDAS...',
      chinacutting: '🧱 DEMOLISHING ENCROACHMENT...',
      politician: '⚖️ ARRESTING CORRUPT VIP...',
      gutka: '🛑 CONFISCATING ILLEGAL GUTKA...'
    };

    const text = titles[evilType] || '🔧 RESTORING STREET CRISIS...';
    if (iconEl) iconEl.textContent = text.slice(0, 2);
    if (titleEl) titleEl.textContent = text;
    const pct = Math.min(100, Math.round(progressRatio * 100));
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}%`;

    el.style.display = 'flex';
  }

  hideInterventionProgress() {
    const el = document.getElementById('hud-intervention-progress');
    if (el) el.style.display = 'none';
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

  showGameOver({ rankedHoles, player, canAdvanceNext = false }) {
    const modal = this.gameOverModal;
    const playerRank = rankedHoles.findIndex(h => h.isPlayer) + 1;

    const headline = playerRank === 1 ? '👑 1ST PLACE CHAMPION! 👑' :
                     playerRank === 2 ? '🥈 2ND PLACE! GREAT JOB!' :
                     playerRank === 3 ? '🥉 3RD PLACE!' : 'MATCH COMPLETED';

    document.getElementById('results-headline').textContent = headline;
    document.getElementById('results-sub').textContent = `Ranked #${playerRank} in Karachi Street Patrol`;

    document.getElementById('stat-score').textContent = player.score.toLocaleString();
    document.getElementById('stat-level').textContent = `Lv ${player.level} (${LEVEL_CONFIG[player.level - 1].title})`;
    document.getElementById('stat-swallowed').textContent = player.swallowedCount;
    document.getElementById('stat-kills').textContent = player.kills;

    // Podium HTML
    const podiumEl = document.getElementById('results-podium');
    podiumEl.innerHTML = '';
    const top3 = [rankedHoles[1], rankedHoles[0], rankedHoles[2]];
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

    const nextBtn = document.getElementById('btn-results-next');
    if (nextBtn) {
      nextBtn.style.display = canAdvanceNext ? 'inline-block' : 'none';
    }

    modal.style.display = 'flex';
  }

  showDistrictClearedModal({
    level,
    districtName,
    heroTitle,
    bonusScore,
    timeBonus,
    nextDistrictName,
    isFinalDistrict = false,
    resolvedThreats = null,
    onNextDistrict
  }) {
    document.getElementById('dc-modal-title').textContent = isFinalDistrict
      ? `🌟 ULTIMATE VICTORY! ALL DISTRICTS SAVED! 🌟`
      : `DISTRICT ${level} CLEARED!`;
    document.getElementById('dc-modal-desc').textContent = isFinalDistrict
      ? `Congratulations! You fulfilled the vision for a clean Karachi! The city is safe, peaceful, and glorious!`
      : `You eliminated all mobile snatchers, mafias & rubbish in ${districtName}! Citizens are celebrating!`;

    document.getElementById('dc-modal-herotitle').textContent = heroTitle;
    document.getElementById('dc-modal-bonus').textContent = `+${bonusScore.toLocaleString()} XP`;
    document.getElementById('dc-modal-time').textContent = `+${timeBonus} SEC`;
    document.getElementById('dc-modal-nextname').textContent = isFinalDistrict
      ? `Grand Champion Ceremony`
      : `${nextDistrictName}`;

    // Populate itemized threat resolution reforms
    const threatListEl = document.getElementById('dc-modal-threat-list');
    if (threatListEl) {
      const defaultThreatsByLevel = {
        1: [
          { icon: '🔒', title: '2x Open Road Hazards', reform: 'Heavy KMC cast-iron covers bolted shut. Hazard-free road restored!' },
          { icon: '📱', title: 'Armed Mobile Snatcher', reform: 'Cornered & apprehended. Snatched smartphones returned to citizens!' },
          { icon: '🚰', title: 'Water Tanker Extortion', reform: 'Illegal suction pipelines severed. Fresh tap water restored to neighborhood!' }
        ],
        2: [
          { icon: '📜', title: '3x Extortion Bhatta Rackets', reform: 'Bhatta parchi network confiscated. Local bazaar merchants protected!' },
          { icon: '🏍️', title: '3x Reckless One-Wheelers', reform: 'Reckless 70cc racers grounded. High-visibility safety cones placed!' },
          { icon: '🕳️', title: '2x Lyari Potholes', reform: 'Deep road trenches filled with durable asphalt. Safe driving restored!' }
        ],
        3: [
          { icon: '🚑', title: 'VIP Traffic Jam Halting Ambulance', reform: 'Protocol convoy diverted with KMC roadblocks. Commuters & hospital route freed!' },
          { icon: '📱', title: 'Empress Market Snatchers', reform: 'Bazaar pickpockets apprehended & shoppers secured!' },
          { icon: '🌿', title: 'Burns Road Trash Heaps', reform: 'Compactor bins installed & fragrant jasmine planters blooming!' }
        ],
        4: [
          { icon: '🏍️', title: 'Midnight Highway Racers', reform: 'Illegal drag racers impounded & safe transit restored!' },
          { icon: '🌲', title: 'Margalla Timber Poachers', reform: 'Illegal timber chainsaws confiscated & forest reserve protected!' },
          { icon: '⚖️', title: 'Corrupt VIP Bureaucrats', reform: 'Embezzled public funds frozen & redirected to public dispensary!' }
        ],
        5: [
          { icon: '📜', title: 'Quetta Bazaar Extortionists', reform: 'Merchant protection enforced & Aman Bazaar peace restored!' },
          { icon: '⚡', title: 'Sparking Transformers', reform: 'High-voltage dangling kundas disconnected & clean solar kiosk built!' }
        ]
      };

      const items = (resolvedThreats && resolvedThreats.length > 0)
        ? resolvedThreats
        : (defaultThreatsByLevel[level] || defaultThreatsByLevel[1]);

      threatListEl.innerHTML = items.map(item => `
        <div class="dc-breakdown-item">
          <span class="threat-icon">${item.icon || '🛡️'}</span>
          <div class="threat-details">
            <span class="threat-title">${item.title}</span>
            <span class="threat-reform">${item.reform}</span>
          </div>
        </div>
      `).join('');
    }

    const nextBtn = document.getElementById('btn-next-district');
    nextBtn.textContent = isFinalDistrict
      ? `👑 CELEBRATE VICTORY ➔`
      : `🚀 GO TO NEXT LEVEL: DISTRICT ${level + 1} ➔`;

    nextBtn.onclick = () => {
      audio.playClick();
      this.hideDistrictClearedModal();
      if (onNextDistrict) onNextDistrict();
    };

    // Direct Level Selector pills
    const pills = this.districtClearedModal.querySelectorAll('.dc-level-pill');
    pills.forEach(pill => {
      pill.onclick = () => {
        audio.playClick();
        this.hideDistrictClearedModal();
        const targetLvl = parseInt(pill.dataset.level) || (level + 1);
        if (window.game && window.game.loadDistrictLevel) {
          window.game.loadDistrictLevel(targetLvl);
        }
      };
    });

    this.districtClearedModal.style.display = 'flex';
  }

  showCrisisCompleteBanner(challenge) {
    this.showAnnouncement(`🌟 CRISIS RESOLVED: ${challenge.title}! ${challenge.benefitText} (+${challenge.xpReward} XP) 🌟`, '#00e676');
    const card = document.getElementById('hud-active-crisis');
    if (card) {
      card.classList.add('crisis-cleared-anim');
      setTimeout(() => card.classList.remove('crisis-cleared-anim'), 1400);
    }
  }

  hideDistrictClearedModal() {
    if (this.districtClearedModal) {
      this.districtClearedModal.style.display = 'none';
    }
  }

  hideGameOverModal() {
    if (this.gameOverModal) {
      this.gameOverModal.style.display = 'none';
    }
  }
}
