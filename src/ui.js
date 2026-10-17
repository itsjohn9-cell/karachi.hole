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
    onNextLevel
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

    this.playerName = 'Karachi Hero';
    this.currentSkin = 'gutter';
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.difficulty = 'kidsEasy'; // 'kidsEasy' or 'classic'
    this.currentAgeTier = 'kids'; // 'kids', 'junior', 'senior'
    this.unlockedBadges = new Set(['water_guardian']);
    this.completedQuizIds = new Set();
    this.activeQuizChallenge = null;
    this.isAutoPaused = false;

    this.createStartMissionModal();
    this.createHUD();
    this.createSkinModal();
    this.createGoodVsBadModal();
    this.createEducationalQuizModal();
    this.createAutoPauseModal();
    this.createGameOverModal();
    this.createDistrictClearedModal();
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
          <div class="city-crest">🌟</div>
          <h1 class="start-title">KARACHI HOLE.IO</h1>
          <p class="start-tagline">3D Third-Person Street Patrol &amp; Civic Hero Mission</p>
        </div>

        <div class="start-form-section">
          <!-- Player / Game Name Input -->
          <div class="form-group">
            <label class="form-label" for="player-name-input">👤 PLAYER / HERO NAME:</label>
            <div class="input-with-icon">
              <span class="input-icon">👑</span>
              <input type="text" id="player-name-input" class="text-input" value="Karachi Hero" maxlength="18" placeholder="Enter your player name..." />
            </div>
          </div>

          <!-- Age Group Selection -->
          <div class="form-group">
            <label class="form-label">👶 SELECT YOUR AGE GROUP:</label>
            <div class="age-selection-grid" id="start-age-grid">
              <div class="age-card active ui-interactive" data-age="kids">
                <span class="age-card-icon">🐣</span>
                <span class="age-card-title">Kids</span>
                <span class="age-card-sub">Ages 5–8</span>
                <span class="age-card-desc">Visual picture cues &amp; gentle hints</span>
              </div>
              <div class="age-card ui-interactive" data-age="junior">
                <span class="age-card-icon">🎒</span>
                <span class="age-card-title">Junior</span>
                <span class="age-card-sub">Ages 9–12</span>
                <span class="age-card-desc">Street safety &amp; civic awareness</span>
              </div>
              <div class="age-card ui-interactive" data-age="senior">
                <span class="age-card-icon">🏆</span>
                <span class="age-card-title">Teens &amp; Adults</span>
                <span class="age-card-sub">Ages 13+</span>
                <span class="age-card-desc">City leadership &amp; public ethics</span>
              </div>
            </div>
          </div>

          <!-- 3D Karachi Avatar Selection -->
          <div class="form-group">
            <label class="form-label">🦸 CHOOSE YOUR 3D KARACHI HERO AVATAR:</label>
            <div class="avatar-selection-grid" id="start-avatar-grid">
              <div class="avatar-card active ui-interactive" data-avatar="tariq">
                <span class="avatar-card-icon">🇵🇰</span>
                <span class="avatar-card-title">Tariq</span>
                <span class="avatar-card-sub">Street Hero</span>
                <span class="avatar-card-desc">Green Shalwar Kameez (+10% Speed)</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="ayesha">
                <span class="avatar-card-icon">🌸</span>
                <span class="avatar-card-title">Ayesha</span>
                <span class="avatar-card-sub">Civic Crusader</span>
                <span class="avatar-card-desc">Sindhi Ajrak Scarf (+15% Reach)</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="farooq">
                <span class="avatar-card-icon">👮‍♂️</span>
                <span class="avatar-card-title">Inspector Farooq</span>
                <span class="avatar-card-sub">Traffic Police</span>
                <span class="avatar-card-desc">Karachi Police Uniform (Stuns Evils)</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="bilal">
                <span class="avatar-card-icon">🚑</span>
                <span class="avatar-card-title">Bilal</span>
                <span class="avatar-card-sub">Edhi Volunteer</span>
                <span class="avatar-card-desc">Rescue Medical Vest (Double XP Rescues)</span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="zain">
                <span class="avatar-card-icon">🎒</span>
                <span class="avatar-card-title">Zain</span>
                <span class="avatar-card-sub">Eco Cadet</span>
                <span class="avatar-card-desc">School Blazer &amp; Cape (Bonus Sorting)</span>
              </div>
            </div>
          </div>

          <!-- Quick Mission Briefing -->
          <div class="mission-brief-box">
            <div class="brief-title">🎯 GTA KARACHI STREET MISSION:</div>
            <div class="brief-points">
              <span>🧹 <strong>Street-Level Patrol:</strong> Run through Karachi avenues &amp; alleys to resolve urban crises!</span>
              <span>🚧 <strong>Solid Obstacles:</strong> Real-life physics apply—you cannot walk through buildings or walls!</span>
              <span>🧩 <strong>Interactive Civic Puzzles:</strong> Solve age-tailored puzzles to resume patrol and earn medals!</span>
            </div>
          </div>
        </div>

        <button class="primary-btn ui-interactive start-mission-btn" id="btn-start-patrol">
          🚀 START PATROL ➔
        </button>
      </div>
    `;

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
          <button class="icon-btn ui-interactive" id="btn-toggle-sound" title="Toggle Sound">🔊</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-music" title="Toggle Music">🎵</button>
          <button class="icon-btn ui-interactive" id="btn-open-skins" title="Change Avatar Skin">🎨</button>
          <button class="icon-btn ui-interactive" id="btn-open-guide" title="Civic Guide">❓</button>
          <button class="icon-btn ui-interactive" id="btn-open-quiz" title="Civic Academy Challenge">🎓</button>
          <button class="icon-btn ui-interactive" id="btn-manual-pause" title="Pause Game">⏸️</button>
        </div>
      </div>

      <!-- Left Panel: District Missions Checklist Card (Zero overlap, top: 72px, left: 16px) -->
      <div class="hud-mission-card" id="district-mission-banner">
        <div class="mission-card-header">
          <span class="district-badge-pill" id="hud-district-badge">DISTRICT 1</span>
          <span class="district-name-text" id="hud-district-title">Tariq Road &amp; PECHS</span>
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

      <!-- Bottom-Right: Sprint Boost Button (bottom: 18px, right: 18px) -->
      <div class="hud-controls-bottom-right">
        <button class="sprint-btn ui-interactive" id="btn-sprint">⚡ SPRINT</button>
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
        <button class="primary-btn ui-interactive resume-patrol-btn" id="btn-auto-resume">
          ▶ RESUME PATROL
        </button>
      </div>
    `;

    document.body.appendChild(this.autoPauseModal);
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
          <h2>Select Hole Skin</h2>
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
            <p class="guide-subtitle">A Visual Guide to Karachi Hole.io: Only Devour the Bad Guys!</p>
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

        <div class="dc-next-preview">
          <span class="next-label">NEXT LEVEL DESTINATION:</span>
          <span class="next-name" id="dc-modal-nextname">District 2: Saddar &amp; Empress Market</span>
        </div>

        <!-- The Prominent Next Level Button requested by user -->
        <button class="primary-btn ui-interactive dc-advance-btn pulse-glow" id="btn-next-district">
          🚀 GO TO NEXT LEVEL ➔
        </button>
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
            avatarId: this.selectedAvatar || 'tariq'
          });
        }
      });
    }

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

    // Manual Pause button on HUD
    const btnManualPause = document.getElementById('btn-manual-pause');
    if (btnManualPause) {
      btnManualPause.addEventListener('click', () => {
        audio.playClick();
        this.showAutoPauseModal();
      });
    }

    // Auto-Resume button on pause modal
    const btnAutoResume = document.getElementById('btn-auto-resume');
    if (btnAutoResume) {
      btnAutoResume.addEventListener('click', () => {
        this.hideAutoPauseModal();
      });
    }

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

    // CRITICAL REQUIREMENT: Auto-pause when user switches tabs or moves away
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.showAutoPauseModal();
      }
    });

    window.addEventListener('blur', () => {
      this.showAutoPauseModal();
    });
  }

  showAutoPauseModal() {
    // Don't auto pause if already on start modal or game over
    if (this.startModal && this.startModal.style.display !== 'none') return;
    if (this.gameOverModal && this.gameOverModal.style.display !== 'none') return;
    if (this.districtClearedModal && this.districtClearedModal.style.display !== 'none') return;

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

    const nextBtn = document.getElementById('btn-next-district');
    nextBtn.textContent = isFinalDistrict
      ? `👑 CELEBRATE VICTORY ➔`
      : `🚀 GO TO NEXT LEVEL ➔`;

    nextBtn.onclick = () => {
      audio.playClick();
      this.hideDistrictClearedModal();
      if (onNextDistrict) onNextDistrict();
    };

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
