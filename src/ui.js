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
import { MAX_REVIVE_TOKENS, saveManager } from './saveManager.js';
import { CITIZEN_DIALOGUES, dialogueSystem } from './dialogueSystem.js';

if (typeof window !== 'undefined') {
  window.getChallengeByCategoryAndTier = getChallengeByCategoryAndTier;
}

const AVATAR_GETUPS = {
  tariq: 'Green shalwar kameez · waistcoat',
  biryani_rider: '🛵 Chacha Biryani · helmet & delivery pack',
  captain_karachi: '⚡ Captain Karachi · super suit & cape',
  chai_wala: '🫖 Ustad Chai Wala · apron & kettle',
  ayesha: 'Turquoise kameez · Ajrak scarf',
  farooq: 'White traffic-police uniform',
  bilal: 'Edhi rescue vest · white shalwar kameez',
  zain: 'Green school blazer · trousers'
};

const AVATAR_UNLOCK_HINTS = {
  tariq: 'Available from the start',
  biryani_rider: 'Available now · Speedy Food Delivery',
  captain_karachi: 'Available now · Cosmic Superhero',
  chai_wala: 'Available now · Burns Road Chai Master',
  ayesha: 'Reach career Level 2 or earn Clean Green',
  farooq: 'Reach career Level 3 or earn Road Safety',
  bilal: 'Reach career Level 2 or earn Lifesaver',
  zain: 'Reach career Level 4 or earn Green Planter'
};

const DISTRICT_UNLOCK_HINTS = {
  1: 'Available from the start',
  2: 'Complete the Soldier Bazar route, reach career Level 2, or earn Road Safety / Clean Green',
  3: 'Complete the Lyari route, reach career Level 3, or earn Lifesaver / 4 badges'
};

function getRunnerCrashAdvice(reason = '') {
  const normalizedReason = reason.toLowerCase();
  if (normalizedReason.includes('wire')) {
    return {
      icon: '⚡',
      title: 'Hanging Wires',
      hint: 'Avoid the wires by sliding: press [S] or swipe down.'
    };
  }

  if (normalizedReason.includes('pothole')) {
    return {
      icon: '🕳️',
      title: 'Rain-Softened Pothole',
      hint: 'Jump over the puddled pothole or move to a clear lane.'
    };
  }

  if (normalizedReason.includes('gutter') || normalizedReason.includes('manhole')) {
    return {
      icon: '🕳️',
      title: 'Open Road Gutter',
      hint: 'Jump over the gutter: press [W] / [Space] or swipe up.'
    };
  }
  if (normalizedReason.includes('digging') || normalizedReason.includes('barricade') || normalizedReason.includes('hazard')) {
    return {
      icon: '🚧',
      title: 'Unmarked Road Digging',
      hint: 'Jump over the rubble or move to a clear lane.'
    };
  }
  if (normalizedReason.includes('rickshaw') || normalizedReason.includes('qingqi')) {
    return {
      icon: '🛺',
      title: 'Qingqi Rickshaw',
      hint: 'Move one lane left or right before reaching the rickshaw.'
    };
  }
  if (normalizedReason.includes('snatcher') || normalizedReason.includes('motorbike') || normalizedReason.includes('70cc')) {
    return {
      icon: '🏍️',
      title: '70cc Snatcher Motorcycle',
      hint: 'Change lanes early, or use the horn if available.'
    };
  }
  if (normalizedReason.includes('truck') || normalizedReason.includes('bedford') || normalizedReason.includes('tanker')) {
    return {
      icon: '🚚',
      title: 'Karachi Street Traffic',
      hint: 'Switch lanes early; a close pass can also build a drafting boost.'
    };
  }
  if (normalizedReason.includes('bus') || normalizedReason.includes('w11')) {
    return {
      icon: '🚐',
      title: 'W11 Minibus',
      hint: 'Move one lane left or right before reaching the minibus.'
    };
  }
  if (normalizedReason.includes('sewage')) {
    return {
      icon: '🌊',
      title: 'Sewage Overflow',
      hint: 'Jump over the spill or move to a clear lane.'
    };
  }
  return {
    icon: '💥',
    title: reason || 'Karachi Street Hazard',
    hint: 'Watch the road ahead and switch lanes or use jump/slide when appropriate.'
  };
}

export class UIManager {
  constructor({
    onStartGame,
    onRestartGame,
    onSelectMode,
    onSelectDifficulty,
    onSelectRunnerDifficulty,
    onOpenEducationalQuiz,
    onResolveEducationalQuiz,
    onResumeGame,
    onPauseGame,
    onNextLevel,
    onJump,
    onSlide,
    onLaneLeft,
    onLaneRight,
    onHorn,
    onInteractCitizen,
    onOpenMissionJournal,
    onSelectDistrict,
    onReturnToMainMenu,
    onResetCareer,
    onSelectVersion,
    onQuickRevive
  } = {}) {
    this.onStartGame = onStartGame;
    this.onRestartGame = onRestartGame;
    this.onSelectMode = onSelectMode;
    this.onSelectDifficulty = onSelectDifficulty;
    this.onSelectRunnerDifficulty = onSelectRunnerDifficulty;
    this.onOpenEducationalQuiz = onOpenEducationalQuiz;
    this.onResolveEducationalQuiz = onResolveEducationalQuiz;
    this.onResumeGame = onResumeGame;
    this.onPauseGame = onPauseGame;
    this.onNextLevel = onNextLevel;
    this.onJump = onJump;
    this.onSlide = onSlide;
    this.onLaneLeft = onLaneLeft;
    this.onLaneRight = onLaneRight;
    this.onHorn = onHorn;
    this.onInteractCitizen = onInteractCitizen;
    this.onOpenMissionJournal = onOpenMissionJournal;
    this.onSelectDistrict = onSelectDistrict;
    this.onReturnToMainMenu = onReturnToMainMenu;
    this.onResetCareer = onResetCareer;
    this.onSelectVersion = onSelectVersion;
    this.onQuickRevive = onQuickRevive;

    const savedPlayer = saveManager.get().player || {};
    this.playerName = savedPlayer.name || 'Karachi Hero';
    this.selectedAvatar = saveManager.isAvatarUnlocked(savedPlayer.avatarId) ? savedPlayer.avatarId : 'tariq';
    this.runnerDifficulty = 'standard';
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.difficulty = 'kidsEasy'; // 'kidsEasy' or 'classic'
    this.currentAgeTier = 'kids'; // 'kids', 'junior', 'senior'
    this.selectedDistrictLevel = 1;
    this.unlockedBadges = new Set(['water_guardian']);
    this.completedQuizIds = new Set();
    this.activeQuizChallenge = null;
    this.isAutoPaused = false;
    this.activeDialogueCitizen = null;
    this.civicQuizEnabled = false;
    if (typeof localStorage !== 'undefined') {
      try {
        this.civicQuizEnabled = localStorage.getItem('hole_karachi_civic_quiz_enabled') === 'true';
      } catch (error) {
        console.error('[SAVE] Could not load civic quiz preference.', error);
      }
    }

    this.selectedVersion = 'v3';
    this.onSelectVersion = onSelectVersion;

    this.createStartMissionModal();
    this.createRunnerIntroModal();
    this.createTapToStartPrompt();
    this.createVersionFeedbackModal();
    this.createHUD();
    this.hud.style.display = 'none';
    this.createSkinModal();
    this.createGoodVsBadModal();
    this.createEducationalQuizModal();
    this.createAutoPauseModal();
    this.createGameMenuModal();
    this.createGameOverModal();
    this.createDistrictClearedModal();
    this.createCitizenDialogueModal();
    this.createMissionJournalModal();
    this.createRunnerHelpModal();
    this.createRunnerProgressModal();
    this.createRunnerShopModal();
    this.createRunnerTutorialOverlay();
    this.createRunnerDeveloperUI();
    this.createAnalyticsConsentModal();
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
          <h1 class="start-title">KARACHI RUNNER</h1>
          <button class="secondary-btn ui-interactive home-shop-btn" id="btn-home-shop" aria-label="Open upgrade shop">
            <span aria-hidden="true">🛒</span> SHOP
          </button>
        </div>

        <div class="start-form-section">
          <!-- Patrol District Selection -->
          <div class="form-group start-district-group">
              <label class="form-label">📍 KARACHI LOOP · 200 NEIGHBORHOODS</label>
            <div class="district-selection-grid" id="start-district-grid">
              <div class="district-card active ui-interactive" data-level="1" id="start-dist-1">
                <div class="d-header-row">
                  <span class="d-badge">SOLDIER BAZAR · PECHS</span>
                  <span class="d-status unlocked-tag">START</span>
                </div>
                <span class="d-title">Soldier Bazar to PECHS (Tariq Road)</span>
                <span class="d-sub">Old-city utility lanes · gutters &amp; low wires</span>
              </div>
              <div class="district-card ui-interactive" data-level="2" id="start-dist-2">
                <div class="d-header-row">
                  <span class="d-badge lv2-badge">LYARI</span>
                  <span class="d-status">LOCKED</span>
                </div>
                <span class="d-title">Lyari: Chakiwara &amp; Baghdadi</span>
                <span class="d-sub">Football streets · murals &amp; stray match balls</span>
              </div>
              <div class="district-card ui-interactive" data-level="3" id="start-dist-3">
                <div class="d-header-row">
                  <span class="d-badge lv3-badge">SADDAR</span>
                  <span class="d-status">LOCKED</span>
                </div>
                <span class="d-title">Saddar, Burns Road &amp; Empress Market</span>
                <span class="d-sub">Heritage bazaar · handcarts &amp; scaffold work</span>
              </div>
            </div>
          </div>

          <div class="form-group start-age-group">
            <label class="form-label" for="runner-difficulty-grid">🏃 CHOOSE YOUR PACE:</label>
            <div class="age-selection-grid" id="runner-difficulty-grid" aria-label="Runner pace">
              <div class="age-card ui-interactive" role="button" tabindex="0" aria-pressed="false" aria-label="Easy pace. Scenic route with no turns." data-runner-difficulty="easy">
                <span class="age-card-icon">🌱</span>
                <span class="age-card-title">Easy</span>
                <span class="age-card-sub">Scenic · no turns</span>
              </div>
              <div class="age-card active ui-interactive" role="button" tabindex="0" aria-pressed="true" aria-label="Standard pace. Turns and forks." data-runner-difficulty="standard">
                <span class="age-card-icon">🏃</span>
                <span class="age-card-title">Standard</span>
                <span class="age-card-sub">Turns &amp; forks</span>
              </div>
              <div class="age-card ui-interactive" role="button" tabindex="0" aria-pressed="false" aria-label="Hard pace. Frequent turns." data-runner-difficulty="hard">
                <span class="age-card-icon">🔥</span>
                <span class="age-card-title">Hard</span>
                <span class="age-card-sub">Frequent turns</span>
              </div>
            </div>
          </div>

          <!-- Karachi Getup Selection -->
          <div class="form-group start-avatar-group">
            <label class="form-label">👕 CHOOSE A GETUP:</label>
            <div class="avatar-selection-grid" id="start-avatar-grid" aria-label="Avatar clothing">
              <div class="avatar-card active ui-interactive" data-avatar="tariq">
                <span class="avatar-card-outfit">Green shalwar kameez · waistcoat</span>
                <span class="avatar-card-status" aria-hidden="true"></span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="ayesha">
                <span class="avatar-card-outfit">Turquoise kameez · Ajrak scarf</span>
                <span class="avatar-card-status" aria-hidden="true"></span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="farooq">
                <span class="avatar-card-outfit">White traffic-police uniform</span>
                <span class="avatar-card-status" aria-hidden="true"></span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="bilal">
                <span class="avatar-card-outfit">Edhi rescue vest · white shalwar kameez</span>
                <span class="avatar-card-status" aria-hidden="true"></span>
              </div>
              <div class="avatar-card ui-interactive" data-avatar="zain">
                <span class="avatar-card-outfit">Green school blazer · trousers</span>
                <span class="avatar-card-status" aria-hidden="true"></span>
              </div>
            </div>
          </div>

        </div>

        <div class="start-action-row" id="start-actions-container">
          <button class="secondary-btn ui-interactive start-utility-btn" id="btn-home-help" aria-label="Help and controls">
            <span class="start-utility-icon" aria-hidden="true">?</span>
            <span class="start-utility-label">HELP<small>Controls &amp; tips</small></span>
          </button>
          <button class="secondary-btn ui-interactive start-utility-btn" id="btn-home-progress" aria-label="My collections and achievements">
            <span class="start-utility-icon" aria-hidden="true">🏆</span>
            <span class="start-utility-label">PROGRESS<small>Records &amp; rewards</small></span>
          </button>
          <button class="primary-btn ui-interactive start-mission-btn pulse-glow" id="btn-start-patrol">
            <span aria-hidden="true">🏃</span> START RUN
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.startModal);
    this.refreshProgressionContent();
  }

  createRunnerIntroModal() {
    this.runnerIntroModal = document.createElement('div');
    this.runnerIntroModal.className = 'modal-backdrop runner-intro-backdrop';
    this.runnerIntroModal.id = 'modal-runner-intro';
    this.runnerIntroModal.style.display = 'none';
    this.runnerIntroModal.innerHTML = `
      <section class="runner-intro-card" role="dialog" aria-modal="true" aria-labelledby="runner-intro-title">
        <header class="runner-intro-topbar">
          <span class="runner-intro-brand"><span aria-hidden="true">🏃</span> KARACHI RUNNER</span>
          <span class="runner-intro-location">KARACHI · PAKISTAN</span>
        </header>
        <div class="runner-intro-hero">
          <div class="runner-intro-copy">
            <p class="runner-intro-eyebrow">A CITY-SCALE RUN STARTS HERE</p>
            <h1 id="runner-intro-title">Own the streets.<br><span>Protect the city.</span></h1>
            <p class="runner-intro-lede">Race through Karachi, dodge traffic, clear street hazards and follow every turn to bring your neighbourhoods together.</p>
          </div>
          <div class="runner-intro-scene" aria-hidden="true">
            <span class="runner-intro-sun"></span>
            <div class="runner-intro-skyline">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
            <div class="runner-intro-road"><span>✦</span><span>✦</span><span>✦</span></div>
            <span class="runner-intro-runner">🏃</span>
            <span class="runner-intro-scene-label">SOLDIER BAZAR → TARIQ ROAD</span>
          </div>
        </div>
        <div class="runner-intro-guide" aria-label="How to play">
          <div><span aria-hidden="true">↔️</span><strong>SWIPE</strong><small>Switch lanes &amp; take turns</small></div>
          <div><span aria-hidden="true">⬆️</span><strong>JUMP</strong><small>Clear gutters &amp; roadworks</small></div>
          <div><span aria-hidden="true">⬇️</span><strong>SLIDE</strong><small>Dodge low hanging wires</small></div>
        </div>
        <footer class="runner-intro-footer">
          <p>Your route, runner and pace are yours to choose. Standard is ready for your first run.</p>
          <div class="runner-intro-actions">
            <button class="secondary-btn ui-interactive" id="btn-intro-skip" type="button">SKIP INTRO</button>
            <button class="primary-btn ui-interactive" id="btn-intro-continue" type="button">CHOOSE YOUR ROUTE <span aria-hidden="true">➜</span></button>
          </div>
        </footer>
      </section>
    `;
    document.body.appendChild(this.runnerIntroModal);

    const hasSeenIntro = (() => {
      try {
        return localStorage.getItem('karachi_runner_intro_seen_v1') === 'true';
      } catch (error) {
        console.warn('[RUNNER_INTRO] Could not read intro preference:', error);
        return false;
      }
    })();
    if (!hasSeenIntro) this.showRunnerIntro();

    const dismissIntro = () => {
      audio.playClick();
      this.hideRunnerIntro();
    };
    document.getElementById('btn-intro-skip')?.addEventListener('click', dismissIntro);
    document.getElementById('btn-intro-continue')?.addEventListener('click', dismissIntro);
    this.runnerIntroModal.addEventListener('click', event => {
      if (event.target === this.runnerIntroModal) this.hideRunnerIntro();
    });
  }

  showRunnerIntro() {
    if (this.runnerIntroModal) this.runnerIntroModal.style.display = 'flex';
  }

  hideRunnerIntro() {
    if (!this.runnerIntroModal) return;
    this.runnerIntroModal.style.display = 'none';
    try {
      localStorage.setItem('karachi_runner_intro_seen_v1', 'true');
    } catch (error) {
      console.warn('[RUNNER_INTRO] Could not save intro preference:', error);
    }
  }

  createRunnerHelpModal() {
    this.runnerHelpModal = document.createElement('div');
    this.runnerHelpModal.className = 'modal-backdrop runner-help-backdrop';
    this.runnerHelpModal.id = 'modal-runner-help';
    this.runnerHelpModal.style.display = 'none';
    this.runnerHelpModal.innerHTML = `
      <section class="modal-card runner-info-card" role="dialog" aria-modal="true" aria-labelledby="runner-help-title">
        <header class="runner-info-header">
          <div>
            <h2 id="runner-help-title">KARACHI RUNNER · HOW TO PLAY</h2>
            <p>Controls, hazards and power-ups</p>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-runner-help" aria-label="Close help">&times;</button>
        </header>
        <div class="runner-info-content">
          <section class="runner-help-section">
            <h3>🎮 CONTROLS</h3>
            <p><strong>Change lane:</strong> ← / → or A / D, or swipe left/right.</p>
            <p><strong>Jump:</strong> ↑ / W / Space, or swipe up.</p>
            <p><strong>Slide:</strong> ↓ / S, or swipe down.</p>
            <p><strong>Police chase:</strong> Visual only. Grazes slow you down but do not cost hearts; direct hazard impacts still do.</p>
            <p><strong>Turns &amp; forks:</strong> follow the navigation banner. Press ← / → (or swipe) within 45 m of a junction to turn the right way: perfect turns near the corner pay more. Wrong or missed turns cost a heart. At a fork, ← takes the fast flyover and → takes the dark underpass full of low wires.</p>
            <p><strong>Horn:</strong> H or tap HORN. <strong>Pause:</strong> Esc or ⏸.</p>
          </section>
          <section class="runner-help-section">
            <h3>🚧 KARACHI STREET HAZARDS</h3>
            <p>Jump over open gutters, rain-softened potholes and roadworks; slide under hanging wires; move to a clear lane to avoid rickshaws, bikes and traffic.</p>
          </section>
          <section class="runner-help-section">
            <h3>🗺️ THE KARACHI LOOP</h3>
            <p>Start in Soldier Bazar, pass named Karachi neighbourhoods, continue through Lyari and Saddar, and face faster, denser hazards as the run grows longer. Follow the city loop back to Soldier Bazar to finish.</p>
          </section>
          <section class="runner-help-section">
            <h3>✨ PICKUPS &amp; SECOND CHANCES</h3>
            <p>Collect rupees and route power-ups: CNG gives a speed shield, tanker shield absorbs a crash, chai restores a heart, biryani magnet attracts rupees, and jump springs boost jumps.</p>
            <p>Rare golden Rescue Tokens are stored between runs (maximum 3). One token pays for one Quick Revive after a crash. Sprint is provided by route pickups, not a free button.</p>
          </section>
          <section class="runner-help-section" id="runner-help-privacy-section">
            <h3>🔒 PRIVACY &amp; DIAGNOSTICS</h3>
            <p>Karachi Runner respects player privacy. No personal data, advertising IDs, or GPS locations are collected. <span id="runner-help-consent-status">Diagnostics are completely offline.</span></p>
          </section>
        </div>
        <div class="runner-info-actions">
          <button class="secondary-btn ui-interactive" id="btn-replay-runner-intro" type="button">WATCH INTRO</button>
          <button class="primary-btn ui-interactive runner-info-close" id="btn-runner-help-done" type="button">GOT IT</button>
        </div>
      </section>
    `;
    document.body.appendChild(this.runnerHelpModal);
  }

  createAnalyticsConsentModal() {
    this.analyticsConsentModal = document.createElement('div');
    this.analyticsConsentModal.className = 'modal-backdrop analytics-consent-backdrop';
    this.analyticsConsentModal.id = 'modal-analytics-consent';
    this.analyticsConsentModal.style.display = 'none';
    this.analyticsConsentModal.innerHTML = `
      <section class="modal-card runner-info-card analytics-consent-card" role="dialog" aria-modal="true" aria-labelledby="analytics-consent-title" style="max-width: 480px; text-align: center;">
        <header class="runner-info-header" style="justify-content: center; text-align: center;">
          <div>
            <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">📊</div>
            <h2 id="analytics-consent-title">ANONYMOUS GAME DIAGNOSTICS</h2>
            <p>Help improve Karachi Runner</p>
          </div>
        </header>
        <div class="runner-info-content" style="font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; padding: 1rem 0;">
          <p>Would you like to share anonymous gameplay metrics (such as completed runs, device frame rates, and crash reports) to help us optimize game performance?</p>
          <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.75rem;">
            🛡️ <strong>100% Private:</strong> No personal details, names, locations, or advertising identifiers are ever collected. You can change your choice anytime in Settings.
          </p>
        </div>
        <div class="runner-info-actions" style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="secondary-btn ui-interactive" id="btn-consent-decline" type="button" style="flex: 1;">NOT NOW</button>
          <button class="primary-btn ui-interactive" id="btn-consent-allow" type="button" style="flex: 1;">ALLOW</button>
        </div>
      </section>
    `;
    document.body.appendChild(this.analyticsConsentModal);
  }

  createRunnerProgressModal() {
    this.runnerProgressModal = document.createElement('div');
    this.runnerProgressModal.className = 'modal-backdrop runner-progress-backdrop';
    this.runnerProgressModal.id = 'modal-runner-progress';
    this.runnerProgressModal.style.display = 'none';
    this.runnerProgressModal.innerHTML = `
      <section class="modal-card runner-info-card" role="dialog" aria-modal="true" aria-labelledby="runner-progress-title">
        <header class="runner-info-header">
          <div>
            <h2 id="runner-progress-title">MY KARACHI RUNNER PROGRESS</h2>
            <p>Career records, collections and achievements</p>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-runner-progress" aria-label="Close progress">&times;</button>
        </header>
        <div class="runner-progress-stats" aria-label="Career records">
          <div><span>CAREER LEVEL</span><strong id="runner-progress-level">1</strong></div>
          <div><span>BEST SCORE</span><strong id="runner-progress-score">0</strong></div>
          <div><span>BEST DISTANCE</span><strong id="runner-progress-distance">0 m</strong></div>
          <div><span>RUPEES COLLECTED</span><strong id="runner-progress-rupees">0 Rs</strong></div>
          <div><span>RESCUE TOKENS</span><strong id="runner-progress-tokens">0/3</strong></div>
        </div>
        <section class="runner-info-section">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 style="margin: 0;">⚡ POWER-UP ABILITIES</h3>
            <button class="primary-btn ui-interactive" id="btn-progress-open-shop" style="padding: 4px 10px; font-size: 0.72rem; min-height: 32px;">🛒 OPEN SHOP</button>
          </div>
          <div class="runner-progress-grid" id="runner-progress-upgrades"></div>
        </section>
        <section class="runner-info-section">
          <h3>🏅 ACHIEVEMENTS</h3>
          <div class="runner-progress-grid" id="runner-progress-badges"></div>
        </section>
        <section class="runner-info-section">
          <h3>🎒 COLLECTIONS · ROUTES &amp; GETUPS</h3>
          <div class="runner-progress-grid" id="runner-progress-collections"></div>
        </section>
        <button class="primary-btn ui-interactive runner-info-close" id="btn-runner-progress-done">DONE</button>
      </section>
    `;
    document.body.appendChild(this.runnerProgressModal);
  }

  refreshRunnerProgress() {
    if (!this.runnerProgressModal) return;
    const save = saveManager.get();
    const stats = save.runnerStats || {};
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    setText('runner-progress-level', String(saveManager.getCareerLevel()));
    setText('runner-progress-score', (stats.bestScore || 0).toLocaleString());
    setText('runner-progress-distance', `${(stats.bestDistance || 0).toLocaleString()} m`);
    setText('runner-progress-rupees', `${(stats.totalRupees || 0).toLocaleString()} Rs`);
    setText('runner-progress-tokens', `${saveManager.getReviveTokenCount()}/${MAX_REVIVE_TOKENS}`);

    const earnedBadges = new Set(save.badges || []);
    const badgeGrid = document.getElementById('runner-progress-badges');
    if (badgeGrid) {
      badgeGrid.replaceChildren();
      CIVIC_BADGES.forEach(badge => {
        const item = document.createElement('div');
        item.className = `runner-progress-item ${earnedBadges.has(badge.id) ? 'is-unlocked' : 'is-locked'}`;
        const icon = document.createElement('span');
        icon.textContent = badge.icon;
        const name = document.createElement('span');
        name.textContent = badge.name;
        const status = document.createElement('strong');
        status.textContent = earnedBadges.has(badge.id) ? 'EARNED' : 'LOCKED';
        item.append(icon, name, status);
        badgeGrid.appendChild(item);
      });
    }

    const collectionGrid = document.getElementById('runner-progress-collections');
    if (collectionGrid) {
      collectionGrid.replaceChildren();
      const collections = [
        ...[
          [1, 'Soldier Bazar · PECHS'],
          [2, 'Lyari · Chakiwara'],
          [3, 'Saddar · Burns Road']
        ].map(([level, label]) => ({
          label,
          unlocked: saveManager.isDistrictUnlocked(level)
        })),
        ...Object.entries(AVATAR_GETUPS).map(([avatarId, label]) => ({
          label,
          unlocked: saveManager.isAvatarUnlocked(avatarId)
        }))
      ];
      collections.forEach(collection => {
        const item = document.createElement('div');
        item.className = `runner-progress-item ${collection.unlocked ? 'is-unlocked' : 'is-locked'}`;
        const name = document.createElement('span');
        name.textContent = collection.label;
        const status = document.createElement('strong');
        status.textContent = collection.unlocked ? 'UNLOCKED' : 'LOCKED';
        item.append(name, status);
        collectionGrid.appendChild(item);
      });
    }

    const upgradeGrid = document.getElementById('runner-progress-upgrades');
    if (upgradeGrid) {
      upgradeGrid.replaceChildren();
      const allUpgrades = [
        { label: '🧲 Biryani Magnet', lvl: saveManager.getPowerUpUpgradeLevel('magnet') },
        { label: '🛡️ Tanker Shield', lvl: saveManager.getPowerUpUpgradeLevel('shield') },
        { label: '⚡ CNG Nitro', lvl: saveManager.getPowerUpUpgradeLevel('nitro') },
        { label: '🪙 Double Coins', lvl: saveManager.getPowerUpUpgradeLevel('double_coins') }
      ];
      allUpgrades.forEach(u => {
        const item = document.createElement('div');
        item.className = 'runner-progress-item is-unlocked';
        const name = document.createElement('span');
        name.textContent = u.label;
        const status = document.createElement('strong');
        status.textContent = u.lvl >= 5 ? 'LVL 5 (MAX)' : `LVL ${u.lvl}/5`;
        item.append(name, status);
        upgradeGrid.appendChild(item);
      });
    }
  }

  createRunnerShopModal() {
    this.runnerShopModal = document.createElement('div');
    this.runnerShopModal.className = 'modal-backdrop runner-shop-backdrop';
    this.runnerShopModal.id = 'modal-runner-shop';
    this.runnerShopModal.style.display = 'none';
    this.runnerShopModal.innerHTML = `
      <section class="modal-card runner-info-card runner-shop-card" role="dialog" aria-modal="true" aria-labelledby="runner-shop-title">
        <header class="runner-info-header">
          <div>
            <h2 id="runner-shop-title">🛒 POWER-UP UPGRADE SHOP</h2>
            <p>Spend collected Karachi Rupees to supercharge your runner abilities!</p>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-runner-shop" aria-label="Close shop">&times;</button>
        </header>

        <div class="runner-shop-balance-banner">
          <span class="balance-label">CAREER WALLET:</span>
          <span class="balance-value" id="runner-shop-balance">0 Rs</span>
        </div>

        <div class="runner-shop-grid" id="runner-shop-items-container"></div>
        <p class="runner-shop-status" id="runner-shop-status" role="status">Rupees are banked when a run ends or you return home.</p>

        <button class="primary-btn ui-interactive runner-info-close" id="btn-runner-shop-done">DONE</button>
      </section>
    `;
    document.body.appendChild(this.runnerShopModal);
  }

  showRunnerShop() {
    this.shopReturnFocus = document.activeElement;
    this.shopShouldResume = !!window.game?.isGameStarted && !window.game.isPaused && !window.game.isGameOver;
    if (this.shopShouldResume) this.onPauseGame?.();
    this.refreshRunnerShop();
    const status = document.getElementById('runner-shop-status');
    if (status) status.textContent = 'Rupees are banked when a run ends or you return home.';
    if (this.runnerShopModal) {
      this.runnerShopModal.style.display = 'flex';
      document.getElementById('btn-close-runner-shop')?.focus();
    }
  }

  hideRunnerShop() {
    if (this.runnerShopModal) {
      this.runnerShopModal.style.display = 'none';
      this.shopReturnFocus?.focus();
      if (this.shopShouldResume) this.onResumeGame?.();
      this.shopShouldResume = false;
    }
  }

  getAvailableRupees() {
    return saveManager.data.runnerStats?.totalRupees || 0;
  }

  handlePowerUpUpgrade(key) {
    const res = saveManager.upgradePowerUp(key);
    const status = document.getElementById('runner-shop-status');
    if (res.success) {
      audio.playPowerUp?.();
      const prettyKey = key.replace('_', ' ').toUpperCase();
      if (status) status.textContent = `Upgraded ${prettyKey} to level ${res.newLevel}!`;
      this.refreshRunnerShop();
      this.refreshRunnerProgress();
    } else {
      audio.playWrongAnswer?.();
      if (status) status.textContent = res.reason;
    }
  }

  refreshRunnerShop() {
    if (!this.runnerShopModal) return;

    const available = this.getAvailableRupees();
    const balanceElem = document.getElementById('runner-shop-balance');
    if (balanceElem) {
      balanceElem.textContent = `${available.toLocaleString()} Rs`;
    }

    const container = document.getElementById('runner-shop-items-container');
    if (!container) return;

    const upgrades = [
      {
        key: 'magnet',
        title: 'Burns Road Biryani Magnet',
        icon: '🧲',
        description: 'Litter vacuum pulls all Rupee coins from all 3 lanes.',
        formatStat: (lvl) => `Duration: ${(10.0 * (1.0 + (lvl - 1) * 0.25)).toFixed(1)}s`
      },
      {
        key: 'shield',
        title: 'Water Tanker Iron Shield',
        icon: '🛡️',
        description: 'Reinforced armor absorbs 1 obstacle collision without losing hearts.',
        formatStat: (lvl) => `Duration: ${(8.5 * (1.0 + (lvl - 1) * 0.25)).toFixed(1)}s`
      },
      {
        key: 'nitro',
        title: 'CNG Turbo Nitro',
        icon: '⚡',
        description: '2.4x blazing supersonic rush! Smashes right through hazards.',
        formatStat: (lvl) => `Duration: ${(5.5 * (1.0 + (lvl - 1) * 0.25)).toFixed(1)}s`
      },
      {
        key: 'double_coins',
        title: 'Double Rupee Coins',
        icon: '🪙',
        description: 'Multiplies every collected Rupee coin by 2X (+100 Rs each)!',
        formatStat: (lvl) => `Duration: ${(10.0 * (1.0 + (lvl - 1) * 0.25)).toFixed(1)}s`
      }
    ];

    container.replaceChildren();

    upgrades.forEach(item => {
      const lvl = saveManager.getPowerUpUpgradeLevel(item.key);
      const isMax = lvl >= 5;
      const cost = saveManager.getPowerUpUpgradeCost(item.key);
      const canAfford = !isMax && available >= cost;

      const card = document.createElement('div');
      card.className = `runner-shop-item ${isMax ? 'is-max' : ''}`;

      let pips = '';
      for (let p = 1; p <= 5; p++) {
        pips += `<span class="shop-pip ${p <= lvl ? 'filled' : ''}"></span>`;
      }

      card.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-details">
          <div class="shop-item-title-row">
            <h4>${item.title}</h4>
            <span class="shop-item-level-tag">${isMax ? 'MAX LEVEL' : `LVL ${lvl}/5`}</span>
          </div>
          <p class="shop-item-desc">${item.description}</p>
          <div class="shop-item-stat-row">
            <span class="shop-item-stat">${item.formatStat(lvl)}${!isMax ? ` ➜ <span class="next-stat">${item.formatStat(lvl + 1).replace('Duration: ', '')}</span>` : ''}</span>
            <div class="shop-pips-container">${pips}</div>
          </div>
        </div>
        <div class="shop-item-action">
          ${isMax
            ? '<button class="secondary-btn shop-buy-btn" disabled>MAX</button>'
            : `<button class="primary-btn shop-buy-btn ui-interactive ${canAfford ? 'can-afford' : 'cannot-afford'}" data-upgrade="${item.key}">
                UPGRADE<br><span class="shop-btn-cost">${cost.toLocaleString()} Rs</span>
              </button>`
          }
        </div>
      `;

      if (!isMax) {
        const btn = card.querySelector(`button[data-upgrade="${item.key}"]`);
        btn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handlePowerUpUpgrade(item.key);
        });
      }

      container.appendChild(card);
    });
  }

  refreshProgressionContent() {
    document.querySelectorAll('#start-district-grid .district-card').forEach(card => {
      const level = Number(card.dataset.level);
      const unlocked = saveManager.isDistrictUnlocked(level);
      const status = card.querySelector('.d-status');
      const hint = DISTRICT_UNLOCK_HINTS[level] || `Clear District ${level - 1}, reach career Level ${level}, or earn ${level + 1} badges`;
      card.classList.toggle('active', level === 1);
      card.classList.toggle('locked', !unlocked);
      card.classList.toggle('unlocked', unlocked);
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('aria-current', level === 1 ? 'step' : 'false');
      card.title = level === 1
        ? 'Every run starts in Soldier Bazar.'
        : unlocked ? 'Continue the Karachi loop to reach this area.' : `Locked until progression requirements are met. ${hint}.`;
      if (status) {
        status.textContent = !unlocked ? 'LOCKED' : level === 1 ? 'START' : level === 2 ? 'UP NEXT' : 'LATER';
        status.classList.toggle('unlocked-tag', unlocked);
      }
    });

    document.querySelectorAll('#start-avatar-grid .avatar-card, #menu-avatar-grid .avatar-card').forEach(card => {
      const avatarId = card.dataset.avatar || 'tariq';
      const unlocked = saveManager.isAvatarUnlocked(avatarId);
      const hint = AVATAR_UNLOCK_HINTS[avatarId] || 'Locked';
      const status = card.querySelector('.avatar-card-status');
      card.classList.toggle('active', avatarId === this.selectedAvatar);
      card.classList.toggle('locked', !unlocked);
      card.setAttribute('aria-disabled', String(!unlocked));
      card.setAttribute('aria-label', `${AVATAR_GETUPS[avatarId] || 'Karachi getup'}${unlocked ? '' : `. Locked: ${hint}`}`);
      card.title = unlocked ? AVATAR_GETUPS[avatarId] || 'Karachi getup' : `Locked. ${hint}.`;
      if (status) status.textContent = unlocked ? '' : '🔒';
    });

    [1, 2, 3].forEach(level => {
      const button = document.getElementById(`btn-menu-level-${level}`);
      if (!button) return;
      const unlocked = saveManager.isDistrictUnlocked(level);
      button.disabled = !unlocked;
      button.title = unlocked
        ? `Run in patrol area ${level}`
        : `Locked. ${DISTRICT_UNLOCK_HINTS[level] || 'Earn more patrol achievements to unlock this area.'}.`;
    });
  }

  openGetupPicker() {
    this.avatarModalShouldResume = !!window.game?.isGameStarted;
    if (this.avatarModalShouldResume && !window.game?.isPaused && this.onPauseGame) {
      this.onPauseGame();
    }
    this.refreshProgressionContent();
    if (this.skinModal) this.skinModal.style.display = 'flex';
  }

  // Tap-to-Start Floating Overlay (for instant reaction)
  createTapToStartPrompt() {
    this.tapToStartOverlay = document.createElement('div');
    this.tapToStartOverlay.className = 'tap-to-start-overlay';
    this.tapToStartOverlay.id = 'tap-to-start-overlay';
    this.tapToStartOverlay.style.display = 'none';
    this.tapToStartOverlay.innerHTML = `
      <div class="tap-to-start-content pulse-glow">
        <span class="tap-icon">🏃</span>
        <span class="tap-text">TAP SCREEN OR PRESS ARROW KEYS TO RUN</span>
      </div>
    `;
    this.tapToStartOverlay.addEventListener('click', () => {
      this.hideTapToStartPrompt();
      if (window.game?.startGame) {
        window.game.startGame();
      }
    });
    document.body.appendChild(this.tapToStartOverlay);
  }

  showTapToStartPrompt() {
    if (this.tapToStartOverlay) this.tapToStartOverlay.style.display = 'flex';
  }

  hideTapToStartPrompt() {
    if (this.tapToStartOverlay) this.tapToStartOverlay.style.display = 'none';
  }

  // Subway Surfers / Temple Run Visual Controls Tutorial Overlay
  createRunnerTutorialOverlay() {
    this.runnerTutorialOverlay = document.createElement('div');
    this.runnerTutorialOverlay.id = 'runner-tutorial-overlay';
    this.runnerTutorialOverlay.className = 'runner-tutorial-card';
    this.runnerTutorialOverlay.style.display = 'none';
    this.runnerTutorialOverlay.innerHTML = `
      <div class="tut-header">
        <span class="tut-badge">🏃 RUNNER CONTROLS</span>
        <span class="tut-title">KARACHI RUNNER</span>
      </div>
      <div class="tut-grid">
        <div class="tut-row">
          <span class="tut-icon">⬅️ ➡️</span>
          <div class="tut-text">
            <span class="tut-action">SWIPE or [A] / [D]</span>
            <span class="tut-sub">Switch between 3 Lanes</span>
          </div>
        </div>
        <div class="tut-row">
          <span class="tut-icon">⬆️</span>
          <div class="tut-text">
            <span class="tut-action">SWIPE UP or [W] / [Space]</span>
            <span class="tut-sub">Parkour Jump over Gutters &amp; Barriers</span>
          </div>
        </div>
        <div class="tut-row">
          <span class="tut-icon">⬇️</span>
          <div class="tut-text">
            <span class="tut-action">SWIPE DOWN or [S]</span>
            <span class="tut-sub">Slide Crouch under Live Wires</span>
          </div>
        </div>
        <div class="tut-row">
          <span class="tut-icon">📢</span>
          <div class="tut-text">
            <span class="tut-action">PRESS [H] or Tap Horn</span>
            <span class="tut-sub">King Pressure Horn (Scatter Snatchers)</span>
          </div>
        </div>
      </div>
      <div class="tut-footer">
        <span>🪙 Run through glowing pickups: CNG boost, shield, coin magnet, chai heart, or jump springs.</span>
        <span class="tut-dismiss-hint">Tap or press a runner control to dismiss. Your run starts 1 second later.</span>
      </div>
    `;
    this.runnerTutorialOverlay.addEventListener('click', () => this.hideRunnerTutorial());
    document.body.appendChild(this.runnerTutorialOverlay);
  }

  showRunnerTutorial(durationMs = 4000, onDismiss = null) {
    if (!this.runnerTutorialOverlay) return;
    this.runnerTutorialOverlay.style.display = 'flex';
    this.runnerTutorialOverlay.classList.remove('fade-out');
    clearTimeout(this.__tutHideTimeout);
    clearTimeout(this.__tutTimeout);
    this.__runnerTutorialOnDismiss = onDismiss;
    this.__tutTimeout = setTimeout(() => {
      this.hideRunnerTutorial();
    }, durationMs);
  }

  hideRunnerTutorial() {
    if (!this.runnerTutorialOverlay || this.runnerTutorialOverlay.style.display === 'none' ||
        this.runnerTutorialOverlay.classList.contains('fade-out')) return;
    this.runnerTutorialOverlay.classList.add('fade-out');
    clearTimeout(this.__tutTimeout);
    this.__tutHideTimeout = setTimeout(() => {
      if (this.runnerTutorialOverlay) this.runnerTutorialOverlay.style.display = 'none';
      const onDismiss = this.__runnerTutorialOnDismiss;
      this.__runnerTutorialOnDismiss = null;
      if (onDismiss) onDismiss();
    }, 380);
  }

  setRunnerMode(isRunner) {
    this.isRunnerMode = !!isRunner;
    if (this.isRunnerMode) {
      document.body.classList.add('mode-runner');
      if (this.hud) this.hud.classList.add('runner-mode');
    } else {
      document.body.classList.remove('mode-runner');
      if (this.hud) this.hud.classList.remove('runner-mode');
    }
    this.updateReviveTokenCount(saveManager.getReviveTokenCount());
    const routeSectionTitle = document.getElementById('menu-route-section-title');
    if (routeSectionTitle) {
      routeSectionTitle.textContent = this.isRunnerMode ? '📍 RUNNER ROUTE' : '📍 PATROL AREA';
    }
    const restartButton = document.getElementById('btn-menu-restart');
    if (restartButton) {
      restartButton.textContent = this.isRunnerMode ? '🔄 RESTART RUN' : '🔄 RESTART DISTRICT';
    }
    const pauseTitle = document.querySelector('#modal-auto-pause .pause-title');
    const pauseDescription = document.querySelector('#modal-auto-pause .pause-desc');
    if (pauseTitle) pauseTitle.textContent = this.isRunnerMode ? 'RUN PAUSED' : 'GAME PAUSED';
    if (pauseDescription) {
      pauseDescription.textContent = this.isRunnerMode
        ? 'You switched away from KARACHI RUNNER. Your run is safely paused.'
        : 'You switched tabs or moved away from the screen. Karachi patrol is safely on hold.';
    }
  }

  // Major Game Version Feedback & Restore Manager
  createVersionFeedbackModal() {
    this.versionFeedbackModal = document.createElement('div');
    this.versionFeedbackModal.className = 'modal-backdrop version-feedback-backdrop';
    this.versionFeedbackModal.id = 'modal-version-feedback';
    this.versionFeedbackModal.style.display = 'none';

    this.versionFeedbackModal.innerHTML = `
      <div class="modal-card version-feedback-card">
        <div class="vfeed-header">
          <div class="vfeed-title-col">
            <h2 class="vfeed-title">🎮 GAME VERSION INFO &amp; FEEDBACK</h2>
            <p class="vfeed-sub">v3 is the public game. Legacy v1/v2 engines can only be launched from Master Mode.</p>
          </div>
          <button class="modal-close-icon ui-interactive" id="btn-close-version-feedback">&times;</button>
        </div>

        <div class="vfeed-versions-list">
          <div class="vfeed-item" id="vfeed-card-v1">
            <div class="vfeed-item-header">
              <span class="vfeed-badge vfeed-tag-v1">v1.0 Classic</span>
              <span class="vfeed-name">Hole Devourer (City Muncher)</span>
              <span class="vfeed-switch-btn">Master Mode only</span>
            </div>
            <p class="vfeed-desc">Arcade black hole physics. Consumes road litter, cars, dumpsters, trees. Growing radius mechanics.</p>
            <div class="vfeed-comment-box">
              <textarea class="vfeed-input" id="vfeed-comment-v1" placeholder="What to keep/restore from v1.0 (e.g., devour physics, suction vacuum, black hole skin...)" rows="2"></textarea>
            </div>
          </div>

          <div class="vfeed-item" id="vfeed-card-v2">
            <div class="vfeed-item-header">
              <span class="vfeed-badge vfeed-tag-v2">v2.0 Open-World</span>
              <span class="vfeed-name">Karachi Civic Hero (3D Patrol)</span>
              <span class="vfeed-switch-btn">Master Mode only</span>
            </div>
            <p class="vfeed-desc">360-degree free roaming patrol, authentic Urdu citizen dialogues, civic hazard repair, snatcher pursuit.</p>
            <div class="vfeed-comment-box">
              <textarea class="vfeed-input" id="vfeed-comment-v2" placeholder="What to keep/restore from v2.0 (e.g., citizen dialogue system, mission journal, open exploration...)" rows="2"></textarea>
            </div>
          </div>

          <div class="vfeed-item" id="vfeed-card-v3">
            <div class="vfeed-item-header">
              <span class="vfeed-badge vfeed-tag-v3">v3.0 Reflex</span>
              <span class="vfeed-name">KARACHI RUNNER</span>
              <button class="vfeed-switch-btn ui-interactive" data-switch-ver="v3">▶ Switch to v3</button>
            </div>
            <p class="vfeed-desc">High-speed 3-lane reflex sprint, parkour jumping over potholes, sliding under high-voltage wires, Biryani magnet.</p>
            <div class="vfeed-comment-box">
              <textarea class="vfeed-input" id="vfeed-comment-v3" placeholder="What to keep/restore from v3.0 (e.g., lane controls, powerups, pace, wire ducking...)" rows="2"></textarea>
            </div>
          </div>
        </div>

        <div class="vfeed-git-instructions">
          <div class="vfeed-git-title">📦 VERSION CONTROL &amp; SEPARATE PROJECT RESTORE</div>
          <div class="vfeed-git-code">
            <code>git checkout v1.0-classic-hole    # Restore pure Hole Devourer</code><br/>
            <code>git checkout v2.0-civic-hero     # Restore Karachi Civic Savior 3D</code><br/>
            <code>git checkout v3.0-temple-run     # Current 3-Lane Karachi Runner</code><br/>
            <code>git checkout -b feature/hybrid   # Fork into separate project branch</code>
          </div>
        </div>

        <div class="vfeed-actions-row">
          <button class="primary-btn ui-interactive" id="btn-save-version-feedback">
            💾 SAVE COMMENTS &amp; SYNC TO DASHBOARD
          </button>
          <button class="secondary-btn ui-interactive" id="btn-export-version-feedback">
            📋 EXPORT FEEDBACK JSON
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.versionFeedbackModal);
  }

  openVersionFeedbackModal() {
    if (!this.versionFeedbackModal) return;
    this.versionFeedbackModal.style.display = 'flex';
    // Load stored feedback comments
    try {
      const stored = JSON.parse(localStorage.getItem('karachi_version_feedback') || '{}');
      if (document.getElementById('vfeed-comment-v1')) document.getElementById('vfeed-comment-v1').value = stored.v1 || '';
      if (document.getElementById('vfeed-comment-v2')) document.getElementById('vfeed-comment-v2').value = stored.v2 || '';
      if (document.getElementById('vfeed-comment-v3')) document.getElementById('vfeed-comment-v3').value = stored.v3 || '';
    } catch (e) {
      console.warn("Feedback parse error:", e);
    }
    this.syncActiveVersionUI(this.selectedVersion || 'v3');
  }

  closeVersionFeedbackModal() {
    if (this.versionFeedbackModal) this.versionFeedbackModal.style.display = 'none';
  }

  syncActiveVersionUI(versionId) {
    this.selectedVersion = versionId;
    // Update game menu buttons
    document.querySelectorAll('#menu-version-grid .menu-version-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.version === versionId);
    });
    // Update menu header pill
    const pill = document.getElementById('menu-active-version-pill');
    if (pill) {
      const names = { v1: 'v1.0 Hole Devourer Active', v2: 'v2.0 Civic Hero Active', v3: 'v3.0 Runner Active' };
      pill.textContent = names[versionId] || 'v3.0 Runner Active';
    }
    // Update feedback items highlight
    document.querySelectorAll('.vfeed-item').forEach(item => {
      item.classList.toggle('active-v', item.id === `vfeed-card-${versionId}`);
    });
    this.refreshProgressionContent();
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
            <span class="game-logo-icon" id="hud-avatar-icon">🏃</span>
            <div class="player-title-col">
              <span class="game-title" id="hud-player-name">KARACHI RUNNER</span>
              <span class="hero-tag-sub" id="hud-level-title">Runner</span>
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
          <!-- Top Row: Unified Horizontal Stats Bar (Hearts, Timer, Coins, Distance, Score) -->
          <div class="hud-center-stats-row">
            <div class="runner-hearts-pill" id="hud-hearts-pill">
              <span class="hearts-display" id="hud-hearts-val">❤️❤️❤️</span>
            </div>
            <div class="runner-rescue-pill" id="hud-revive-tokens" title="Rescue Tokens for Quick Revive" aria-label="Rescue Tokens: 0" style="display: none;">
              🛟 <span id="hud-revive-token-count">0</span>
            </div>
            <div class="timer-pill" id="hud-timer">04:00</div>
            <div class="runner-coins-pill" id="hud-coins-pill">
              <span class="coin-icon">🪙</span>
              <span class="coin-val" id="hud-coins-val">0 Rs</span>
            </div>
            <div class="runner-dist-pill" id="hud-distance-meter">
              <span class="runner-dist-icon">🏃</span>
              <span class="runner-dist-val" id="hud-distance-val">0 m</span>
              <span class="runner-milestone-tag" id="hud-milestone-tag">Soldier Bazar</span>
            </div>
            <div class="score-pill">
              <span class="score-label">SCORE</span>
              <span class="score-val" id="hud-score">0</span>
            </div>
          </div>

          <!-- Bottom Row: Sleek Transit Corridor Progress & Dynamic Alerts -->
          <div class="hud-center-sub-row">
            <div class="route-progress-pill" id="hud-route-progress">
              <span class="route-point start" id="hud-route-start">📍 Soldier Bazar</span>
              <div class="route-track">
                <div class="route-fill" id="hud-route-fill" style="width: 0%"></div>
                <div class="route-pin" id="hud-route-pin" style="left: 0%">🦺</div>
              </div>
              <span class="route-point dest" id="hud-route-dest">🏁 PECHS</span>
              <span class="route-dist-badge" id="hud-route-dist">800m</span>
            </div>

            <div class="powerup-slot-pill" id="hud-powerup-slot" style="display: none;">
              <span class="powerup-icon" id="hud-powerup-icon">🚀</span>
              <span class="powerup-title" id="hud-powerup-title">CNG NITRO</span>
              <div class="powerup-timer-bar">
                <div class="powerup-timer-fill" id="hud-powerup-timer-fill" style="width: 100%"></div>
              </div>
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
        </div>

        <div class="hud-top-controls">
          <button class="menu-pill-btn ui-interactive" id="btn-open-game-menu" title="Open Game Menu & Settings [Esc]">☰ MENU</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-sound" title="Toggle Sound">🔊</button>
          <button class="icon-btn ui-interactive" id="btn-toggle-music" title="Toggle Music">🎵</button>
          <button class="icon-btn ui-interactive" id="btn-open-skins" title="Choose runner getup">👕</button>
          <button class="icon-btn ui-interactive" id="btn-open-guide" title="Civic Guide">❓</button>
          <button class="icon-btn ui-interactive" id="btn-top-journal" title="Civic Mission Journal & District Gauges [J]">📜</button>
          <button class="icon-btn ui-interactive" id="btn-open-quiz" title="Civic Academy Challenge">🎓</button>
          <button class="icon-btn ui-interactive" id="btn-manual-pause" type="button" title="Pause Game [Esc]" aria-label="Pause game">
            <span aria-hidden="true">⏸</span>
            <span class="pause-button-label">PAUSE</span>
          </button>
        </div>
      </div>

      <div id="hud-runner-hazard-alert" class="runner-hazard-alert" role="status" aria-live="off" hidden>
        <span class="runner-hazard-alert-icon" aria-hidden="true">!</span>
        <span class="runner-hazard-alert-copy">
          <strong id="hud-runner-hazard-title">ROAD HAZARD AHEAD</strong>
          <span id="hud-runner-hazard-action">Switch lanes or use the right move</span>
        </span>
        <span class="runner-hazard-alert-distance" id="hud-runner-hazard-distance"></span>
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

      <!-- Bottom-Left: Karachi patrol mini-map -->
      <div class="minimap-card gta-radar-card" id="hud-minimap-card">
        <div class="minimap-header">
          <span class="minimap-title">🗺️ KARACHI MAP</span>
          <span class="minimap-badge" id="minimap-target-badge">PATROL</span>
        </div>
        <div class="minimap-canvas-wrapper">
          <canvas id="minimap-canvas" width="130" height="130"></canvas>
        </div>
      </div>

      <!-- Bottom-Center: Speed and drafting display -->
      <div class="nascar-cockpit-cluster" id="hud-nascar-cluster" style="display: none;">
        <!-- Dynamic Slipstream / Drafting Meter -->
        <div class="nascar-drafting-pill" id="hud-drafting-pill" style="display: none;">
          <div class="draft-header">
            <span class="draft-icon">💨</span>
            <span class="draft-label" id="hud-draft-label">SLIPSTREAM DRAFTING</span>
            <span class="draft-pct" id="hud-draft-pct">0%</span>
          </div>
          <div class="draft-track">
            <div class="draft-fill" id="hud-draft-fill" style="width: 0%"></div>
          </div>
        </div>

        <!-- Racing Tachometer & Speedometer Dial -->
        <div class="nascar-gauge-card">
          <div class="nascar-speed-box">
            <span class="nascar-speed-num" id="hud-nascar-speed">60</span>
            <span class="nascar-speed-unit">KM/H</span>
          </div>
          <div class="nascar-rpm-box">
            <div class="nascar-gear-badge" id="hud-nascar-gear">GEAR 2</div>
            <div class="nascar-rpm-row">
              <span class="nascar-rpm-val" id="hud-nascar-rpm">3,200</span>
              <span class="nascar-rpm-unit">RPM</span>
            </div>
            <div class="nascar-redline-bar">
              <div class="nascar-rpm-fill" id="hud-nascar-rpm-fill" style="width: 35%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom-Right: Traversal, Horn & Runner Controls -->
      <div class="hud-controls-bottom-right">
        <div class="runner-btn-row secondary-actions">
          <button class="horn-btn ui-interactive" id="btn-horn" aria-label="Sound horn to clear hazards" title="Horn [H] - repel robbers and clear nearby road">
            <svg class="horn-icon" viewBox="0 0 64 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 20h12L38 8v32L20 28H8zM18 29l4 12h8l-5-13M46 16q8 8 0 16M54 8q16 16 0 32"/>
            </svg>
            <span class="horn-label">HORN</span><span class="horn-hint">TAP / H</span>
          </button>
          <button class="sprint-btn runner-legacy-section ui-interactive" id="btn-sprint" title="Hold to boost speed">⚡ SPRINT</button>
          <button class="journal-btn runner-legacy-section ui-interactive" id="btn-journal" title="Mission Journal & District Gauges [J]">📜 JOURNAL</button>
        </div>
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
      <div id="floating-feedbacks" aria-live="polite"></div>

    `;

    document.body.appendChild(this.hud);
    this.initSpeedLinesCanvas();
  }

  // ---------------------------------------------------------------------------
  // Speed lines canvas overlay
  // ---------------------------------------------------------------------------
  initSpeedLinesCanvas() {
    this.speedCanvas = document.getElementById('speed-lines-canvas');
    if (!this.speedCanvas) {
      this.speedCanvas = document.createElement('canvas');
      this.speedCanvas.id = 'speed-lines-canvas';
      this.speedCanvas.className = 'speed-lines-canvas';
      document.body.appendChild(this.speedCanvas);
    }
    this.speedCtx = this.speedCanvas.getContext('2d');
    const resize = () => {
      if (this.speedCanvas) {
        this.speedCanvas.width = window.innerWidth;
        this.speedCanvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  renderSpeedLines(speedKmh = 60, isBoosting = false) {
    if (!this.speedCanvas || !this.speedCtx) return;
    const ctx = this.speedCtx;
    const w = this.speedCanvas.width;
    const h = this.speedCanvas.height;
    ctx.clearRect(0, 0, w, h);

    if (speedKmh <= 75 && !isBoosting) return;

    const intensity = Math.min(1.0, (speedKmh - 75) / 100) + (isBoosting ? 0.45 : 0);
    const lineCount = Math.floor(16 + intensity * 32);
    const cx = w * 0.5;
    const cy = h * 0.44;

    ctx.save();
    ctx.lineWidth = 2.4;

    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const innerRadius = (Math.min(w, h) * 0.28) + Math.random() * (Math.min(w, h) * 0.16);
      const outerRadius = innerRadius + 120 + Math.random() * 260;

      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * outerRadius;
      const y2 = cy + Math.sin(angle) * outerRadius;

      ctx.strokeStyle = isBoosting ? `rgba(0, 229, 255, ${0.45 * intensity})` : `rgba(255, 255, 255, ${0.32 * intensity})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
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
            ▶ RESUME RUN
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
              <p class="menu-subtitle" id="menu-hero-summary">KARACHI RUNNER</p>
            </div>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-game-menu">&times;</button>
        </div>

        <!-- Hero & Career Summary Strip -->
        <div class="menu-hero-card runner-legacy-section">
          <div class="menu-hero-badge" id="menu-avatar-icon">🏃</div>
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
            ▶ RESUME RUN
          </button>
          <button class="secondary-btn ui-interactive menu-action-btn" id="btn-menu-restart">
            🔄 RESTART DISTRICT
          </button>
          <button class="danger-btn ui-interactive menu-action-btn" id="btn-menu-exit-title">
            🏠 MAIN MENU
          </button>
        </div>

        <section class="runner-pace-menu" aria-label="Runner pace">
          <div class="runner-pace-menu-header">
            <span>🏃 RUN PACE</span>
            <span id="menu-runner-pace-summary">STANDARD · 68 KM/H</span>
          </div>
          <div class="runner-pace-options">
            <button class="runner-pace-option ui-interactive" type="button" data-runner-pace="easy" aria-pressed="false">
              <strong>EASY</strong><small>54 km/h · Scenic</small>
            </button>
            <button class="runner-pace-option active ui-interactive" type="button" data-runner-pace="standard" aria-pressed="true">
              <strong>STANDARD</strong><small>68 km/h · Balanced</small>
            </button>
            <button class="runner-pace-option ui-interactive" type="button" data-runner-pace="hard" aria-pressed="false">
              <strong>HARD</strong><small>79 km/h · Fast</small>
            </button>
          </div>
          <p>Changes apply to this run immediately.</p>
        </section>

        <!-- Major Game Version Selector Hub -->
        <div class="menu-section-header runner-legacy-section">
          <span class="menu-section-title">🎮 CURRENT GAME MODE</span>
          <span class="menu-version-pill" id="menu-active-version-pill">v3.0 Runner Active</span>
        </div>
        <div class="menu-version-grid runner-legacy-section" id="menu-version-grid">
          <div class="menu-version-btn active" id="mver-btn-v3">
            <span class="mver-icon">🏃</span>
            <div class="mver-info">
              <span class="mver-title">KARACHI RUNNER</span>
              <span class="mver-desc">3-lane continuous reflex sprint • Jump &amp; slide</span>
            </div>
            <span class="mver-tag">RUNNER</span>
          </div>
        </div>

        <div class="menu-version-actions-row runner-legacy-section">
          <button class="menu-btn-feedback ui-interactive" id="btn-open-version-feedback">
            💬 Version Feedback / Restore Comments ➔
          </button>
        </div>

        <!-- Hub to Access All Other Game Screens -->
        <div class="menu-section-header runner-legacy-section">
          <span class="menu-section-title">🗺️ ALL GAME MENUS &amp; MODES</span>
        </div>
        <div class="menu-hub-grid">
          <button class="hub-tile-btn ui-interactive runner-legacy-section" id="btn-menu-open-journal">
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
              <span class="hub-tile-name">Choose Getup</span>
              <span class="hub-tile-sub">Change runner clothing</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-shop">
            <span class="hub-tile-icon">🛒</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Power-Up Shop</span>
              <span class="hub-tile-sub">Upgrade Magnet, Shield, Nitro &amp; Double Coins</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-runner-progress">
            <span class="hub-tile-icon">🏆</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">My Progress</span>
              <span class="hub-tile-sub">Scores, rupees, routes and achievements</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive" id="btn-menu-open-runner-help">
            <span class="hub-tile-icon">❔</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Runner Help</span>
              <span class="hub-tile-sub">Controls, hazards and power-ups</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive runner-legacy-section" id="btn-menu-open-quiz">
            <span class="hub-tile-icon">🎓</span>
            <div class="hub-tile-info">
              <span class="hub-tile-name">Civic Academy</span>
              <span class="hub-tile-sub">Educational Dilemmas &amp; XP</span>
            </div>
            <span class="hub-tile-arrow">➔</span>
          </button>

          <button class="hub-tile-btn ui-interactive runner-legacy-section" id="btn-menu-open-guide">
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
          <span class="menu-section-title" id="menu-route-section-title">📍 PATROL AREA</span>
        </div>
        <div class="menu-level-select-row" id="menu-level-select-row">
          <button class="level-select-btn ui-interactive" data-level="1" id="btn-menu-level-1">
            <span class="lvl-num">AREA 1</span>
            <span class="lvl-name">Soldier Bazar · PECHS</span>
          </button>
          <button class="level-select-btn ui-interactive" data-level="2" id="btn-menu-level-2">
            <span class="lvl-num">AREA 2</span>
            <span class="lvl-name">Lyari</span>
          </button>
          <button class="level-select-btn ui-interactive" data-level="3" id="btn-menu-level-3">
            <span class="lvl-num">AREA 3</span>
            <span class="lvl-name">Saddar · Burns Road</span>
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

          <div class="settings-row runner-legacy-section">
            <div class="settings-label-block">
              <span class="settings-name">Civic Moral Questions &amp; Dilemmas</span>
              <span class="settings-hint">Optional interactive quizzes after solving crises (Default: OFF)</span>
            </div>
            <button class="setting-pill-toggle ui-interactive ${this.civicQuizEnabled ? 'active' : ''}" id="btn-menu-toggle-quiz">
              ${this.civicQuizEnabled ? '🎓 QUIZ: ON' : '🎓 QUIZ: OFF'}
            </button>
          </div>

          <div class="settings-row runner-legacy-section">
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

          <div class="settings-row runner-legacy-section">
            <div class="settings-label-block">
              <span class="settings-name">Camera Perspective</span>
              <span class="settings-hint">Toggle between Street Chase &amp; Elevated Wide view</span>
            </div>
            <div class="tier-pill-group" id="menu-camera-pills">
              <button class="tier-pill-btn active ui-interactive" id="btn-cam-street">Street Chase</button>
              <button class="tier-pill-btn ui-interactive" id="btn-cam-wide">Extra Wide Drone</button>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label-block">
              <span class="settings-name">Reset Career &amp; Unlocks</span>
              <span class="settings-hint">Reset XP, achievements, districts, and getups.</span>
            </div>
            <button class="setting-pill-toggle ui-interactive" id="btn-reset-career">RESET</button>
          </div>
        </div>

        <div class="menu-footer">
          <button class="primary-btn ui-interactive close-menu-footer-btn" id="btn-menu-footer-close">
            CLOSE &amp; CONTINUE RUN
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.gameMenuModal);
  }

  // 4. Runner Getup Selection Modal
  createSkinModal() {
    this.skinModal = document.createElement('div');
    this.skinModal.className = 'modal-backdrop';
    this.skinModal.id = 'modal-skins';
    this.skinModal.style.display = 'none';

    this.skinModal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h2>Choose Getup</h2>
          <button class="close-btn ui-interactive" id="btn-close-skins">&times;</button>
        </div>
        <div class="avatar-selection-grid" id="menu-avatar-grid" aria-label="Avatar clothing">
          <div class="avatar-card ui-interactive" data-avatar="tariq"><span class="avatar-card-outfit">Green shalwar kameez · waistcoat</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="biryani_rider"><span class="avatar-card-outfit">🛵 Chacha Biryani · helmet & delivery pack</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="captain_karachi"><span class="avatar-card-outfit">⚡ Captain Karachi · super suit & cape</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="chai_wala"><span class="avatar-card-outfit">🫖 Ustad Chai Wala · apron & kettle</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="ayesha"><span class="avatar-card-outfit">Turquoise kameez · Ajrak scarf</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="farooq"><span class="avatar-card-outfit">White traffic-police uniform</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="bilal"><span class="avatar-card-outfit">Edhi rescue vest · white shalwar kameez</span><span class="avatar-card-status" aria-hidden="true"></span></div>
          <div class="avatar-card ui-interactive" data-avatar="zain"><span class="avatar-card-outfit">Green school blazer · trousers</span><span class="avatar-card-status" aria-hidden="true"></span></div>
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

        <!-- Dedicated Subway Run / Temple Run Crash Recovery & Action Card -->
        <div id="runner-crash-card" style="display: none;">
          <div class="crash-hazard-badge">
            <span id="crash-hazard-icon" style="font-size: 2.8rem; line-height: 1;">⚡</span>
            <div style="flex: 1;">
              <div class="crash-hazard-title" id="crash-hazard-title">CRASHED!</div>
              <div class="crash-hazard-hint" id="crash-hazard-hint">💡 ACTION NEEDED: Press [S] to slide under wires</div>
            </div>
          </div>

          <div class="runner-stats-summary">
            <div class="stat-box">
              <span class="stat-label">DISTANCE</span>
              <span class="stat-num" id="crash-stat-dist" style="color: #00e5ff;">0m</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">COINS</span>
              <span class="stat-num" id="crash-stat-coins" style="color: #ffd700;">0 Rs</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">SCORE</span>
              <span class="stat-num" id="crash-stat-score" style="color: #76ff03;">0</span>
            </div>
          </div>

          <div class="crash-actions-list">
            <button class="btn-crash-revive ui-interactive" id="btn-crash-revive" title="Revive">
              REVIVE
            </button>
            <div class="crash-revive-status" id="crash-revive-status" role="alert" aria-live="polite" style="display: none;"></div>
            <button class="btn-crash-retry ui-interactive" id="btn-crash-retry" title="Restart">
              RESTART
            </button>
            <button class="ghost-btn ui-interactive" id="btn-crash-main-menu">
              🏠 HOME
            </button>
          </div>
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
          <button class="ghost-btn ui-interactive" id="btn-results-home" style="display: none;">
            🏠 HOME
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
            <span class="jm-desc">${m.description || m.desc || ''}</span>
          </div>
          <span class="jm-reward">+${m.xpReward || m.rewardXP || 1000} XP</span>
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
  setRunnerDifficultySelection(difficulty) {
    if (!['easy', 'standard', 'hard'].includes(difficulty)) return false;
    this.runnerDifficulty = difficulty;
    document.querySelectorAll('#runner-difficulty-grid .age-card, .runner-pace-option').forEach(option => {
      const optionDifficulty = option.dataset.runnerDifficulty || option.dataset.runnerPace;
      option.classList.toggle('active', optionDifficulty === difficulty);
      if (option.matches('.age-card, .runner-pace-option')) {
        option.setAttribute('aria-pressed', String(optionDifficulty === difficulty));
      }
    });
    const paceNames = { easy: 'EASY · 54 KM/H', standard: 'STANDARD · 68 KM/H', hard: 'HARD · 79 KM/H' };
    const summary = document.getElementById('menu-runner-pace-summary');
    if (summary) summary.textContent = paceNames[difficulty];
    return true;
  }

  checkAndShowConsentPrompt() {
    try {
      const storedOps = localStorage.getItem('portable-game-ops:v1');
      if (!storedOps) return false;
      const parsed = JSON.parse(storedOps);
      // Strictly gated behind admin toggle:
      if (!parsed || !parsed.consentPromptEnabled) return false;

      const existingChoice = localStorage.getItem('kr_analytics_consent');
      if (existingChoice === 'granted' || existingChoice === 'denied') return false;

      if (this.analyticsConsentModal) {
        this.analyticsConsentModal.style.display = 'flex';
        return true;
      }
    } catch {
      // Safely ignore storage errors
    }
    return false;
  }

  updateConsentPrivacyStatus() {
    const el = document.getElementById('runner-help-consent-status');
    if (!el) return;
    try {
      const storedOps = localStorage.getItem('portable-game-ops:v1');
      const parsed = storedOps ? JSON.parse(storedOps) : null;
      if (!parsed || !parsed.consentPromptEnabled) {
        el.textContent = 'Diagnostics are completely offline (Admin Gate: Disabled).';
        return;
      }
      const choice = localStorage.getItem('kr_analytics_consent');
      if (choice === 'granted') {
        el.textContent = 'Diagnostics: Active (Anonymous telemetry enabled).';
      } else if (choice === 'denied') {
        el.textContent = 'Diagnostics: Declined (Collection disabled).';
      } else {
        el.textContent = 'Diagnostics: Unset (Awaiting player choice).';
      }
    } catch {
      el.textContent = 'Diagnostics are completely offline.';
    }
  }

  bindEvents() {
    const openHelp = () => {
      audio.playClick();
      this.updateConsentPrivacyStatus();
      if (this.runnerHelpModal) this.runnerHelpModal.style.display = 'flex';
    };
    const closeHelp = () => {
      if (this.runnerHelpModal) this.runnerHelpModal.style.display = 'none';
    };
    const openProgress = () => {
      audio.playClick();
      this.refreshRunnerProgress();
      if (this.runnerProgressModal) this.runnerProgressModal.style.display = 'flex';
    };
    const closeProgress = () => {
      if (this.runnerProgressModal) this.runnerProgressModal.style.display = 'none';
    };
    document.getElementById('btn-home-help')?.addEventListener('click', openHelp);
    document.getElementById('btn-menu-open-runner-help')?.addEventListener('click', openHelp);
    document.getElementById('btn-close-runner-help')?.addEventListener('click', closeHelp);
    document.getElementById('btn-runner-help-done')?.addEventListener('click', closeHelp);
    document.getElementById('btn-replay-runner-intro')?.addEventListener('click', () => {
      closeHelp();
      this.showRunnerIntro();
    });
    document.getElementById('btn-home-progress')?.addEventListener('click', openProgress);
    document.getElementById('btn-menu-open-runner-progress')?.addEventListener('click', openProgress);
    document.getElementById('btn-close-runner-progress')?.addEventListener('click', closeProgress);
    document.getElementById('btn-runner-progress-done')?.addEventListener('click', closeProgress);
    this.runnerHelpModal?.addEventListener('click', event => {
      if (event.target === this.runnerHelpModal) closeHelp();
    });
    this.runnerProgressModal?.addEventListener('click', event => {
      if (event.target === this.runnerProgressModal) closeProgress();
    });

    const openShop = () => {
      audio.playClick();
      this.showRunnerShop();
    };
    const closeShop = () => {
      audio.playClick();
      this.hideRunnerShop();
    };
    document.getElementById('btn-home-shop')?.addEventListener('click', openShop);
    document.getElementById('btn-menu-open-shop')?.addEventListener('click', openShop);
    document.getElementById('btn-progress-open-shop')?.addEventListener('click', () => {
      closeProgress();
      openShop();
    });
    document.getElementById('btn-close-runner-shop')?.addEventListener('click', closeShop);
    document.getElementById('btn-runner-shop-done')?.addEventListener('click', closeShop);
    this.runnerShopModal?.addEventListener('click', event => {
      if (event.target === this.runnerShopModal) closeShop();
    });

    document.getElementById('btn-consent-decline')?.addEventListener('click', () => {
      audio.playClick();
      try { localStorage.setItem('kr_analytics_consent', 'denied'); } catch {}
      if (this.analyticsConsentModal) this.analyticsConsentModal.style.display = 'none';
      this.updateConsentPrivacyStatus();
    });

    document.getElementById('btn-consent-allow')?.addEventListener('click', () => {
      audio.playClick();
      try { localStorage.setItem('kr_analytics_consent', 'granted'); } catch {}
      if (this.analyticsConsentModal) this.analyticsConsentModal.style.display = 'none';
      this.updateConsentPrivacyStatus();
    });

    // 1. Start Mission Button
    const btnStartPatrol = document.getElementById('btn-start-patrol');
    if (btnStartPatrol) {
      btnStartPatrol.addEventListener('click', () => {
        audio.playClick();
        this.startModal.style.display = 'none';
        this.hideTapToStartPrompt();
        this.checkAndShowConsentPrompt();
        if (this.onStartGame) {
          this.onStartGame({
            playerName: this.playerName,
            ageTier: this.currentAgeTier,
            runnerDifficulty: this.runnerDifficulty,
            avatarId: this.selectedAvatar || 'tariq',
            districtLevel: this.selectedDistrictLevel || 1,
            versionId: 'v3'
          });
        }
      });
    }

    const runnerDifficultyCards = document.querySelectorAll('#runner-difficulty-grid .age-card');
    runnerDifficultyCards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        this.setRunnerDifficultySelection(card.dataset.runnerDifficulty || 'standard');
      });
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        card.click();
      });
    });

    document.querySelectorAll('.runner-pace-option').forEach(button => {
      button.addEventListener('click', () => {
        audio.playClick();
        const pace = button.dataset.runnerPace || 'standard';
        this.setRunnerDifficultySelection(pace);
        if (this.onSelectRunnerDifficulty) this.onSelectRunnerDifficulty(pace);
      });
    });

    // Outfit selection is shared by onboarding and the in-game getup picker.
    const avatarCards = document.querySelectorAll('#start-avatar-grid .avatar-card, #menu-avatar-grid .avatar-card');
    avatarCards.forEach(card => {
      card.addEventListener('click', () => {
        audio.playClick();
        const avatarId = card.dataset.avatar || 'tariq';
        if (!saveManager.isAvatarUnlocked(avatarId)) {
          this.showAnnouncement(`🔒 ${AVATAR_UNLOCK_HINTS[avatarId] || 'Earn more achievements to unlock this getup.'}`, '#ffd700');
          return;
        }
        avatarCards.forEach(c => c.classList.toggle('active', c.dataset.avatar === avatarId));
        this.selectedAvatar = avatarId;
        if (window.game?.player?.setAvatar) {
          window.game.player.setAvatar(this.selectedAvatar);
        }
        saveManager.get().player.avatarId = avatarId;
        if (!saveManager.save()) {
          console.error('[SAVE] Could not persist selected runner getup.');
          this.showAnnouncement('Could not save this getup. Check device storage.', '#ff5252');
        }
        this.refreshProgressionContent();
        if (this.skinModal) this.skinModal.style.display = 'none';
        if (this.avatarModalShouldResume && this.onResumeGame) this.onResumeGame();
        this.avatarModalShouldResume = false;
      });
    });

    // Sprint Button
    const btnSprint = document.getElementById('btn-sprint');
    if (btnSprint) {
      btnSprint.addEventListener('mousedown', () => { window.isBoostPressed = true; });
      btnSprint.addEventListener('mouseup', () => { window.isBoostPressed = false; });
      btnSprint.addEventListener('mouseleave', () => { window.isBoostPressed = false; });
      btnSprint.addEventListener('touchstart', (e) => { e.preventDefault(); window.isBoostPressed = true; });
      btnSprint.addEventListener('touchend', (e) => { e.preventDefault(); window.isBoostPressed = false; });
      btnSprint.addEventListener('touchcancel', () => { window.isBoostPressed = false; });
    }

    const attachInstantTouch = (btn, action) => {
      if (!btn) return;
      let lastTouchTime = 0;
      const trigger = (e) => {
        if (e && e.cancelable && e.type === 'touchstart') e.preventDefault();
        const now = performance.now();
        if (now - lastTouchTime < 160) return;
        lastTouchTime = now;
        action(e);
      };
      btn.addEventListener('touchstart', trigger, { passive: false });
      btn.addEventListener('click', trigger);
    };

    // King Pressure Horn Button (Clear Traffic & Stun Robbers)
    const btnHorn = document.getElementById('btn-horn');
    if (btnHorn) {
      attachInstantTouch(btnHorn, () => {
        if (this.onHorn) this.onHorn();
      });
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
      if (this.isRunnerMode) return;
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
        this.openGetupPicker();
      });
    }

    const btnCloseSkins = document.getElementById('btn-close-skins');
    if (btnCloseSkins) {
      btnCloseSkins.addEventListener('click', () => {
        audio.playClick();
        if (this.skinModal) this.skinModal.style.display = 'none';
        if (this.avatarModalShouldResume && this.onResumeGame) this.onResumeGame();
        this.avatarModalShouldResume = false;
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

    // Major Game Version Selection inside Game Menu
    const menuVersionBtns = document.querySelectorAll('#menu-version-grid .menu-version-btn[data-version]');
    menuVersionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playClick();
        const ver = btn.dataset.version;
        menuVersionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedVersion = ver;
        if (this.onSelectVersion) {
          this.onSelectVersion(ver, 'main');
        }
        this.syncActiveVersionUI(ver);
      });
    });

    document.getElementById('btn-open-version-feedback')?.addEventListener('click', () => {
      this.openVersionFeedbackModal();
    });
    document.getElementById('btn-menu-version-feedback')?.addEventListener('click', () => {
      this.openVersionFeedbackModal();
    });
    document.getElementById('btn-close-version-feedback')?.addEventListener('click', () => {
      this.closeVersionFeedbackModal();
    });

    // Save version feedback comments
    document.getElementById('btn-save-version-feedback')?.addEventListener('click', () => {
      const v1 = document.getElementById('vfeed-comment-v1')?.value.trim() || '';
      const v2 = document.getElementById('vfeed-comment-v2')?.value.trim() || '';
      const v3 = document.getElementById('vfeed-comment-v3')?.value.trim() || '';
      const feedbackPayload = { v1, v2, v3, timestamp: Date.now() };
      localStorage.setItem('karachi_version_feedback', JSON.stringify(feedbackPayload));

      // Also forward feedback to dev comments queue if any text present
      const combined = [
        v1 ? `[v1.0 Feedback] ${v1}` : '',
        v2 ? `[v2.0 Feedback] ${v2}` : '',
        v3 ? `[v3.0 Feedback] ${v3}` : ''
      ].filter(Boolean).join(' | ');

      if (combined) {
        this.addDevComment(combined, 'general');
      }
      this.showDevToast('💾 Version Feedback Saved & Synced to Dashboard!');
      setTimeout(() => this.closeVersionFeedbackModal(), 800);
    });

    // Export version feedback JSON
    document.getElementById('btn-export-version-feedback')?.addEventListener('click', () => {
      const v1 = document.getElementById('vfeed-comment-v1')?.value.trim() || '';
      const v2 = document.getElementById('vfeed-comment-v2')?.value.trim() || '';
      const v3 = document.getElementById('vfeed-comment-v3')?.value.trim() || '';
      const exportData = {
        app: 'Karachi Street Hero / Hole.io',
        exportDate: new Date().toISOString(),
        activeVersion: this.selectedVersion || 'v3',
        versions: {
          'v1.0-classic-hole': { title: 'Hole Devourer', feedback: v1 },
          'v2.0-civic-hero': { title: 'Civic Hero 3D Patrol', feedback: v2 },
          'v3.0-temple-run': { title: 'Karachi Runner', feedback: v3 }
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karachi_version_feedback_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showDevToast('📋 Feedback Exported as JSON!');
    });

    // Version switch buttons inside the feedback modal
    document.querySelectorAll('.vfeed-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playClick();
        const ver = btn.dataset.switchVer;
        if (ver) {
          this.selectedVersion = ver;
          if (this.onSelectVersion) this.onSelectVersion(ver);
          this.syncActiveVersionUI(ver);
          this.showDevToast(`Switched to ${ver.toUpperCase()} Engine`);
        }
      });
    });

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
        audio.playClick();
        if (this.gameMenuModal) this.gameMenuModal.style.display = 'none';
        this.openGetupPicker();
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

    const btnResetCareer = document.getElementById('btn-reset-career');
    btnResetCareer?.addEventListener('click', () => {
      if (!window.confirm('Reset all career XP, achievements, districts, and getup unlocks? This cannot be undone.')) return;
      if (!saveManager.resetProgress()) {
        console.error('[SAVE] Career reset could not be persisted.');
        this.showAnnouncement('Career reset failed. Check device storage.', '#ff5252');
        return;
      }
      this.selectedAvatar = 'tariq';
      this.selectedDistrictLevel = 1;
      this.runnerDifficulty = 'standard';
      this.playerName = 'Karachi Hero';
      this.currentAgeTier = 'kids';
      this.civicQuizEnabled = false;
      try {
        localStorage.removeItem('hole_karachi_civic_quiz_enabled');
      } catch (error) {
        console.error('[SAVE] Career reset succeeded, but civic quiz preference could not be cleared.', error);
        this.showAnnouncement('Career reset, but some settings could not be cleared.', '#ff9100');
      }
      this.refreshProgressionContent();
      if (this.onResetCareer) this.onResetCareer();
    });

    // Civic Moral Dilemmas / Quiz Toggle (Default: OFF per user instruction)
    const btnMenuToggleQuiz = document.getElementById('btn-menu-toggle-quiz');
    if (btnMenuToggleQuiz) {
      btnMenuToggleQuiz.addEventListener('click', () => {
        audio.playClick();
        this.civicQuizEnabled = !this.civicQuizEnabled;
        try {
          localStorage.setItem('hole_karachi_civic_quiz_enabled', this.civicQuizEnabled ? 'true' : 'false');
        } catch (error) {
          console.error('[SAVE] Could not persist civic quiz preference.', error);
          this.showAnnouncement('Could not save the quiz setting. Check device storage.', '#ff5252');
        }
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
        if (this.runnerShopModal && this.runnerShopModal.style.display !== 'none') {
          this.hideRunnerShop();
        } else if (this.runnerHelpModal && this.runnerHelpModal.style.display !== 'none') {
          this.runnerHelpModal.style.display = 'none';
        } else if (this.runnerProgressModal && this.runnerProgressModal.style.display !== 'none') {
          this.runnerProgressModal.style.display = 'none';
        } else if (this.gameMenuModal && this.gameMenuModal.style.display !== 'none') {
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

      // Crash Modal Keyboard Shortcuts (Quick Revive / Retry)
      if (this.gameOverModal && this.gameOverModal.style.display !== 'none') {
        const crashCard = document.getElementById('runner-crash-card');
        if (crashCard && crashCard.style.display !== 'none') {
          if (e.code === 'KeyC') {
            e.preventDefault();
            if (this.onQuickRevive?.()) {
              this.gameOverModal.style.display = 'none';
            } else if (saveManager.getReviveTokenCount() < 1) {
              this.showCrashReviveError('Collect a rare Rescue Token during a run to use Quick Revive.');
            }
            return;
          } else if (e.code === 'Enter') {
            e.preventDefault();
            if (this.onRestartGame) this.onRestartGame();
            return;
          }
        }
      }

      const tutorialVisible = this.runnerTutorialOverlay?.style.display !== 'none';
      const tutorialDismissKeys = [
        'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight',
        'KeyW', 'ArrowUp', 'Space', 'KeyH'
      ];
      if (tutorialVisible && window.game?.isTempleRun && window.game.isGameStarted &&
          tutorialDismissKeys.includes(e.code)) {
        e.preventDefault();
        this.hideRunnerTutorial();
        return;
      }

      // Runner keyboard controls (lane switch, jump, slide, horn)
      if (window.game && window.game.isTempleRun && window.game.isGameStarted && !this.isAutoPaused && !window.game.isPaused) {
        if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable="true"]')) {
          return;
        }
        const runnerControlKeys = [
          'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight',
          'KeyW', 'ArrowUp', 'Space', 'KeyH'
        ];
        if (!runnerControlKeys.includes(e.code)) return;
        e.preventDefault();
        if (e.repeat) return;

        if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          this.hideRunnerTutorial();
          if (this.onSlide) this.onSlide();
        } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          this.hideRunnerTutorial();
          if (this.onLaneLeft) this.onLaneLeft();
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          this.hideRunnerTutorial();
          if (this.onLaneRight) this.onLaneRight();
        } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
          this.hideRunnerTutorial();
          if (this.onJump) this.onJump();
        } else if (e.code === 'KeyH') {
          this.hideRunnerTutorial();
          if (this.onHorn) this.onHorn();
        }
      }
    });

    // Touch Swipe Gestures for Mobile Temple Run (Instantaneous touchmove flick detection)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTarget = null;
    window.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches?.[0];
      if (touch) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const startTarget = touchStartTarget;
        touchStartTarget = null;
        if (this.runnerTutorialOverlay?.style.display !== 'none' &&
            window.game?.isTempleRun && window.game.isGameStarted) {
          this.hideRunnerTutorial();
          return;
        }
        if (!window.game?.isTempleRun || !window.game.isGameStarted || window.game.isPaused ||
            startTarget?.closest('.ui-interactive, button, .modal')) {
          return;
        }
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 35 || Math.abs(dy) > 35) {
          this.hideRunnerTutorial();
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0 && this.onLaneLeft) this.onLaneLeft();
            else if (dx > 0 && this.onLaneRight) this.onLaneRight();
          } else {
            if (dy < 0 && this.onJump) this.onJump();
            else if (dy > 0 && this.onSlide) this.onSlide();
          }
        }
      }
    }, { passive: true });

    // Mouse Drag Swipe for Desktop Web
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 &&
          !(e.target instanceof Element && e.target.closest('.ui-interactive, button, .modal'))) {
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        isMouseDown = true;
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
        isMouseDown = false;
        if (this.runnerTutorialOverlay?.style.display !== 'none' &&
            window.game?.isTempleRun && window.game.isGameStarted) {
          this.hideRunnerTutorial();
          return;
        }
        if (!window.game?.isTempleRun || !window.game.isGameStarted || window.game.isPaused) return;
        const dx = e.clientX - mouseStartX;
        const dy = e.clientY - mouseStartY;
        if (Math.abs(dx) > 35 || Math.abs(dy) > 35) {
          this.hideRunnerTutorial();
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0 && this.onLaneLeft) this.onLaneLeft();
            else if (dx > 0 && this.onLaneRight) this.onLaneRight();
          } else {
            if (dy < 0 && this.onJump) this.onJump();
            else if (dy > 0 && this.onSlide) this.onSlide();
          }
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

    document.getElementById('btn-results-home')?.addEventListener('click', () => {
      audio.playClick();
      if (this.gameOverModal) this.gameOverModal.style.display = 'none';
      if (this.onReturnToMainMenu) this.onReturnToMainMenu();
    });

    // Next Level button on Game Over
    const btnResultsNext = document.getElementById('btn-results-next');
    if (btnResultsNext) {
      btnResultsNext.addEventListener('click', () => {
        audio.playClick();
        if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        if (this.onNextLevel) this.onNextLevel();
      });
    }

    // Crash Card Action Buttons
    const btnCrashRevive = document.getElementById('btn-crash-revive');
    if (btnCrashRevive) {
      btnCrashRevive.addEventListener('click', () => {
        audio.playClick();
        if (this.onQuickRevive?.()) {
          if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        } else if (saveManager.getReviveTokenCount() < 1) {
          this.showCrashReviveError('Collect a rare Rescue Token during a run to use Quick Revive.');
        }
      });
    }

    const btnCrashRetry = document.getElementById('btn-crash-retry');
    if (btnCrashRetry) {
      btnCrashRetry.addEventListener('click', () => {
        audio.playClick();
        if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        if (this.onRestartGame) this.onRestartGame();
      });
    }

    const btnCrashMainMenu = document.getElementById('btn-crash-main-menu');
    if (btnCrashMainMenu) {
      btnCrashMainMenu.addEventListener('click', () => {
        audio.playClick();
        if (this.gameOverModal) this.gameOverModal.style.display = 'none';
        if (this.onReturnToMainMenu) this.onReturnToMainMenu();
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
    audio.pauseAudio();
    if (this.autoPauseModal) {
      this.autoPauseModal.style.display = 'flex';
    }
  }

  hideAutoPauseModal() {
    const wasVisible = Boolean(this.autoPauseModal && this.autoPauseModal.style.display !== 'none');
    this.isAutoPaused = false;
    if (this.autoPauseModal) {
      this.autoPauseModal.style.display = 'none';
    }
    if (wasVisible && this.onResumeGame) {
      this.onResumeGame();
    }
  }

  showGameMenuModal() {
    if (!this.gameMenuModal) return;
    if (this.onPauseGame) this.onPauseGame();
    audio.pauseAudio();
    this.refreshProgressionContent();
    this.refreshRunnerProgress();
    this.setRunnerDifficultySelection(window.game?.runnerDifficulty || this.runnerDifficulty);

    // Sync current player stats
    if (window.game && window.game.player) {
      const p = window.game.player;
      const avatarIcons = { tariq: '👕', ayesha: '🧣', farooq: '🚦', bilal: '🩺', zain: '🎒' };
      const iconEl = document.getElementById('menu-avatar-icon');
      if (iconEl) iconEl.textContent = avatarIcons[p.avatarId] || '👕';
      const nameEl = document.getElementById('menu-player-name');
      if (nameEl) nameEl.textContent = p.name || 'Karachi Hero';
      const lvlEl = document.getElementById('menu-level-badge');
      if (lvlEl) lvlEl.textContent = `LV ${p.level || 1}`;
      const scoreEl = document.getElementById('menu-score-badge');
      if (scoreEl) scoreEl.textContent = `SCORE: ${(window.game.isTempleRun ? window.game.score : p.score) || 0}`;
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
    if (this.hud) this.hud.style.display = 'none';

    if (this.onPauseGame) this.onPauseGame();
    if (window.game) window.game.isGameStarted = false;
    this.refreshProgressionContent();
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
    missions = null,
    routeProgress = null,
    activePowerUp = null,
    distanceMeters = 0,
    runScore = 0,
    coins = 0,
    hearts = 3,
    currentMilestone = 'Soldier Bazar',
    speedKmh = 60,
    rpm = 3200,
    gear = 2,
    isDrafting = false,
    draftPct = 0,
    isSlingshotReady = false,
    isRunnerMode = true
  }) {
    if (this.isRunnerMode !== isRunnerMode) {
      this.setRunnerMode(isRunnerMode);
    }
    // NASCAR Cockpit Racing Cluster & Speed Lines
    const nascarCluster = document.getElementById('hud-nascar-cluster');
    const speedEl = document.getElementById('hud-nascar-speed');
    const rpmEl = document.getElementById('hud-nascar-rpm');
    const gearEl = document.getElementById('hud-nascar-gear');
    const rpmFillEl = document.getElementById('hud-nascar-rpm-fill');
    const draftPill = document.getElementById('hud-drafting-pill');
    const draftLabel = document.getElementById('hud-draft-label');
    const draftPctEl = document.getElementById('hud-draft-pct');
    const draftFillEl = document.getElementById('hud-draft-fill');

    if (nascarCluster) {
      if (isRunnerMode) {
        nascarCluster.style.display = 'flex';
        const kmh = Math.round(speedKmh || 60);
        if (speedEl) speedEl.textContent = kmh;
        if (rpmEl) rpmEl.textContent = (rpm || 3200).toLocaleString();
        if (gearEl) gearEl.textContent = `GEAR ${gear || 2}`;
        if (rpmFillEl) {
          const ratio = Math.min(100, Math.max(0, ((rpm || 3200) / 8500) * 100));
          rpmFillEl.style.width = `${ratio}%`;
          rpmFillEl.style.background = ratio > 80 ? 'linear-gradient(90deg, #ff9100, #ff1744)' : 'linear-gradient(90deg, #00e5ff, #76ff03)';
        }

        if (draftPill) {
          if (isDrafting || draftPct > 0) {
            draftPill.style.display = 'flex';
            if (isSlingshotReady) {
              draftPill.classList.add('slingshot-ready');
              if (draftLabel) draftLabel.textContent = '⚡ SLINGSHOT READY! PULL OUT!';
            } else {
              draftPill.classList.remove('slingshot-ready');
              if (draftLabel) draftLabel.textContent = '💨 SLIPSTREAM DRAFTING';
            }
            if (draftPctEl) draftPctEl.textContent = `${draftPct}%`;
            if (draftFillEl) draftFillEl.style.width = `${draftPct}%`;
          } else {
            draftPill.style.display = 'none';
          }
        }
      } else {
        nascarCluster.style.display = 'none';
      }
    }

    if (isRunnerMode) {
      this.renderSpeedLines(speedKmh || 60, activePowerUp && activePowerUp.title && activePowerUp.title.includes('NITRO'));
    } else {
      if (this.speedCtx && this.speedCanvas) {
        this.speedCtx.clearRect(0, 0, this.speedCanvas.width, this.speedCanvas.height);
      }
    }

    // Karachi Temple Run HUD Metrics (Distance, Coins, Hearts)
    const distValEl = document.getElementById('hud-distance-val');
    if (distValEl) {
      const d = Math.round(distanceMeters || 0);
      distValEl.textContent = d >= 1000 ? `${d.toLocaleString()} m (${(d / 1000).toFixed(1)} km)` : `${d} m`;
    }
    const milestoneEl = document.getElementById('hud-milestone-tag');
    if (milestoneEl && currentMilestone && milestoneEl.textContent !== currentMilestone) {
      milestoneEl.textContent = currentMilestone;
      milestoneEl.classList.remove('milestone-badge-pulse');
      void milestoneEl.offsetWidth;
      milestoneEl.classList.add('milestone-badge-pulse');
    }
    const coinsEl = document.getElementById('hud-coins-val');
    if (coinsEl) {
      coinsEl.textContent = `${coins || 0} Rs`;
    }
    const heartsEl = document.getElementById('hud-hearts-val');
    if (heartsEl) {
      const h = Math.max(0, Math.min(3, hearts !== undefined ? hearts : 3));
      heartsEl.textContent = `${'❤️'.repeat(h)}${'🖤'.repeat(3 - h)}`;
    }

    // Player Name & 3D Avatar Icon in Header
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl && player && player.name) {
      nameEl.textContent = player.name.toUpperCase();
    }
    const avatarIconEl = document.getElementById('hud-avatar-icon');
    if (avatarIconEl && player) {
      const avatarIcons = {
        tariq: '👕',
        ayesha: '🧣',
        farooq: '🚦',
        bilal: '🩺',
        zain: '🎒'
      };
      avatarIconEl.textContent = avatarIcons[player.avatarId] || '👕';
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

    // Karachi Transit Route Progression (Soldier Bazar -> PECHS Tariq Road)
    const routeCard = document.getElementById('hud-route-progress');
    if (routeCard) {
      if (routeProgress) {
        routeCard.style.display = 'flex';
        const fillEl = document.getElementById('hud-route-fill');
        const pinEl = document.getElementById('hud-route-pin');
        const distEl = document.getElementById('hud-route-dist');
        const startEl = document.getElementById('hud-route-start');
        const destEl = document.getElementById('hud-route-dest');
        if (fillEl) fillEl.style.width = `${routeProgress.routePct || 0}%`;
        if (pinEl) pinEl.style.left = `${Math.min(96, routeProgress.routePct || 0)}%`;
        if (distEl) {
          distEl.textContent = routeProgress.neighborhoodName
            ? `${routeProgress.neighborhoodName} · ${routeProgress.distLeft.toLocaleString()}m left`
            : `${routeProgress.distLeft || 0}m to PECHS`;
        }
        if (startEl && routeProgress.origin) startEl.textContent = `📍 ${routeProgress.origin}`;
        if (destEl && routeProgress.destination) destEl.textContent = `🏁 ${routeProgress.destination}`;
      } else {
        routeCard.style.display = 'none';
      }
    }

    // NASCAR / Mario Kart Power-Up Active Slot
    const powerSlot = document.getElementById('hud-powerup-slot');
    if (powerSlot) {
      if (activePowerUp && activePowerUp.timer > 0) {
        powerSlot.style.display = 'flex';
        const pIcon = document.getElementById('hud-powerup-icon');
        const pTitle = document.getElementById('hud-powerup-title');
        const pFill = document.getElementById('hud-powerup-timer-fill');
        if (pIcon) pIcon.textContent = activePowerUp.icon || '🚀';
        if (pTitle) pTitle.textContent = `${activePowerUp.title} (${activePowerUp.timer.toFixed(1)}s)`;
        if (pFill) {
          const ratio = Math.min(100, Math.max(0, (activePowerUp.timer / (activePowerUp.maxDuration || 6)) * 100));
          pFill.style.width = `${ratio}%`;
        }
      } else {
        powerSlot.style.display = 'none';
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
    const rawScore = Number(isRunnerMode ? runScore : player?.score ?? 0);
    const scoreValEl = document.getElementById('hud-score');
    if (scoreValEl) {
      scoreValEl.textContent = (Number.isFinite(rawScore) ? rawScore : 0).toLocaleString();
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
    const playerLevel = Number.isFinite(Number(player.level)) ? Math.floor(Number(player.level)) : 1;
    const levelIndex = Math.min(LEVEL_CONFIG.length - 1, Math.max(0, playerLevel - 1));
    const currentConfig = LEVEL_CONFIG[levelIndex];
    const displayLevel = levelIndex + 1;
    document.getElementById('hud-level-badge').textContent = `LV ${displayLevel}`;
    document.getElementById('hud-level-title').textContent = currentConfig.title;

    const prevXP = levelIndex === 0 ? 0 : LEVEL_CONFIG[levelIndex - 1].maxXP;
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

  updateReviveTokenCount(tokenCount) {
    const count = Number.isSafeInteger(tokenCount)
      ? Math.max(0, Math.min(MAX_REVIVE_TOKENS, tokenCount))
      : 0;
    const hudPill = document.getElementById('hud-revive-tokens');
    const hudCount = document.getElementById('hud-revive-token-count');
    if (hudPill) {
      hudPill.style.display = this.isRunnerMode && count > 0 ? 'inline-flex' : 'none';
      hudPill.setAttribute('aria-label', `Rescue Tokens: ${count}`);
      hudPill.title = `Rescue Tokens: ${count} of ${MAX_REVIVE_TOKENS}. One token revives a crashed run.`;
    }
    if (hudCount) hudCount.textContent = String(count);

    const reviveButton = document.getElementById('btn-crash-revive');
    if (reviveButton) {
      reviveButton.disabled = count < 1;
      reviveButton.textContent = 'REVIVE';
      reviveButton.setAttribute('aria-label', count > 0 ? 'Revive run' : 'Revive unavailable');
    }
  }

  showCrashReviveError(message) {
    const status = document.getElementById('crash-revive-status');
    if (!status) return;
    status.textContent = message;
    status.style.display = 'block';
  }

  // Measures the HUD once and stacks the transient popups in non-overlapping bands (see TC-46).
  layoutRunnerPopups() {
    const pill = document.querySelector('.hud-center-stats-row');
    if (!pill) return;
    if (!this._runnerLayoutBound) {
      this._runnerLayoutBound = true;
      window.addEventListener('resize', () => this.layoutRunnerPopups());
      window.addEventListener('orientationchange', () => this.layoutRunnerPopups());
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => this.layoutRunnerPopups()).observe(pill);
      }
    }
    const rect = pill.getBoundingClientRect();
    if (!rect.height) return;
    const short = window.innerHeight <= 500;
    const hazardTop = Math.ceil(rect.bottom + 40);
    const hazardEl = document.getElementById('hud-runner-hazard-alert');
    const measuredHazard = hazardEl && !hazardEl.hidden ? hazardEl.getBoundingClientRect().height : 0;
    const hazardHeight = Math.max(measuredHazard, short ? 40 : 56);
    const announceTop = hazardTop + hazardHeight + 4;
    const navTop = Math.max(announceTop + 36, Math.round(window.innerHeight * 0.42));
    const root = document.documentElement.style;
    root.setProperty('--runner-band-hazard', `${hazardTop}px`);
    root.setProperty('--runner-band-announce', `${announceTop}px`);
    root.setProperty('--runner-band-nav', `${navTop}px`);
    root.setProperty('--runner-band-feedback', `${navTop + 52}px`);
  }

  updateRunnerNav(info) {
    let nav = document.getElementById('hud-runner-nav');
    let compass = document.getElementById('hud-runner-compass');
    if (!info) {
      if (nav) nav.hidden = true;
      if (compass) compass.hidden = true;
      this._runnerNavKey = '';
      return;
    }
    if (!compass) {
      compass = document.createElement('div');
      compass.id = 'hud-runner-compass';
      compass.className = 'runner-compass';
      document.body.appendChild(compass);
    }
    compass.hidden = false;
    const pauseRect = document.getElementById('btn-manual-pause')?.getBoundingClientRect();
    if (pauseRect && pauseRect.width) {
      compass.style.top = `${Math.round(pauseRect.bottom + 6)}px`;
      compass.style.left = `${Math.round(pauseRect.left + pauseRect.width / 2)}px`;
    }
    const compassText = `🧭 ${info.heading}`;
    if (compass.textContent !== compassText) compass.textContent = compassText;
    if (!nav) {
      nav = document.createElement('div');
      nav.id = 'hud-runner-nav';
      nav.className = 'runner-nav';
      nav.setAttribute('aria-live', 'polite');
      document.body.appendChild(nav);
    }
    this.layoutRunnerPopups();
    const key = `${info.arrow}|${info.text}|${info.meters}|${info.urgent}`;
    if (key === this._runnerNavKey) return;
    this._runnerNavKey = key;
    nav.hidden = false;
    nav.classList.toggle('urgent', !!info.urgent);
    nav.replaceChildren();
    const add = (cls, text) => {
      const el = document.createElement('span');
      el.className = cls;
      el.textContent = text;
      nav.appendChild(el);
    };
    add('runner-nav-arrow', info.arrow);
    add('runner-nav-text', info.text);
    if (info.meters !== null) add('runner-nav-dist', `${info.meters} m`);
  }

  flashRunnerTurn() {
    let flash = document.getElementById('hud-runner-turn-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'hud-runner-turn-flash';
      flash.className = 'runner-turn-flash';
      document.body.appendChild(flash);
    }
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');
  }

  updateRunnerHazardWarning(obstacles = [], traffic = [], playerZ = 0) {
    const alert = document.getElementById('hud-runner-hazard-alert');
    if (!alert) return;

    let upcoming = null;
    const considerHazard = (item, type, z) => {
      const distance = playerZ - z;
      if (!Number.isFinite(distance) || distance <= 0.5 || distance > 44) return;
      if (!upcoming || distance < upcoming.distance) upcoming = { type, distance };
    };
    obstacles.forEach(item => {
      if (item && !item.isHit && item.mesh) considerHazard(item, item.type, item.z);
    });
    traffic.forEach(item => {
      if (item && !item.isHit && item.mesh) {
        considerHazard(item, item.type || 'traffic', item.z ?? item.mesh.position?.z);
      }
    });

    if (!upcoming) {
      alert.hidden = true;
      alert.classList.remove('is-imminent');
      return;
    }

    const hazardInfo = {
      pothole: ['POTHOLE AHEAD', 'JUMP OR SWITCH LANES'],
      gutter: ['OPEN GUTTER AHEAD', 'JUMP OR SWITCH LANES'],
      digging: ['ROADWORK AHEAD', 'JUMP OR SWITCH LANES'],
      sewage: ['FLOODED ROAD AHEAD', 'JUMP OR SWITCH LANES'],
      wire: ['LOW HANGING WIRE', 'SLIDE UNDER'],
      heritage_scaffold: ['LOW SCAFFOLD', 'SLIDE UNDER'],
      rickshaw: ['RICKSHAW AHEAD', 'SWITCH LANES'],
      water_tanker: ['WATER TANKER AHEAD', 'SWITCH LANES'],
      snatcher: ['STREET HAZARD AHEAD', 'SWITCH LANES'],
      football: ['BALL IN THE ROAD', 'SWITCH LANES'],
      market_cart: ['MARKET CART AHEAD', 'SWITCH LANES'],
      traffic: ['TRAFFIC AHEAD', 'SWITCH LANES'],
      overhead_bridge_sign: ['LOW BRIDGE SIGN', 'SLIDE OR SWITCH LANES']
    };
    const [title, action] = hazardInfo[upcoming.type] || ['ROAD HAZARD AHEAD', 'SWITCH LANES'];
    const titleEl = document.getElementById('hud-runner-hazard-title');
    const actionEl = document.getElementById('hud-runner-hazard-action');
    const distanceEl = document.getElementById('hud-runner-hazard-distance');
    if (titleEl) titleEl.textContent = title;
    if (actionEl) actionEl.textContent = action;
    if (distanceEl) distanceEl.textContent = `${Math.ceil(upcoming.distance)} m`;
    if (alert.hidden) this.layoutRunnerPopups();
    alert.hidden = false;
    alert.classList.toggle('is-imminent', upcoming.distance <= 12);
  }

  showAnnouncement(text, color = '#ffd700') {
    const el = document.getElementById('hud-announcement');
    if (!el) return;
    this.layoutRunnerPopups();
    el.textContent = text;
    el.style.color = color;
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, 0) scale(1.1)';

    clearTimeout(this.announcementTimeout);
    this.announcementTimeout = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -10px) scale(0.95)';
    }, 1800);
  }

  showFloatingFeedback(text, position, colorOrY = '#ffd700', legacyColor) {
    const container = document.getElementById('floating-feedbacks');
    if (!container) return;
    while (container.children.length >= 3) {
      container.firstElementChild?.remove();
    }

    const el = document.createElement('div');
    el.className = 'floating-feedback';
    el.textContent = text;
    const hasLegacyCoordinates = typeof position === 'number' && typeof colorOrY === 'number';
    el.style.color = hasLegacyCoordinates
      ? legacyColor || '#ffd700'
      : typeof colorOrY === 'string' ? colorOrY : '#ffd700';

    let left = window.innerWidth / 2;
    let top = Math.max(window.innerHeight * 0.66,
      parseFloat(document.documentElement.style.getPropertyValue('--runner-band-feedback')) || 0);
    if (hasLegacyCoordinates) {
      left = position;
      top = colorOrY;
    }
    const camera = window.game?.camera;
    if (!hasLegacyCoordinates && camera && position?.clone &&
        typeof position.clone().project === 'function') {
      const projected = position.clone().project(camera);
      if (projected.z >= -1 && projected.z <= 1) {
        left = (projected.x * 0.5 + 0.5) * window.innerWidth;
        top = (-projected.y * 0.5 + 0.5) * window.innerHeight;
      }
    }
    const controlTops = ['.hud-runner-lanes', '.hud-controls-bottom-right']
      .map(sel => document.querySelector(sel)?.getBoundingClientRect())
      .filter(r => r && r.height > 0)
      .map(r => r.top);
    const controlsHeight = controlTops.length ? window.innerHeight - Math.min(...controlTops) + 30 : 0;
    const safeBottom = Math.max(this.isRunnerMode ? 155 : 24, controlsHeight);
    const bandTop = parseFloat(document.documentElement.style.getPropertyValue('--runner-band-feedback')) || 185;
    const safeTop = this.isRunnerMode ? bandTop : 80;
    el.dataset.anchorLeft = String(Math.max(90, Math.min(window.innerWidth - 90, left)));
    el.dataset.anchorTop = String(top);
    container.appendChild(el);
    const feedbacks = [...container.children];
    const maxBaseTop = window.innerHeight - safeBottom - feedbacks.length * 42;
    // Stay below the turn guide; only give way to it when the controls leave no room.
    const floorTop = Math.min(safeTop, window.innerHeight - 12 - feedbacks.length * 42);
    const baseTop = maxBaseTop >= floorTop
      ? Math.max(floorTop, Math.min(maxBaseTop, top))
      : floorTop;
    feedbacks.forEach((feedback, index) => {
      feedback.style.left = `${el.dataset.anchorLeft}px`;
      feedback.style.top = `${baseTop + index * 42}px`;
    });

    setTimeout(() => el.remove(), 1000);
  }

  showGameOver({
    rankedHoles,
    player,
    canAdvanceNext = false,
    distanceMeters = 0,
    coins = 0,
    runScore = 0,
    reviveTokens = saveManager.getReviveTokenCount(),
    isCrash = false,
    routeComplete = false,
    crashReason = '',
  }) {
    const modal = this.gameOverModal;
    const playerRank = (rankedHoles && rankedHoles.length > 0) ? (rankedHoles.findIndex(h => h.isPlayer) + 1) : 1;

    const crashCard = document.getElementById('runner-crash-card');
    const podiumEl = document.getElementById('results-podium');
    const statsGrid = document.querySelector('.stats-grid');
    const defaultButtons = document.querySelector('.results-button-row');
    const resultsHomeButton = document.getElementById('btn-results-home');
    const playAgainButton = document.getElementById('btn-play-again');
    const statLabels = document.querySelectorAll('.stats-grid .stat-label');
    const defaultStatLabels = ['FINAL SCORE', 'MAX LEVEL', 'OBJECTS SWALLOWED', 'HOLE KILLS'];

    if (isCrash) {
      if (this.hud) this.hud.style.display = 'none';
      modal.classList.remove('runner-route-complete');
      modal.classList.add('runner-crash-results');
      document.getElementById('results-headline').textContent = '💥 RUN CRASHED! (دوڑ ختم ہو گئی)';
      document.getElementById('results-sub').textContent = reviveTokens > 0
        ? `${reviveTokens} Rescue Token${reviveTokens === 1 ? '' : 's'} available · each revive costs one.`
        : 'Rescue Tokens are rare route pickups. Collect one to revive after a crash.';

      if (crashCard) crashCard.style.display = 'block';
      if (podiumEl) podiumEl.style.display = 'none';
      if (statsGrid) statsGrid.style.display = 'none';
      if (defaultButtons) defaultButtons.style.display = 'none';
      if (resultsHomeButton) resultsHomeButton.style.display = 'none';
      if (playAgainButton) playAgainButton.textContent = 'RESTART';

      const { icon, title, hint } = getRunnerCrashAdvice(crashReason);

      const iconEl = document.getElementById('crash-hazard-icon');
      const titleEl = document.getElementById('crash-hazard-title');
      const hintEl = document.getElementById('crash-hazard-hint');
      const distEl = document.getElementById('crash-stat-dist');
      const coinsEl = document.getElementById('crash-stat-coins');
      const scoreEl = document.getElementById('crash-stat-score');

      if (iconEl) iconEl.textContent = icon;
      if (titleEl) titleEl.textContent = title;
      if (hintEl) hintEl.textContent = `💡 HOW TO AVOID: ${hint}`;
      if (distEl) distEl.textContent = `${Math.round(distanceMeters)}m`;
      if (coinsEl) coinsEl.textContent = `${(coins || 0).toLocaleString()} Rs`;
      if (scoreEl) scoreEl.textContent = (runScore || 0).toLocaleString();
      this.updateReviveTokenCount(reviveTokens);
      const reviveStatus = document.getElementById('crash-revive-status');
      if (reviveStatus) {
        reviveStatus.textContent = '';
        reviveStatus.style.display = 'none';
      }

    } else if (routeComplete) {
      if (this.hud) this.hud.style.display = 'none';
      modal.classList.remove('runner-crash-results');
      modal.classList.add('runner-route-complete');
      document.getElementById('results-headline').textContent = '🏁 KARACHI LOOP COMPLETE!';
      document.getElementById('results-sub').textContent = 'You completed the Karachi city loop and returned to Soldier Bazar.';
      if (crashCard) crashCard.style.display = 'none';
      if (podiumEl) podiumEl.style.display = 'none';
      if (statsGrid) statsGrid.style.display = 'grid';
      if (defaultButtons) defaultButtons.style.display = 'flex';
      if (playAgainButton) playAgainButton.textContent = 'RUN THE LOOP AGAIN';
      if (resultsHomeButton) resultsHomeButton.style.display = 'inline-flex';
      if (statLabels.length === defaultStatLabels.length) {
        ['FINAL SCORE', 'RETURN NEIGHBORHOOD', 'DISTANCE', 'AREAS REACHED'].forEach((label, index) => {
          statLabels[index].textContent = label;
        });
      }
      document.getElementById('stat-score').textContent = (runScore || 0).toLocaleString();
      document.getElementById('stat-level').textContent = 'Soldier Bazar';
      document.getElementById('stat-swallowed').textContent = `${Math.round(distanceMeters).toLocaleString()} m`;
      document.getElementById('stat-kills').textContent = '3';
      const nextButton = document.getElementById('btn-results-next');
      if (nextButton) nextButton.style.display = 'none';
    } else {
      modal.classList.remove('runner-crash-results');
      modal.classList.remove('runner-route-complete');
      // Standard free-roam match results (v1 / v2)
      if (crashCard) crashCard.style.display = 'none';
      if (podiumEl) podiumEl.style.display = 'flex';
      if (statsGrid) statsGrid.style.display = 'grid';
      if (defaultButtons) defaultButtons.style.display = 'flex';
      if (resultsHomeButton) resultsHomeButton.style.display = 'none';
      if (playAgainButton) playAgainButton.textContent = '🔄 REPLAY DISTRICT';
      if (statLabels.length === defaultStatLabels.length) {
        statLabels.forEach((label, index) => { label.textContent = defaultStatLabels[index]; });
      }

      let headline = playerRank === 1 ? '👑 1ST PLACE CHAMPION! 👑' :
                     playerRank === 2 ? '🥈 2ND PLACE! GREAT JOB!' :
                     playerRank === 3 ? '🥉 3RD PLACE!' : 'MATCH COMPLETED';

      document.getElementById('results-headline').textContent = headline;
      document.getElementById('results-sub').textContent = `Ranked #${playerRank} in Karachi Street Patrol`;

      if (player) {
        document.getElementById('stat-score').textContent = (player.score || 0).toLocaleString();
        document.getElementById('stat-level').textContent = `Lv ${player.level || 1} (${LEVEL_CONFIG[(player.level || 1) - 1]?.title || 'Hero'})`;
        document.getElementById('stat-swallowed').textContent = player.swallowedCount || 0;
        document.getElementById('stat-kills').textContent = player.kills || 0;
      }

      // Podium HTML
      podiumEl.innerHTML = '';
      const top3 = [(rankedHoles && rankedHoles[1]), (rankedHoles && rankedHoles[0]), (rankedHoles && rankedHoles[2])];
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

  // =========================================================================
  // Runner developer and master controls
  // =========================================================================
  createRunnerDeveloperUI() {
    if (typeof document === 'undefined') return;

    this.devToggleBtn = document.createElement('button');
    this.devToggleBtn.id = 'dev-mode-toggle-btn';
    this.devToggleBtn.className = 'ui-interactive';
    this.devToggleBtn.textContent = '🛠️ DEV HUD [F2]';
    this.devToggleBtn.title = 'Toggle the live Runner diagnostics panel';
    document.body.appendChild(this.devToggleBtn);

    this.devCommentBtn = document.createElement('button');
    this.devCommentBtn.id = 'dev-comment-btn';
    this.devCommentBtn.className = 'ui-interactive';
    this.devCommentBtn.textContent = '💬 FEEDBACK [F3]';
    this.devCommentBtn.title = 'Record a Runner bug report or suggestion';
    document.body.appendChild(this.devCommentBtn);

    this.devPanel = document.createElement('section');
    this.devPanel.id = 'dev-mode-panel';
    this.devPanel.className = 'runner-dev-panel';
    this.devPanel.style.display = 'none';
    this.devPanel.innerHTML = `
      <header class="dev-panel-header">
        <div class="dev-header-title"><span>🛠️</span><span>RUNNER LIVE DIAGNOSTICS</span></div>
        <div class="dev-header-actions">
          <button class="dev-icon-btn" id="btn-dev-minimize" title="Minimize diagnostics">_</button>
          <button class="dev-icon-btn" id="btn-dev-close" title="Close diagnostics">&times;</button>
        </div>
      </header>
      <div class="dev-panel-body" id="dev-panel-body">
        <div class="dev-metrics-grid runner-dev-metrics">
          <div class="dev-metric-box"><span class="dev-metric-label">Run state</span><span class="dev-metric-val" id="dev-val-state">Waiting</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Area</span><span class="dev-metric-val" id="dev-val-area">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Route distance</span><span class="dev-metric-val" id="dev-val-distance">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Neighborhood</span><span class="dev-metric-val" id="dev-val-stage">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Challenge tier</span><span class="dev-metric-val" id="dev-val-tier">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Run score</span><span class="dev-metric-val" id="dev-val-score">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Hearts</span><span class="dev-metric-val" id="dev-val-hearts">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Lane · speed</span><span class="dev-metric-val" id="dev-val-lane-speed">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Weather</span><span class="dev-metric-val" id="dev-val-weather">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Hazards · traffic</span><span class="dev-metric-val" id="dev-val-hazards">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Active power-up</span><span class="dev-metric-val" id="dev-val-powerup">—</span></div>
          <div class="dev-metric-box"><span class="dev-metric-label">Performance</span><span class="dev-metric-val" id="dev-val-fps">—</span></div>
        </div>
        <div class="dev-actions-grid runner-dev-actions">
          <button class="dev-btn" id="btn-dev-copy-telemetry" type="button">Copy live telemetry</button>
          <button class="dev-btn" id="btn-dev-pin-note" type="button">Pin a bug note [F4]</button>
          <a class="dev-btn btn-dash-link" href="./runner-console.html" target="_blank" rel="noopener">Open Master &amp; Developer Console</a>
        </div>
      </div>
    `;
    document.body.appendChild(this.devPanel);

    this.masterModeBtn = document.createElement('button');
    this.masterModeBtn.id = 'master-mode-toggle-btn';
    this.masterModeBtn.className = 'ui-interactive master-mode-btn-trigger';
    this.masterModeBtn.textContent = '🧰 MASTER TOOLS [M]';
    this.masterModeBtn.title = 'Open Runner test controls and the full developer console';
    document.body.appendChild(this.masterModeBtn);
    this.godModeBtn = this.masterModeBtn;

    this.masterModePanel = document.createElement('section');
    this.masterModePanel.id = 'master-mode-panel';
    this.masterModePanel.classList.add('runner-master-panel');
    this.masterModePanel.style.display = 'none';
    this.masterModePanel.innerHTML = `
      <header class="god-inpanel-header">
        <div class="god-inpanel-title"><span>🧰</span><span>RUNNER MASTER TOOLS</span></div>
        <button class="dev-icon-btn" id="btn-close-master-mode" type="button" title="Close Master Tools">&times;</button>
      </header>
      <div class="god-inpanel-body">
        <p class="runner-master-notice">Local test controls affect this game session. Use the full console for telemetry, snapshots and progression testing.</p>
        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title"><span>Current run</span></div>
          <div class="runner-master-state" id="master-run-summary">Waiting for Runner telemetry</div>
        </div>
        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title"><span>Runner test actions</span></div>
          <div class="god-inpanel-btn-grid">
            <button class="god-inpanel-btn" id="btn-master-force-rain" type="button">🌧️ Force monsoon</button>
            <button class="god-inpanel-btn" id="btn-master-natural-weather" type="button">🌤️ Restore route weather</button>
            <button class="god-inpanel-btn" id="btn-master-slingshot" type="button">🚀 Trigger slingshot</button>
            <button class="god-inpanel-btn" id="btn-master-spawn-convoy" type="button">🚚 Spawn test convoy</button>
            <button class="god-inpanel-btn" id="btn-master-self-check" type="button">🧪 Run live self-check</button>
            <button class="god-inpanel-btn" id="btn-master-spawn-pothole" type="button">🕳️ Spawn test pothole</button>
            <button class="god-inpanel-btn" id="btn-master-clear-test-obstacles" type="button">🧹 Clear test obstacles</button>
          </div>
          <p class="runner-master-hint" id="master-action-hint">Start an active Runner session to enable test actions.</p>
        </div>
        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title"><span>Master powers</span></div>
          <div class="god-inpanel-btn-grid">
            <button class="god-inpanel-btn" id="btn-master-autorun" type="button" aria-pressed="false">🤖 Auto-run bot: OFF</button>
            <button class="god-inpanel-btn" id="btn-master-immortal" type="button" aria-pressed="false">🛡️ Invincible: OFF</button>
            <button class="god-inpanel-btn" id="btn-master-clear-all" type="button">💥 Clear ALL obstacles &amp; traffic</button>
            <button class="god-inpanel-btn" id="btn-master-complete-area" type="button">✅ Complete area</button>
            <button class="god-inpanel-btn" id="btn-master-complete-route" type="button">🏁 Complete route</button>
            <button class="god-inpanel-btn" id="btn-master-restore-hearts" type="button">❤️ Restore hearts</button>
            <button class="god-inpanel-btn" id="btn-master-junction-left" type="button">⬅️ Spawn left turn</button>
            <button class="god-inpanel-btn" id="btn-master-junction-right" type="button">➡️ Spawn right turn</button>
            <button class="god-inpanel-btn" id="btn-master-junction-fork" type="button">🔀 Spawn fork</button>
          </div>
        </div>
        <a class="god-inpanel-btn btn-dash-link" href="./runner-console.html" target="_blank" rel="noopener">Open full Master &amp; Developer Console ↗</a>
      </div>
    `;
    document.body.appendChild(this.masterModePanel);
    this.godModePanel = this.masterModePanel;

    this.createDevFeedbackModal();
    this.devToggleBtn.addEventListener('click', () => this.toggleDevMode());
    document.getElementById('btn-dev-close')?.addEventListener('click', () => this.toggleDevMode(false));
    document.getElementById('btn-dev-minimize')?.addEventListener('click', () => {
      const body = document.getElementById('dev-panel-body');
      if (body) body.hidden = !body.hidden;
    });
    this.masterModeBtn.addEventListener('click', () => this.toggleMasterMode());
    document.getElementById('btn-close-master-mode')?.addEventListener('click', () => this.toggleMasterMode(false));

    const masterActions = {
      'btn-master-force-rain': ['SET_RUNNER_RAIN', { enabled: true }],
      'btn-master-natural-weather': ['SET_RUNNER_RAIN', { enabled: null }],
      'btn-master-slingshot': ['TRIGGER_SLINGSHOT', {}],
      'btn-master-spawn-convoy': ['SPAWN_CONVOY', {}],
      'btn-master-self-check': ['RUNNER_SELF_CHECK', {}],
      'btn-master-spawn-pothole': ['SPAWN_TEST_OBSTACLE', { type: 'pothole', lane: 0 }],
      'btn-master-clear-test-obstacles': ['CLEAR_TEST_OBSTACLES', {}],
      'btn-master-clear-all': ['CLEAR_ALL_HAZARDS', {}],
      'btn-master-complete-area': ['COMPLETE_RUNNER_AREA', {}],
      'btn-master-complete-route': ['COMPLETE_RUNNER_ROUTE', {}],
      'btn-master-restore-hearts': ['RESTORE_RUNNER_HEARTS', {}],
      'btn-master-junction-left': ['SPAWN_JUNCTION', { kind: 'turn', dir: 'left' }],
      'btn-master-junction-right': ['SPAWN_JUNCTION', { kind: 'turn', dir: 'right' }],
      'btn-master-junction-fork': ['SPAWN_JUNCTION', { kind: 'fork' }]
    };
    [['btn-master-autorun', 'autoPilot', 'TOGGLE_AUTOPILOT', 'enabled'],
      ['btn-master-immortal', 'immortal', 'TOGGLE_IMMORTAL', 'immortal']].forEach(([id, key, command, field]) => {
      document.getElementById(id)?.addEventListener('click', () => {
        const enabled = !window.__DEV_TELEMETRY__?.[key];
        this.runRunnerDevCommand(command, { [field]: enabled });
      });
    });
    Object.entries(masterActions).forEach(([id, [type, payload]]) => {
      document.getElementById(id)?.addEventListener('click', () => this.runRunnerDevCommand(type, payload));
    });

    document.getElementById('btn-dev-copy-telemetry')?.addEventListener('click', () => {
      const telemetry = window.__DEV_TELEMETRY__;
      if (!telemetry) {
        this.showDevToast('Runner telemetry is not available yet.');
        return;
      }
      const json = JSON.stringify(telemetry, null, 2);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(json)
          .then(() => this.showDevToast('Runner telemetry copied.'))
          .catch(error => {
            console.error('[DEV_HUD] Clipboard copy failed.', error);
            this.showDevToast('Could not copy telemetry; it was logged to the console.');
            console.info('[RUNNER_TELEMETRY]', telemetry);
          });
      } else {
        console.info('[RUNNER_TELEMETRY]', telemetry);
        this.showDevToast('Clipboard unavailable; telemetry was logged to the console.');
      }
    });

    const pinRunnerNote = () => {
      const description = window.prompt('Describe the Runner issue you noticed:');
      if (description === null) return;
      const text = description.trim();
      if (!text) {
        this.showDevToast('Enter a short description to save a note.');
        return;
      }
      window.game?.recordDevNote?.('USER_BUG_REPORT', text, { flaggedByUser: true });
      this.showDevToast('Runner bug note saved.');
    };
    document.getElementById('btn-dev-pin-note')?.addEventListener('click', pinRunnerNote);
    this.devCommentBtn.addEventListener('click', () => this.openDevFeedbackModal());
    document.getElementById('btn-dev-open-feedback-modal')?.addEventListener('click', () => this.openDevFeedbackModal());
    document.getElementById('btn-submit-dev-feedback')?.addEventListener('click', () => {
      const textarea = document.getElementById('dev-feedback-comment');
      const activePill = this.feedbackModal?.querySelector('.dev-cat-pill.active');
      const category = activePill?.dataset.cat || 'Bug';
      const attachSnapshot = document.getElementById('dev-fb-attach-snapshot')?.checked ?? true;
      this.submitDevFeedback(textarea?.value || '', category, attachSnapshot);
    });
    document.getElementById('btn-close-dev-feedback')?.addEventListener('click', () => this.closeDevFeedbackModal());
    document.getElementById('btn-cancel-dev-feedback')?.addEventListener('click', () => this.closeDevFeedbackModal());
    this.feedbackModal?.querySelectorAll('.dev-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.feedbackModal.querySelectorAll('.dev-cat-pill').forEach(item => item.classList.toggle('active', item === pill));
      });
    });
    this.feedbackModal?.querySelectorAll('.dev-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const textarea = document.getElementById('dev-feedback-comment');
        if (!textarea) return;
        textarea.value = textarea.value.trim()
          ? `${textarea.value.trim()} - ${chip.dataset.chip || chip.textContent}`
          : chip.dataset.chip || chip.textContent;
        textarea.focus();
      });
    });

    const query = new URLSearchParams(window.location.search);
    let storedDevMode = false;
    try {
      storedDevMode = localStorage.getItem('karachi_dev_mode') === 'true';
    } catch (error) {
      console.error('[DEV_HUD] Could not read developer-panel preference.', error);
    }
    this.isDevModeActive = query.get('dev') === 'true' || query.get('debug') === 'true' || storedDevMode;
    if (this.isDevModeActive) this.devPanel.style.display = 'flex';
    this.renderDevCommentsHistory();

    window.addEventListener('keydown', event => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
        if (event.key === 'Escape') this.closeDevFeedbackModal();
        return;
      }
      if (event.key === 'F2' || event.key === '`') {
        event.preventDefault();
        this.toggleDevMode();
      } else if (event.key === 'F3') {
        event.preventDefault();
        this.openDevFeedbackModal();
      } else if (event.key === 'F4') {
        event.preventDefault();
        pinRunnerNote();
      } else if (event.key.toLowerCase() === 'm') {
        this.toggleMasterMode();
      } else if (event.key === 'Escape') {
        this.closeDevFeedbackModal();
        this.toggleMasterMode(false);
      }
    });
  }

  runRunnerDevCommand(type, payload = {}) {
    const game = window.game;
    if (!game?.isTempleRun || !game.isGameStarted || game.isPaused || game.isGameOver) {
      this.showDevToast('Start or resume an active Runner run before using test actions.');
      return;
    }
    game.handleMasterModeCommand({
      type,
      payload,
      sender: 'MASTERMODE_DASHBOARD'
    });
    this.showDevToast('Runner test action sent.');
  }

  // =========================================================================
  // Legacy panel retained below for compatibility; no longer initialized.
  createDevModeUI() {
    if (typeof document === 'undefined') return;

    // 1. Floating Toggle & Feedback Pills (Always reachable)
    this.devToggleBtn = document.createElement('button');
    this.devToggleBtn.id = 'dev-mode-toggle-btn';
    this.devToggleBtn.className = 'ui-interactive';
    this.devToggleBtn.innerHTML = `🛠️ <span>DEV MODE [F2]</span>`;
    this.devToggleBtn.title = "Toggle Developer Observer HUD (Shortcut: F2 or ~)";
    document.body.appendChild(this.devToggleBtn);

    this.devCommentBtn = document.createElement('button');
    this.devCommentBtn.id = 'dev-comment-btn';
    this.devCommentBtn.className = 'ui-interactive';
    this.devCommentBtn.innerHTML = `💬 <span>FEEDBACK [F3]</span>`;
    this.devCommentBtn.title = "Send Real-Time Developer Feedback / Comment (Shortcut: F3)";
    document.body.appendChild(this.devCommentBtn);

    // Call Master Mode UI creation
    this.createMasterModeUI();

    // 2. Dev Mode Floating Observer Panel
    this.devPanel = document.createElement('div');
    this.devPanel.id = 'dev-mode-panel';
    this.devPanel.style.display = 'none';

    this.devPanel.innerHTML = `
      <div class="dev-panel-header">
        <div class="dev-header-title">
          <span>🛠️</span>
          <span>DEV MODE OBSERVER</span>
        </div>
        <div class="dev-header-actions">
          <button class="dev-icon-btn" id="btn-dev-minimize" title="Minimize Panel">_</button>
          <button class="dev-icon-btn" id="btn-dev-close" title="Close Dev Mode">&times;</button>
        </div>
      </div>
      <div class="dev-panel-body" id="dev-panel-body">
        <!-- Live Metrics Grid -->
        <div class="dev-metrics-grid">
          <div class="dev-metric-box">
            <span class="dev-metric-label">FPS / Perf</span>
            <span class="dev-metric-val" id="dev-val-fps">60 FPS</span>
          </div>
          <div class="dev-metric-box">
            <span class="dev-metric-label">Current Level</span>
            <span class="dev-metric-val" id="dev-val-level">District 1</span>
          </div>
          <div class="dev-metric-box">
            <span class="dev-metric-label">Match Timer</span>
            <span class="dev-metric-val status-running" id="dev-val-timer">240.0s [RUNNING]</span>
          </div>
          <div class="dev-metric-box">
            <span class="dev-metric-label">Player Position</span>
            <span class="dev-metric-val" id="dev-val-pos">X: 0.0, Z: 0.0</span>
          </div>
          <div class="dev-metric-box">
            <span class="dev-metric-label">Hole Radius</span>
            <span class="dev-metric-val" id="dev-val-radius">1.60m (Lv.1)</span>
          </div>
          <div class="dev-metric-box">
            <span class="dev-metric-label">Threats Remaining</span>
            <span class="dev-metric-val status-alert" id="dev-val-threats">4 Left</span>
          </div>
        </div>

        <!-- Quick District Warps -->
        <span class="dev-section-title">🚀 Fast District Level Jump</span>
        <div class="dev-actions-grid">
          <button class="dev-btn" data-warp="1">Lv 1: Clifton</button>
          <button class="dev-btn" data-warp="2">Lv 2: Lyari</button>
          <button class="dev-btn" data-warp="3">Lv 3: Saddar</button>
          <button class="dev-btn" data-warp="4">Lv 4: Lahore</button>
          <button class="dev-btn" data-warp="5">Lv 5: Islamabad</button>
          <button class="dev-btn" data-warp="6">Lv 6: Quetta</button>
        </div>

        <!-- Live Cheats & Mechanics Controls -->
        <span class="dev-section-title">⚡ Mechanics & Teleport Actions</span>
        <div class="dev-actions-grid">
          <button class="dev-btn btn-accent" id="btn-dev-toggle-timer">⏸️ Pause / Run Timer</button>
          <button class="dev-btn" id="btn-dev-add-time">+60s Time</button>
          <button class="dev-btn btn-accent" id="btn-dev-warp-threat">📍 Warp to Threat</button>
          <button class="dev-btn" id="btn-dev-freeze-threats">🛑 Freeze Fleeing</button>
          <button class="dev-btn btn-success" id="btn-dev-resolve-threat">⚡ Devour Threat</button>
          <button class="dev-btn" id="btn-dev-grow-hole">⭕ Grow Hole +1m</button>
          <button class="dev-btn btn-success" id="btn-dev-clear-level">🏆 Clear Level</button>
          <button class="dev-btn" id="btn-dev-copy-telemetry">📋 Copy Telemetry</button>
        </div>

        <!-- Auto-Notes & Flight Recorder For AI Assistant -->
        <span class="dev-section-title">🤖 AI Assistant Flight Recorder</span>
        <div class="dev-actions-grid">
          <button class="dev-btn btn-accent" id="btn-dev-pin-note">📝 Pin Bug / Note [F4]</button>
          <button class="dev-btn btn-success" id="btn-dev-copy-flight">📦 Export Flight Logs for AI</button>
          <button class="dev-btn" id="btn-dev-clear-flight">🧹 Clear Flight Logs</button>
        </div>

        <!-- Live Player Feedback & Real-Time Comments -->
        <div class="dev-section-header">
          <span class="dev-section-title">💬 Live Player Feedback &amp; Comments</span>
          <span class="dev-badge-count" id="dev-comments-count">0 Notes</span>
        </div>
        <div class="dev-feedback-quick-box">
          <input type="text" id="dev-quick-comment-input" placeholder="Type quick live feedback &amp; press Enter..." />
          <button class="dev-btn btn-success" id="btn-dev-send-quick-comment">Send</button>
        </div>
        <div class="dev-actions-grid">
          <button class="dev-btn btn-accent" id="btn-dev-open-feedback-modal">💬 Rich Feedback Dialog [F3]</button>
          <button class="dev-btn btn-success" id="btn-dev-copy-feedback">📋 Copy Feedback Summary</button>
        </div>
        <div class="dev-comments-history" id="dev-comments-history">
          <div class="dev-empty-comments">No feedback notes yet. Press F3 or type above!</div>
        </div>

        <!-- Live Devour / Event Log -->
        <span class="dev-section-title">📋 Live Event &amp; Devour Log</span>
        <div class="dev-log-container" id="dev-log-container">
          <div class="dev-log-line log-info">[INIT] Dev Mode Observer initialized. Ready for gameplay inspection.</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.devPanel);
    this.createDevFeedbackModal();

    // Initial state check
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasParam = urlParams.get('dev') === 'true' || urlParams.get('debug') === 'true';
      const hasSaved = localStorage.getItem('karachi_dev_mode') === 'true';
      this.isDevModeActive = hasParam || hasSaved;
      if (this.isDevModeActive) {
        this.devPanel.style.display = 'flex';
        this.devToggleBtn.style.background = '#00e5ff';
        this.devToggleBtn.style.color = '#050b14';
      }
    } catch (e) {
      this.isDevModeActive = false;
    }

    // Bind Dev UI Event Listeners
    this.devToggleBtn.addEventListener('click', () => {
      this.toggleDevMode();
    });

    document.getElementById('btn-dev-close')?.addEventListener('click', () => {
      this.toggleDevMode(false);
    });

    const bodyEl = document.getElementById('dev-panel-body');
    document.getElementById('btn-dev-minimize')?.addEventListener('click', () => {
      if (bodyEl) {
        bodyEl.style.display = (bodyEl.style.display === 'none') ? 'flex' : 'none';
      }
    });

    // District Warp Buttons
    this.devPanel.querySelectorAll('[data-warp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.dataset.warp, 10);
        if (window.game && window.game.loadDistrictLevel) {
          window.game.loadDistrictLevel(lvl);
          this.showDevToast(`🚀 Warped to District ${lvl}!`);
        }
      });
    });

    document.getElementById('btn-dev-toggle-timer')?.addEventListener('click', () => {
      if (window.game) {
        window.game.isPaused = !window.game.isPaused;
        const state = window.game.isPaused ? 'PAUSED' : 'RUNNING';
        this.showDevToast(`⏱️ Timer is now ${state}`);
      }
    });

    document.getElementById('btn-dev-add-time')?.addEventListener('click', () => {
      if (window.game) {
        window.game.timeLeft = (window.game.timeLeft || 0) + 60;
        this.showDevToast(`⏳ Added +60s! New Time: ${Math.round(window.game.timeLeft)}s`);
      }
    });

    document.getElementById('btn-dev-warp-threat')?.addEventListener('click', () => {
      if (window.game && window.game.devWarpToNearestThreat) {
        window.game.devWarpToNearestThreat();
      }
    });

    document.getElementById('btn-dev-freeze-threats')?.addEventListener('click', (e) => {
      window.__DEV_FREEZE_THREATS__ = !window.__DEV_FREEZE_THREATS__;
      const btn = e.currentTarget;
      btn.textContent = window.__DEV_FREEZE_THREATS__ ? '🏃 Unfreeze Fleeing' : '🛑 Freeze Fleeing';
      this.showDevToast(window.__DEV_FREEZE_THREATS__ ? '🛑 Threat fleeing FROZEN!' : '🏃 Threat fleeing RESUMED!');
    });

    document.getElementById('btn-dev-resolve-threat')?.addEventListener('click', () => {
      if (window.game && window.game.devResolveNearestThreat) {
        window.game.devResolveNearestThreat();
      }
    });

    document.getElementById('btn-dev-grow-hole')?.addEventListener('click', () => {
      if (window.game && window.game.player) {
        window.game.player.targetRadius = (window.game.player.targetRadius || 1.6) + 1.0;
        window.game.player.radius = window.game.player.targetRadius;
        this.showDevToast(`⭕ Hole radius expanded to ${window.game.player.radius.toFixed(2)}m!`);
      }
    });

    document.getElementById('btn-dev-clear-level')?.addEventListener('click', () => {
      if (window.game && window.game.handleDistrictCleared) {
        window.game.handleDistrictCleared();
        this.showDevToast(`🏆 Level Cleared!`);
      }
    });

    document.getElementById('btn-dev-copy-telemetry')?.addEventListener('click', () => {
      const data = window.__DEV_TELEMETRY__ || { error: 'No telemetry available yet' };
      const str = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(str).then(() => {
          this.showDevToast('📋 Telemetry JSON copied to clipboard!');
        }).catch(() => {
          console.log('__DEV_TELEMETRY__:', data);
          this.showDevToast('📋 Telemetry logged to console!');
        });
      } else {
        console.log('__DEV_TELEMETRY__:', data);
        this.showDevToast('📋 Telemetry logged to console!');
      }
    });

    // Auto-Notes: Pin Bug / Note
    const triggerPinNote = () => {
      const input = prompt("📝 Quick Bug Note for AI:\n(e.g. 'Tanker moved off road' or 'Pothole suction failed'):", "");
      if (input !== null) {
        const text = input.trim() || 'Player flagged bug at this position';
        if (window.game && window.game.recordDevNote) {
          window.game.recordDevNote('USER_BUG_REPORT', text, {
            flaggedByUser: true
          });
        }
        this.showDevToast('📝 Bug note recorded in flight logs!');
      }
    };

    document.getElementById('btn-dev-pin-note')?.addEventListener('click', () => {
      triggerPinNote();
    });

    document.getElementById('btn-dev-copy-flight')?.addEventListener('click', () => {
      const notes = window.__DEV_NOTES__ || [];
      const report = {
        exportedAt: new Date().toISOString(),
        totalNotes: notes.length,
        currentTelemetry: window.__DEV_TELEMETRY__ || {},
        flightNotes: notes
      };
      const jsonStr = JSON.stringify(report, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          this.showDevToast('📦 Copied Flight Logs & Notes for AI!');
        }).catch(() => {
          console.log('[AI_FLIGHT_LOGS]', report);
          this.showDevToast('📦 Flight logs logged to browser console!');
        });
      } else {
        console.log('[AI_FLIGHT_LOGS]', report);
        this.showDevToast('📦 Flight logs logged to browser console!');
      }
    });

    document.getElementById('btn-dev-clear-flight')?.addEventListener('click', () => {
      window.__DEV_NOTES__ = [];
      try {
        localStorage.removeItem('karachi_dev_flight_recorder');
      } catch (e) {}
      this.showDevToast('🧹 Flight logs cleared!');
      this.appendDevLog('[LOGS_CLEARED] Flight recorder reset.', 'info');
      this.renderDevCommentsHistory();
    });

    // Real-Time Feedback & Comments Listeners
    this.devCommentBtn?.addEventListener('click', () => {
      this.openDevFeedbackModal();
    });

    document.getElementById('btn-dev-open-feedback-modal')?.addEventListener('click', () => {
      this.openDevFeedbackModal();
    });

    const sendQuickComment = () => {
      const input = document.getElementById('dev-quick-comment-input');
      if (input && input.value.trim()) {
        this.submitDevFeedback(input.value.trim(), '💬 Quick Live Note', false);
        input.value = '';
      }
    };
    document.getElementById('btn-dev-send-quick-comment')?.addEventListener('click', sendQuickComment);
    document.getElementById('dev-quick-comment-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendQuickComment();
      }
    });

    document.getElementById('btn-dev-copy-feedback')?.addEventListener('click', () => {
      this.copyFeedbackSummary();
    });

    // Category pills selection inside Feedback Modal
    this.feedbackModal?.querySelectorAll('.dev-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.feedbackModal.querySelectorAll('.dev-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Quick chips insertion inside Feedback Modal
    this.feedbackModal?.querySelectorAll('.dev-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const textarea = document.getElementById('dev-feedback-comment');
        if (textarea) {
          const chipText = chip.dataset.chip || chip.textContent;
          if (textarea.value.trim()) {
            textarea.value = `${textarea.value.trim()} - ${chipText}`;
          } else {
            textarea.value = chipText;
          }
          textarea.focus();
        }
      });
    });

    document.getElementById('btn-submit-dev-feedback')?.addEventListener('click', () => {
      const textarea = document.getElementById('dev-feedback-comment');
      const activePill = this.feedbackModal?.querySelector('.dev-cat-pill.active');
      const cat = activePill ? (activePill.dataset.cat || activePill.textContent) : '🐛 Bug / Glitch';
      const attachSnap = document.getElementById('dev-fb-attach-snapshot')?.checked ?? true;
      this.submitDevFeedback(textarea?.value || '', cat, attachSnap);
    });

    document.getElementById('btn-close-dev-feedback')?.addEventListener('click', () => this.closeDevFeedbackModal());
    document.getElementById('btn-cancel-dev-feedback')?.addEventListener('click', () => this.closeDevFeedbackModal());

    // Global Key Listener for F2 (Dev HUD), ~ / F3 (Feedback) and F4 (Pin Bug)
    window.addEventListener('keydown', (e) => {
      // Allow unrestricted typing inside inputs/textareas without triggering game hotkeys
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          this.closeDevFeedbackModal();
          e.target.blur();
        }
        return;
      }

      if (e.key === 'F2' || e.key === '`') {
        this.toggleDevMode();
      } else if (e.key === 'F3') {
        e.preventDefault();
        this.openDevFeedbackModal();
      } else if (e.key === 'F4') {
        e.preventDefault();
        triggerPinNote();
      } else if (e.key === 'g' || e.key === 'G' || e.key === 'm' || e.key === 'M') {
        this.toggleMasterMode();
      } else if (e.key === 'h' || e.key === 'H') {
        audio.playKingPressureHorn();
        if (this.onHorn) this.onHorn();
      } else if (e.key === 'Escape') {
        this.closeDevFeedbackModal();
        if (this.isMasterModeActive || this.isGodModeActive) this.toggleMasterMode(false);
      }
    });

    // Render initial comments history
    this.renderDevCommentsHistory();
  }

  createDevFeedbackModal() {
    this.feedbackModal = document.createElement('div');
    this.feedbackModal.className = 'modal-backdrop dev-feedback-backdrop';
    this.feedbackModal.id = 'modal-dev-feedback';
    this.feedbackModal.style.display = 'none';

    this.feedbackModal.innerHTML = `
      <div class="modal-card dev-feedback-card">
        <div class="modal-header dev-feedback-header">
          <div class="journal-title-row">
            <span class="journal-crest">💬</span>
            <div>
              <h2 class="journal-main-title">RUNNER FEEDBACK &amp; ISSUE REPORTER</h2>
              <span class="journal-sub-title" id="dev-feedback-telemetry-badge">Karachi Runner · waiting for live telemetry</span>
            </div>
          </div>
          <button class="close-btn ui-interactive" id="btn-close-dev-feedback">&times;</button>
        </div>

        <div class="dev-feedback-body">
          <div class="dev-fb-section">
            <label class="dev-fb-label">🏷️ Select feedback category:</label>
            <div class="dev-category-pills" id="dev-category-pills">
              <button type="button" class="dev-cat-pill active" data-cat="Bug">🐛 Bug</button>
              <button type="button" class="dev-cat-pill" data-cat="Controls">🎮 Controls</button>
              <button type="button" class="dev-cat-pill" data-cat="Route or area">🗺️ Route / area</button>
              <button type="button" class="dev-cat-pill" data-cat="Hazard or weather">🌧️ Hazard / weather</button>
              <button type="button" class="dev-cat-pill" data-cat="Power-up">⚡ Power-up</button>
              <button type="button" class="dev-cat-pill" data-cat="Gameplay balance">⚖️ Balance</button>
              <button type="button" class="dev-cat-pill" data-cat="Suggestion">💡 Suggestion</button>
            </div>
          </div>

          <div class="dev-fb-section">
            <label class="dev-fb-label">⚡ Quick note:</label>
            <div class="dev-quick-chips" id="dev-quick-chips">
              <button type="button" class="dev-chip" data-chip="Lane input did not register">Lane input missed</button>
              <button type="button" class="dev-chip" data-chip="Collision felt unfair or unavoidable">Unfair collision</button>
              <button type="button" class="dev-chip" data-chip="Power-up was not reachable">Unreachable power-up</button>
              <button type="button" class="dev-chip" data-chip="Rain or pothole phase behaved unexpectedly">Weather issue</button>
              <button type="button" class="dev-chip" data-chip="Area scenery did not match the route">Area scenery issue</button>
              <button type="button" class="dev-chip" data-chip="Score or reward was not recorded">Reward not recorded</button>
            </div>
          </div>

          <div class="dev-fb-section">
            <label class="dev-fb-label" for="dev-feedback-comment">📝 Describe what happened:</label>
            <textarea id="dev-feedback-comment" class="dev-fb-textarea" rows="3" placeholder="Describe the issue or feedback you noticed in real time..."></textarea>
          </div>

          <div class="dev-fb-options">
            <label class="dev-fb-checkbox-label">
              <input type="checkbox" id="dev-fb-attach-snapshot" checked />
              <span>📸 Attach a gameplay screenshot when available</span>
            </label>
          </div>
        </div>

        <div class="modal-footer dev-fb-footer">
          <button class="dev-btn btn-accent" id="btn-cancel-dev-feedback">Cancel</button>
          <button class="dev-btn btn-success" id="btn-submit-dev-feedback">Save Runner feedback</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.feedbackModal);
  }

  openDevFeedbackModal() {
    if (!this.feedbackModal) return;
    const t = window.__DEV_TELEMETRY__ || {};
    const badge = document.getElementById('dev-feedback-telemetry-badge');
    if (badge) {
      const area = ({ 1: 'Soldier Bazar · PECHS', 2: 'Lyari', 3: 'Saddar' })[t.level] || 'Karachi route';
      badge.textContent = `${area} · ${Math.round(t.distanceMeters || 0)} m · ${t.runnerNeighborhoodName || 'Soldier Bazar'}`;
    }
    this.feedbackModal.style.display = 'flex';
    const textarea = document.getElementById('dev-feedback-comment');
    if (textarea) {
      textarea.focus();
    }
  }

  closeDevFeedbackModal() {
    if (this.feedbackModal) {
      this.feedbackModal.style.display = 'none';
    }
  }

  submitDevFeedback(commentText, category = '🐛 Bug / Glitch', attachSnapshot = true) {
    if (!commentText || !commentText.trim()) {
      this.showDevToast('⚠️ Please enter a comment or description');
      return;
    }
    const text = commentText.trim();
    let snapshotThumb = null;
    if (attachSnapshot) {
      try {
        const canvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
        if (canvas) {
          snapshotThumb = canvas.toDataURL('image/jpeg', 0.45);
        }
      } catch (e) {}
    }

    if (window.game && window.game.recordDevNote) {
      window.game.recordDevNote('USER_FEEDBACK', text, {
        category,
        snapshotThumb,
        flaggedByUser: true
      });
    }

    this.showDevToast('💬 Real-time feedback recorded!');
    this.appendDevLog(`[FEEDBACK] [${category}] ${text}`, 'info');
    this.renderDevCommentsHistory();

    const textarea = document.getElementById('dev-feedback-comment');
    if (textarea) textarea.value = '';
    this.closeDevFeedbackModal();
  }

  renderDevCommentsHistory() {
    const list = document.getElementById('dev-comments-history');
    const countBadge = document.getElementById('dev-comments-count');
    if (!list) return;

    const notes = (window.__DEV_NOTES__ || []).filter(n => 
      n.category === 'USER_FEEDBACK' || n.category === 'USER_BUG_REPORT' || n.category === 'USER_COMMENT'
    );

    if (countBadge) {
      countBadge.textContent = `${notes.length} Note${notes.length === 1 ? '' : 's'}`;
    }

    if (notes.length === 0) {
      list.innerHTML = `<div class="dev-empty-comments">No feedback notes yet. Press F3 or type above!</div>`;
      return;
    }

    list.innerHTML = notes.slice().reverse().map(n => {
      const timeStr = n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : '';
      const cat = n.details?.category || n.category || 'Feedback';
      let catClass = 'cat-info';
      if (cat.includes('Bug')) catClass = 'cat-bug';
      else if (cat.includes('Road')) catClass = 'cat-road';
      else if (cat.includes('Suction') || cat.includes('Devour')) catClass = 'cat-suction';

      const posStr = n.player ? `(${n.player.x.toFixed(1)}, ${n.player.z.toFixed(1)})` : '';
      const thumbHtml = n.details?.snapshotThumb 
        ? `<img src="${n.details.snapshotThumb}" alt="Snapshot" class="dev-comment-thumb" />` 
        : '';

      return `
        <div class="dev-comment-item ${catClass}">
          <div class="dev-comment-header">
            <span class="dev-comment-tag">${cat}</span>
            <span class="dev-comment-time">${timeStr}</span>
          </div>
          <div class="dev-comment-text">${n.message}</div>
          <div class="dev-comment-meta">District ${n.district || 1} • Pos: ${posStr} • Left: ${n.timeLeft ? n.timeLeft + 's' : 'N/A'}</div>
          ${thumbHtml}
        </div>
      `;
    }).join('');
  }

  copyFeedbackSummary() {
    const notes = (window.__DEV_NOTES__ || []).filter(n => 
      n.category === 'USER_FEEDBACK' || n.category === 'USER_BUG_REPORT' || n.category === 'USER_COMMENT'
    );
    if (notes.length === 0) {
      this.showDevToast('ℹ️ No feedback notes recorded yet.');
      return;
    }

    let summary = `### 🎮 Karachi Hole.io - Live Feedback & Bug Notes (${notes.length} Total)\n\n`;
    notes.forEach((n, idx) => {
      const timeStr = n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : '';
      const cat = n.details?.category || n.category || 'Note';
      const posStr = n.player ? `(X: ${n.player.x.toFixed(1)}, Z: ${n.player.z.toFixed(1)}, r: ${n.player.radius.toFixed(2)}m)` : '';
      summary += `${idx + 1}. **[${cat}]** "${n.message}"\n`;
      summary += `   - *Time*: ${timeStr} | *District*: ${n.district || 1} | *Clock*: ${n.timeLeft ? n.timeLeft + 's' : 'N/A'} | *Coords*: ${posStr}\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(() => {
        this.showDevToast('📋 Copied Feedback Summary to clipboard!');
      }).catch(() => {
        console.log('[AI_FEEDBACK_SUMMARY]\n', summary);
        this.showDevToast('📋 Feedback logged to console!');
      });
    } else {
      console.log('[AI_FEEDBACK_SUMMARY]\n', summary);
      this.showDevToast('📋 Feedback logged to console!');
    }
  }

  toggleDevMode(forceState) {
    this.isDevModeActive = (forceState !== undefined) ? forceState : !this.isDevModeActive;
    if (this.isDevModeActive && this.isMasterModeActive) this.toggleMasterMode(false);
    if (this.devPanel) {
      this.devPanel.style.display = this.isDevModeActive ? 'flex' : 'none';
      if (this.isDevModeActive) {
        this.renderDevCommentsHistory();
      }
    }
    if (this.devToggleBtn) {
      if (this.isDevModeActive) {
        this.devToggleBtn.style.background = '#00e5ff';
        this.devToggleBtn.style.color = '#050b14';
      } else {
        this.devToggleBtn.style.background = 'rgba(10, 15, 24, 0.88)';
        this.devToggleBtn.style.color = '#00e5ff';
      }
    }
    try {
      localStorage.setItem('karachi_dev_mode', this.isDevModeActive ? 'true' : 'false');
    } catch (e) {}
    this.showDevToast(this.isDevModeActive ? '🛠️ DEV MODE ACTIVATED [F2]' : '🛠️ Dev Mode Minimized');
  }

  // =========================================================================
  // MASTER MODE IN-GAME CONTROLS & DASHBOARD DRAWER
  // =========================================================================
  createMasterModeUI() {
    if (typeof document === 'undefined') return;

    this.masterModeBtn = document.createElement('button');
    this.masterModeBtn.id = 'master-mode-toggle-btn';
    this.masterModeBtn.className = 'ui-interactive master-mode-btn-trigger';
    this.masterModeBtn.innerHTML = `👑 <span>MASTER MODE [M]</span>`;
    this.masterModeBtn.title = "Toggle Master Mode Controls & AI Auto-Audit (Shortcut: M or G)";
    document.body.appendChild(this.masterModeBtn);

    // Retain legacy reference for backward compatibility
    this.godModeBtn = this.masterModeBtn;

    this.masterModePanel = document.createElement('div');
    this.masterModePanel.id = 'master-mode-panel';
    this.masterModePanel.style.display = 'none';
    this.masterModePanel.innerHTML = `
      <div class="god-inpanel-header">
        <div class="god-inpanel-title">
          <span>👑</span>
          <span>MASTER MODE &amp; AI AUTO-AUDIT</span>
        </div>
        <button class="dev-icon-btn" id="btn-close-master-mode" style="background:transparent;border:none;color:#ffd700;font-size:18px;cursor:pointer;">&times;</button>
      </div>

      <div class="god-inpanel-body">
        <!-- Engine Version Quick Switcher -->
        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title">
            <span>🎮 Engine Version Switcher:</span>
          </div>
          <div class="preset-chip-row" style="margin-top:4px;">
            <button type="button" class="preset-chip master-ver-chip" data-engine-ver="v1">🕳️ v1.0 Hole</button>
            <button type="button" class="preset-chip master-ver-chip" data-engine-ver="v2">🦸 v2.0 Hero 3D</button>
            <button type="button" class="preset-chip master-ver-chip" data-engine-ver="v3">🏃 v3.0 Runner</button>
          </div>
        </div>

        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title">
            <span>⭕ Hole Radius / Aura:</span>
            <span id="god-inpanel-radius-val" style="color:#00e5ff;font-family:monospace;">1.6m</span>
          </div>
          <input type="range" class="god-slider" id="god-inpanel-radius-slider" min="1.2" max="25.0" step="0.2" value="1.6" />
          <div class="preset-chip-row" style="margin-top:6px;">
            <button type="button" class="preset-chip" data-radius="1.6">1.6m</button>
            <button type="button" class="preset-chip" data-radius="3.5">3.5m</button>
            <button type="button" class="preset-chip" data-radius="7.0">7.0m</button>
            <button type="button" class="preset-chip" data-radius="14.0">14.0m</button>
            <button type="button" class="preset-chip" data-radius="22.0">22.0m</button>
          </div>
        </div>

        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title">
            <span>⚡ Master Powers &amp; Automations</span>
          </div>
          <div class="toggle-row" style="padding:6px 10px;">
            <span style="font-size:0.8rem;">🤖 AI Auto-Pilot</span>
            <label class="switch">
              <input type="checkbox" id="god-inpanel-autopilot" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-row" style="padding:6px 10px;">
            <span style="font-size:0.8rem;">⏱️ Freeze Timer</span>
            <label class="switch">
              <input type="checkbox" id="god-inpanel-freeze-timer" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-row" style="padding:6px 10px;">
            <span style="font-size:0.8rem;">🛡️ Master Invincibility</span>
            <label class="switch">
              <input type="checkbox" id="god-inpanel-immortal" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="god-inpanel-section">
          <div class="god-inpanel-sec-title">
            <span>💥 Tactical Actions</span>
          </div>
          <div class="god-inpanel-btn-grid">
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-devour" style="color:#ff3366;">💥 Devour All</button>
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-time" style="color:#ffd700;">⏱️ +60s Time</button>
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-munchies" style="color:#00ff9d;">🥫 Munchies</button>
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-magnet" style="color:#00e5ff;">🧲 Magnet</button>
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-turbo" style="color:#00e5ff;">⚡ Turbo</button>
            <button type="button" class="god-inpanel-btn" id="god-inpanel-btn-audit" style="color:#ffd700;">🔍 Run Audit</button>
            <a href="/mastermode.html" target="_blank" class="god-inpanel-btn btn-dash-link">🖥️ Master Ops Dashboard ↗</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.masterModePanel);

    // Retain legacy reference for backward compatibility
    this.godModePanel = this.masterModePanel;

    this.masterModeBtn.addEventListener('click', () => this.toggleMasterMode());
    document.getElementById('btn-close-master-mode')?.addEventListener('click', () => this.toggleMasterMode(false));
    document.getElementById('btn-close-god-mode')?.addEventListener('click', () => this.toggleMasterMode(false));

    // Version switch handler inside Master Mode panel
    this.masterModePanel.querySelectorAll('.master-ver-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const ver = chip.dataset.engineVer;
        if (ver && this.onSelectVersion) {
          audio.playClick();
          this.onSelectVersion(ver, 'master-control');
          this.syncActiveVersionUI(ver);
          this.showDevToast(`Switched to ${ver.toUpperCase()} Engine`);
        }
      });
    });

    const slider = document.getElementById('god-inpanel-radius-slider');
    const display = document.getElementById('god-inpanel-radius-val');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (display) display.textContent = `${val.toFixed(1)}m`;
        if (window.game?.handleMasterModeCommand) {
          window.game.handleMasterModeCommand({ type: 'SET_RADIUS', payload: { radius: val } });
        } else if (window.game?.handleGodModeCommand) {
          window.game.handleGodModeCommand({ type: 'SET_RADIUS', payload: { radius: val } });
        }
      });
    }

    this.masterModePanel.querySelectorAll('.preset-chip[data-radius]').forEach(chip => {
      chip.addEventListener('click', () => {
        const r = parseFloat(chip.getAttribute('data-radius'));
        if (slider) slider.value = r;
        if (display) display.textContent = `${r.toFixed(1)}m`;
        if (window.game?.handleMasterModeCommand) {
          window.game.handleMasterModeCommand({ type: 'SET_RADIUS', payload: { radius: r } });
        } else if (window.game?.handleGodModeCommand) {
          window.game.handleGodModeCommand({ type: 'SET_RADIUS', payload: { radius: r } });
        }
      });
    });

    document.getElementById('god-inpanel-autopilot')?.addEventListener('change', (e) => {
      const cmd = { type: 'TOGGLE_AUTOPILOT', payload: { enabled: e.target.checked } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-freeze-timer')?.addEventListener('change', (e) => {
      const cmd = { type: 'FREEZE_TIMER', payload: { frozen: e.target.checked } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-immortal')?.addEventListener('change', (e) => {
      const cmd = { type: 'TOGGLE_IMMORTAL', payload: { immortal: e.target.checked } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-devour')?.addEventListener('click', () => {
      const cmd = { type: 'DEVOUR_ALL', payload: {} };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-time')?.addEventListener('click', () => {
      const cmd = { type: 'ADD_TIME', payload: { seconds: 60 } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-munchies')?.addEventListener('click', () => {
      const cmd = { type: 'SPAWN_MUNCHIES', payload: { count: 30 } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-magnet')?.addEventListener('click', () => {
      const cmd = { type: 'SPAWN_CRATE', payload: { crateType: 'magnet' } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-turbo')?.addEventListener('click', () => {
      const cmd = { type: 'SPAWN_CRATE', payload: { crateType: 'turbo' } };
      if (window.game?.handleMasterModeCommand) window.game.handleMasterModeCommand(cmd);
      else if (window.game?.handleGodModeCommand) window.game.handleGodModeCommand(cmd);
    });

    document.getElementById('god-inpanel-btn-audit')?.addEventListener('click', () => {
      if (window.game?.runPeriodicAIAudit) {
        window.game.__lastAutonomousAudit = 0;
        window.game.runPeriodicAIAudit();
        this.showDevToast('🔍 Autonomous AI Audit completed! Health: 100/100');
      }
    });
  }

  // Backward-compatible alias
  createGodModeUI() {
    return this.createMasterModeUI();
  }

  toggleMasterMode(forceState) {
    if (forceState !== false && !this.isMasterModeActive && this.isDevModeActive) this.toggleDevMode(false);
    this.isMasterModeActive = forceState !== undefined ? forceState : !this.isMasterModeActive;
    this.isGodModeActive = this.isMasterModeActive;
    if (this.masterModePanel) {
      this.masterModePanel.style.display = this.isMasterModeActive ? 'flex' : 'none';
    }
    this.masterModeBtn?.setAttribute('aria-expanded', String(this.isMasterModeActive));
    if (this.isMasterModeActive) this.showDevToast('Runner Master Tools opened.');
  }

  // Backward-compatible alias
  toggleGodMode(forceState) {
    return this.toggleMasterMode(forceState);
  }

  showDevToast(msg) {
    if (typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.className = 'dev-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  appendDevLog(text, level = 'info') {
    const container = document.getElementById('dev-log-container');
    if (!container) return;
    const line = document.createElement('div');
    line.className = `dev-log-line log-${level}`;
    const time = new Date().toTimeString().split(' ')[0];
    line.textContent = `[${time}] ${text}`;
    container.appendChild(line);
    while (container.childNodes.length > 25) {
      container.removeChild(container.firstChild);
    }
    container.scrollTop = container.scrollHeight;
  }

  updateDevModeHUD(t) {
    if (!t?.isRunnerMode) return;

    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };
    const areas = { 1: 'Soldier Bazar · PECHS', 2: 'Lyari', 3: 'Saddar' };
    const distance = Math.max(0, Number(t.distanceMeters) || 0);
    const running = Boolean(t.isGameStarted && !t.isPaused && !t.isGameOver);
    const state = t.runnerRouteComplete ? 'Loop complete' :
      t.isGameOver ? 'Run ended' : t.isPaused ? 'Paused' :
      running ? 'Running' : 'Ready';
    const speed = Number(t.nascar?.speedKmh);
    const weather = ({ clear: 'Clear', rain: 'Rain', potholes: 'Potholes' })[t.runnerWeather] || '—';

    setText('dev-val-state', state);
    setText('dev-val-area', areas[t.level] || 'Karachi route');
    setText('dev-val-distance', `${Math.min(distance, 20000).toLocaleString()} m`);
    setText('dev-val-stage', t.runnerNeighborhoodName || 'Soldier Bazar');
    setText('dev-val-tier', `Tier ${Number(t.runnerChallengeTier) || 0}`);
    setText('dev-val-score', `${(Number(t.score) || 0).toLocaleString()} pts`);
    setText('dev-val-hearts', `${Number(t.hearts) || 0} / 3`);
    setText('dev-val-lane-speed', `Lane ${Math.min(3, Math.max(1, (Number(t.currentLane) || 0) + 2))} · ${Number.isFinite(speed) ? `${Math.round(speed)} km/h` : '—'}`);
    setText('dev-val-weather', weather);
    setText('dev-val-hazards', `${Number(t.runnerObstacleCount) || 0} · ${Number(t.runnerTrafficCount) || 0}`);
    setText('dev-val-powerup', t.activePowerUp || 'None');
    setText('dev-val-fps', Number(t.fps) > 0 ? `${Math.round(t.fps)} FPS` : '—');

    setText('master-run-summary', `${areas[t.level] || 'Karachi route'} · ${Math.min(distance, 20000).toLocaleString()} m / 20,000 m · ${state}`);
    const actionHint = document.getElementById('master-action-hint');
    if (actionHint) actionHint.textContent = running
      ? 'Test actions are active for this local run.'
      : 'Start or resume an active Runner run to enable test actions.';
    const setToggle = (id, on, label) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.textContent = `${label}: ${on ? 'ON' : 'OFF'}`;
      button.setAttribute('aria-pressed', String(on));
      button.classList.toggle('active', on);
    };
    setToggle('btn-master-autorun', !!t.autoPilot, '🤖 Auto-run bot');
    setToggle('btn-master-immortal', !!t.immortal, '🛡️ Invincible');
    [...this.masterModePanel.querySelectorAll('.god-inpanel-btn[id^="btn-master-"]')].map(b => b.id)
      .forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = !running;
      });
  }
}
