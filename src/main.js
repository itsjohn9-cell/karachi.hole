import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CityGenerator } from './cityGenerator.js';
import { DIFFICULTY_CONFIG, Hole, LEVEL_CONFIG } from './hole.js';
import { DISTRICT_CONFIGS, getDistrictConfig } from './districts.js';
import { VirtualJoystick } from './joystick.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';
import { KarachiModels } from './karachiModels.js';
import { MAX_REVIVE_TOKENS, saveManager } from './saveManager.js';
import { CITIZEN_DIALOGUES } from './dialogueSystem.js';
import { leaderboardService } from './leaderboardService.js';
import { AvatarBuilder } from './avatar.js';
import { getNextSafeRenderScale, PortableGameOpsEngine } from './game-ops-engine.js';
import { getKarachiNeighborhoodName } from './karachi-neighborhoods.js';

const RUNNER_POTHOLE_RIM_GEOMETRY = new THREE.RingGeometry(0.66, 1.0, 24);
const RUNNER_POTHOLE_RIM_MATERIAL = new THREE.MeshBasicMaterial({ color: 0x202a31 });
const RUNNER_POTHOLE_WARNING_RING_GEOMETRY = new THREE.RingGeometry(0.98, 1.18, 24);
const RUNNER_POTHOLE_WARNING_RING_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffc400,
  side: THREE.DoubleSide
});
const RUNNER_POTHOLE_WATER_GEOMETRY = new THREE.CircleGeometry(0.48, 24);
const RUNNER_POTHOLE_WATER_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x20c9ec,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide
});
const RUNNER_POTHOLE_ARROW_GEOMETRY = (() => {
  // Caution Hazard Cross ('X') - unmistakable danger warning so players never confuse it with an acceleration boost pad
  const shape = new THREE.Shape();
  const arm = 0.44;
  const thick = 0.13;
  shape.moveTo(-arm, -arm + thick);
  shape.lineTo(-arm + thick, -arm);
  shape.lineTo(0, -thick * 0.72);
  shape.lineTo(arm - thick, -arm);
  shape.lineTo(arm, -arm + thick);
  shape.lineTo(thick * 0.72, 0);
  shape.lineTo(arm, arm - thick);
  shape.lineTo(arm - thick, arm);
  shape.lineTo(0, thick * 0.72);
  shape.lineTo(-arm + thick, arm);
  shape.lineTo(-arm, arm - thick);
  shape.lineTo(-thick * 0.72, 0);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
})();
const RUNNER_POTHOLE_ARROW_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffe45c,
  side: THREE.DoubleSide
});
const RUNNER_DIRECTION_ARROW_GEOMETRY = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.2, -0.65);
  shape.lineTo(0.2, -0.65);
  shape.lineTo(0.2, 0.1);
  shape.lineTo(0.65, 0.1);
  shape.lineTo(0, 0.8);
  shape.lineTo(-0.65, 0.1);
  shape.lineTo(-0.2, 0.1);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
})();
const RUNNER_NEIGHBORHOOD_COUNT = 200;
const RUNNER_METERS_PER_NEIGHBORHOOD = 100;
const RUNNER_CITY_LOOP_METERS = RUNNER_NEIGHBORHOOD_COUNT * RUNNER_METERS_PER_NEIGHBORHOOD;
const RUNNER_AREA_NAMES = [
  'Soldier Bazar · Garden Heritage',
  'Mazar-e-Quaid · Quaid Mausoleum',
  'Saddar · Empress Market Heritage',
  'I.I. Chundrigar · Financial Corridor',
  'Clifton · Sea View Coastline',
  'Lyari · Chakiwara Cultural District'
];
const RUNNER_AREA_THRESHOLDS = [3300, 6700, 10000, 13400, 16700, 20000];
const RUNNER_SPEEDS = { easy: 14.5, cruiser: 16.5, standard: 19, hard: 22 };
const RUNNER_TURN_INPUT_METERS = 45;
const RUNNER_TURN_ENTRY_METERS = 14;
const RUNNER_TURN_LAST_INPUT_METERS = 6.5;

function runnerSegmentDistanceSquared(x, z, start, end) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dz * dz;
  const t = lengthSquared > 0
    ? THREE.MathUtils.clamp(((x - start.x) * dx + (z - start.z) * dz) / lengthSquared, 0, 1)
    : 0;
  const closestX = start.x + dx * t;
  const closestZ = start.z + dz * t;
  const distanceX = x - closestX;
  const distanceZ = z - closestZ;
  return distanceX * distanceX + distanceZ * distanceZ;
}

function runnerSegmentDistanceSquared3D(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dy * dy + dz * dz;
  const t = lengthSquared > 0
    ? THREE.MathUtils.clamp(
      ((point.x - start.x) * dx + (point.y - start.y) * dy + (point.z - start.z) * dz) / lengthSquared,
      0,
      1
    )
    : 0;
  const closestX = start.x + dx * t;
  const closestY = start.y + dy * t;
  const closestZ = start.z + dz * t;
  const distanceX = point.x - closestX;
  const distanceY = point.y - closestY;
  const distanceZ = point.z - closestZ;
  return distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ;
}

function runnerSegmentCrossesZ(z, startZ, endZ, radius) {
  return z >= Math.min(startZ, endZ) - radius && z <= Math.max(startZ, endZ) + radius;
}

export class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.opsEngine = null;

    // Game Mode & State
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.matchDuration = 240; // 4 minutes match duration
    this.timeLeft = this.matchDuration;
    this.isGameStarted = false;
    this.isGameOver = false;
    this.isPaused = false;

    // Karachi Civic District Progression System (Leveling up via Civic Cleanse!)
    const savedDistrictLevel = Number(saveManager.get().currentDistrictLevel || 1);
    this.currentDistrictLevel = saveManager.isDistrictUnlocked(savedDistrictLevel) ? savedDistrictLevel : 1;
    this.districtClearing = false;
    this.districtEvils = [];
    this.districtTotal = 0;
    this.districtRemaining = 0;

    // Optional Civic Quiz Dilemmas: Disabled by default per user request (Opt-in via Settings)
    this.civicQuizEnabled = (typeof localStorage !== 'undefined' && localStorage.getItem('hole_karachi_civic_quiz_enabled') === 'true');

    // Before & After Transformation Monuments and Mini-Map Tracker
    this.cleanedMonuments = [];
    this.recentCleaned = [];

    // Movement vectors
    this.moveVector = { x: 0, y: 0 };
    this.isBoosting = false;
    this.currentTargetObjective = null;

    // Arcade Power-Up & Combo Timers
    this.magnetTimer = 0;
    this.turboTimer = 0;
    this.frenzyTimer = 0;
    this.nitroTimer = 0;
    this.shieldTimer = 0;
    this.superJumpTimer = 0;
    this.chingchiTimer = 0;
    this.jetpackTimer = 0;
    this.doubleCoinsTimer = 0;
    this.hornCooldownTimer = 0;
    this.maxHornCooldown = 8.0;
    this.coinComboCount = 0;
    this.lastCoinPickupTime = 0;
    this.activePowerUp = null;
    this.gutterHazards = [];
    this.finishGate = null;
    this.gutterFalls = 0;
    this.guttersJumped = 0;
    this.robbersEvaded = 0;
    this.robberyLosses = 0;
    this.score = 0;

    // Major Game Versioning Hub: 'v1' (Classic Hole.io Devourer) | 'v2' (Karachi Civic Hero 3D Patrol) | 'v3' (Karachi Temple Run Street Runner)
    this.majorVersion = 'v3';
    this.isTempleRun = (this.majorVersion === 'v3');
    this.currentLane = 0; // -1: Left ($X = -3.2$), 0: Center ($X = 0$), 1: Right ($X = +3.2$)
    this.laneWidth = 3.2;
    this.targetLaneX = 0;
    this.distanceMeters = 0;
    this.lastFunnelMeters = 0;
    this.coins = 0;
    this.hearts = 3;
    this.maxHearts = 3;
    this.runnerWaveCount = 0;
    this.runnerPowerupDropCount = 0;
    this.runnerNearMissCount = 0;
    this.runnerRunRecorded = false;
    this.runnerRouteComplete = false;
    this.runnerNeighborhoodIndex = 1;
    this.runnerAreaIndex = 0;
    this.runnerDifficulty = 'standard';
    this.isSliding = false;
    this.slideTimer = 0;
    this.isFastFalling = false;
    this.playerBlobShadow = null;
    this.laneChangeTimer = 0.18;
    this.laneChangeDuration = 0.18;
    this.laneChangeStartX = 0;
    this.skyDome = null;
    this.skylineBackdrop = null;
    this.speedWindLines = null;
    this.nearMissCount = 0;
    this.runnerDifficulty = 'cruiser';
    this.runSpeed = RUNNER_SPEEDS.cruiser;
    this.runnerObstacles = [];
    this.runnerCoins = [];
    this.runnerPowerups = [];
    this.runnerReviveTokens = [];
    this.runnerTraffic = [];
    this.runnerBoostPads = [];
    this.runnerRainOverride = null;
    this.runnerRainEffect = null;
    this.runnerWeatherState = 'clear';
    this.corridorDistrictLevel = null;
    this.isDrafting = false;
    this.draftCharge = 0;
    this.currentKmh = 60;
    this.currentRpm = 3200;
    this.currentGear = 2;
    this.targetBankRoll = 0;
    this.currentBankRoll = 0;
    this.isNascarSuperSpeed = false;
    this.isBusSurfing = false;
    this.busSurfingTimer = 0.0;
    this.surfingBus = null;
    this.surfingBuses = [];
    this.nextSurfingBusDist = 60;
    this.nextRunnerWaveZ = 45.0;
    this.runnerJunction = null;
    this.runnerTurn = null;
    this.runnerSection = null;
    this.runnerSectionDecor = [];
    this.runnerHeading = 0;
    this.runnerTurnsCompleted = 0;
    this.runnerJunctionIndex = 0;
    this.runnerCameraLift = 0;
    this.nextJunctionAt = 150;
    this.currentMilestone = getKarachiNeighborhoodName(1);
    this.milestones = [
      { dist: 0, name: 'Soldier Bazar · Karachi Loop Start' },
      { dist: 6700, name: 'Lyari · Chakiwara' },
      { dist: 13400, name: 'Saddar · Burns Road' }
    ];
    this.passedMilestoneIndices = new Set([0]);

    // 3D Police Havaldar CD-70 Chaser System
    this.chaserMesh = null;
    this.chaserDistance = 12.0;
    this.targetChaserDistance = 12.0;
    this.isChaserClose = false;
    this.chaserStumbleGraceTimer = 0;

    // Karachi Word Hunt (K-A-R-A-C-H-I)
    this.wordHuntTarget = 'KARACHI';
    this.wordHuntCollected = [];
    this.wordHuntNextIndex = 0;
    this.runnerWordLetters = [];
    this.nextWordLetterZ = -30.0;

    // Junoon Fever Rush (Adrenaline Bar)
    this.feverCharge = 0;
    this.feverTimer = 0.0;
    this.isFeverActive = false;

    // 🏏 Tape-Ball Cricket Master Bat
    this.cricketBatTimer = 0.0;
    this.cricketBatMesh = null;

    // 🛹 Qingqi Hover-Surfer Skateboard
    this.hoverboardTimer = 0.0;
    this.hoverboardMesh = null;
    this.hoverboardCooldown = 0.0;

    // Dynamic Combo Streak Multiplier
    this.runnerComboStreak = 1;
    this.runnerComboTimer = 0.0;

    // Master Mode & AI Auto-Pilot State (Renamed from God Mode per user directive)
    this.isMasterImmortal = false;
    this.isGodImmortal = false; // Alias for backward compatibility
    this.isTimerFrozen = false;
    this.masterSpeedMult = 1.0;
    this.godSpeedMult = 1.0; // Alias for backward compatibility
    this.isAutoPilotActive = false;
    this.__lastMasterTelemetryBroadcast = 0;
    this.__lastRuntimeSnapshot = 0;

    this.initThree();
    this.initScene();
    this.initHoles();
    this.initJoystick();
    this.initDistrictChallenges(getDistrictConfig(this.currentDistrictLevel));
    this.createNavigationGuide();
    this.initUI();
    this.initAudioTriggers();
    this.initMasterModeComms();
    this.initGodModeComms = this.initMasterModeComms; // Alias

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.opsEngine && typeof this.opsEngine.syncOfflineQueue === 'function') {
          this.opsEngine.syncOfflineQueue();
        }
      });
    }
    this.loadDistrictLevel(this.currentDistrictLevel, false);
    this.restoreSavedCareerProgress();

    // Start Game Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Responsive Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initThree() {
    // Scene with warm Karachi coastal golden haze
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd2c6b2);
    this.scene.fog = new THREE.FogExp2(0xd2c6b2, 0.0065);

    // Stylized Gradient Sky Dome & Distant Karachi Skyline Parallax Backdrop
    this.skyDome = this.createSkyDome();
    if (this.skyDome) this.scene.add(this.skyDome);

    this.skylineBackdrop = this.createDistantSkylineBackdrop();
    if (this.skylineBackdrop) this.scene.add(this.skylineBackdrop);

    this.speedWindLines = this.createSpeedWindLines();
    if (this.speedWindLines) this.scene.add(this.speedWindLines);

    // Camera - Subway Surfers / GTA street-level chase perspective (Zoomed out for wide urban visibility)
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.3,
      500
    );
    this.camera.position.set(0, 3.4, 5.8);
    this.camera.lookAt(0, 1.5, -9.5);

    // Progressive WebGL Renderer Creation with Multi-Tier Fallbacks
    let renderer = null;
    const canvasContainer = this.container || document.getElementById('canvas-container') || document.body;

    const renderConfigs = [
      { antialias: true, powerPreference: 'default', failIfMajorPerformanceCaveat: false },
      { antialias: false, powerPreference: 'low-power', precision: 'mediump', failIfMajorPerformanceCaveat: false },
      { antialias: false, failIfMajorPerformanceCaveat: false },
      {}
    ];

    for (const cfg of renderConfigs) {
      try {
        renderer = new THREE.WebGLRenderer(cfg);
        if (renderer && renderer.getContext()) break;
      } catch (e) {
        console.warn('[WEBGL_FALLBACK] Failed renderer config:', cfg, e.message);
      }
    }

    if (!renderer || (typeof renderer.getContext === 'function' && !renderer.getContext())) {
      console.warn('[WEBGL_FALLBACK] WebGL context unavailable. Initializing virtual canvas renderer so UI and game logic remain 100% operational.');
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth || 1280;
      canvas.height = window.innerHeight || 800;
      this.renderer = {
        domElement: canvas,
        setSize: () => {},
        setPixelRatio: () => {},
        render: () => {},
        shadowMap: { enabled: false },
        isVirtualFallback: true
      };
      canvasContainer.appendChild(canvas);
    } else {
      this.renderer = renderer;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      try {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
      } catch (e) {}
      canvasContainer.appendChild(this.renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.65);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc4b79b, 0.5);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Sunlight
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.dirLight.position.set(45, 70, 35);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 200;
    const shadowD = 60;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Particle System
    this.particles = new ParticleSystem(this.scene);
  }

  initScene() {
    this.cityGen = new CityGenerator(this.scene);
    const generated = this.cityGen.generateCity();
    this.edibleObjects = generated.edibleObjects;
    this.politicians = generated.politicians || [];
    this.animals = generated.animals || [];
    this.robberies = generated.robberies || [];
    this.badGuys = generated.badGuys || [];
    this.foodStalls = generated.foodStalls || [];
    this.buildings = generated.buildings || [];
    this.citizens = generated.citizens || [];
    this.keyCitizens = generated.keyCitizens || [];
    this.interactiveVictims = generated.interactiveVictims || [];
    this.interactiveTraffic = generated.interactiveTraffic || [];
    this.interactiveResidents = generated.interactiveResidents || [];
    this.districtEvils = generated.currentDistrictEvils || this.badGuys.filter(b => b.isDistrictEvil);
    this.districtTotal = Math.max(1, this.districtEvils.length);
    this.districtRemaining = this.districtTotal;
    this.civicTotal = this.districtTotal;
    this.civicCleansed = 0;
    this.frenzyTimer = 0;
    this.frenzyTriggered = false;
  }

  initHoles() {
    this.holes = [];

    // Player Hole (Kids / Easy mode by default, KMC Open Gutter skin)
    this.player = new Hole({
      scene: this.scene,
      name: "You (Karachi King)",
      isPlayer: true,
      skin: 'gutter',
      initialPos: { x: 0, z: 0 },
      color: 0x00e5ff,
      difficulty: this.difficulty || 'kidsEasy'
    });
    this.player.politiciansDevoured = 0;
    this.player.turboTimer = 0;
    this.holes.push(this.player);

    if (!this.playerBlobShadow) {
      this.playerBlobShadow = this.createBlobShadow(1.3, 1.3);
      if (this.playerBlobShadow) this.scene.add(this.playerBlobShadow);
    }

    // 5 AI Bots with Kid-Friendly tuning (Slow, Non-aggressive)
    const botConfigs = [
      { name: "TruckArtMaster", skin: "truckArt", color: 0xff007f, pos: [-45, 15] },
      { name: "ChaiWala_99", skin: "ajrak", color: 0x8b0000, pos: [-20, 45] },
      { name: "CliftonRacer", skin: "emerald", color: 0x00e676, pos: [45, 45] },
      { name: "BurnsRoadChef", skin: "quaid", color: 0xffd700, pos: [-55, 30] },
      { name: "ChundrigarBoss", skin: "neon", color: 0x00f0ff, pos: [45, -35] }
    ];

    botConfigs.forEach(cfg => {
      const bot = new Hole({
        scene: this.scene,
        name: cfg.name,
        isPlayer: false,
        skin: cfg.skin,
        initialPos: cfg.pos,
        color: cfg.color,
        difficulty: this.difficulty || 'kidsEasy'
      });
      this.holes.push(bot);
    });
  }

  initJoystick() {
    this.joystick = new VirtualJoystick({
      onMove: (vx, vz) => {
        if (!this.isGameStarted && (Math.abs(vx) > 0.05 || Math.abs(vz) > 0.05)) {
          this.startGame();
        }
        this.moveVector.x = vx;
        this.moveVector.y = vz;
      },
      onEnd: () => {
        this.moveVector.x = 0;
        this.moveVector.y = 0;
      },
      onBoost: (boosting) => {
        this.isBoosting = boosting;
      },
      onJump: () => {
        this.performJump();
      },
      onInteract: () => {
        this.interactWithNearbyCitizen();
      },
      onJournal: () => {
        this.openMissionJournal();
      }
    });
  }

  initUI() {
    this.ui = new UIManager({
      onStartGame: ({ playerName, ageTier, runnerDifficulty, avatarId, versionId }) => {
        this.setMajorGameVersion(versionId === 'v3' ? versionId : 'v3', false);
        if (this.player) {
          this.player.name = playerName || "Karachi Hero";
          if (avatarId) {
            this.player.setAvatar(avatarId);
          }
          this.player.updateNameTag();
        }
        const savedProfile = saveManager.get().player;
        savedProfile.name = this.player?.name || 'Karachi Hero';
        savedProfile.avatarId = this.player?.avatarId || 'tariq';
        if (!saveManager.save()) {
          console.error('[SAVE] Could not persist runner profile.');
          this.ui.showAnnouncement('Could not save your profile. Check device storage.', '#ff5252');
        }
        this.difficulty = ageTier === 'kids' ? 'kidsEasy' : 'classic';
        this.runnerDifficulty = Object.hasOwn(RUNNER_SPEEDS, runnerDifficulty) ? runnerDifficulty : 'cruiser';
        this.runSpeed = RUNNER_SPEEDS[this.runnerDifficulty];
        this.loadDistrictLevel(1, false);
        this.startGame();
        audio?.startMusic?.();
        audio?.playPoliceWhistle?.();
        audio?.playMusicalHorn?.();
        if (this.camera) {
          this.cameraSmoothPos = this.camera.position.clone();
          this.cameraSmoothLookAt = new THREE.Vector3(0, 1.25, (this.player?.position?.z || 0) - 3.0);
          this.cameraSmoothTimer = 0.65;
        }
        if (this.particles && this.player) {
          this.particles.createSkidSmoke(this.player.position, 12);
        }
        this.ui?.showAnnouncement?.('🚀 BHAG KARACHI BHAG! · SOLDIER BAZAR', '#ffd700');
      },
      onSelectVersion: (versionId, source = 'main') => {
        this.setMajorGameVersion(versionId, true, source);
      },
      onSelectDistrict: (level) => {
        this.loadDistrictLevel(level);
      },
      onJump: () => {
        this.performJump();
      },
      onHorn: () => {
        this.triggerKingPressureHorn();
      },
      onSlide: () => {
        this.performSlide();
      },
      onLaneLeft: () => {
        this.changeLane(-1);
      },
      onLaneRight: () => {
        this.changeLane(1);
      },
      onInteractCitizen: () => {
        this.interactWithNearbyCitizen();
      },
      onOpenMissionJournal: () => {
        this.openMissionJournal();
      },
      onNextLevel: () => {
        this.advanceToNextDistrict();
      },
      onResetCareer: () => this.resetCareerProgress(),
      onRestartGame: () => {
        this.restartGame();
      },
      onSelectMode: (mode) => {
        this.gameMode = mode;
        this.restartGame();
      },
      onSelectDifficulty: (diff) => {
        this.difficulty = diff;
        this.restartGame();
      },
      onSelectRunnerDifficulty: (pace) => {
        this.setRunnerDifficulty(pace);
      },
      onOpenEducationalQuiz: (category) => {
        this.pauseGame();
      },
      onResolveEducationalQuiz: (challenge) => {
        if (this.player) {
          this.player.addXP(challenge.rewardXP || 500);
          this.particles.createCelebrationConfetti(this.player.position, 45);
        }
        this.timeLeft += (challenge.rewardTime || 25);
        this.ui.showAnnouncement(`🌟 CIVIC HERO: +${challenge.rewardXP} XP & +${challenge.rewardTime || 25}s BONUS!`, '#00e676');
      },
      onResumeGame: () => {
        this.resumeGame();
      },
      onPauseGame: () => {
        this.pauseGame();
      },
      onReturnToMainMenu: () => {
        this.returnToMainMenu();
      },
      onDeployHoverboard: () => {
        this.deployHoverboard();
      },
      onDoubleTap: () => {
        this.deployHoverboard();
      },
      onQuickRevive: () => {
        return this.quickReviveWithChai();
      }
    });

    const splash = document.getElementById('karachi-starter-splash');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('is-hidden');
        setTimeout(() => splash.remove(), 400);
      }, 400);
    }
  }

  pauseGame() {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.moveVector) {
      this.moveVector.x = 0;
      this.moveVector.y = 0;
    }
    audio.pauseAudio();
  }

  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.clock.getDelta(); // Reset clock delta so physics doesn't leap
    audio.resumeAudio();
    audio.playClick();
  }

  returnToMainMenu() {
    this.cancelRunnerDeathAnimation();
    this.persistRunnerRun();
    this.pauseGame();
    this.isGameStarted = false;
    audio.playClick();
    if (this.ui) {
      this.ui.returnToMainMenu();
    }
    if (!saveManager.save()) {
      console.error('[SAVE] Could not persist career when returning to the main menu.');
    }
  }

  persistRunnerRun() {
    if (!this.isTempleRun || !this.isGameStarted || this.runnerRunRecorded) return true;
    if (!saveManager.recordRunnerRun(this.distanceMeters, this.score, this.coins)) {
      console.error('[SAVE] Could not persist completed KARACHI RUNNER results.');
      return false;
    }
    this.runnerRunRecorded = true;
    try {
      leaderboardService.submitRunScore({
        score: this.score,
        distance: this.distanceMeters,
        rupees: this.coins,
        district: this.currentNeighborhood?.name || 'Soldier Bazar',
        pace: this.runnerDifficulty || 'cruiser'
      });
      leaderboardService.recordChallengeProgress('distance_single_run', this.distanceMeters);
    } catch (e) {
      console.warn('[Leaderboard] Score submission non-fatal notice:', e.message);
    }
    this.ui?.refreshRunnerProgress();
    return true;
  }

  /**
   * Agile Street Parkour Traversal Jump Mechanic (Space / Mobile Jump)
   */
  performJump() {
    if (!this.player || this.isPaused || this.isGameOver) return;
    if (!this.isGameStarted) this.startGame();

    // Fluid Jump/Slide cancellation: cancel active slide immediately when jumping
    if (this.isSliding) {
      this.isSliding = false;
      this.slideTimer = 0;
      if (this.player.avatarMesh) {
        this.player.avatarMesh.scale.set(1, 1, 1);
        this.player.avatarMesh.position.y = 0;
      }
    }

    // If trapped in open sewer gutter, jump immediately pulls hero out!
    if (this.player.isTrappedInGutter) {
      this.player.isTrappedInGutter = false;
      this.player.position.y = 0;
      this.player.jump(7.5);
      audio.playJump();
      this.ui.showFloatingFeedback('💨 ESCAPED SEWER!', this.player.position, '#00e676');
      return;
    }

    const jumpStrength = (this.superJumpTimer > 0) ? 11.5 : 6.2;
    const jumped = this.player.jump(jumpStrength);
    if (jumped) {
      audio.playJump();
      this.particles.createDevourSparkles(this.player.position, 6, 0x00e5ff);
    }
  }

  /**
   * Calculate King Pressure Horn cooldown duration based on selected pace/difficulty:
   * Easy: 4.0s (casual & forgiving)
   * Standard: 8.0s (balanced arcade rhythm)
   * Hard: 14.0s (tactical & high stakes)
   */
  getHornCooldownDuration() {
    const pace = this.runnerDifficulty || 'cruiser';
    let base = 8.0;
    if (pace === 'easy') base = 4.0;
    else if (pace === 'cruiser') base = 6.0;
    else if (pace === 'hard') base = 14.0;
    const hornLvl = saveManager.getPowerUpUpgradeLevel?.('horn') || 1;
    return Math.max(2.0, base - (hornLvl - 1) * 0.75);
  }

  /**
   * Authentic Karachi King Pressure Horn (بادشاہ پریشر ہارن) [H]
   * Emits supersonic acoustic shockwave, stuns robbers, scatters traffic & clears mobile debris.
   * Enforces pace-dependent cooldown and preserves structural hazards (wires, gutters, bridge signs).
   */
  triggerKingPressureHorn() {
    if (!this.player || this.isPaused || this.isGameOver) return;
    if (!this.isGameStarted) this.startGame();

    // Check cooldown
    if (this.hornCooldownTimer > 0) {
      const remaining = Math.ceil(this.hornCooldownTimer);
      this.ui?.showAnnouncement?.(`📢 HORN RECHARGING... (${remaining}s remaining)`, '#ffd600');
      audio?.playClick?.();
      return;
    }

    const hornButton = document.getElementById('btn-horn');
    if (hornButton) {
      hornButton.classList.remove('is-honking');
      void hornButton.offsetWidth;
      hornButton.classList.add('is-honking');
    }
    audio.playKingPressureHorn();
    audio.vibrate([60, 30, 80]);
    this.cameraShakeTimer = 0.35;

    // Apply pace-dependent cooldown
    const cooldownDuration = this.getHornCooldownDuration();
    this.hornCooldownTimer = cooldownDuration;
    this.maxHornCooldown = cooldownDuration;
    if (hornButton) {
      hornButton.classList.add('is-cooling-down');
      const hint = hornButton.querySelector('.horn-hint');
      if (hint) hint.textContent = `${Math.ceil(this.hornCooldownTimer)}s`;
    }

    // Supersonic visual shockwave expanding from player position
    this.particles.createLevelUpShockwave(this.player.position, 24);

    let stunnedCount = 0;
    // Check nearby bad guys & robbers within 26m
    if (this.districtEvils) {
      this.districtEvils.forEach(evil => {
        if (evil && evil.state !== 'swallowed' && evil.mesh) {
          const d = this.player.position.distanceTo(evil.mesh.position);
          if (d < 26.0) {
            stunnedCount++;
            evil.isFleeing = true;
            evil.fleeTimer = 6.0;
            // Send evil spinning in opposite direction
            evil.mesh.rotation.y += Math.PI;
            this.particles.createCleanseSparkleBurst(evil.mesh.position, 12);
          }
        }
      });
    }

    // Nearby traffic honks and parts to the shoulder
    if (this.interactiveTraffic) {
      this.interactiveTraffic.forEach(car => {
        if (car && car.position) {
          const d = this.player.position.distanceTo(car.position);
          if (d < 24.0) {
            car.position.x += (car.position.x >= 0 ? 3.5 : -3.5);
          }
        }
      });
    }

    // Supersonic wave clears nearby movable runner obstacles ahead
    if (this.runnerObstacles) {
      this.runnerObstacles.forEach(obs => {
        if (!obs.isHit && obs.mesh) {
          const dz = this.player.position.z - obs.z;
          if (dz > 0 && dz < 30.0) {
            // Immovable structural hazards: high-voltage overhead wires, open sewer gutters/potholes, bridge signs
            const isImmovableStructure = (
              obs.type === 'wire' ||
              obs.type === 'gutter' ||
              obs.type === 'pothole' ||
              obs.type === 'digging' ||
              obs.type === 'overhead_bridge_sign' ||
              obs.hazardType === 'HIGH_HAZARD'
            );

            if (isImmovableStructure) {
              // Acoustic shockwave ripples against the barrier with a visual spark deflection
              this.particles.createDevourSparkles(obs.mesh.position, 6, 0x00e5ff);
              return;
            }

            // Movable/mobile obstacles are repelled or blasted aside
            obs.isHit = true;
            this.particles.createDevourSparkles(obs.mesh.position, 12, 0xffd700);
            if (obs.type === 'snatcher' || obs.type === 'rickshaw' || obs.type === 'motorcycle') {
              obs.mesh.position.x += (obs.mesh.position.x >= 0 ? 6.5 : -6.5);
              obs.mesh.rotation.z += 0.5;
            } else {
              this.disposeRunnerObject(obs.mesh);
            }
            this.awardRunnerXP(250);
            this.score += 250;
          }
        }
      });
    }

    if (stunnedCount > 0) {
      const pts = stunnedCount * 300;
      this.score = (this.score || 0) + pts;
      this.awardRunnerXP(pts);
      this.robbersEvaded = (this.robbersEvaded || 0) + stunnedCount;
      this.ui.showAnnouncement(`📢 KING HORN BLAST! Stunned & Scared Off ${stunnedCount} Bandits! +${pts} PTS`, '#ffd600');
      this.ui.showFloatingFeedback(`+${pts} 📢 ROBBER STUNNED!`, this.player.position, '#ffd600');
      if (window.__DEV_TELEMETRY__) {
        window.__DEV_TELEMETRY__.robbersEvaded = this.robbersEvaded;
      }
    } else {
      this.ui.showAnnouncement('📢 KING PRESSURE HORN BLAST! Traffic Cleared!', '#ffd600');
    }
  }

  /**
   * Temple Run: Slide Crouch Traversal Mechanic (S / ArrowDown / Touch Slide / Swipe Down)
   */
  performSlide() {
    if (!this.player || this.isPaused || this.isGameOver) return;
    if (!this.isGameStarted) this.startGame();

    const groundY = this.isTempleRun ? this.getCorridorGroundHeight(this.player.position.z, this.player.position.x) : 0;
    const isAirborne = !this.player.isGrounded || ((this.player.position.y || 0) > groundY + 0.08);

    if (isAirborne) {
      // Subway Surfers Fast-Fall Dive: plunge immediately toward road instead of 1-frame teleport
      this.isFastFalling = true;
      this.player.velocityY = Math.min(this.player.velocityY || 0, -20.0);
      this.particles?.createSkidSmoke?.(this.player.position, 4);
    } else {
      this.isFastFalling = false;
      this.player.position.y = groundY;
      this.player.velocityY = 0;
      this.player.isGrounded = true;
    }

    this.isSliding = true;
    this.slideTimer = 0.72;
    audio.playSlide();
    if (this.player.avatarMesh) {
      this.player.avatarMesh.scale.set(1.15, 0.42, 1.25);
      this.player.avatarMesh.position.y = -0.32;
    }
    this.particles.createSkidSmoke(this.player.position, 6);
    this.ui.showFloatingFeedback(isAirborne ? '⚡ FAST-FALL!' : '⚡ SLIDE!', this.player.position, '#00e5ff');
  }

  /**
   * Temple Run: Lane Switching Mechanic (A / D / ArrowLeft / ArrowRight / Touch Lane Buttons / Swipe)
   */
  changeLane(dir) {
    if (!this.player || this.isPaused || this.isGameOver) return;
    if (!this.isGameStarted) this.startGame();
    if (this.runnerTurn) return;
    if (!this._autoLaneChange && this.attemptRunnerTurn(dir)) return;
    const nextLane = Math.max(-1, Math.min(1, this.currentLane + dir));
    if (nextLane === this.currentLane) return;

    // Check if NASCAR Slingshot Boost was primed from drafting behind a vehicle!
    if ((this.draftCharge || 0) >= 0.72) {
      this.nitroTimer = 4.5;
      this.draftCharge = 0;
      this.isDrafting = false;
      this.score += 500;
      this.awardRunnerXP(500);
      audio.playSlingshotBoost();
      this.cameraShakeTimer = 0.35;
      this.particles.createDevourSparkles(this.player.position, 25, 0x00e5ff);
      this.ui.showAnnouncement('🏁 STREET SLINGSHOT BOOST! +500 PTS!', '#ffd700');
      this.ui.showFloatingFeedback('🚀 SLINGSHOT BOOST!', this.player.position, '#ffd700');
    } else {
      audio.playClick();
    }

    this.laneChangeStartX = this.player.position.x;
    this.currentLane = nextLane;
    this.targetLaneX = this.currentLane * this.laneWidth;
    this.laneChangeTimer = 0.0;

    // Stock-Car dynamic lateral banking roll into turns + asphalt tire skid
    this.targetBankRoll = -dir * 0.20;
    audio.playTireScreech();
    this.particles.createSkidSmoke(this.player.position, 4);
  }

  /**
   * Clear all active runner 3D obstacles, coins, traffic and power-ups from scene
   */
  clearRunnerObjects(keepPlayerStatus = false) {
    this.cancelRunnerDeathAnimation();
    this.isFastFalling = false;
    this.laneChangeTimer = this.laneChangeDuration || 0.18;
    this.laneChangeStartX = 0;
    if (this.runnerObstacles) {
      this.runnerObstacles.forEach(obs => {
        if (obs && obs.mesh) this.disposeRunnerObject(obs.mesh);
      });
      this.runnerObstacles = [];
    }
    if (this.runnerCoins) {
      this.runnerCoins.forEach(coin => {
        if (coin && coin.mesh) this.disposeRunnerObject(coin.mesh);
      });
      this.runnerCoins = [];
    }
    if (this.runnerPowerups) {
      this.runnerPowerups.forEach(p => {
        if (p && p.mesh) this.disposeRunnerObject(p.mesh);
      });
      this.runnerPowerups = [];
    }
    if (this.runnerReviveTokens) {
      this.runnerReviveTokens.forEach(token => {
        if (token?.mesh) this.disposeRunnerObject(token.mesh);
      });
      this.runnerReviveTokens = [];
    }
    if (this.runnerTraffic) {
      this.runnerTraffic.forEach(v => {
        if (v && v.mesh) this.disposeRunnerObject(v.mesh);
      });
      this.runnerTraffic = [];
    }
    if (this.runnerBoostPads) {
      this.runnerBoostPads.forEach(b => {
        if (b && b.mesh) this.disposeRunnerObject(b.mesh);
      });
      this.runnerBoostPads = [];
    }
    if (this.runnerWordLetters) {
      this.runnerWordLetters.forEach(l => {
        if (l && l.mesh) this.disposeRunnerObject(l.mesh);
      });
      this.runnerWordLetters = [];
    }

    if (!keepPlayerStatus) {
      if (this.surfingBuses) {
        this.surfingBuses.forEach(b => {
          if (b && b.mesh) this.disposeRunnerObject(b.mesh);
        });
        this.surfingBuses = [];
      }
      this.isBusSurfing = false;
      this.busSurfingTimer = 0.0;
      this.surfingBus = null;
      this.nextSurfingBusDist = 260;
      this.isDrafting = false;
      this.draftCharge = 0;
      this.runnerStumbleTimer = 0;
      this.doubleCoinsTimer = 0;
      if (this.chaserMesh) {
        this.disposeRunnerObject(this.chaserMesh);
        this.chaserMesh = null;
      }
      if (this.cricketBatMesh && this.player?.group) {
        this.player.group.remove(this.cricketBatMesh);
        this.disposeRunnerObject(this.cricketBatMesh);
        this.cricketBatMesh = null;
      }
      if (this.hoverboardMesh) {
        this.disposeRunnerObject(this.hoverboardMesh);
        this.hoverboardMesh = null;
      }
      this.feverTimer = 0;
      this.isFeverActive = false;
      this.feverCharge = 0;
      this.cricketBatTimer = 0;
      this.hoverboardTimer = 0;
      this.runnerComboStreak = 1;
      this.runnerComboTimer = 0;
      this.wordHuntCollected = [];
      this.wordHuntNextIndex = 0;
      if (this.ui?.updateWordHunt) this.ui.updateWordHunt([]);
      if (this.ui?.updateFeverMeter) this.ui.updateFeverMeter(0, false);
      if (this.ui?.updateHoverboard) this.ui.updateHoverboard(0, 0);
      if (typeof audio !== 'undefined' && audio.resetMusicPitch) {
        audio.resetMusicPitch();
      }
      if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.resetDeathAnimation && this.player?.avatarMesh) {
        AvatarBuilder.resetDeathAnimation(this.player.avatarMesh);
      }
    }
  }

  awardRunnerXP(amount) {
    const validAmount = typeof amount === 'number' && Number.isFinite(amount)
      ? amount
      : (Number(amount?.points ?? amount?.score ?? amount?.xp ?? 0) || 0);
    if (!this.player || validAmount <= 0) return;
    const previousLevel = saveManager.getCareerLevel();
    this.player.addXP(validAmount);
    saveManager.addPlayerXP(validAmount);
    if (saveManager.getCareerLevel() > previousLevel) {
      this.ui?.refreshProgressionContent();
    }
  }

  unlockRunnerBadge(badgeId) {
    if (!saveManager.unlockBadge(badgeId)) return;
    this.ui?.refreshProgressionContent();
    this.ui?.showAnnouncement(`🏅 RUNNER ACHIEVEMENT: ${badgeId.replaceAll('_', ' ').toUpperCase()}!`, '#ffd700');
  }

  deployHoverboard() {
    if (!this.player || !this.isTempleRun || !this.isGameStarted || this.isGameOver || this.isPaused) return;
    if (this.hoverboardTimer > 0) return;
    if (this.hoverboardCooldown > 0) {
      this.ui?.showAnnouncement?.(`🛹 Hoverboard cooling down (${Math.ceil(this.hoverboardCooldown)}s)`, '#ffd700');
      return;
    }
    this.hoverboardTimer = 22.0;
    audio?.playHoverboardDeploy?.();
    this.particles?.createDevourSparkles?.(this.player.position, 24, 0x00e5ff);
    if (!this.hoverboardMesh) {
      this.hoverboardMesh = KarachiModels.createHoverboardMesh();
      this.scene.add(this.hoverboardMesh);
    }
    this.hoverboardMesh.visible = true;
    this.ui?.showAnnouncement?.('🛹 QINGQI HOVER-SURFER DEPLOYED! 1 Crash Shield Active! ✨', '#00e5ff');
    this.ui?.showFloatingFeedback?.('🛹 HOVER-SURFER!', this.player.position, '#00e5ff');
  }

  addFeverCharge(amount) {
    if (this.isFeverActive) return;
    this.feverCharge = Math.min(100, Math.max(0, (this.feverCharge || 0) + amount));
    if (this.ui?.updateFeverMeter) {
      this.ui.updateFeverMeter(this.feverCharge, false);
    }
    if (this.feverCharge >= 100) {
      this.triggerJunoonFever();
    }
  }

  triggerJunoonFever() {
    this.isFeverActive = true;
    this.feverTimer = 8.5;
    this.feverCharge = 100;
    audio?.playFeverRush?.();
    audio?.playMusicalHorn?.();
    this.cameraShakeTimer = 0.35;
    this.particles?.createCelebrationConfetti?.(this.player.position, 50);
    this.ui?.showAnnouncement?.('🔥 JUNOON FEVER RUSH! UNSTOPPABLE HYPER SPEED & COIN VORTEX! ⚡', '#00e5ff');
    this.ui?.showFloatingFeedback?.('⚡ JUNOON FEVER!', this.player.position, '#00e5ff');
    if (this.ui?.updateFeverMeter) {
      this.ui.updateFeverMeter(100, true);
    }
  }

  recordRunnerStunt(stuntName, bonusScore = 150) {
    this.runnerComboStreak = Math.min(10, (this.runnerComboStreak || 1) + 1);
    this.runnerComboTimer = 4.0;
    const mult = this.runnerComboStreak;
    const finalScore = bonusScore * mult;
    this.score += finalScore;
    this.awardRunnerXP(finalScore);
    audio?.playMelodicCoin?.(mult);
    this.ui?.showFloatingFeedback?.(`${stuntName} (x${mult}!)`, this.player.position, mult >= 5 ? '#ff1744' : '#ffd700');
    if (mult === 3) this.ui?.showAnnouncement?.('🔥 3X COMBO STREAK! KEEP FLYING!', '#ffd700');
    else if (mult === 5) this.ui?.showAnnouncement?.('⚡ 5X UNSTOPPABLE STUNT RUNNER! 🚀', '#00e5ff');
    else if (mult === 10) this.ui?.showAnnouncement?.('👑 10X MAXIMUM KARACHI KING! 🔥', '#ff1744');
    const comboEl = document.getElementById('hud-combo');
    if (comboEl) {
      comboEl.style.display = 'block';
      const val = document.getElementById('hud-combo-val');
      if (val) val.textContent = String(mult);
    }
  }

  /**
   * Handle obstacle collision during Karachi Temple Run
   */
  handleRunnerHit(obstacle, reason) {
    if (!obstacle || obstacle.isHit || !this.player || this.isGameOver) return;

    if (this.isMasterImmortal || this.isGodImmortal) {
      this.ui.showFloatingFeedback('👑 IMMORTAL MASTER MODE!', this.player.position, '#ffd700');
      return;
    }

    const isTurnMistake = obstacle.type === 'wrong_turn' || obstacle.type === 'missed_turn';
    // Turn mistakes are always charged; grace only protects against repeat obstacle hits.
    if ((this.runnerInvulnerableTimer || 0) > 0 && !isTurnMistake) return;


    // Sky Flight Jetpack (Flies safely above ground obstacles)
    if (this.jetpackTimer > 0 && !isTurnMistake) {
      return;
    }

    // Check Junoon Fever Rush (Unstoppable Hyper Speed Smash)
    if (this.isFeverActive && !isTurnMistake) {
      obstacle.isHit = true;
      audio?.playSmashObstacle?.();
      this.cameraShakeTimer = 0.25;
      this.particles?.createCelebrationConfetti?.(obstacle.mesh?.position || this.player.position, 28);
      this.particles?.createImpactDust?.(this.player.position, 14);
      this.ui?.showAnnouncement?.(`🔥 JUNOON FEVER SMASH! Obliterated ${reason}! +500 PTS`, '#00e5ff');
      this.ui?.showFloatingFeedback?.('🔥 FEVER SMASH! +500', this.player.position, '#00e5ff');
      this.awardRunnerXP(500);
      this.score += 500;
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Check 🏏 Tape-Ball Cricket Master Bat (Smash Obstacle Out of the Park for SIX!)
    if (this.cricketBatTimer > 0 && !isTurnMistake) {
      obstacle.isHit = true;
      audio?.playCricketCrack?.();
      audio?.playMusicalHorn?.();
      this.cameraShakeTimer = 0.35;
      this.particles?.createCelebrationConfetti?.(obstacle.mesh?.position || this.player.position, 35);
      this.particles?.createImpactDust?.(this.player.position, 18);
      this.recordRunnerStunt('🏏 SIXER! HIT OUT OF THE PARK!', 600);
      this.addFeverCharge(15);
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Check 🛹 Qingqi Hover-Surfer Skateboard (Crash Absorption)
    if (this.hoverboardTimer > 0 && !isTurnMistake) {
      obstacle.isHit = true;
      audio?.playCrash?.();
      this.hoverboardTimer = 0;
      this.hoverboardCooldown = 15.0;
      if (this.hoverboardMesh) {
        this.hoverboardMesh.visible = false;
      }
      this.runnerInvulnerableTimer = 2.5;
      this.cameraShakeTimer = 0.3;
      this.particles?.createDevourSparkles?.(this.player.position, 30, 0x00e5ff);
      this.ui?.showAnnouncement?.(`🛹 HOVERBOARD CRASH SHIELD! Saved from ${reason}! (2.5s Grace)`, '#00e5ff');
      this.ui?.showFloatingFeedback?.('🛹 HOVER SHIELD SAVED YOU!', this.player.position, '#00e5ff');
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Check Super Chingchi Rickshaw (Chaos Smash Mode)
    if (this.chingchiTimer > 0 && !isTurnMistake) {
      obstacle.isHit = true;
      audio.playSmashObstacle();
      this.cameraShakeTimer = 0.35;
      this.particles.createCelebrationConfetti(obstacle.mesh?.position || this.player.position, 28);
      this.particles.createImpactDust(this.player.position, 16);
      this.ui.showAnnouncement(`🛺💥 CHINGCHI SMASH! Demolished ${reason}! +1,000 PTS`, '#ffd600');
      this.ui.showFloatingFeedback('🛺 RAMMED! +1000', this.player.position, '#ffd600');
      this.awardRunnerXP(1000);
      this.score += 1000;
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Check CNG Turbo Nitro (Invulnerability Smash)
    if (this.nitroTimer > 0 && !isTurnMistake) {
      obstacle.isHit = true;
      audio.playCrash();
      this.particles.createDevourSparkles(obstacle.mesh?.position || this.player.position, 20, 0xffd700);
      this.ui.showAnnouncement(`💥 CNG NITRO SMASH! Obliterated ${reason}! +500 XP`, '#ff9100');
      this.awardRunnerXP(500);
      this.score += 500;
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Check Water Tanker Iron Shield (Impact Absorption)
    if (this.shieldTimer > 0 && !isTurnMistake) {
      obstacle.isHit = true;
      audio.playCrash();
      this.shieldTimer = 0;
      if (this.player) this.player.isShielded = false;
      this.runnerInvulnerableTimer = 2.0;
      this.cameraShakeTimer = 0.3;
      this.particles.createSkidSmoke(this.player.position, 10);
      this.ui.showAnnouncement(`🛡️ WATER TANKER SHIELD BROKE! Absorbed Impact on ${reason}! (2s Grace)`, '#00e5ff');
      this.ui.showFloatingFeedback('🛡️ SHIELD BROKE!', this.player.position, '#00e5ff');
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      return;
    }

    // Deduct 1 Heart
    this.recordCrash({
      reason,
      obstacleType: obstacle.type || 'unknown',
      distanceMeters: this.distanceMeters,
      currentSpeed: this.player?.currentSpeed || 0,
      area: this.currentMilestone || ''
    });
    obstacle.isHit = true;
    this.hearts = Math.max(0, this.hearts - 1);
    this.ui.showAnnouncement(
      `❌ ${reason} — 1 HEART LOST · ${this.hearts} LEFT`,
      '#ff1744',
      { priority: 1, duration: 4000 }
    );
    audio.playCrash();
    audio.vibrate([120, 60, 160]);
    this.cameraShakeTimer = 0.45;
    this.particles.createSkidSmoke(this.player.position, 12);

    // Deflect and remove the hit obstacle so player never gets trapped behind it
    if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);

    if (this.hearts > 0) {
      // Grant 2.0s invulnerability grace window so player has time to orient themselves
      this.runnerInvulnerableTimer = 2.0;

      let hint = 'Switch [A/D]!';
      const rLower = (reason || '').toLowerCase();
      if (rLower.includes('wire')) hint = 'Slide [S]!';
      else if (rLower.includes('gutter') || rLower.includes('digging') || rLower.includes('sewage')) hint = 'Jump [W/Space]!';

      this.particles.createSkidSmoke(this.player.position, 16);
      this.particles.createImpactDust(this.player.position, 12);
      this.ui.showFloatingFeedback(`⚠️ ${hint} · 2s GRACE`, this.player.position, '#ff1744');

      // Trigger Stumble: reduce currentSpeed to baseSpeed * 0.75 for 1.5 seconds
      const origSpeed = this.player.currentSpeed;
      this.player.currentSpeed = this.player.baseSpeed * 0.75;
      this.runnerStumbleTimer = 1.5;
      if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.triggerStumble && this.player?.avatarMesh) {
        AvatarBuilder.triggerStumble(this.player.avatarMesh, 1.5);
      }
      setTimeout(() => {
        if (this.player && !this.isGameOver) {
          this.player.currentSpeed = Math.max(origSpeed, this.player.baseSpeed);
        }
      }, 1500);
    } else {
      this.triggerTempleRunGameOver(reason, obstacle);
    }
  }

  recordCrash({ reason, obstacleType, distanceMeters, area, currentSpeed } = {}) {
    const dist = Number.isFinite(Number(distanceMeters)) ? Number(distanceMeters) : (this.distanceMeters || 0);
    const speed = Number.isFinite(Number(currentSpeed)) ? Number(currentSpeed) : (this.player?.currentSpeed || 0);
    const obsType = obstacleType || 'unknown';
    const locArea = area || this.currentMilestone || '';

    try {
      this.opsEngine ||= new PortableGameOpsEngine();
      return this.opsEngine.recordCrash({
        reason,
        obstacleType: obsType,
        distanceMeters: dist,
        currentSpeed: speed,
        area: locArea
      });
    } catch (error) {
      console.error('[GAME_OPS] Could not record crash telemetry.', error);
    }
  }

  recordProgressionFunnel(distanceMeters) {
    const dist = Number.isFinite(Number(distanceMeters)) ? Number(distanceMeters) : (this.distanceMeters || 0);
    const speed = this.player?.currentSpeed || 0;
    const milestoneName = this.currentMilestone || `${dist}m`;

    try {
      this.opsEngine ||= new PortableGameOpsEngine();
      return this.opsEngine.recordProgression({
        distanceMeters: dist,
        milestone: milestoneName,
        currentSpeed: speed,
        hearts: this.hearts,
        area: this.currentMilestone || '',
        score: this.score || 0
      });
    } catch (error) {
      console.error('[GAME_OPS] Could not record funnel progression.', error);
    }
  }

  recordGameOpsEvent(type, detail) {
    try {
      this.opsEngine ||= new PortableGameOpsEngine();
      this.opsEngine.record(type, detail);
    } catch (error) {
      console.error('[GAME_OPS] Could not maintain the local operations log.', error);
    }
  }

  getDeathResolutionType(reason, obstacle) {
    const obsType = (obstacle?.type || '').toLowerCase();
    const rLower = (reason || '').toLowerCase();

    // 1. Gutter / Manhole / Pothole / Sewage / Void death
    if (
      obsType === 'gutter' ||
      obsType === 'pothole' ||
      obsType === 'sewage' ||
      obsType === 'digging' ||
      rLower.includes('gutter') ||
      rLower.includes('manhole') ||
      rLower.includes('pothole') ||
      rLower.includes('sewage') ||
      rLower.includes('digging')
    ) {
      return 'gutter';
    }

    // 2. Vehicle / Wall Crash (default for all obstacles/traffic/walls/scaffolds)
    return 'vehicle_crash';
  }

  /**
   * Game Over when runner runs out of hearts with hazard-specific death resolutions:
   * 1. Gutter/Manhole Death: Player drops instantly on Y-axis into void with heavy splash, camera looks down into hole.
   * 2. Vehicle/Wall Crash: Player stops instantly, backward ragdoll/knockback, camera jolts violently.
   * Audio: Dynamic background music pitch resets on death.
   */
  triggerTempleRunGameOver(reason, obstacle = null) {
    this.isGameOver = true;
    this.isPaused = true;
    if (typeof audio !== 'undefined' && audio.resetMusicPitch) {
      audio.resetMusicPitch(); // Requirement 4: reset pitch on death
    }

    const deathType = this.getDeathResolutionType(reason, obstacle);

    const ranked = [...(this.holes || [])].sort((a, b) => b.score - a.score);
    this.ui.showGameOver({
      rankedHoles: ranked,
      player: this.player,
      isCrash: true,
      distanceMeters: Math.round(this.distanceMeters),
      coins: this.coins,
      runScore: this.score,
      reviveTokens: saveManager.getReviveTokenCount(),
      crashReason: reason || 'Karachi Street Hazard',
      deathType,
      canAdvanceNext: false
    });

    if (deathType === 'gutter') {
      this.executeGutterDeathResolution();
    } else {
      this.executeVehicleCrashDeathResolution();
    }
  }

  /**
   * 1. Gutter/Manhole Death: Player drops instantly on the Y-axis into the void with a heavy splash sound,
   * followed by the camera looking down into the hole.
   */
  executeGutterDeathResolution() {
    this.cancelRunnerDeathAnimation();
    audio.playWaterSplash();
    audio.playGameOver();

    if (this.player) {
      this.player.currentSpeed = 0;
      this.player.isGrounded = false;
    }

    const holeX = this.player ? this.player.position.x : 0;
    const holeY = this.player ? this.getCorridorGroundHeight(this.player.position.z, this.player.position.x) : 0;
    const holeZ = this.player ? this.player.position.z : 0;

    // Heavy splash particles & sewer spray at hole rim
    this.particles?.createImpactDust?.(new THREE.Vector3(holeX, holeY + 0.1, holeZ), 32);
    this.particles?.createDevourSparkles?.(new THREE.Vector3(holeX, holeY + 0.1, holeZ), 25, 0x00bcd4);
    this.particles?.createSkidSmoke?.(new THREE.Vector3(holeX, holeY + 0.1, holeZ), 20);

    // Trigger panic flailing animation
    if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.triggerGutterFall && this.player?.avatarMesh) {
      AvatarBuilder.triggerGutterFall(this.player.avatarMesh);
    }

    // Instant Y-drop into void
    let elapsed = 0;
    const duration = 1.35;
    const startY = this.player ? this.player.position.y : 0;
    const targetDropY = startY - 5.5;

    // Camera overhead position looking down into the hole
    const targetCamX = holeX;
    const targetCamY = holeY + 4.8;
    const targetCamZ = holeZ + 0.9;
    const targetLookX = holeX;
    const targetLookY = holeY - 4.2;
    const targetLookZ = holeZ - 0.2;

    this.runnerDeathAnimation = setInterval(() => {
      elapsed += 0.033;
      const t = Math.min(1.0, elapsed / duration);
      const easeT = t * t; // accelerating gravity drop

      if (this.player) {
        this.player.position.y = THREE.MathUtils.lerp(startY, targetDropY, easeT);
        if (this.player.group) {
          this.player.group.position.y = this.player.position.y;
        }
        if (this.player.avatarMesh) {
          const s = Math.max(0.1, 1.0 - t * 0.7);
          this.player.avatarMesh.scale.set(s, s, s);
          this.player.avatarMesh.rotation.y += 0.15;
          AvatarBuilder.updateAnimation?.(this.player.avatarMesh, false, 0.033, 1.0, false);
        }
      }

      // Camera smoothly tracks directly over the hole looking down into the dark abyss
      if (this.camera) {
        this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.14);
        this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, 0.14);
        this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 0.14);
        this.camera.lookAt(targetLookX, targetLookY, targetLookZ);
      }

      if (t >= 1.0) {
        this.cancelRunnerDeathAnimation();
      }
    }, 33);
  }

  /**
   * 2. Vehicle/Wall Crash: Player stops instantly, plays a backward ragdoll/knockback animation,
   * and the camera jolts violently.
   */
  executeVehicleCrashDeathResolution() {
    this.cancelRunnerDeathAnimation();
    audio.playCrash();
    audio.playGameOver();

    // Violent camera jolt
    this.cameraShakeTimer = 0.95;
    if (this.camera) {
      this.camera.position.z += 1.2;
      this.camera.position.y += 0.6;
      this.camera.rotation.z += (Math.random() - 0.5) * 0.12;
    }

    if (this.player) {
      this.player.currentSpeed = 0;
    }

    // Impact debris & smoke
    this.particles?.createImpactDust?.(this.player.position, 28);
    this.particles?.createSkidSmoke?.(this.player.position, 22);

    if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.triggerBackwardRagdoll && this.player?.avatarMesh) {
      AvatarBuilder.triggerBackwardRagdoll(this.player.avatarMesh);
    }

    const startZ = this.player ? this.player.position.z : 0;
    const targetKnockbackZ = startZ + 2.8; // Knocked back along +Z
    const groundY = this.getCorridorGroundHeight(startZ, this.player ? this.player.position.x : 0);

    let elapsed = 0;
    const duration = 1.0;

    this.runnerDeathAnimation = setInterval(() => {
      elapsed += 0.033;
      const t = Math.min(1.0, elapsed / duration);
      const easeOut = Math.sin(t * Math.PI * 0.5);

      if (this.player) {
        // Parabolic backward arc: rises slightly then lands flat on asphalt
        const arcY = Math.sin(t * Math.PI) * 0.8;
        this.player.position.z = THREE.MathUtils.lerp(startZ, targetKnockbackZ, easeOut);
        this.player.position.y = groundY + arcY;
        if (this.player.group) {
          this.player.group.position.z = this.player.position.z;
          this.player.group.position.y = this.player.position.y;
        }
        if (this.player.avatarMesh) {
          // Backward flip / settle on back
          this.player.avatarMesh.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.48, easeOut);
          AvatarBuilder.updateAnimation?.(this.player.avatarMesh, false, 0.033, 1.0, false);
        }
      }

      // Camera recoil & focus on fallen player
      if (this.camera && this.player) {
        this.camera.lookAt(this.player.position.x, groundY + 0.8, this.player.position.z);
      }

      if (t >= 1.0) {
        this.cancelRunnerDeathAnimation();
      }
    }, 33);
  }

  cancelRunnerDeathAnimation() {
    if (this.runnerDeathAnimation !== undefined) {
      clearInterval(this.runnerDeathAnimation);
      this.runnerDeathAnimation = undefined;
    }
  }

  /**
   * Spend one saved Rescue Token to continue a crashed run.
   */
  quickReviveWithChai() {
    if (!this.player || !this.isTempleRun || !this.isGameOver) return false;
    if (saveManager.getReviveTokenCount() < 1) return false;
    if (!saveManager.consumeReviveToken()) {
      this.ui.showCrashReviveError('Could not save the token change. Check device storage and try again.');
      return false;
    }

    this.cancelRunnerDeathAnimation();
    this.isFastFalling = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.laneChangeTimer = this.laneChangeDuration || 0.18;
    this.laneChangeStartX = 0;
    audio.playPowerUp();
    audio.playChaiSip();
    audio.resumeAudio();

    this.isGameOver = false;
    this.isPaused = false;
    this.hearts = 2; // Revive with 2 hearts
    this.nitroTimer = 4.0; // 4 seconds CNG Turbo Invulnerable Blast
    this.runnerInvulnerableTimer = 4.0;

    // Reset player position cleanly to center lane
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.player.position.x = 0;
    this.player.isGrounded = true;
    this.player.position.y = this.getCorridorGroundHeight(this.player.position.z, 0);
    this.player.velocityY = 0;
    if (this.player.group) {
      this.player.group.position.x = 0;
      this.player.group.position.y = this.player.position.y;
    }
    if (this.player.avatarMesh) {
      this.player.avatarMesh.visible = true;
      this.player.avatarMesh.scale.set(1, 1, 1);
      this.player.avatarMesh.position.y = 0;
      if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.resetDeathAnimation) {
        AvatarBuilder.resetDeathAnimation(this.player.avatarMesh);
      }
    }
    if (typeof audio !== 'undefined' && audio.resetMusicPitch) {
      audio.resetMusicPitch();
    }

    // Clear nearby obstacles & traffic within 45 meters forward
    const pZ = this.player.position.z;
    if (this.runnerObstacles) {
      for (let i = this.runnerObstacles.length - 1; i >= 0; i--) {
        const obs = this.runnerObstacles[i];
        if (obs && Math.abs(obs.z - pZ) < 45.0) {
          if (obs.mesh) this.disposeRunnerObject(obs.mesh);
          this.runnerObstacles.splice(i, 1);
        }
      }
    }
    if (this.runnerTraffic) {
      for (let i = this.runnerTraffic.length - 1; i >= 0; i--) {
        const v = this.runnerTraffic[i];
        if (v && v.mesh && Math.abs(v.mesh.position.z - pZ) < 45.0) {
          this.disposeRunnerObject(v.mesh);
          this.runnerTraffic.splice(i, 1);
        }
      }
    }

    this.runnerStumbleTimer = 0;
    this.doubleCoinsTimer = 0;

    this.particles.createCelebrationConfetti(this.player.position, 35);
    this.particles.createDevourSparkles(this.player.position, 40, 0x76ff03);
    this.ui.updateReviveTokenCount(saveManager.getReviveTokenCount());
    if (this.ui.hud) this.ui.hud.style.display = '';
    this.ui.showAnnouncement('☕ RESCUE TOKEN USED! KADAK CHAI REVIVAL!', '#76ff03');
    this.ui.showFloatingFeedback('☕ REVIVED!', this.player.position, '#76ff03');
    return true;
  }

  /**
   * Recover the runner after a stalled forward-position watchdog check.
   */
  recoverStuckRunner() {
    if (!this.player) return;
    const previousPosition = {
      x: Number(this.player.position.x.toFixed(2)),
      z: Number(this.player.position.z.toFixed(2))
    };
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.player.position.x = 0;
    this.player.position.z = Math.min(this.player.position.z, (this.lastRunnerZ ?? this.player.position.z) - 1);
    this.player.position.y = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    if (this.player.group) this.player.group.position.copy(this.player.position);
    this.isSliding = false;
    this.slideTimer = 0;
    if (this.player.avatarMesh) {
      this.player.avatarMesh.scale.set(1, 1, 1);
      this.player.avatarMesh.position.y = 0;
    }
    this.lastRunnerZ = this.player.position.z;
    this.recordGameOpsEvent('fix.applied', {
      rule: 'recover-stalled-runner',
      summary: 'Returned stalled runner to the center lane and resumed forward movement.',
      previousPosition,
      position: {
        x: Number(this.player.position.x.toFixed(2)),
        z: Number(this.player.position.z.toFixed(2))
      }
    });
    this.ui.showFloatingFeedback('↔ POSITION RESTORED', this.player.position, '#00e5ff');
  }

  /**
   * Create 3D Karachi Power-Up Collectible Orb
   */
  createRunnerPowerupMesh(type) {
    const group = new THREE.Group();
    if (type === 'revive_token') {
      const token = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.12, 24),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xb8860b,
          emissiveIntensity: 0.65,
          metalness: 0.8,
          roughness: 0.22
        })
      );
      token.rotation.x = Math.PI / 2;
      group.add(token);
      group.add(new THREE.Mesh(
        new THREE.TorusGeometry(0.64, 0.07, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      ));
      group.userData = { powerupType: type, isRare: true };
      return group;
    }

    if (type === 'mystery_box') {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.72, 0.72),
        new THREE.MeshStandardMaterial({
          color: 0x9c27b0,
          emissive: 0xba68c8,
          emissiveIntensity: 0.65,
          metalness: 0.4,
          roughness: 0.3
        })
      );
      box.position.y = 0.95;
      group.add(box);

      const ribbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.75, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      ribbon.position.y = 0.95;
      group.add(ribbon);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.06, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xffeb3b })
      );
      ring.position.y = 0.95;
      group.add(ring);
      group.userData = { powerupType: type, isMystery: true };
      return group;
    }

    if (type === 'chingchi') {
      const rickshawBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.5, 0.9),
        new THREE.MeshStandardMaterial({
          color: 0x00e676,
          emissive: 0x00c853,
          emissiveIntensity: 0.5,
          metalness: 0.6,
          roughness: 0.2
        })
      );
      rickshawBody.position.y = 0.85;
      group.add(rickshawBody);

      const canopy = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.45, 0.15, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd600 })
      );
      canopy.position.y = 1.15;
      group.add(canopy);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.06, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xffd600 })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.85;
      group.add(halo);

      group.userData = { powerupType: type, isChingchi: true };
      return group;
    }

    if (type === 'jetpack') {
      const rocketKettle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.68, 12),
        new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          emissive: 0x00b0ff,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      rocketKettle.position.y = 0.95;
      group.add(rocketKettle);

      const nozzleL = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.24, 8),
        new THREE.MeshBasicMaterial({ color: 0xff9100 })
      );
      nozzleL.rotation.x = Math.PI;
      nozzleL.position.set(-0.2, 0.6, 0);
      group.add(nozzleL);

      const nozzleR = nozzleL.clone();
      nozzleR.position.x = 0.2;
      group.add(nozzleR);

      const wings = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.05, 0.25),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      wings.position.y = 0.95;
      group.add(wings);

      group.userData = { powerupType: type, isJetpack: true };
      return group;
    }

    if (type === 'cricket_bat') {
      const bat = KarachiModels.createCricketBatPickup();
      bat.position.y = 0.85;
      group.add(bat);
      group.userData = { powerupType: type, isCricketBat: true };
      return group;
    }

    let color = 0x00e5ff;
    if (type === 'cng') color = 0x00e5ff;
    else if (type === 'shield') color = 0x00bcd4;
    else if (type === 'magnet') color = 0xffd700;
    else if (type === 'chai') color = 0xff7043;
    else if (type === 'jump') color = 0x76ff03;

    const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 1.0;
    group.add(sphere);

    const haloGeo = new THREE.RingGeometry(0.65, 0.85, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.0;
    group.add(halo);

    group.userData = { powerupType: type };
    return group;
  }

  /**
   * Spawn a wave of Karachi street obstacles and coins ahead along the 3-lane corridor
   */
  spawnRunnerWave(waveZ) {
    const lanes = [-this.laneWidth, 0, this.laneWidth]; // [-3.2, 0, 3.2]
    const obstacleStartIndex = this.runnerObstacles.length;
    const trafficStartIndex = this.runnerTraffic.length;
    const boostPadStartIndex = this.runnerBoostPads.length;
    const coinStartIndex = this.runnerCoins.length;
    const powerupStartIndex = this.runnerPowerups.length;
    const tokenStartIndex = this.runnerReviveTokens.length;

    const alignWaveGroundY = () => {
      for (let i = obstacleStartIndex; i < this.runnerObstacles.length; i++) {
        const obs = this.runnerObstacles[i];
        if (obs && obs.mesh) {
          const gy = this.getCorridorGroundHeight(obs.z ?? obs.mesh.position.z, obs.laneX || 0);
          obs.mesh.position.y += gy;
        }
      }
      for (let i = trafficStartIndex; i < this.runnerTraffic.length; i++) {
        const v = this.runnerTraffic[i];
        if (v && v.mesh) {
          const gy = this.getCorridorGroundHeight(v.mesh.position.z, v.laneX || 0);
          v.mesh.position.y += gy;
        }
      }
      for (let i = boostPadStartIndex; i < this.runnerBoostPads.length; i++) {
        const pad = this.runnerBoostPads[i];
        if (pad && pad.mesh) {
          const gy = this.getCorridorGroundHeight(pad.z ?? pad.mesh.position.z, pad.laneX || 0);
          pad.mesh.position.y += gy;
        }
      }
      for (let i = coinStartIndex; i < this.runnerCoins.length; i++) {
        const c = this.runnerCoins[i];
        if (c && c.mesh) {
          const gy = this.getCorridorGroundHeight(c.z ?? c.mesh.position.z, c.x || 0);
          c.mesh.position.y += gy;
        }
      }
      for (let i = powerupStartIndex; i < this.runnerPowerups.length; i++) {
        const pu = this.runnerPowerups[i];
        if (pu && pu.mesh) {
          const gy = this.getCorridorGroundHeight(pu.z ?? pu.mesh.position.z, pu.x || 0);
          pu.mesh.position.y += gy;
        }
      }
      for (let i = tokenStartIndex; i < this.runnerReviveTokens.length; i++) {
        const tok = this.runnerReviveTokens[i];
        if (tok && tok.mesh) {
          const gy = this.getCorridorGroundHeight(tok.z ?? tok.mesh.position.z, tok.laneX || 0);
          tok.mesh.position.y += gy;
        }
      }
    };

    // Safety approach & junction zone: 100% hurdle-free and coin-free asphalt runway for ultra-smooth turning!
    if (this.isRunnerJunctionZone(waveZ)) {
      alignWaveGroundY();
      return;
    }

    // 0. Safe Onboarding Warmup Zone (First 50 meters): Spawn ONLY pleasant golden coin paths!
    if (this.distanceMeters < 50) {
      const laneX = lanes[Math.floor(Math.random() * 3)];
      [-4.0, -2.0, 0, 2.0, 4.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(laneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: laneX, z: waveZ + zOff });
      });
      alignWaveGroundY();
      return;
    }

    // Periodic "W-11 Minibus Surfing" Set-Piece Chunk (Trigger ramp + moving W-11 + bridge signs)
    if (this.distanceMeters >= (this.nextSurfingBusDist || 60) && !this.isBusSurfing && (!this.surfingBuses || this.surfingBuses.length === 0) && !this.runnerJunction) {
      this.nextSurfingBusDist = this.distanceMeters + 180;
      this.spawnW11SurfingSetPiece(waveZ);
      alignWaveGroundY();
      return;
    }

    const localArchetypes = this.currentDistrictLevel === 1
      ? ['soldier_tanker']
      : this.currentDistrictLevel === 2
        ? ['lyari_football']
        : this.currentDistrictLevel === 3
          ? ['saddar_handcart', 'saddar_scaffold']
          : [];
    const archetypes = [...Array(8).keys(), ...localArchetypes];
    const archetype = this.runnerSection?.type === 'underpass' && Math.random() < 0.6
      ? 0
      : archetypes[Math.floor(Math.random() * archetypes.length)];

    if (archetype === 0) {
      // Low hanging wires span the road; slide underneath.
      const wires = KarachiModels.createHangingWireHazard(12.4);
      wires.position.set(0, 0, waveZ);
      this.scene.add(wires);
      this.runnerObstacles.push({
        type: 'wire',
        hazardType: 'HIGH_HAZARD',
        z: waveZ,
        requiredAction: 'slide',
        mesh: wires,
        isHit: false
      });

      // Line of coins before and after wire
      [-4.0, -2.0, 2.0, 4.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(0, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: 0, z: waveZ + zOff });
      });
    } else if (archetype === 1) {
      // 2. Open Unpaved Gutter (LOW_HAZARD - Must JUMP over!)
      const gutterLaneIdx = Math.floor(Math.random() * 3);
      const gutterLaneX = lanes[gutterLaneIdx];
      const gutter = KarachiModels.createOpenGutterHazard(1.4);
      gutter.position.set(gutterLaneX, 0.04, waveZ);
      this.scene.add(gutter);
      this.runnerObstacles.push({
        type: 'gutter',
        hazardType: 'LOW_HAZARD',
        laneX: gutterLaneX,
        z: waveZ,
        requiredAction: 'jump',
        mesh: gutter,
        isHit: false
      });

      // Arch of 3 coins right over the gutter
      [-2.2, 0, 2.2].forEach((zOff, idx) => {
        const coin = KarachiModels.createRupeeCoin(50);
        const yH = idx === 1 ? 1.65 : 0.95;
        coin.position.set(gutterLaneX, yH, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: gutterLaneX, z: waveZ + zOff });
      });

      // Free lane coins
      const freeLaneX = lanes[(gutterLaneIdx + 1) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 2) {
      // 3. Unannounced KMC Road Digging & Construction Rubble (LOW_HAZARD - Must JUMP or switch lane)
      const digLaneIdx = Math.floor(Math.random() * 3);
      const digLaneX = lanes[digLaneIdx];
      const rubble = KarachiModels.createRoadDiggingObstacle(2.8);
      rubble.position.set(digLaneX, 0, waveZ);
      this.scene.add(rubble);
      this.runnerObstacles.push({
        type: 'digging',
        hazardType: 'LOW_HAZARD',
        laneX: digLaneX,
        z: waveZ,
        requiredAction: 'jump_or_dodge',
        mesh: rubble,
        isHit: false
      });

      const freeLaneX = lanes[(digLaneIdx + 1) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 3) {
      // 4. Stalled Qingqi Rickshaw (FULL_BLOCK - Must switch lane)
      const rickLaneIdx = Math.floor(Math.random() * 3);
      const rickLaneX = lanes[rickLaneIdx];
      const rick = KarachiModels.createStalledRickshawObstacle();
      rick.position.set(rickLaneX, 0, waveZ);
      this.scene.add(rick);
      this.runnerObstacles.push({
        type: 'rickshaw',
        hazardType: 'FULL_BLOCK',
        laneX: rickLaneX,
        z: waveZ,
        requiredAction: 'dodge',
        mesh: rick,
        isHit: false
      });

      const freeLaneX = lanes[(rickLaneIdx + 2) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 4) {
      // 5. Overflowing Sewage Water Spill (LOW_HAZARD - Must JUMP or switch lane)
      const sewLaneIdx = Math.floor(Math.random() * 3);
      const sewLaneX = lanes[sewLaneIdx];
      const sewage = KarachiModels.createSewageSpillHazard(3.0);
      sewage.position.set(sewLaneX, 0, waveZ);
      this.scene.add(sewage);
      this.runnerObstacles.push({
        type: 'sewage',
        hazardType: 'LOW_HAZARD',
        laneX: sewLaneX,
        z: waveZ,
        requiredAction: 'jump_or_dodge',
        mesh: sewage,
        isHit: false
      });

      const freeLaneX = lanes[(sewLaneIdx + 1) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 5) {
      // 6. 70cc Snatcher Motorcycle (FULL_BLOCK - Evade or blast with King Pressure Horn [H]!)
      const bikeLaneIdx = Math.floor(Math.random() * 3);
      const bikeLaneX = lanes[bikeLaneIdx];
      const bike = KarachiModels.createSnatcherMotorbike();
      bike.position.set(bikeLaneX, 0, waveZ);
      this.scene.add(bike);
      this.runnerObstacles.push({
        type: 'snatcher',
        hazardType: 'FULL_BLOCK',
        laneX: bikeLaneX,
        z: waveZ,
        requiredAction: 'dodge_or_horn',
        mesh: bike,
        isHit: false
      });

      const freeLaneX = lanes[(bikeLaneIdx + 1) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 6) {
      // 7. NASCAR Highway Traffic Convoy (Cruising vehicle - Draft behind for 100% Slingshot Turbo!)
      const trafficLaneIdx = Math.floor(Math.random() * 3);
      const trafficLaneX = lanes[trafficLaneIdx];
      const vTypes = ['bedford', 'w11', 'tanker', 'rickshaw'];
      const vChoice = vTypes[Math.floor(Math.random() * vTypes.length)];
      let vMesh, vLabel, vSpeed, vWidth;

      if (vChoice === 'bedford') {
        vMesh = KarachiModels.createBedfordTruck();
        vLabel = '🚚 Bedford Truck';
        vSpeed = 13.0;
        vWidth = 2.0;
      } else if (vChoice === 'w11') {
        vMesh = KarachiModels.createW11MiniBus();
        vLabel = '🚐 W11 Minibus';
        vSpeed = 15.0;
        vWidth = 1.8;
      } else if (vChoice === 'tanker') {
        vMesh = KarachiModels.createWaterTanker();
        vLabel = '🚰 Water Tanker';
        vSpeed = 12.0;
        vWidth = 2.1;
      } else {
        vMesh = KarachiModels.createAutoRickshaw();
        vLabel = '🛺 Qingqi Rickshaw';
        vSpeed = 11.0;
        vWidth = 1.5;
      }

      vMesh.position.set(trafficLaneX, 0, waveZ);
      this.scene.add(vMesh);

      // Attach Aerodynamic Slipstream Streamlines to rear
      const ribbons = KarachiModels.createSlipstreamRibbons(vWidth, 7.5);
      vMesh.add(ribbons);

      this.runnerTraffic.push({
        type: 'traffic_vehicle',
        hazardType: 'FULL_BLOCK',
        mesh: vMesh,
        laneX: trafficLaneX,
        speed: vSpeed,
        label: vLabel,
        ribbons,
        isHit: false,
        nearMissAwarded: false
      });

      // Free lane coins
      const freeLaneX = lanes[(trafficLaneIdx + 1) % 3];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(freeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: freeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 7) {
      // 8. NASCAR Asphalt Boost Pad OR Hydraulic Spring Trampoline Launch Pad
      const padLaneIdx = Math.floor(Math.random() * 3);
      const padLaneX = lanes[padLaneIdx];
      const isSpring = Math.random() < 0.5;
      const pad = isSpring
        ? KarachiModels.createSpringLaunchPad(2.4, 3.8)
        : KarachiModels.createAsphaltBoostPad(2.4, 4.2);
      pad.position.set(padLaneX, 0.02, waveZ);
      this.scene.add(pad);
      this.runnerBoostPads.push({
        mesh: pad,
        laneX: padLaneX,
        z: waveZ,
        isUsed: false,
        isSpringPad: isSpring
      });

      // Line of high-value golden coins along the boost/spring pad trajectory
      [-2.0, 0, 2.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(100);
        coin.position.set(padLaneX, isSpring ? 2.8 : 0.8, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 100, x: padLaneX, z: waveZ + zOff, isRoofCoin: isSpring });
      });
    } else if (archetype === 'soldier_tanker') {
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];
      const tanker = KarachiModels.createWaterTanker();
      tanker.position.set(laneX, 0, waveZ);
      this.scene.add(tanker);
      this.runnerObstacles.push({
        type: 'water_tanker',
        hazardType: 'FULL_BLOCK',
        laneX,
        z: waveZ,
        requiredAction: 'dodge',
        mesh: tanker,
        isHit: false
      });
      tanker.userData.patrolAreaLevel = 1;

      const safeLaneX = lanes[(lanes.indexOf(laneX) + 1) % lanes.length];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(safeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: safeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 'lyari_football') {
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];
      const football = KarachiModels.createLyariStreetFootball();
      football.position.set(laneX, 0, waveZ);
      this.scene.add(football);
      this.runnerObstacles.push({
        type: 'football',
        hazardType: 'LOW_HAZARD',
        laneX,
        z: waveZ,
        requiredAction: 'dodge',
        mesh: football,
        isHit: false
      });
      football.userData.patrolAreaLevel = 2;

      const safeLaneX = lanes[(lanes.indexOf(laneX) + 1) % lanes.length];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(safeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: safeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 'saddar_handcart') {
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];
      const handcart = KarachiModels.createSaddarMarketHandcart();
      handcart.position.set(laneX, 0, waveZ);
      this.scene.add(handcart);
      this.runnerObstacles.push({
        type: 'market_cart',
        hazardType: 'FULL_BLOCK',
        laneX,
        z: waveZ,
        requiredAction: 'dodge',
        mesh: handcart,
        isHit: false
      });
      handcart.userData.patrolAreaLevel = 3;

      const safeLaneX = lanes[(lanes.indexOf(laneX) + 1) % lanes.length];
      [-3.0, 0, 3.0].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(safeLaneX, 0, waveZ + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: safeLaneX, z: waveZ + zOff });
      });
    } else if (archetype === 'saddar_scaffold') {
      const scaffold = KarachiModels.createSaddarHeritageScaffold(7.5);
      scaffold.position.set(0, 0, waveZ);
      this.scene.add(scaffold);
      this.runnerObstacles.push({
        type: 'heritage_scaffold',
        hazardType: 'HIGH_HAZARD',
        z: waveZ,
        requiredAction: 'slide',
        mesh: scaffold,
        isHit: false
      });
      scaffold.userData.patrolAreaLevel = 3;
    }

    const runnerWeather = this.getRunnerWeatherState();
    const isPotholeWeather = runnerWeather === 'potholes' || runnerWeather === 'rain' || this.runnerRainOverride === true;
    if (isPotholeWeather &&
        !this.runnerObstacles.slice(obstacleStartIndex).some(obstacle =>
          obstacle.type === 'wire' || obstacle.type === 'heritage_scaffold'
        )) {
      const blockedLanes = [
        ...this.runnerObstacles.slice(obstacleStartIndex).map(obstacle => obstacle.laneX),
        ...this.runnerTraffic.slice(trafficStartIndex).map(vehicle => vehicle.laneX),
        ...this.runnerBoostPads.slice(boostPadStartIndex).map(pad => pad.laneX)
      ];
      const openLanes = lanes.filter(laneX =>
        !blockedLanes.some(blockedLaneX =>
          Number.isFinite(blockedLaneX) && Math.abs(blockedLaneX - laneX) < 0.1
        )
      );
      const potholeCount = (runnerWeather === 'rain' || this.runnerRainOverride === true)
        ? (this.runnerWaveCount % 2 === 0 ? 2 : 1)
        : (this.runnerWaveCount % 3 === 2 ? 2 : 1);
      for (let index = 0; index < Math.min(potholeCount, openLanes.length - 1); index++) {
        const laneX = openLanes[(this.runnerWaveCount + index) % openLanes.length];
        const pothole = this.createRunnerPotholeMesh();
        pothole.position.set(laneX, 0, waveZ - (index * 3.0));
        this.scene.add(pothole);
        this.runnerObstacles.push({
          type: 'pothole',
          hazardType: 'LOW_HAZARD',
          laneX,
          z: waveZ - (index * 3.0),
          requiredAction: 'jump_or_dodge',
          mesh: pothole,
          isHit: false
        });
      }
    }

    const challengeTier = this.getRunnerChallengeTier();
    const obstaclesThisWave = this.runnerObstacles.slice(obstacleStartIndex);
    const hasFullWidthHazard = obstaclesThisWave.some(obstacle =>
      obstacle.type === 'wire' || obstacle.type === 'heritage_scaffold'
    );
    const blockedLanes = [
      ...obstaclesThisWave.map(obstacle => obstacle.laneX),
      ...this.runnerTraffic.slice(trafficStartIndex).map(vehicle => vehicle.laneX)
    ];
    const occupiedLanes = lanes.filter(laneX =>
      blockedLanes.some(blockedLaneX =>
        Number.isFinite(blockedLaneX) && Math.abs(blockedLaneX - laneX) < 0.1
      )
    );
    const openLanes = lanes.filter(laneX =>
      !occupiedLanes.some(occupiedLaneX => Math.abs(occupiedLaneX - laneX) < 0.1)
    );
    const comboInterval = Math.max(2, 6 - challengeTier);
    if (challengeTier >= 2 &&
        this.runnerWaveCount % comboInterval === comboInterval - 1 &&
        !hasFullWidthHazard &&
        occupiedLanes.length === 1 &&
        openLanes.length >= 2) {
      const comboLaneX = openLanes[(this.runnerWaveCount + challengeTier) % openLanes.length];
      const roadwork = KarachiModels.createRoadDiggingObstacle(2.8);
      roadwork.position.set(comboLaneX, 0, waveZ);
      this.scene.add(roadwork);
      this.runnerObstacles.push({
        type: 'combined_roadwork',
        hazardType: 'LOW_HAZARD',
        laneX: comboLaneX,
        z: waveZ,
        requiredAction: 'jump',
        mesh: roadwork,
        isHit: false
      });
    }

    // Fairness Rule: Never spawn FULL_BLOCK across all 3 lanes at the same Z-position. At least one lane must always remain clear.
    const fullBlocks = [
      ...this.runnerObstacles.slice(obstacleStartIndex).filter(obstacle => obstacle.hazardType === 'FULL_BLOCK'),
      ...this.runnerTraffic.slice(trafficStartIndex).filter(vehicle => vehicle.hazardType === 'FULL_BLOCK')
    ];
    const fullBlockOccupiedLanes = new Map();
    lanes.forEach((laneX, laneIdx) => {
      const blocker = fullBlocks.find(item => {
        const itemX = item.laneX ?? item.mesh?.position?.x;
        const itemZ = item.z ?? item.mesh?.position?.z ?? waveZ;
        return Number.isFinite(itemX) && Math.abs(itemX - laneX) < 0.25 && Math.abs(itemZ - waveZ) <= 6.0;
      });
      if (blocker) fullBlockOccupiedLanes.set(laneIdx, blocker);
    });

    if (fullBlockOccupiedLanes.size >= 3) {
      // All 3 lanes are blocked by FULL_BLOCK at waveZ! Clear at least one lane to ensure fairness.
      const clearLaneIdx = Math.floor(Math.random() * 3);
      const toRemove = fullBlockOccupiedLanes.get(clearLaneIdx);
      if (toRemove) {
        if (toRemove.mesh) this.disposeRunnerObject(toRemove.mesh);
        const obsIdx = this.runnerObstacles.indexOf(toRemove);
        if (obsIdx !== -1) this.runnerObstacles.splice(obsIdx, 1);
        const trafIdx = this.runnerTraffic.indexOf(toRemove);
        if (trafIdx !== -1) this.runnerTraffic.splice(trafIdx, 1);
      }
    }

    this.runnerWaveCount += 1;
    if (this.runnerWaveCount % 3 === 0) {
      const pTypes = ['cng', 'shield', 'magnet', 'chai', 'jump', 'jetpack', 'cricket_bat', 'mystery_box'];
      const chosenType = pTypes[this.runnerPowerupDropCount % pTypes.length];
      const blockedLanes = [
        ...this.runnerObstacles.slice(obstacleStartIndex)
          .filter(obstacle => obstacle.type !== 'wire' && obstacle.hazardType !== 'HIGH_HAZARD')
          .map(obstacle => obstacle.laneX),
        ...this.runnerTraffic.slice(trafficStartIndex).map(vehicle => vehicle.laneX)
      ];
      const safeLanes = lanes.filter(laneX =>
        !blockedLanes.some(blockedLaneX => Math.abs(blockedLaneX - laneX) < 0.1)
      );
      const pLaneX = safeLanes.length
        ? safeLanes[this.runnerPowerupDropCount % safeLanes.length]
        : lanes[this.runnerPowerupDropCount % lanes.length];
      const pMesh = this.createRunnerPowerupMesh(chosenType);
      pMesh.position.set(pLaneX, 0, waveZ - 12.0);
      this.scene.add(pMesh);
      this.runnerPowerups.push({
        type: chosenType,
        mesh: pMesh,
        x: pLaneX,
        z: waveZ - 12.0
      });
      this.runnerPowerupDropCount += 1;
    }

    if (this.runnerWaveCount % 18 === 0 &&
        saveManager.getReviveTokenCount() < MAX_REVIVE_TOKENS) {
      const blockedLanes = [
        ...this.runnerObstacles.slice(obstacleStartIndex)
          .filter(obstacle => obstacle.type !== 'wire' && obstacle.hazardType !== 'HIGH_HAZARD')
          .map(obstacle => obstacle.laneX),
        ...this.runnerTraffic.slice(trafficStartIndex).map(vehicle => vehicle.laneX)
      ];
      const safeLanes = lanes.filter(laneX =>
        !blockedLanes.some(blockedLaneX => Math.abs(blockedLaneX - laneX) < 0.1)
      );
      const tokenLaneX = safeLanes.length
        ? safeLanes[this.runnerWaveCount % safeLanes.length]
        : lanes[this.runnerWaveCount % lanes.length];
      const tokenMesh = this.createRunnerPowerupMesh('revive_token');
      tokenMesh.position.set(tokenLaneX, 0.9, waveZ - 16.0);
      this.scene.add(tokenMesh);
      this.runnerReviveTokens.push({
        mesh: tokenMesh,
        laneX: tokenLaneX,
        z: waveZ - 16.0
      });
    }

    alignWaveGroundY();
  }

  /**
   * Spawn the complete "W-11 Minibus Surfing" Set-Piece Chunk:
   * 1. The Trigger: Moving W-11 minibus with rear ramp attached.
   * 2. The Bridge Signs: Downstream low-hanging overhead signs to dodge or slide under.
   * 3. Bonus coins along the surfing trajectory.
   */
  spawnW11SurfingSetPiece(waveZ = null) {
    if (waveZ === null) {
      waveZ = (this.player ? this.player.position.z : 0) - 35.0;
    }
    const lanes = [-this.laneWidth, 0, this.laneWidth];
    const laneIdx = 1; // Center lane
    const laneX = lanes[laneIdx];

    const setPiece = CityGenerator.createW11SurfingSetPiece(waveZ, { laneX });
    this.scene.add(setPiece.bus);

    const busObj = {
      mesh: setPiece.bus,
      laneX,
      speed: 11.5,
      isSurfed: false,
      userData: setPiece.bus.userData
    };
    if (!this.surfingBuses) this.surfingBuses = [];
    this.surfingBuses.push(busObj);

    // Register bridge signs as HIGH_HAZARD runnerObstacles
    setPiece.bridgeSigns.forEach(sign => {
      this.scene.add(sign);
      this.runnerObstacles.push({
        type: 'overhead_bridge_sign',
        hazardType: 'HIGH_HAZARD',
        z: sign.position.z,
        mesh: sign,
        blockedLanes: sign.userData.blockedLanes,
        requiredAction: sign.userData.requiredAction,
        isHit: false,
        isGrazed: false,
        isDodged: false
      });
    });

    // Spawn bonus rupee coins along the surfing route
    for (let z = waveZ - 20; z >= waveZ - 130; z -= 14) {
      [-this.laneWidth, 0, this.laneWidth].forEach(lx => {
        const coin = KarachiModels.createRupeeCoin(100);
        coin.position.set(lx, 3.5, z);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 100, x: lx, z, isRoofCoin: true });
      });
    }

    this.ui?.showAnnouncement?.('🚐💨 W-11 MINIBUS AHEAD! RUN UP THE RAMP TO SURF!', '#ffd700');
    return busObj;
  }

  /**
   * The Exit: After 15 seconds, the bus brakes hard (triggering audio.playBrakeScreech),
   * launching the player forward back onto the asphalt seamlessly.
   */
  exitBusSurfing() {
    if (!this.isBusSurfing) return;

    // Hard brake screech audio
    audio.playBrakeScreech();

    // Camera shake & intense tire friction smoke
    this.cameraShakeTimer = 0.55;
    this.particles?.createSkidSmoke?.(this.player.position, 35);
    this.particles?.createImpactDust?.(this.player.position, 25);

    // Launch player forward back onto the asphalt seamlessly with upward parabolic trajectory
    this.player.velocityY = 8.5;
    this.player.isGrounded = false;
    this.isBusSurfing = false;
    this.busSurfingTimer = 0;

    if (this.surfingBus) {
      this.surfingBus.speed = 4.0;
      this.surfingBus.isRetiring = true;
      this.surfingBus = null;
    }

    this.ui?.showAnnouncement?.('🛑 BRAKE SCREECH! LAUNCHED TO ROAD! +1,000 PTS', '#ffd700');
    this.ui?.showFloatingFeedback?.('🚀 AIR LAUNCH! +1000', this.player.position, '#ffd700');
    this.awardRunnerXP(1000);
    this.score += 1000;
    this.recordGameOpsEvent?.('runner.w11_surfing_end', { distanceMeters: Math.round(this.distanceMeters) });
  }

  /**
   * Subway Surfers Ground Contact Blob Shadow (Soft radial ambient occlusion mesh)
   */
  createBlobShadow(width = 1.3, length = 1.3) {
    if (typeof document === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.38)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const geo = new THREE.PlaneGeometry(width, length);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 3;
      mesh.visible = false;
      return mesh;
    } catch (e) {
      return null;
    }
  }

  /**
   * Evaluates runner collision bounding box dimensions with slide compression
   */
  getRunnerHitbox() {
    if (!this.player) return null;
    const pPos = this.player.position;
    const isSlide = !!this.isSliding;
    const height = isSlide ? 0.72 : 1.85;
    const radius = isSlide ? 0.42 : 0.48;
    return {
      minX: pPos.x - radius,
      maxX: pPos.x + radius,
      minY: pPos.y,
      maxY: pPos.y + height,
      minZ: pPos.z - radius,
      maxZ: pPos.z + radius,
      height,
      radius,
      isSliding: isSlide,
      isFastFalling: !!this.isFastFalling
    };
  }

  /**
   * Stylized Sky Hemisphere Dome with vertical sky gradient & drifting clouds
   */
  createSkyDome() {
    if (typeof document === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0.0, '#10528c');
      grad.addColorStop(0.35, '#2980b9');
      grad.addColorStop(0.65, '#60a5fa');
      grad.addColorStop(0.85, '#fed7aa');
      grad.addColorStop(1.0, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 256);

      // Stylized fluffy clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.beginPath();
      ctx.arc(35, 140, 22, 0, Math.PI * 2);
      ctx.arc(60, 135, 30, 0, Math.PI * 2);
      ctx.arc(88, 142, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.beginPath();
      ctx.arc(80, 80, 18, 0, Math.PI * 2);
      ctx.arc(102, 75, 24, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      const skyGeo = new THREE.SphereGeometry(450, 24, 16);
      const skyMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      skyMesh.name = 'Stylized-Sky-Dome';
      skyMesh.userData.isSkyDome = true;
      return skyMesh;
    } catch (e) {
      return null;
    }
  }

  /**
   * Distant Karachi Skyline Parallax Backdrop (Habib Bank Plaza, Port Cranes, Mazar Dome)
   */
  createDistantSkylineBackdrop() {
    const group = new THREE.Group();
    group.name = 'Distant-Karachi-Skyline';
    group.userData.isDistantSkyline = true;
    const silMat = new THREE.MeshBasicMaterial({
      color: 0x8a7e72,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      fog: false
    });

    // 1. Habib Bank Plaza Silhouette (Iconic 1960s triangular crown tower)
    const hbp = new THREE.Mesh(new THREE.BoxGeometry(26, 120, 20), silMat);
    hbp.position.set(-85, 50, -180);
    group.add(hbp);
    const hbpTop = new THREE.Mesh(new THREE.ConeGeometry(15, 24, 4), silMat);
    hbpTop.position.set(-85, 118, -180);
    hbpTop.rotation.y = Math.PI / 4;
    group.add(hbpTop);

    // 2. Port of Karachi Gantry Container Cranes
    [-140, 130].forEach(cx => {
      const craneGantry = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 6), silMat);
      craneGantry.position.set(cx, 65, -190);
      group.add(craneGantry);
      const craneLegL = new THREE.Mesh(new THREE.BoxGeometry(3, 65, 3), silMat);
      craneLegL.position.set(cx - 10, 32.5, -190);
      group.add(craneLegL);
      const craneLegR = new THREE.Mesh(new THREE.BoxGeometry(3, 65, 3), silMat);
      craneLegR.position.set(cx + 10, 32.5, -190);
      group.add(craneLegR);
    });

    // 3. Mazar-e-Quaid Distant Marble Dome
    const mazarBase = new THREE.Mesh(new THREE.BoxGeometry(45, 35, 45), silMat);
    mazarBase.position.set(70, 17.5, -200);
    group.add(mazarBase);
    const mazarDome = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), silMat);
    mazarDome.position.set(70, 35, -200);
    group.add(mazarDome);

    // 4. Radio transmission tower with blinking aviation red beacon
    const towerMast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 3.5, 95, 6), silMat);
    towerMast.position.set(0, 47.5, -210);
    group.add(towerMast);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033, fog: false });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(2.0, 8, 8), beaconMat);
    beacon.position.set(0, 95, -210);
    group.add(beacon);
    group.userData.beacon = beacon;

    return group;
  }

  /**
   * Semi-transparent projected vehicle headlight beam cone
   */
  createHeadlightBeam(color = 0xfffae0, length = 14.0, radius = 1.4) {
    const geo = new THREE.CylinderGeometry(0.18, radius, length, 12, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, -length * 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(geo, mat);
    beam.userData.isHeadlightBeam = true;
    return beam;
  }

  /**
   * Peripheral Speed Wind Lines (Tunnel Rush FX during High Velocity / Nitro)
   */
  createSpeedWindLines() {
    const group = new THREE.Group();
    group.name = 'Speed-Wind-Lines';
    group.userData.isSpeedWindLines = true;
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    const lines = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3.2 + (i % 3) * 0.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.65 + 1.8;
      const zStart = -2.0 - (i % 4) * 3.0;
      const length = 5.0 + (i % 3) * 3.0;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, zStart),
        new THREE.Vector3(x, y, zStart + length)
      ]);
      const line = new THREE.Line(geo, lineMat.clone());
      line.userData = { angle, radius, baseZ: zStart, length, speedFactor: 1.0 + (i % 3) * 0.3 };
      group.add(line);
      lines.push(line);
    }
    group.userData.lines = lines;
    group.visible = false;
    return group;
  }

  triggerRunnerStumble(obstacle, label) {
    if (!this.player || this.isGameOver) return;

    if (this.isMasterImmortal || this.isGodImmortal) {
      this.ui.showFloatingFeedback('👑 IMMORTAL MASTER MODE!', this.player.position, '#ffd700');
      return;
    }

    if (this.jetpackTimer > 0 || this.chingchiTimer > 0 || this.nitroTimer > 0 || this.isFeverActive) return;

    // Trigger Non-Lethal Stumble (Speed slowdown & Havaldar tailing tension):
    this.runnerStumbleTimer = 1.5;  // 1.5s 25% speed reduction
    this.targetChaserDistance = 2.4; // Havaldar surges right up behind player with siren & whistle!
    this.isChaserClose = true;
    this.chaserStumbleGraceTimer = 4.5;
    audio?.playPoliceWhistle?.();
    audio?.playPoliceSiren?.();

    if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.triggerStumble && this.player?.avatarMesh) {
      AvatarBuilder.triggerStumble(this.player.avatarMesh, 1.5);
    }

    audio.playTireScreech();
    this.cameraShakeTimer = 0.25;
    this.particles.createSkidSmoke(this.player.position, 10);
    this.ui.showAnnouncement(`🚨 GRAZED ${label} · TRAFFIC HAVALDAR ON YOUR TAIL! DON'T STUMBLE!`, '#ff1744');
    this.ui.showFloatingFeedback('⚠️ STUMBLED! HAVALDAR CLOSING IN!', this.player.position, '#ff1744');
  }

  createRunnerPotholeMesh() {
    const group = new THREE.Group();
    group.name = 'Rain-Softened Road Pothole';

    // 1. Excavated Asphalt Crater Bed
    const craterGeo = new THREE.CylinderGeometry(0.92, 0.74, 0.12, 16, 1, false);
    const craterMat = new THREE.MeshLambertMaterial({ color: 0x14181f });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.position.y = 0.02;
    crater.receiveShadow = true;
    group.add(crater);

    // 2. High-contrast Rim and Warning Ring
    const rim = new THREE.Mesh(RUNNER_POTHOLE_RIM_GEOMETRY, RUNNER_POTHOLE_RIM_MATERIAL);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.035;
    group.add(rim);

    const warningRing = new THREE.Mesh(
      RUNNER_POTHOLE_WARNING_RING_GEOMETRY,
      RUNNER_POTHOLE_WARNING_RING_MATERIAL
    );
    warningRing.rotation.x = -Math.PI / 2;
    warningRing.position.y = 0.05;
    group.add(warningRing);

    // 3. Murky Deep Rainwater Puddle Disk
    const water = new THREE.Mesh(RUNNER_POTHOLE_WATER_GEOMETRY, RUNNER_POTHOLE_WATER_MATERIAL);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.06;
    group.add(water);

    // 4. Animated Concentric Ripple Waves in the Water
    const rippleGeo = new THREE.RingGeometry(0.22, 0.38, 20);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x5ce1e6,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.y = 0.062;
    ripple.userData.isPotholeRipple = true;
    group.add(ripple);

    // 5. Jagged Cracked Asphalt Rubble Pieces around the Perimeter (each is a Mesh with geometry)
    const rubbleMat = new THREE.MeshLambertMaterial({ color: 0x222a33 });
    const pieceCount = 8;
    for (let i = 0; i < pieceCount; i++) {
      const angle = (i / pieceCount) * Math.PI * 2 + (Math.sin(i * 3) * 0.15);
      const rad = 0.88 + (Math.cos(i * 5) * 0.10);
      const w = 0.20 + (Math.sin(i * 2) * 0.06);
      const h = 0.06 + (Math.cos(i) * 0.03);
      const d = 0.25 + (Math.sin(i * 4) * 0.06);
      const rubbleGeo = new THREE.BoxGeometry(w, h, d);
      const rubble = new THREE.Mesh(rubbleGeo, rubbleMat);
      rubble.position.set(Math.cos(angle) * rad, 0.05, Math.sin(angle) * rad);
      rubble.rotation.set(Math.sin(i) * 0.2, angle + Math.cos(i) * 0.3, Math.cos(i * 2) * 0.2);
      rubble.castShadow = true;
      group.add(rubble);
    }

    // 6. Authentic Karachi Warning Hazard Stick & Red Caution Flag
    const stickGeo = new THREE.CylinderGeometry(0.035, 0.045, 1.25, 8);
    const stickMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(0.55, 0.64, 0.2);
    stick.rotation.set(0.12, 0.45, -0.32);
    group.add(stick);

    const flagGeo = new THREE.BoxGeometry(0.28, 0.16, 0.03);
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.78, 1.15, 0.2);
    flag.rotation.set(0.12, 0.45, -0.32);
    group.add(flag);

    // 7. Approach Warning Arrows painted on the asphalt ahead
    [2.2, 4.0].forEach(distance => {
      const approachArrow = new THREE.Mesh(
        RUNNER_POTHOLE_ARROW_GEOMETRY,
        RUNNER_POTHOLE_ARROW_MATERIAL
      );
      approachArrow.rotation.x = -Math.PI / 2;
      approachArrow.position.set(0, 0.045, distance);
      approachArrow.scale.set(0.72, 0.72, 0.72);
      approachArrow.userData.isApproachMarker = true;
      group.add(approachArrow);
    });

    group.userData.isRunnerHazard = true;
    group.userData.obstacleType = 'pothole';
    return group;
  }

  getRunnerWeatherState() {
    if (this.runnerRainOverride === true) return 'rain';
    if (this.runnerRainOverride === false) return 'clear';
    if (this.distanceMeters < 450) return 'clear';

    const cycleDistance = (this.distanceMeters - 450) % 1800;
    if (cycleDistance < 200) return 'rain';
    if (cycleDistance < 750) return 'potholes';
    return 'clear';
  }

  getRunnerNeighborhoodIndex(distance = this.distanceMeters) {
    return Math.min(
      RUNNER_NEIGHBORHOOD_COUNT,
      Math.max(1, Math.floor(Math.max(0, distance) / RUNNER_METERS_PER_NEIGHBORHOOD) + 1)
    );
  }

  getRunnerChallengeTier(distance = this.distanceMeters) {
    return Math.min(8, Math.floor(Math.max(0, distance) / 2500));
  }

  getRunnerWaveSpacing(distance = this.distanceMeters) {
    const pace = this.runnerDifficulty || 'cruiser';
    const paceBonus = pace === 'easy' ? 6 : (pace === 'cruiser' ? 3 : (pace === 'hard' ? -2 : 0));
    return Math.max(22, 28 + paceBonus - Math.floor(Math.max(0, distance) / 5000));
  }

  getRunnerSpeed(distance = this.distanceMeters) {
    const progress = THREE.MathUtils.clamp(distance / RUNNER_CITY_LOOP_METERS, 0, 1);
    return this.runSpeed * (1 + progress * 0.35);
  }

  setRunnerDifficulty(difficulty) {
    if (!Object.hasOwn(RUNNER_SPEEDS, difficulty)) {
      console.warn('[RUNNER] Ignoring invalid pace selection:', difficulty);
      return false;
    }
    this.runnerDifficulty = difficulty;
    this.runSpeed = RUNNER_SPEEDS[difficulty] * this.masterSpeedMult;

    if (this.isTempleRun && this.isGameStarted && !this.isGameOver && !this.runnerJunction) {
      const profile = this.getRunnerNavProfile();
      const nextGap = this.distanceMeters > 0 ? profile.gap : profile.firstAt;
      this.nextJunctionAt = this.distanceMeters + nextGap;
    }
    return true;
  }

  updateRunnerProgression() {
    if (this.distanceMeters >= RUNNER_CITY_LOOP_METERS) {
      this.distanceMeters = RUNNER_CITY_LOOP_METERS;
      this.finishRunnerCityLoop();
      return true;
    }

    const neighborhoodIndex = this.getRunnerNeighborhoodIndex();
    if (neighborhoodIndex !== this.runnerNeighborhoodIndex) {
      this.runnerNeighborhoodIndex = neighborhoodIndex;
      this.currentMilestone = getKarachiNeighborhoodName(neighborhoodIndex);
    }

    let areaIndex = 0;
    while (areaIndex < RUNNER_AREA_THRESHOLDS.length - 1 && this.distanceMeters >= RUNNER_AREA_THRESHOLDS[areaIndex]) {
      areaIndex++;
    }
    if (areaIndex !== this.runnerAreaIndex) {
      this.runnerAreaIndex = areaIndex;
      this.currentDistrictLevel = areaIndex + 1;
      this.currentMilestone = getKarachiNeighborhoodName(neighborhoodIndex);
      if (!saveManager.isDistrictUnlocked(this.currentDistrictLevel)) {
        saveManager.unlockDistrict(this.currentDistrictLevel);
        this.ui?.refreshProgressionContent();
      }
      this.corridorDistrictLevel = this.currentDistrictLevel;
    if (this.isTempleRun) {
      if (!this.chaserMesh) {
        this.chaserMesh = KarachiModels.createHavaldarMotorcycle();
        this.scene.add(this.chaserMesh);
      }
      this.chaserDistance = 12.0;
      this.targetChaserDistance = 12.0;
      this.isChaserClose = false;
      const playerZ = this.player?.position?.z ?? 60.0;
      this.chaserMesh.position.set(0, 0, playerZ + 12.0);
    }
      if (this.corridorChunks && this.corridorChunks.length > 0) {
        this.corridorChunks.forEach(chunk => {
          chunk.userData.patrolAreaLevel = this.currentDistrictLevel;
        });
      }
      // Seamless progression: do NOT destroy ground underneath player;
      // spawn a grand ceremonial welcome arch ahead and let upcoming chunks cycle naturally.
      const archZ = (this.player?.position?.z || 0) - 35.0;
      this.spawnMilestoneArchAhead(RUNNER_AREA_NAMES[areaIndex] || 'KARACHI ROUTE', archZ);
      this.ui?.showAnnouncement(
        `🏁 KARACHI ROUTE: ${RUNNER_AREA_NAMES[areaIndex].toUpperCase()} · NEW STREET CHALLENGES`,
        '#00e5ff'
      );
    }

    return false;
  }

  finishRunnerCityLoop() {
    if (this.runnerRouteComplete) return;
    this.runnerRouteComplete = true;
    this.runnerNeighborhoodIndex = RUNNER_NEIGHBORHOOD_COUNT;
    this.currentDistrictLevel = 1;
    this.currentMilestone = getKarachiNeighborhoodName(RUNNER_NEIGHBORHOOD_COUNT);
    this.isGameOver = true;
    this.isPaused = true;
    this.score += 10000;
    this.awardRunnerXP(5000);
    audio.playDistrictClearedFanfare();
    this.particles.createCelebrationConfetti(this.player.position, 120);
    this.persistRunnerRun();
    this.ui?.showGameOver({
      rankedHoles: [...(this.holes || [])].sort((a, b) => b.score - a.score),
      player: this.player,
      routeComplete: true,
      distanceMeters: RUNNER_CITY_LOOP_METERS,
      coins: this.coins,
      runScore: this.score
    });
  }

  updateRunnerWeather(dt) {
    const weather = this.getRunnerWeatherState();
    if (weather !== this.runnerWeatherState) {
      this.runnerWeatherState = weather;
      if (weather === 'rain') {
        this.ui?.showAnnouncement('🌧️ KARACHI MONSOON! Slow down and watch the road.', '#80deea');
      } else if (weather === 'potholes') {
        this.ui?.showAnnouncement('🕳️ RAIN-SOFTENED ROAD! Puddled potholes ahead.', '#80deea');
      } else if (weather === 'clear') {
        this.ui?.showAnnouncement('☀️ RAIN CLEARED. Stay alert for road damage.', '#ffd700');
      }
    }

    if (!this.runnerRainEffect) {
      const positions = new Float32Array(180 * 2 * 3);
      for (let index = 0; index < 180; index++) {
        const offset = index * 6;
        const x = (Math.random() - 0.5) * 24;
        const y = 2 + Math.random() * 12;
        const z = (Math.random() - 0.5) * 34;
        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = z;
        positions[offset + 3] = x - 0.12;
        positions[offset + 4] = y - 1.1;
        positions[offset + 5] = z;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const rain = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
        color: 0xa8d8e8,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
      }));
      rain.frustumCulled = false;
      rain.visible = false;
      this.scene.add(rain);
      this.runnerRainEffect = { mesh: rain, positions, attribute: geometry.attributes.position };
    }

    const rain = this.runnerRainEffect;
    rain.mesh.visible = weather === 'rain';
    rain.mesh.position.set(this.player.position.x, 0, this.player.position.z);

    // Animate concentric water ripple waves inside all active road potholes
    const rippleTime = performance.now() * 0.0035;
    if (this.runnerObstacles) {
      for (let i = 0; i < this.runnerObstacles.length; i++) {
        const obs = this.runnerObstacles[i];
        if (obs && obs.type === 'pothole' && obs.mesh) {
          const ripple = obs.mesh.children.find(child => child.userData?.isPotholeRipple);
          if (ripple) {
            const scale = 1.0 + 0.38 * Math.sin(rippleTime + i * 1.5);
            ripple.scale.set(scale, scale, scale);
            if (ripple.material) {
              ripple.material.opacity = (weather === 'rain' ? 0.82 : 0.45) * (0.55 + 0.45 * Math.cos(rippleTime * 1.8 + i));
            }
          }
        }
      }
    }

    if (weather !== 'rain') return;

    for (let offset = 0; offset < rain.positions.length; offset += 6) {
      rain.positions[offset + 1] -= 30 * dt;
      if (rain.positions[offset + 1] < 0) {
        rain.positions[offset] = (Math.random() - 0.5) * 24;
        rain.positions[offset + 1] = 8 + Math.random() * 6;
        rain.positions[offset + 2] = (Math.random() - 0.5) * 34;
      }
      rain.positions[offset + 3] = rain.positions[offset] - 0.12;
      rain.positions[offset + 4] = rain.positions[offset + 1] - 1.1;
      rain.positions[offset + 5] = rain.positions[offset + 2];
    }
    rain.attribute.needsUpdate = true;
  }

  /**
   * Spawn a 2-vehicle Highway Traffic Convoy ahead (Tactical Master Mode / Scripted Event)
   */
  spawnTrafficConvoyAhead() {
    const waveZ = this.player ? this.player.position.z - 35.0 : -40.0;
    const lanes = [-this.laneWidth, 0, this.laneWidth];

    const v1 = KarachiModels.createBedfordTruck();
    v1.position.set(lanes[0], 0, waveZ);
    this.scene.add(v1);
    const r1 = KarachiModels.createSlipstreamRibbons(2.0, 7.5);
    v1.add(r1);
    this.runnerTraffic.push({ mesh: v1, laneX: lanes[0], speed: 12.0, label: '🚚 Bedford Truck', ribbons: r1, isHit: false });

    const v2 = KarachiModels.createW11MiniBus();
    v2.position.set(lanes[2], 0, waveZ - 14.0);
    this.scene.add(v2);
    const r2 = KarachiModels.createSlipstreamRibbons(1.8, 7.0);
    v2.add(r2);
    this.runnerTraffic.push({ mesh: v2, laneX: lanes[2], speed: 14.5, label: '🚐 W11 Minibus', ribbons: r2, isHit: false });
  }

  /**
   * Initialize Infinite Procedural 3-Lane Corridor for Karachi Subway Run
   */
  initCorridorTerrain() {
    const baseZ = this.player?.position.z ?? 60.0;
    if (this.corridorChunks) {
      this.corridorChunks.forEach(chunk => this.disposeCorridorChunk(chunk));
    }
    this.corridorChunks = [];
    this.corridorChunkSerial = 0;
    this.corridorElevation = 0.0;
    this.lastFunnelMeters = 0;

    // Rolling verticality profile for the initial endless corridor:
    // Flat launch runway -> sloped flyover ramp up (+5m) -> elevated corridor -> ramp down (-5m) -> ground
    const initialSlopes = ['FLAT', 'FLAT', 'RAMP_UP', 'FLAT', 'RAMP_DOWN', 'FLAT', 'FLAT'];
    for (let i = 0; i < 7; i++) {
      const chunkZ = baseZ - (i * 60.0);
      const forcedSlope = initialSlopes[i] || null;
      const chunk = this.createCorridorChunk(chunkZ, forcedSlope);
      this.scene.add(chunk);
      this.corridorChunks.push(chunk);
    }
    this.corridorDistrictLevel = this.currentDistrictLevel;
    if (this.isTempleRun) {
      if (!this.chaserMesh) {
        this.chaserMesh = KarachiModels.createHavaldarMotorcycle();
        this.scene.add(this.chaserMesh);
      }
      this.chaserDistance = 12.0;
      this.targetChaserDistance = 12.0;
      this.isChaserClose = false;
      this.chaserMesh.position.set(0, 0, baseZ + 12.0);
    }
  }

  /**
   * Place classic-city landmarks, distant towers and palms along a corridor chunk.
   * Returns the set of sides (-1 / 1) whose roadside is occupied by a landmark.
   */
  addCorridorLandmarks(chunkGroup) {
    const lists = {
      1: ['createKMCBuilding', 'createBurnsRoadColonialBuilding', 'createBahadurabadCharminar', 'createTariqRoadFashionPlaza', 'createResidentialBungalow', 'createCommercialPlaza'],
      2: ['createMazarEQuaid', 'createOverheadPedestrianBridge', 'createFrereHall', 'createKMCBuilding', 'createCommercialPlaza'],
      3: ['createEmpressMarket', 'createSaddarClockTower', 'createCommercialPlaza', 'createBurnsRoadBiryaniStall', 'createBurnsRoadColonialBuilding'],
      4: ['createHabibBankPlaza', 'createMCBTower', 'createChundrigarSkyscraper', 'createCommercialPlaza'],
      5: ['createTeenTalwarChowrangi', 'createMohattaPalace', 'createCliftonLighthouse', 'createDoDaryaPavilion', 'createCliftonDecoratedCamel'],
      6: ['createLyariStreetFootball', 'createChaiDhaba', 'createCommercialPlaza', 'createBurnsRoadColonialBuilding', 'createKMCBuilding']
    };
    const list = lists[this.currentDistrictLevel] || lists[1];
    const serial = this.corridorChunkSerial = (this.corridorChunkSerial || 0) + 1;
    const occupied = new Set();
    const names = [];

    [-1, 1].forEach((side, sideIndex) => {
      // Leave one side per few chunks as plain blocks so the street keeps a varied rhythm.
      if ((serial + sideIndex) % 4 === 3) return;
      const name = list[(serial * 2 + sideIndex) % list.length];
      const model = KarachiModels[name]?.();
      if (!model) return;
      const footprint = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
      const fit = Math.min(1, 26 / Math.max(footprint.x, footprint.z));
      model.scale.setScalar(fit);
      model.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const landmarkY = chunkGroup.userData?.startElevation !== undefined
        ? CityGenerator.getSegmentElevation(chunkGroup.userData, 0, 60.0)
        : 0;
      model.position.set(side * (12.5 + (footprint.x * fit) / 2), landmarkY, 0);
      chunkGroup.add(model);
      occupied.add(side);
      names.push(name);
    });

    const towers = ['createHabibBankPlaza', 'createMCBTower', 'createChundrigarSkyscraper', 'createCommercialPlaza'];
    const towerName = towers[serial % towers.length];
    const tower = KarachiModels[towerName]?.();
    if (tower) {
      const side = serial % 2 === 0 ? -1 : 1;
      const tz = (serial % 3 - 1) * 12;
      const towerY = chunkGroup.userData?.startElevation !== undefined
        ? CityGenerator.getSegmentElevation(chunkGroup.userData, tz, 60.0)
        : 0;
      tower.position.set(side * 50, towerY, tz);
      chunkGroup.add(tower);
      names.push(towerName);
    }

    [-1, 1].forEach(side => {
      const palm = KarachiModels.createPalmTree?.();
      if (!palm) return;
      const pz = side * 24;
      const palmY = chunkGroup.userData?.startElevation !== undefined
        ? CityGenerator.getSegmentElevation(chunkGroup.userData, pz, 60.0)
        : 0;
      palm.position.set(side * 9.6, palmY, pz);
      chunkGroup.add(palm);
    });

    if (serial % 2 === 0) {
      const slangSide = serial % 4 === 0 ? -1 : 1;
      const slangBoard = KarachiModels.createSlangBillboard?.(Math.floor(serial / 2));
      if (slangBoard) {
        const bz = (serial % 3 - 1) * 8;
        const bY = chunkGroup.userData?.startElevation !== undefined
          ? CityGenerator.getSegmentElevation(chunkGroup.userData, bz, 60.0)
          : 0;
        slangBoard.position.set(slangSide * 11.5, bY, bz);
        chunkGroup.add(slangBoard);
        names.push('createSlangBillboard');
      }
    }

    chunkGroup.userData.landmarks = names;
    return occupied;
  }

  /**
   * Determine exact ground surface elevation (Y) along the 3-lane endless corridor.
   * Uses Raycasting against active road meshes with fallback to mathematical slope interpolation.
   */
  getCorridorGroundHeight(worldZ, worldX = 0) {
    if (!this.corridorChunks || this.corridorChunks.length === 0) return 0;

    // 1. Raycasting approach against active road surface geometry
    if (!this.runnerRaycaster) {
      this.runnerRaycaster = new THREE.Raycaster();
      this.runnerRayOrigin = new THREE.Vector3();
      this.runnerRayDown = new THREE.Vector3(0, -1, 0);
    }
    const roadMeshes = [];
    for (let i = 0; i < this.corridorChunks.length; i++) {
      const c = this.corridorChunks[i];
      if (Math.abs(c.position.z - worldZ) <= 35.0) {
        c.traverse(child => {
          if (child.isMesh && child.userData.isRoadSurface) roadMeshes.push(child);
        });
      }
    }
    if (roadMeshes.length > 0) {
      this.runnerRayOrigin.set(worldX, 35.0, worldZ);
      this.runnerRaycaster.set(this.runnerRayOrigin, this.runnerRayDown);
      const hits = this.runnerRaycaster.intersectObjects(roadMeshes, false);
      if (hits.length > 0) {
        return hits[0].point.y;
      }
    }

    // 2. High-precision mathematical interpolation based on the current chunk's elevation profile
    for (let i = 0; i < this.corridorChunks.length; i++) {
      const chunk = this.corridorChunks[i];
      const cz = chunk.position.z;
      if (worldZ <= cz + 30.001 && worldZ >= cz - 30.001) {
        const localZ = worldZ - cz;
        const t = THREE.MathUtils.clamp((30.0 - localZ) / 60.0, 0, 1);
        const s = t * t * (3 - 2 * t);
        const startElev = chunk.userData?.startElevation || 0;
        const delta = chunk.userData?.elevationDelta || 0;
        return startElev + s * delta;
      }
    }

    // Fallback: search closest chunk
    let closestChunk = this.corridorChunks[0];
    let minDist = Infinity;
    for (let i = 0; i < this.corridorChunks.length; i++) {
      const dist = Math.abs(worldZ - this.corridorChunks[i].position.z);
      if (dist < minDist) {
        minDist = dist;
        closestChunk = this.corridorChunks[i];
      }
    }
    if (closestChunk) {
      const localZ = worldZ - closestChunk.position.z;
      const t = THREE.MathUtils.clamp((30.0 - localZ) / 60.0, 0, 1);
      const s = t * t * (3 - 2 * t);
      const startElev = closestChunk.userData?.startElevation || 0;
      const delta = closestChunk.userData?.elevationDelta || 0;
      return startElev + s * delta;
    }
    return 0;
  }

  /**
   * Create a single 60-meter modular Corridor Segment (Asphalt, painted lane lines, sidewalks, buildings)
   * Supports three elevation profiles: FLAT, RAMP_UP (+5m), RAMP_DOWN (-5m)
   */
  createCorridorChunk(chunkZ, forceSlope = null, forceStartElevation = null) {
    const chunkGroup = new THREE.Group();
    chunkGroup.position.z = chunkZ;

    // Elevation Profiles: support FLAT, RAMP_UP (+5m), RAMP_DOWN (-5m)
    let startElevation = Number.isFinite(forceStartElevation)
      ? forceStartElevation
      : (this.corridorElevation || 0.0);
    let slopeState = forceSlope;

    if (!slopeState) {
      if (Math.abs(chunkZ - 60.0) < 125.0) {
        // Safe flat start zone around initial run spawn
        slopeState = 'FLAT';
        startElevation = 0;
      } else {
        const distToJunction = this.runnerJunction ? Math.abs(chunkZ - this.runnerJunction.z) : Infinity;
        if (this.runnerJunction?.kind === 'turn' && distToJunction < 100) {
          slopeState = 'FLAT';
          startElevation = 0;
        } else if (distToJunction < 130.0) {
          // Approach to turn junction: level out back to 0
          if (startElevation > 0) slopeState = 'RAMP_DOWN';
          else if (startElevation < 0) slopeState = 'RAMP_UP';
          else slopeState = 'FLAT';
        } else {
          // Rolling Karachi flyovers and elevated arterial ridges
          if (startElevation <= 0) {
            slopeState = Math.random() < 0.45 ? 'RAMP_UP' : 'FLAT';
          } else if (startElevation >= 5.0) {
            slopeState = Math.random() < 0.55 ? 'RAMP_DOWN' : 'FLAT';
          } else {
            slopeState = 'FLAT';
          }
        }
      }
    }

    const elevationDelta = slopeState === 'RAMP_UP' ? 5.0 : slopeState === 'RAMP_DOWN' ? -5.0 : 0.0;
    const endElevation = startElevation + elevationDelta;
    this.corridorElevation = endElevation;

    chunkGroup.userData.slopeState = slopeState;
    chunkGroup.userData.startElevation = startElevation;
    chunkGroup.userData.endElevation = endElevation;
    chunkGroup.userData.elevationDelta = elevationDelta;

    const getLocalY = (z) => CityGenerator.getSegmentElevation(
      { slopeState, startElevation, elevationDelta },
      z,
      60.0
    );
    const districtStyles = {
      1: {
        name: 'SOLDIER BAZAR · GARDEN HERITAGE',
        streets: [
          { avenue: 'SOLDIER BAZAR', avenueUrdu: 'سولجر بازار', cross: 'NISHTAR ROAD', crossUrdu: 'نشتر روڈ' },
          { avenue: 'GARDEN EAST', avenueUrdu: 'گارڈن ایسٹ', cross: 'BRITTO ROAD', crossUrdu: 'برٹو روڈ' },
          { avenue: 'NISHTAR ROAD', avenueUrdu: 'نشتر روڈ', cross: 'TARIQ ROAD', crossUrdu: 'طارق روڈ' },
          { avenue: 'PECHS', avenueUrdu: 'پی ای سی ایچ ایس', cross: 'BAHADURABAD', crossUrdu: 'بہادرآباد' }
        ],
        buildingColors: [0xb0bec5, 0xcfd8dc, 0xffcc80, 0x80deea, 0xa5d6a7],
        sidewalkColor: 0x64748b,
        roadColor: 0x181e26,
        laneMarking: 0xffffff
      },
      2: {
        name: 'LYARI · MAZAR-E-QUAID & CHAKIWARA',
        streets: [
          { avenue: 'SHAHRAH-E-QUAIDEEN', avenueUrdu: 'شاہراہ قائدین', cross: 'MAZAR-E-QUAID', crossUrdu: 'مزارِ قائد' },
          { avenue: 'M.A. JINNAH ROAD', avenueUrdu: 'ایم اے جناح روڈ', cross: 'QUAID MEMORIAL', crossUrdu: 'یادگارِ قائد' },
          { avenue: 'NEW M.A. JINNAH ROAD', avenueUrdu: 'نیو ایم اے جناح روڈ', cross: 'GURUMANDIR', crossUrdu: 'گرو مندر' },
          { avenue: 'KASHMIR ROAD', avenueUrdu: 'کشمیر روڈ', cross: 'SHAHRAH-E-QUAIDEEN', crossUrdu: 'شاہراہ قائدین' }
        ],
        buildingColors: [0xffffff, 0xe0e0e0, 0xb2dfdb, 0x80cbc4, 0xc8e6c9],
        sidewalkColor: 0x4db6ac,
        roadColor: 0x11161d,
        laneMarking: 0x00e676
      },
      3: {
        name: 'SADDAR · EMPRESS MARKET HERITAGE',
        streets: [
          { avenue: 'EMPRESS MARKET', avenueUrdu: 'ایمپریس مارکیٹ', cross: 'PREEDY STREET', crossUrdu: 'پریڈی اسٹریٹ' },
          { avenue: 'SADDAR BAZAAR', avenueUrdu: 'صدر بازار', cross: 'ABDULLAH HAROON ROAD', crossUrdu: 'عبداللہ ہارون روڈ' },
          { avenue: 'BURNS ROAD FOOD STREET', avenueUrdu: 'برنس روڈ فوڈ اسٹریٹ', cross: 'BOHRI BAZAAR', crossUrdu: 'بوہری بازار' },
          { avenue: 'ZAIBUNNISA STREET', avenueUrdu: 'زیب النساء اسٹریٹ', cross: 'REGAL CHOWK', crossUrdu: 'ریگل چوک' }
        ],
        buildingColors: [0x8d6e63, 0xa1887f, 0xd7ccc8, 0xffcc80, 0xb0bec5],
        sidewalkColor: 0x795548,
        roadColor: 0x242326,
        laneMarking: 0xe6d7b8
      },
      4: {
        name: 'I.I. CHUNDRIGAR · FINANCIAL CORRIDOR',
        streets: [
          { avenue: 'I.I. CHUNDRIGAR ROAD', avenueUrdu: 'آئی آئی چندریگر روڈ', cross: 'MCB TOWER', crossUrdu: 'ایم سی بی ٹاور' },
          { avenue: 'MCLEOD ROAD', avenueUrdu: 'میکلوڈ روڈ', cross: 'HABIB BANK PLAZA', crossUrdu: 'حبیب بینک پلازہ' },
          { avenue: 'STOCK EXCHANGE ROAD', avenueUrdu: 'اسٹاک ایکسچینج روڈ', cross: 'WALL STREET', crossUrdu: 'وال اسٹریٹ' },
          { avenue: 'MEREWETHER TOWER', avenueUrdu: 'میرے ویتھر ٹاور', cross: 'TALPUR ROAD', crossUrdu: 'تالپور روڈ' }
        ],
        buildingColors: [0x37474f, 0x455a64, 0x607d8b, 0x90a4ae, 0x0277bd],
        sidewalkColor: 0x374151,
        roadColor: 0x0f172a,
        laneMarking: 0x38bdf8
      },
      5: {
        name: 'CLIFTON · SEA VIEW COASTLINE',
        streets: [
          { avenue: 'CLIFTON BEACH', avenueUrdu: 'کلفٹن بیچ', cross: 'TEEN TALWAR', crossUrdu: 'تین تلوار' },
          { avenue: 'SEA VIEW PROMENADE', avenueUrdu: 'سی ویو پرومیناڈ', cross: 'KHAYABAN-E-SHAMSHEER', crossUrdu: 'خیابانِ شمشیر' },
          { avenue: 'DO DARYA COASTAL ROAD', avenueUrdu: 'دو دریا کوسٹل روڈ', cross: 'MANORA LIGHTHOUSE', crossUrdu: 'منوڑا لائٹ ہاؤس' },
          { avenue: 'HATIM ALVI ROAD', avenueUrdu: 'حاتم علوی روڈ', cross: 'MOHATTA PALACE', crossUrdu: 'مہٹہ پیلس' }
        ],
        buildingColors: [0xffab91, 0xffccbc, 0x80deea, 0xb2ebf2, 0xffe082],
        sidewalkColor: 0x00897b,
        roadColor: 0x1e293b,
        laneMarking: 0xffd54f
      },
      6: {
        name: 'LYARI · CHAKIWARA CULTURAL DISTRICT',
        streets: [
          { avenue: 'LYARI AMAN AVENUE', avenueUrdu: 'لیاری امن ایونیو', cross: 'CHAKIWARA', crossUrdu: 'چاکیواڑہ' },
          { avenue: 'BAGHDADI CHOWK', avenueUrdu: 'بغدادی چوک', cross: 'KALAKOT', crossUrdu: 'کلاکوٹ' },
          { avenue: 'PEOPLES FOOTBALL STADIUM', avenueUrdu: 'پیپلز فٹ بال اسٹیڈیم', cross: 'CHEEL CHOWK', crossUrdu: 'چیل چوک' },
          { avenue: 'MAURIPUR HIGHWAY', avenueUrdu: 'ماری پور ہائی وے', cross: 'GUL MUHAMMAD LANE', crossUrdu: 'گل محمد لین' }
        ],
        buildingColors: [0xef5350, 0xffa726, 0xffee58, 0x66bb6a, 0x42a5f5],
        sidewalkColor: 0x8d6e63,
        roadColor: 0x261e1b,
        laneMarking: 0xffeb3b
      }
    };
    const districtStyle = districtStyles[this.currentDistrictLevel] || districtStyles[1];
    const routeIndex = Math.abs(Math.floor(chunkZ / 60.0)) % districtStyle.streets.length;
    const route = districtStyle.streets[routeIndex];
    chunkGroup.userData.karachiDistrict = route.avenue;
    chunkGroup.userData.patrolArea = districtStyle.name;
    chunkGroup.userData.patrolAreaLevel = this.currentDistrictLevel;
    chunkGroup.userData.runnerIdentity = getDistrictConfig(this.currentDistrictLevel)?.runnerFocus || 'Karachi urban arterial corridor · high-speed traffic';

    // 1-4. Modular Subdivided Roadway Surface, Dividers, Curbs & Sidewalks with elevation slope
    const roadSegment = CityGenerator.createModularRoadSegment(60.0, 13.0, {
      roadColor: districtStyle.roadColor,
      laneMarking: districtStyle.laneMarking,
      sidewalkColor: districtStyle.sidewalkColor,
      slopeState,
      startElevation,
      elevationDelta
    });
    chunkGroup.add(roadSegment);

    // 4. Streetlights every 30m along sidewalks
    [-20, 10].forEach(lz => {
      [-6.5, 6.5].forEach(lx => {
        const lightPole = KarachiModels.createStreetLamp();
        lightPole.position.set(lx, getLocalY(lz) + 0.28, lz);
        if (lx < 0) lightPole.rotation.y = Math.PI;
        chunkGroup.add(lightPole);
      });
    });

    // Local road signs and roadside stalls give the runner corridor a Karachi identity.
    const leftStreetSign = KarachiModels.createKarachiGreenStreetSign(
      route.avenue,
      route.avenueUrdu,
      route.cross,
      route.crossUrdu
    );
    leftStreetSign.position.set(-8.7, getLocalY(-15), -15);
    leftStreetSign.rotation.y = Math.PI / 2;
    chunkGroup.add(leftStreetSign);

    const rightStreetSign = KarachiModels.createKarachiGreenStreetSign(
      route.cross,
      route.crossUrdu,
      route.avenue,
      route.avenueUrdu
    );
    rightStreetSign.position.set(8.7, getLocalY(15), 15);
    rightStreetSign.rotation.y = -Math.PI / 2;
    chunkGroup.add(rightStreetSign);

    const roadsideStall = this.currentDistrictLevel === 3
      ? (routeIndex % 2 === 0 ? KarachiModels.createBurnsRoadBunKababStall() : KarachiModels.createBurnsRoadBiryaniStall())
      : this.currentDistrictLevel === 2
        ? (routeIndex % 2 === 0 ? KarachiModels.createChaiDhaba() : KarachiModels.createRoadsidePaanKhokha())
        : (routeIndex % 2 === 0 ? KarachiModels.createChaiDhaba() : KarachiModels.createRoadsidePaanKhokha());
    roadsideStall.position.set(routeIndex % 2 === 0 ? -10.8 : 10.8, getLocalY(0), 0);
    roadsideStall.rotation.y = routeIndex % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    chunkGroup.add(roadsideStall);

    if (this.currentDistrictLevel === 2 && routeIndex % 2 === 0) {
      const goal = new THREE.Group();
      goal.name = 'Lyari Street Football Goal';
      chunkGroup.userData.lyariFootballGround = true;
      const frameMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
      const postGeometry = new THREE.BoxGeometry(0.12, 2.1, 0.12);
      [-1.35, 1.35].forEach(x => {
        const post = new THREE.Mesh(postGeometry, frameMaterial);
        post.position.set(x, 1.05, 0);
        goal.add(post);
      });
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.12), frameMaterial);
      crossbar.position.y = 2.1;
      goal.add(crossbar);
      goal.position.set(8.6, getLocalY(-20), -20);
      chunkGroup.add(goal);
      const football = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 8),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      football.position.set(7.0, getLocalY(-17) + 0.32, -17);
      chunkGroup.add(football);
    }

    if (this.currentDistrictLevel === 1) {
      chunkGroup.userData.soldierBazarWaterTank = true;
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.3, 4.2),
        new THREE.MeshLambertMaterial({ color: 0xc8c2b8 })
      );
      roof.position.set(-15.5, getLocalY(0) + 11.5, 0);
      chunkGroup.add(roof);
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(1.25, 1.25, 1.8, 14),
        new THREE.MeshLambertMaterial({ color: 0x416b79 })
      );
      tank.position.set(-15.5, getLocalY(0) + 12.55, 0);
      tank.castShadow = true;
      chunkGroup.add(tank);
      const tankTop = new THREE.Mesh(
        new THREE.CylinderGeometry(1.28, 1.28, 0.12, 14),
        new THREE.MeshLambertMaterial({ color: 0x698c96 })
      );
      tankTop.position.set(-15.5, getLocalY(0) + 13.5, 0);
      chunkGroup.add(tankTop);
    } else if (this.currentDistrictLevel === 2) {
      chunkGroup.userData.lyariMuralWall = true;
      const muralWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 3.4, 9.5),
        new THREE.MeshLambertMaterial({ color: 0x9b4b36 })
      );
      muralWall.position.set(-10.35, getLocalY(0) + 2.0, 0);
      chunkGroup.add(muralWall);
      [
        { color: 0x168a73, y: 1.1, z: 0 },
        { color: 0xe7b94f, y: 2.0, z: -1.4 },
        { color: 0xd76a48, y: 2.0, z: 1.4 },
        { color: 0x247f91, y: 2.9, z: 0 }
      ].forEach(stripe => {
        const paint = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.54, 2.5),
          new THREE.MeshLambertMaterial({ color: stripe.color })
        );
        paint.position.set(-10.24, getLocalY(stripe.z) + stripe.y, stripe.z);
        chunkGroup.add(paint);
      });
      const muralBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 16, 12),
        new THREE.MeshLambertMaterial({ color: 0xf4ead2 })
      );
      muralBall.position.set(-10.18, getLocalY(0) + 2.0, 0);
      muralBall.scale.set(0.12, 1, 1);
      chunkGroup.add(muralBall);
    } else if (this.currentDistrictLevel === 3) {
      chunkGroup.userData.saddarHeritageFacade = true;
    }

    // Concrete flyover support pillars when road is elevated above ground
    if (startElevation > 0.5 || endElevation > 0.5) {
      [-20, 20].forEach(pz => {
        const pY = getLocalY(pz);
        if (pY > 0.8) {
          const pier = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, pY, 2.4),
            new THREE.MeshLambertMaterial({ color: 0x475569 })
          );
          pier.position.set(0, pY / 2, pz);
          chunkGroup.add(pier);
        }
      });
    }

    // Iconic Karachi landmarks from the classic city replace plain box blocks on some roadsides.
    const landmarkSides = this.addCorridorLandmarks(chunkGroup);

    // Local building styles distinguish the chosen Karachi patrol area.
    [-13.5, 13.5].forEach(sideX => {
      if (landmarkSides.has(sideX < 0 ? -1 : 1)) return;
      for (let bz = -20; bz <= 20; bz += 20) {
        const w = 6 + (Math.abs(bz) % 3);
        const h = this.currentDistrictLevel === 3
          ? 12 + ((Math.abs(bz) * 7) % 10)
          : this.currentDistrictLevel === 2
            ? 7 + ((Math.abs(bz) * 5) % 12)
            : 8 + ((Math.abs(bz) * 7) % 15);
        const d = 18;
        const color = districtStyle.buildingColors[Math.abs(Math.round(chunkZ + bz + sideX)) % districtStyle.buildingColors.length];
        const bGeo = new THREE.BoxGeometry(w, h, d);
        const bMat = new THREE.MeshLambertMaterial({ color });
        const bld = new THREE.Mesh(bGeo, bMat);
        const bldGroundY = getLocalY(bz);
        bld.position.set(sideX, bldGroundY + h / 2, bz);
        chunkGroup.add(bld);

        if (this.currentDistrictLevel === 3) {
          const facadeX = sideX < 0 ? sideX + w / 2 + 0.08 : sideX - w / 2 - 0.08;
          const trimMat = new THREE.MeshLambertMaterial({ color: 0xd7c4a1 });
          const shadowMat = new THREE.MeshLambertMaterial({ color: 0x51473e });
          const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, d + 0.6), trimMat);
          cornice.position.set(facadeX, bldGroundY + h - 0.7, bz);
          chunkGroup.add(cornice);
          [-4.8, 0, 4.8].forEach(windowZ => {
            const window = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 1.45), shadowMat);
            window.position.set(facadeX + (sideX < 0 ? 0.06 : -0.06), bldGroundY + 4.0, bz + windowZ);
            chunkGroup.add(window);
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 1.7), trimMat);
            lintel.position.set(window.position.x, bldGroundY + 5.34, bz + windowZ);
            chunkGroup.add(lintel);
          });
          [-7.4, 7.4].forEach(pierZ => {
            const pier = new THREE.Mesh(new THREE.BoxGeometry(0.28, Math.max(5, h - 2), 0.38), trimMat);
            pier.position.set(facadeX, bldGroundY + Math.max(5, h - 2) / 2, bz + pierZ);
            chunkGroup.add(pier);
          });
        }
      }
    });

    this.mergeCorridorChunk(chunkGroup);
    return chunkGroup;
  }

  // Collapses a chunk's static meshes into a few draw calls per material. Meshes are
  // grouped by road side and 6 m slab so a cross-road can hide just the overlapped part.
  mergeCorridorChunk(chunkGroup) {
    chunkGroup.updateMatrixWorld(true);
    const inverse = new THREE.Matrix4().copy(chunkGroup.matrixWorld).invert();
    const buckets = new Map();
    const getBucket = (side, slab, roadSurface) => {
      const id = side + '|' + slab + '|' + roadSurface;
      if (!buckets.has(id)) {
        const group = new THREE.Group();
        chunkGroup.add(group);
        buckets.set(id, { side, slab, roadSurface, group, groups: new Map() });
      }
      return buckets.get(id);
    };
    const slabOf = (min, max) => (max - min >= 40
      ? 'full'
      : THREE.MathUtils.clamp(Math.floor(((min + max) / 2 + 30) / 6), 0, 9));
    const meshes = [];
    chunkGroup.traverse(object => { if (object.isMesh || object.isLine || object.isSprite) meshes.push(object); });
    const tmpPos = new THREE.Vector3();
    // Snapshot transforms before detaching parents that contain other renderables.
    const renderables = meshes.map(mesh => ({
      mesh,
      rel: new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld),
      box: new THREE.Box3().setFromObject(mesh).applyMatrix4(inverse)
    }));
    renderables.forEach(({ mesh, rel, box }) => {
      const material = mesh.material;
      const roadSurface = !!mesh.userData.isRoadSurface ||
        (mesh.isMesh && box.max.y <= 0.1 && box.min.x >= -6.5 && box.max.x <= 6.5);
      tmpPos.setFromMatrixPosition(rel);
      const side = tmpPos.x < -7.2 ? 'left' : tmpPos.x > 7.2 ? 'right' : 'core';
      const mergeable = mesh.isMesh && !mesh.isSkinnedMesh && !mesh.isInstancedMesh && !Array.isArray(material) &&
        material && !material.transparent && !material.vertexColors && rel.determinant() > 0 &&
        mesh.geometry?.attributes?.position && !mesh.userData.keepSeparate;
      if (!mergeable) {
        getBucket(side, slabOf(box.min.z, box.max.z), roadSurface).group.add(mesh);
        rel.decompose(mesh.position, mesh.quaternion, mesh.scale);
        return;
      }
      let geo = mesh.geometry.clone().applyMatrix4(rel);
      if (geo.index) geo = geo.toNonIndexed();
      const count = geo.attributes.position.count;
      if (!geo.attributes.normal) geo.computeVertexNormals();
      if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
      Object.keys(geo.attributes).forEach(name => {
        if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name);
      });
      geo.computeBoundingBox();
      const bucket = getBucket(side, slabOf(geo.boundingBox.min.z, geo.boundingBox.max.z), roadSurface);
      const key = [material.type, material.color?.getHex(), material.map?.uuid, material.emissive?.getHex(),
        material.emissiveIntensity, material.side, mesh.castShadow, mesh.receiveShadow, mesh.visible].join('|');
      let entry = bucket.groups.get(key);
      if (!entry) {
        entry = { material, castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow, geoms: [] };
        bucket.groups.set(key, entry);
      }
      entry.geoms.push(geo);
      mesh.parent?.remove(mesh);
    });
    // Drop emptied containers so only merged slabs and leftovers remain.
    [...chunkGroup.children].forEach(child => {
      if (child.isMesh || child.isLine) return;
      let hasContent = false;
      child.traverse(o => { if (o !== child && (o.isMesh || o.isLight || o.isLine)) hasContent = true; });
      if (!hasContent) chunkGroup.remove(child);
    });
    const slabs = [];
    buckets.forEach(bucket => {
      bucket.groups.forEach(entry => {
        const merged = mergeGeometries(entry.geoms, false);
        entry.geoms.forEach(g => g.dispose());
        if (!merged) return;
        const mesh = new THREE.Mesh(merged, entry.material);
        mesh.castShadow = entry.castShadow;
        mesh.receiveShadow = entry.receiveShadow;
        mesh.userData.merged = true;
        bucket.group.add(mesh);
      });
      if (!bucket.group.children.length) return;
      bucket.group.name = `Merged ${bucket.side} ${bucket.slab}`;
      chunkGroup.add(bucket.group);
      const zBox = new THREE.Box3().setFromObject(bucket.group).applyMatrix4(inverse);
      bucket.group.userData = {
        side: bucket.side, slab: bucket.slab, roadSurface: bucket.roadSurface,
        zMin: zBox.min.z, zMax: zBox.max.z
      };
      slabs.push(bucket.group);
    });
    chunkGroup.userData.slabs = slabs;
  }

  // Hides straight-corridor slabs that overlap a cross-road zone (world z range). Pass null to restore.
  setCorridorZoneHidden(minZ, maxZ) {
    (this.corridorChunks || []).forEach(chunk => {
      (chunk.userData.slabs || []).forEach(slab => {
        if (slab.userData.roadSurface) return;
        const lo = chunk.position.z + slab.userData.zMin;
        const hi = chunk.position.z + slab.userData.zMax;
        slab.visible = !chunk.userData.turnExitClearance && !(minZ !== null && hi > minZ && lo < maxZ);
      });
    });
  }

  disposeRunnerObject(object) {
    this.disposedRunnerObjects ||= new WeakSet();
    if (this.disposedRunnerObjects.has(object)) return;
    this.disposedRunnerObjects.add(object);
    object.removeFromParent();

    // Model factories share these assets across chunks and the classic city.
    const shared = new Set([
      ...Object.values(KarachiModels.materials),
      CityGenerator._cachedAsphaltTexture,
      RUNNER_POTHOLE_RIM_GEOMETRY, RUNNER_POTHOLE_RIM_MATERIAL,
      RUNNER_POTHOLE_WARNING_RING_GEOMETRY, RUNNER_POTHOLE_WARNING_RING_MATERIAL,
      RUNNER_POTHOLE_WATER_GEOMETRY, RUNNER_POTHOLE_WATER_MATERIAL,
      RUNNER_POTHOLE_ARROW_GEOMETRY, RUNNER_POTHOLE_ARROW_MATERIAL,
      RUNNER_DIRECTION_ARROW_GEOMETRY
    ]);
    Object.values(KarachiModels.materials).forEach(material => {
      if (material.isMaterial) {
        Object.values(material).forEach(value => {
          if (value?.isTexture) shared.add(value);
        });
      }
    });
    const resources = new Set();
    object.traverse(child => {
      if (child.geometry && !child.isSprite) resources.add(child.geometry);
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.filter(Boolean).forEach(material => {
        if (shared.has(material)) return;
        resources.add(material);
        Object.values(material).forEach(value => {
          if (value?.isTexture) resources.add(value);
        });
      });
    });
    resources.forEach(resource => {
      if (!shared.has(resource)) resource.dispose();
    });
  }

  disposeCorridorChunk(chunk) {
    this.disposeRunnerObject(chunk);
  }

  /**
   * Spawn a Ceremonial Karachi Milestone Welcome Arch across all 3 lanes
   */
  spawnMilestoneArchAhead(name, archZ) {
    if (this.isRunnerJunctionZone(archZ)) return;
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, archZ);

    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x00e5ff });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.0, 0.8), pillarMat);
    p1.position.set(-6.0, 3.0, 0);
    archGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.0, 0.8), pillarMat);
    p2.position.set(6.0, 3.0, 0);
    archGroup.add(p2);

    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(13.2, 1.4, 0.8), new THREE.MeshStandardMaterial({
      color: 0x0d47a1,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.4
    }));
    crossBar.position.set(0, 5.8, 0);
    archGroup.add(crossBar);

    this.scene.add(archGroup);
    this.runnerObstacles.push({
      type: 'scenery_arch',
      z: archZ,
      mesh: archGroup,
      isHit: true
    });
  }

  /**
   * Main Karachi Temple Run Corridor Physics, Movement, Obstacle & Coin Collision Loop
   */
  updateTempleRunCorridor(dt) {
    if (!this.player) return;
    if (!this.player.isAlive || this.isGameOver || this.isPaused) {
      this.ui?.updateRunnerHazardWarning([], [], this.player.position.z);
      return;
    }
    if (this.runnerTurn) {
      this.updateRunnerTurnAnimation(dt);
      return;
    }
    const previousRunnerPosition = this.player.position.clone();

    // 0. Endless Procedural Corridor Chunk Recycling (Active pool of 7 modular road chunks, each 60 units long)
    if (!this.corridorChunks || this.corridorChunks.length === 0) {
      this.initCorridorTerrain();
    }
    if (this.corridorChunks && this.corridorChunks.length > 0) {
      let minZ = 0;
      for (let i = 0; i < this.corridorChunks.length; i++) {
        const cz = this.corridorChunks[i].position.z;
        if (cz < minZ) minZ = cz;
      }
      for (let i = 0; i < this.corridorChunks.length; i++) {
        const chunk = this.corridorChunks[i];
        if (chunk.position.z > this.player.position.z + 50.0) {
          const newZ = minZ - 60.0;
          this.scene.remove(chunk);
          this.disposeCorridorChunk(chunk);
          const newChunk = this.createCorridorChunk(newZ);
          this.scene.add(newChunk);
          this.corridorChunks[i] = newChunk;
          minZ = newZ;
        }
      }

      // Maintain active pool size of exactly 7 modular chunks (each 60 units long)
      while (this.corridorChunks.length < 7) {
        const newZ = minZ - 60.0;
        const newChunk = this.createCorridorChunk(newZ);
        this.scene.add(newChunk);
        this.corridorChunks.push(newChunk);
        minZ = newZ;
      }
      while (this.corridorChunks.length > 7) {
        let maxIdx = 0;
        let maxZ = -Infinity;
        for (let j = 0; j < this.corridorChunks.length; j++) {
          if (this.corridorChunks[j].position.z > maxZ) {
            maxZ = this.corridorChunks[j].position.z;
            maxIdx = j;
          }
        }
        const removed = this.corridorChunks.splice(maxIdx, 1)[0];
        this.scene.remove(removed);
        this.disposeCorridorChunk(removed);
      }
    }

    // 1. Calculate Forward Running Speed
    let speed = this.getRunnerSpeed();
    if (this.isFeverActive) {
      speed *= 1.85;
    }
    if (this.isNascarSuperSpeed) {
      speed *= 2.2;
    }
    if (this.chingchiTimer > 0) {
      speed *= 2.2;
    } else if (this.jetpackTimer > 0) {
      speed *= 1.85;
    } else if (this.nitroTimer > 0) {
      speed *= 2.1;
    } else if (this.turboTimer > 0 || this.isBoosting) {
      speed *= 1.45;
    }
    // Speed boost while actively drafting behind a lead vehicle
    if (this.isDrafting && this.draftCharge > 0) {
      speed += 8.5 * this.draftCharge;
    }
    if (this.runnerSection?.type === 'flyover') speed *= 1.08;

    // W-11 Minibus Roof Surfing: 50% Speed Boost!
    if (this.isBusSurfing) {
      speed *= 1.50;
    }

    // Stumble penalty: reduce currentSpeed by 25% for 1.5 seconds
    if (this.runnerStumbleTimer > 0) {
      this.runnerStumbleTimer = Math.max(0, this.runnerStumbleTimer - dt);
      speed *= 0.75;
    }

    this.player.currentSpeed = speed;

    // 4. Audio: Pitch up background music dynamically by 5% every time player speed increases
    const baseRunnerSpeed = this.runSpeed || 13.5;
    if (this.player && Number.isFinite(this.player.currentSpeed)) {
      const speedDelta = Math.max(0, this.player.currentSpeed - baseRunnerSpeed);
      const speedTiers = Math.floor(speedDelta / 1.0);
      const targetPitch = 1.0 + (speedTiers * 0.05);
      if (typeof audio !== 'undefined' && audio.getMusicPitch && Math.abs(audio.getMusicPitch() - targetPitch) > 0.005) {
        audio.setMusicPitch(targetPitch);
      }
    }

    // Calculate real-time NASCAR Cockpit metrics
    const kmh = Math.round(speed * 3.6);
    this.currentKmh = kmh;
    const gear = kmh < 45 ? 1 : kmh < 85 ? 2 : kmh < 125 ? 3 : kmh < 165 ? 4 : 5;
    this.currentGear = gear;
    const gearMin = [0, 0, 45, 85, 125, 165][gear];
    const gearMax = [0, 45, 85, 125, 165, 230][gear];
    const rpm = Math.round(2500 + ((kmh - gearMin) / Math.max(1, gearMax - gearMin)) * 5500);
    this.currentRpm = rpm;

    // 2. Fixed-Duration 180ms Eased Lane Switching (Subway Surfers signature snappiness)
    if (this.isAutoPilotActive) this.executeRunnerAutoPilot(dt);
    if (this.runnerTurn) {
      this.updateRunnerTurnAnimation(dt);
      return;
    }
    this.currentLane = THREE.MathUtils.clamp(Math.round(this.currentLane || 0), -1, 1);
    this.laneWidth = 3.2;
    this.targetLaneX = this.currentLane * this.laneWidth;

    if ((this.laneChangeTimer || 0) < (this.laneChangeDuration || 0.18)) {
      this.laneChangeTimer = Math.min(this.laneChangeDuration || 0.18, (this.laneChangeTimer || 0) + dt);
      const t = this.laneChangeTimer / (this.laneChangeDuration || 0.18);
      // Smooth cubic ease-out curve
      const s = 1.0 - Math.pow(1.0 - t, 3);
      this.player.position.x = (this.laneChangeStartX || 0) + (this.targetLaneX - (this.laneChangeStartX || 0)) * s;

      // Dynamic athletic banking roll peaking at midpoint
      const rollFactor = Math.sin(t * Math.PI);
      this.currentBankRoll = (this.targetBankRoll || 0) * rollFactor;
    } else {
      this.player.position.x = THREE.MathUtils.lerp(
        this.player.position.x,
        this.targetLaneX,
        Math.min(1.0, dt * 25.0)
      );
      this.currentBankRoll = THREE.MathUtils.lerp(this.currentBankRoll || 0, 0, Math.min(1.0, dt * 16.0));
    }

    // Update Runner Invulnerability Grace Timer & Blinking Mesh
    if ((this.runnerInvulnerableTimer || 0) > 0) {
      this.runnerInvulnerableTimer = Math.max(0, this.runnerInvulnerableTimer - dt);
      if (this.player.avatarMesh) {
        this.player.avatarMesh.visible = (Math.floor(Date.now() / 90) % 2 === 0);
      }
    } else {
      if (this.player && this.player.avatarMesh) {
        this.player.avatarMesh.visible = true;
      }
    }

    // 3. Forward Movement Along Street (Heading North towards -Z)
    let travelled = speed * dt;
    if (this.runnerJunction?.kind === 'turn' && !this.runnerJunction.resolved) {
      const entry = this.runnerJunction.turnQueued ? RUNNER_TURN_ENTRY_METERS : RUNNER_TURN_LAST_INPUT_METERS;
      travelled = Math.min(travelled, Math.max(0, this.player.position.z - this.runnerJunction.z - entry));
    }
    this.player.position.z -= travelled;
    this.distanceMeters += travelled;

    // Funnel Tracking: Fire progression events every 500 meters to build a retention funnel
    this.lastFunnelMeters = this.lastFunnelMeters || 0;
    while (this.distanceMeters >= this.lastFunnelMeters + 500) {
      this.lastFunnelMeters += 500;
      this.recordProgressionFunnel(this.lastFunnelMeters);
    }

    if (this.updateRunnerProgression()) return;
    this.updateRunnerWeather(dt);
    this.updateRunnerNavigation(dt);
    if (this.isGameOver) return;
    if (this.runnerTurn) {
      this.updateRunnerTurnAnimation(0);
      return;
    }

    // Sync 3D group position, orientation, and banking roll
    this.player.group.position.x = this.player.position.x;
    this.player.group.position.z = this.player.position.z;
    this.player.facingAngle = Math.PI;
    this.player.targetRotationY = Math.PI;
    this.player.group.rotation.y = Math.PI;
    this.player.group.rotation.z = this.currentBankRoll;
    if (this.player.avatarMesh) {
      this.player.avatarMesh.rotation.z = this.currentBankRoll;
    }

    // 4. Camera Rig: Lock smoothly behind player
    // following player.position.x * 0.45 smoothly for dynamic lane switches
    if (this.camera) {
      const baseGroundY = this.getCorridorGroundHeight(this.player.position.z, this.player.position.x);
      const groundY = baseGroundY + (this.isBusSurfing ? 3.15 : 0);
      const narrowViewport = THREE.MathUtils.clamp((1.15 - this.camera.aspect) / 0.65, 0, 1);
      const horizontalCameraFollow = THREE.MathUtils.lerp(0.45, 0.72, narrowViewport);
      const horizontalLookAhead = THREE.MathUtils.lerp(0.65, 0.95, narrowViewport);
      const targetCamX = this.player.position.x * horizontalCameraFollow;
      const targetCamY = (this.player.position.y || 0) + 2.85 + (this.jetpackTimer > 0 ? 3.6 : 0) + (this.runnerCameraLift || 0);
      const targetCamZ = this.player.position.z + 5.2;
      
      const targetLookX = this.player.position.x * horizontalLookAhead;
      const targetLookY = (this.player.position.y || 0) + 1.25 + (this.jetpackTimer > 0 ? 2.5 : 0);
      const targetLookZ = this.player.position.z - 18.0;

      if (Number.isNaN(targetLookX) || Number.isNaN(targetLookY) || Number.isNaN(targetLookZ)) {
        console.warn("NaN detected in camera target. Aborting frame update.");
        return;
      }

      if ((this.cameraSmoothTimer || 0) > 0 && this.cameraSmoothPos && this.cameraSmoothLookAt) {
        this.cameraSmoothTimer = Math.max(0, this.cameraSmoothTimer - dt);
        const smoothRate = Math.min(1.0, dt * 7.0);
        this.cameraSmoothPos.x = THREE.MathUtils.lerp(this.cameraSmoothPos.x, targetCamX, smoothRate);
        this.cameraSmoothPos.y = THREE.MathUtils.lerp(this.cameraSmoothPos.y, targetCamY, smoothRate);
        this.cameraSmoothPos.z = THREE.MathUtils.lerp(this.cameraSmoothPos.z, targetCamZ, smoothRate);
        this.cameraSmoothLookAt.x = THREE.MathUtils.lerp(this.cameraSmoothLookAt.x, targetLookX, smoothRate);
        this.cameraSmoothLookAt.y = THREE.MathUtils.lerp(this.cameraSmoothLookAt.y, targetLookY, smoothRate);
        this.cameraSmoothLookAt.z = THREE.MathUtils.lerp(this.cameraSmoothLookAt.z, targetLookZ, smoothRate);
        this.camera.position.copy(this.cameraSmoothPos);
        this.camera.lookAt(this.cameraSmoothLookAt);
      } else {
        this.camera.position.x = THREE.MathUtils.lerp(
          this.camera.position.x,
          targetCamX,
          Math.min(1.0, dt * 6.0)
        );
        this.camera.position.y = THREE.MathUtils.lerp(
          this.camera.position.y,
          targetCamY,
          Math.min(1.0, dt * 12.0)
        );
        this.camera.position.z = targetCamZ;
        this.camera.lookAt(targetLookX, targetLookY, targetLookZ);
      }

      // Parallax Backdrop & Sky Dome Synchronization
      if (this.skyDome) {
        this.skyDome.position.set(this.player.position.x * 0.1, (this.player.position.y || 0) * 0.1, this.player.position.z);
      }
      if (this.skylineBackdrop) {
        this.skylineBackdrop.position.set(this.player.position.x * 0.15, 0, this.player.position.z);
        if (this.skylineBackdrop.userData.beacon) {
          // Aviation red beacon blinks every 800ms
          this.skylineBackdrop.userData.beacon.visible = Math.floor(Date.now() / 800) % 2 === 0;
        }
      }

      // Dynamic Speed Wind Lines (Subway Surfers tunnel rush FX)
      if (this.speedWindLines) {
        const isHighSpeed = speed > 21.0 || (this.nitroTimer > 0) || (this.chingchiTimer > 0) || (this.turboTimer > 0);
        if (isHighSpeed && this.camera) {
          this.speedWindLines.visible = true;
          this.speedWindLines.position.copy(this.camera.position);
          this.speedWindLines.rotation.copy(this.camera.rotation);
          const targetOpacity = Math.min(0.48, (speed - 16.0) * 0.03 + ((this.nitroTimer > 0) ? 0.25 : 0));
          this.speedWindLines.children.forEach(line => {
            if (line.material) line.material.opacity = targetOpacity;
            line.position.z += dt * speed * (line.userData.speedFactor || 1.0);
            if (line.position.z > 8.0) line.position.z = -12.0;
          });
        } else {
          this.speedWindLines.visible = false;
        }
      }

      // Breathing Emissive Pulse on Neon Signage (Gantry chevrons, beacons)
      if (this.runnerJunction && this.runnerJunction.group) {
        const pulse = 0.45 + Math.sin(Date.now() * 0.006) * 0.25;
        this.runnerJunction.group.traverse(child => {
          if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = pulse;
          }
        });
      }
    }

    // 5. Update Vertical Traversal (Jump gravity & arc, Jetpack sky flight, Sloped Terrain Grounding, Roof Surfing)
    const baseGroundY = this.getCorridorGroundHeight(this.player.position.z, this.player.position.x);
    const groundY = baseGroundY + (this.isBusSurfing ? 3.15 : 0);
    if (this.jetpackTimer > 0) {
      this.jetpackTimer = Math.max(0, this.jetpackTimer - dt);
      const skyAltitude = groundY + 4.8;
      this.player.position.y = THREE.MathUtils.lerp(this.player.position.y, skyAltitude, dt * 5.0);
      this.player.isGrounded = false;
      this.player.group.position.y = this.player.position.y;
      this.particles.createSkidSmoke(new THREE.Vector3(this.player.position.x, this.player.position.y - 0.4, this.player.position.z + 0.3), 1);
      this.particles.createDevourSparkles(new THREE.Vector3(this.player.position.x, this.player.position.y - 0.4, this.player.position.z + 0.3), 2, 0x00e5ff);
    } else if (!this.player.isGrounded || (this.player.position.y || 0) > groundY + 0.05 || this.player.velocityY !== 0) {
      const gravity = this.isFastFalling ? 45.0 : 18.0;
      this.player.velocityY -= gravity * dt;
      this.player.position.y += this.player.velocityY * dt;
      if (this.player.position.y <= groundY) {
        this.player.position.y = groundY;
        this.player.velocityY = 0;
        this.player.isGrounded = true;
        if (this.isFastFalling) {
          this.isFastFalling = false;
          this.isSliding = true;
          this.slideTimer = Math.max(this.slideTimer || 0, 0.65);
          this.particles?.createSkidSmoke?.(this.player.position, 8);
          audio?.playSlide?.();
        }
      }
      this.player.group.position.y = this.player.position.y;
    } else {
      // Grounded: smoothly snap to terrain height beneath player
      this.player.position.y = THREE.MathUtils.lerp(
        this.player.position.y,
        groundY,
        Math.min(1.0, dt * 25.0)
      );
      this.player.velocityY = 0;
      this.player.isGrounded = true;
      this.isFastFalling = false;
      this.player.group.position.y = this.player.position.y;
    }

    // 5b. Ground Contact Blob Shadows (Subway Surfers Contact Grounding)
    if (this.playerBlobShadow) {
      if (this.player && this.player.isAlive && !this.isGameOver) {
        this.playerBlobShadow.visible = true;
        this.playerBlobShadow.position.set(this.player.position.x, groundY + 0.03, this.player.position.z);
        const jumpElevation = Math.max(0, (this.player.position.y || 0) - groundY);
        if (this.isSliding) {
          this.playerBlobShadow.scale.set(1.15, 1, 1.45);
          this.playerBlobShadow.material.opacity = 0.75;
        } else if (jumpElevation > 0.05) {
          const shrinkFactor = Math.max(0.35, 1.0 - jumpElevation * 0.16);
          this.playerBlobShadow.scale.set(shrinkFactor, 1, shrinkFactor);
          this.playerBlobShadow.material.opacity = Math.max(0.12, 0.65 - jumpElevation * 0.18);
        } else {
          this.playerBlobShadow.scale.set(1.0, 1, 1.0);
          this.playerBlobShadow.material.opacity = 0.70;
        }
      } else {
        this.playerBlobShadow.visible = false;
      }
    }

    if (this.chingchiTimer > 0) {
      this.chingchiTimer = Math.max(0, this.chingchiTimer - dt);
      this.particles.createDevourSparkles(this.player.position, 1, 0xffd600);
    }
    if (this.nitroTimer > 0) {
      this.nitroTimer = Math.max(0, this.nitroTimer - dt);
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
      if (this.player) this.player.isShielded = (this.shieldTimer > 0);
    }
    if (this.magnetTimer > 0) {
      this.magnetTimer = Math.max(0, this.magnetTimer - dt);
    }
    if (this.doubleCoinsTimer > 0) {
      this.doubleCoinsTimer = Math.max(0, this.doubleCoinsTimer - dt);
      if (Math.random() < 0.25) {
        this.particles.createDevourSparkles(this.player.position, 1, 0xffd700);
      }
    }

    // 6. Update Slide Timer & Mesh Crouch Scale (Scale Y to 0.42 for 0.72s to duck under hanging wires)
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.player.avatarMesh) {
        this.player.avatarMesh.scale.set(1.15, 0.42, 1.25);
        this.player.avatarMesh.position.y = -0.32;
      }
      this.particles.createSkidSmoke(this.player.position, 1);
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.slideTimer = 0;
        if (this.player.avatarMesh) {
          this.player.avatarMesh.scale.set(1, 1, 1);
          this.player.avatarMesh.position.y = 0;
        }
      }
    }

    // 6. Limb Animation
    if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.updateAnimation && this.player?.avatarMesh) {
      AvatarBuilder.updateAnimation(this.player.avatarMesh, true, dt, speed / 14.0, !this.player.isGrounded);
    }

    // 7. Check Karachi Milestone Badges & Archway Celebrations (Every 500m)
    for (let i = 0; i < this.milestones.length; i++) {
      const m = this.milestones[i];
      if (this.distanceMeters >= m.dist && !this.passedMilestoneIndices.has(i)) {
        this.passedMilestoneIndices.add(i);
        this.currentMilestone = m.name;
        audio.playDistrictClearedFanfare();
        this.particles.createCelebrationConfetti(this.player.position, 50);
        this.ui.showAnnouncement(`🚩 KARACHI MILESTONE: ${m.name}! +1000 PTS`, '#00e5ff');
        this.awardRunnerXP(1000);
        this.score += 1000;
        this.spawnMilestoneArchAhead(m.name, this.player.position.z - 25.0);
      }
    }

    // 8. Dynamic Runner Waves Spawning Ahead
    const waveSpacing = this.getRunnerWaveSpacing();
    if (this.nextRunnerWaveZ > this.player.position.z - 15.0) {
      this.nextRunnerWaveZ = this.player.position.z - 25.0;
    }
    while (this.nextRunnerWaveZ > this.player.position.z - 110.0) {
      if (this.runnerJunction && this.nextRunnerWaveZ < this.runnerJunction.z + 75.0) break;
      this.spawnRunnerWave(this.nextRunnerWaveZ);
      this.spawnRunnerSectionExtras(this.nextRunnerWaveZ - waveSpacing * 0.5);
      this.nextRunnerWaveZ -= waveSpacing;
    }

    // 8b. Karachi Word Hunt (K-A-R-A-C-H-I) Letters Spawning Ahead
    if (!this.nextWordLetterZ || this.nextWordLetterZ > this.player.position.z - 15.0) {
      this.nextWordLetterZ = this.player.position.z - 30.0;
    }
    while (this.nextWordLetterZ > this.player.position.z - 120.0) {
      if (this.runnerJunction && Math.abs(this.nextWordLetterZ - this.runnerJunction.z) < 35.0) {
        this.nextWordLetterZ -= 50.0;
        continue;
      }
      if (this.wordHuntCollected.length < this.wordHuntTarget.length) {
        const char = this.wordHuntTarget[this.wordHuntCollected.length];
        const letterMesh = KarachiModels.createWordLetter(char);
        const laneIdx = (this.wordHuntCollected.length * 2 + 1) % 3;
        const laneX = [-3.2, 0, 3.2][laneIdx];
        const groundY = this.getCorridorGroundHeight(this.nextWordLetterZ, laneX);
        letterMesh.position.set(laneX, groundY + 1.25, this.nextWordLetterZ);
        this.scene.add(letterMesh);
        this.runnerWordLetters.push({ mesh: letterMesh, char, z: this.nextWordLetterZ, laneX });
      }
      this.nextWordLetterZ -= 55.0;
    }

    // 9. Collect Rupee Coins
    const pPos = this.player.position;
    if (this.ui) {
      this.ui.updateRunnerHazardWarning(this.runnerObstacles, this.runnerTraffic, pPos.z);
    }
    this.updateRunnerCoins(dt, previousRunnerPosition);

    // 9b. Collect Word Hunt Letters
    if (this.runnerWordLetters && this.runnerWordLetters.length > 0) {
      for (let i = this.runnerWordLetters.length - 1; i >= 0; i--) {
        const item = this.runnerWordLetters[i];
        if (!item || !item.mesh) continue;
        item.mesh.rotation.y += dt * 3.0;
        item.mesh.position.y += Math.sin(Date.now() * 0.005 + i) * 0.005;

        const dist = item.mesh.position.distanceTo(pPos);
        const pathDistSq = runnerSegmentDistanceSquared3D(item.mesh.position, previousRunnerPosition, pPos);
        if (dist < 1.65 || pathDistSq < 1.65 * 1.65) {
          const char = item.char;
          audio?.playLetterChime?.(this.wordHuntCollected.length);
          this.wordHuntCollected.push(char);
          this.particles?.createCelebrationConfetti?.(item.mesh.position, 28);
          this.addFeverCharge(25);
          this.recordRunnerStunt(`🔤 LETTER '${char}'!`, 350);
          if (this.ui?.updateWordHunt) {
            this.ui.updateWordHunt(this.wordHuntCollected);
          }
          if (this.wordHuntCollected.length >= this.wordHuntTarget.length) {
            audio?.playWordComplete?.();
            this.particles?.createCelebrationConfetti?.(this.player.position, 80);
            this.coins += 5000;
            this.score += 5000;
            this.awardRunnerXP(5000);
            this.activateJunoonFever();
            this.ui?.showAnnouncement?.('🎉 WORD COMPLETE: K-A-R-A-C-H-I! 5,000 RS + JUNOON FEVER RUSH! 🎸🔥', '#ffd700');
            this.ui?.showFloatingFeedback?.('🔥 JUNOON FEVER RUSH!', this.player.position, '#ffd700');
            this.wordHuntCollected = [];
            if (this.ui?.updateWordHunt) this.ui.updateWordHunt([]);
          }
          this.disposeRunnerObject(item.mesh);
          this.runnerWordLetters.splice(i, 1);
        } else if (item.z > pPos.z + 28.0) {
          this.disposeRunnerObject(item.mesh);
          this.runnerWordLetters.splice(i, 1);
        }
      }
    }

    // 10. Collect Power-Ups
    for (let i = this.runnerPowerups.length - 1; i >= 0; i--) {
      const p = this.runnerPowerups[i];
      if (!p || !p.mesh) continue;

      p.mesh.rotation.y += dt * 2.8;
      const dist = p.mesh.position.distanceTo(pPos);
      const pathDistSq = runnerSegmentDistanceSquared3D(p.mesh.position, previousRunnerPosition, pPos);
      if (dist < 1.55 || pathDistSq < 1.55 * 1.55) {
        const type = p.type;
        if (type === 'chingchi') {
          this.chingchiTimer = 9.0;
          this.player.isBoosting = true;
          this.activePowerUp = { title: 'Super Chingchi Smash 🛺', timer: 9.0 };
          audio.playMusicalHorn();
          this.cameraShakeTimer = 0.25;
          this.particles.createCelebrationConfetti(this.player.position, 28);
          this.ui.showAnnouncement('🛺 SUPER CHINGCHI SMASH! Plow through everything! 💥', '#ffd600');
          this.ui.showFloatingFeedback('🛺 CHINGCHI SMASH!', this.player.position, '#ffd600');
        } else if (type === 'jetpack') {
          this.jetpackTimer = 8.0;
          this.activePowerUp = { title: 'Chai Rocket Jetpack 🚀', timer: 8.0 };
          audio.playJetpackWhoosh();
          this.cameraShakeTimer = 0.2;
          this.particles.createCelebrationConfetti(this.player.position, 28);
          this.ui.showAnnouncement('🚀 CHAI ROCKET JETPACK! Sky Flight Above Traffic! ✨', '#00e5ff');
          this.ui.showFloatingFeedback('🚀 SKY FLIGHT!', this.player.position, '#00e5ff');
          for (let s = 1; s <= 8; s++) {
            const skyZ = pPos.z - s * 5.0;
            const skyCoin = KarachiModels.createRupeeCoin(100);
            skyCoin.position.set(this.targetLaneX, 5.0, skyZ);
            this.scene.add(skyCoin);
            this.runnerCoins.push({ mesh: skyCoin, x: this.targetLaneX, z: skyZ, value: 100 });
          }
        } else if (type === 'mystery_box') {
          audio.playMysteryBox();
          this.particles.createCelebrationConfetti(p.mesh.position, 35);
          const roll = Math.random();
          if (roll < 0.45) {
            this.coins += 1000;
            this.score += 1000;
            this.awardRunnerXP(1000);
            this.ui.showAnnouncement('🎁 MYSTERY CRATE JACKPOT! +1,000 RS! 💰', '#ffd700');
            this.ui.showFloatingFeedback('💰 +1,000 RS JACKPOT!', this.player.position, '#ffd700');
          } else if (roll < 0.70) {
            saveManager.addReviveToken();
            this.ui.updateReviveTokenCount(saveManager.getReviveTokenCount());
            this.ui.showAnnouncement('🎁 MYSTERY CRATE: FREE RESCUE TOKEN! ✨', '#00e5ff');
            this.ui.showFloatingFeedback('✨ RESCUE TOKEN!', this.player.position, '#00e5ff');
          } else {
            this.chingchiTimer = 7.0;
            this.player.isBoosting = true;
            this.activePowerUp = { title: 'Surprise Chingchi 🛺', timer: 7.0 };
            audio.playMusicalHorn();
            this.ui.showAnnouncement('🎁 MYSTERY CRATE: SECRET CHINGCHI TURBO! 🛺💨', '#76ff03');
            this.ui.showFloatingFeedback('🛺 SURPRISE CHINGCHI!', this.player.position, '#76ff03');
          }
        } else if (type === 'cng') {
          const nitroLvl = saveManager.getPowerUpUpgradeLevel('nitro');
          const duration = 6.0 * (1.0 + (nitroLvl - 1) * 0.25);
          this.nitroTimer = duration;
          this.player.isBoosting = true;
          this.activePowerUp = { title: `CNG Turbo Nitro ⚡ (Lvl ${nitroLvl})`, timer: duration };
          audio.playBunKababSizzle();
          this.ui.showAnnouncement(`⚡ CNG TURBO NITRO! Invulnerable Super Speed! (${duration.toFixed(1)}s)`, '#00e5ff');
        } else if (type === 'shield') {
          const shieldLvl = saveManager.getPowerUpUpgradeLevel('shield');
          const duration = 14.0 * (1.0 + (shieldLvl - 1) * 0.25);
          this.shieldTimer = duration;
          if (this.player) this.player.isShielded = true;
          this.activePowerUp = { title: `Water Tanker Iron Shield 🛡️ (Lvl ${shieldLvl})`, timer: duration };
          audio.playShieldAbsorb();
          this.ui.showAnnouncement(`🛡️ WATER TANKER IRON SHIELD! Absorbs 1 Crash! (${duration.toFixed(1)}s)`, '#00bcd4');
        } else if (type === 'magnet') {
          const magnetLvl = saveManager.getPowerUpUpgradeLevel('magnet');
          const duration = 10.0 * (1.0 + (magnetLvl - 1) * 0.25);
          this.magnetTimer = duration;
          this.activePowerUp = { title: `Burns Road Biryani Magnet 🧲 (Lvl ${magnetLvl})`, timer: duration };
          audio.playMagnetHum();
          this.ui.showAnnouncement(`🧲 BURNS ROAD BIRYANI MAGNET! Rupee Coins Attracted! (${duration.toFixed(1)}s)`, '#ffd700');
        } else if (type === 'double_coins' || type === 'double') {
          const doubleLvl = saveManager.getPowerUpUpgradeLevel('double_coins');
          const duration = 10.0 * (1.0 + (doubleLvl - 1) * 0.25);
          this.doubleCoinsTimer = duration;
          this.activePowerUp = { title: `Double Rupee Coins 🪙 (Lvl ${doubleLvl})`, timer: duration };
          audio.playMelodicCoin(5);
          this.ui.showAnnouncement(`🪙 DOUBLE RUPEE COINS! 2X Multiplier! (${duration.toFixed(1)}s)`, '#ffd700');
        } else if (type === 'chai') {
          const previousHearts = this.hearts;
          this.hearts = Math.min(this.maxHearts, this.hearts + 1);
          if (this.hearts > previousHearts) this.unlockRunnerBadge('lifesaver');
          audio.playHeartGain();
          this.particles.createCelebrationConfetti(this.player.position, 20);
          this.ui.showAnnouncement('🫖 DOODH PATTI CHAI! Restored 1 Heart ❤️!', '#00e676');
          this.ui.showFloatingFeedback('+1 ❤️ CHAI HEAL', this.player.position, '#00e676');
        } else if (type === 'jump') {
          const jumpLvl = saveManager.getPowerUpUpgradeLevel('jump');
          const duration = 10.0 * (1.0 + (jumpLvl - 1) * 0.25);
          const jumpPower = 11.5 + (jumpLvl - 1) * 1.5;
          this.superJumpTimer = duration;
          this.activePowerUp = { title: `Hydraulic Jump Springs 👟 (Lvl ${jumpLvl})`, timer: duration };
          audio.playJump();
          this.player.jump(jumpPower);
          this.cameraShakeTimer = 0.2;
          this.particles.createCelebrationConfetti(this.player.position, 30);
          this.ui.showAnnouncement(`👟 HYDRAULIC JUMP SPRINGS! High Aerial Clearance! 🏙️ (${duration.toFixed(1)}s)`, '#76ff03');
          this.ui.showFloatingFeedback('🚀 SUPER JUMP!', this.player.position, '#76ff03');
          // Spawn overhead arc of high-value Rupee coins across the sky
          for (let s = 1; s <= 7; s++) {
            const skyZ = pPos.z - s * 5.2;
            const arcY = 4.2 + Math.sin((s / 7) * Math.PI) * 2.0;
            const skyCoin = KarachiModels.createRupeeCoin(100);
            skyCoin.position.set(this.targetLaneX, arcY, skyZ);
            this.scene.add(skyCoin);
            this.runnerCoins.push({ mesh: skyCoin, x: this.targetLaneX, z: skyZ, value: 100, isRoofCoin: true });
          }
        } else if (type === 'cricket_bat') {
          const batLvl = saveManager.getPowerUpUpgradeLevel('cricket_bat');
          const duration = 18.0 * (1.0 + (batLvl - 1) * 0.25);
          this.cricketBatTimer = duration;
          this.activePowerUp = { title: `🏏 Tape-Ball Cricket Bat (Lvl ${batLvl})`, timer: duration };
          audio?.playCricketCrack?.();
          audio?.playMusicalHorn?.();
          this.cameraShakeTimer = 0.2;
          this.particles?.createCelebrationConfetti?.(this.player.position, 30);
          if (!this.cricketBatMesh && this.player?.group) {
            this.cricketBatMesh = KarachiModels.createCricketBatPickup();
            this.cricketBatMesh.position.set(0.65, 0.75, 0.15);
            this.cricketBatMesh.rotation.set(0.4, 0.2, -0.5);
            this.player.group.add(this.cricketBatMesh);
          }
          this.ui?.showAnnouncement?.(`🏏 TAPE-BALL CRICKET BAT! Hit obstacles for SIX! 🚀 (${duration.toFixed(1)}s)`, '#76ff03');
          this.ui?.showFloatingFeedback?.('🏏 SIXER BAT!', this.player.position, '#76ff03');
        }

        this.particles.createDevourSparkles(p.mesh.position, 14, 0x00e5ff);
        this.disposeRunnerObject(p.mesh);
        this.runnerPowerups.splice(i, 1);
      }
    }

    for (let i = this.runnerReviveTokens.length - 1; i >= 0; i--) {
      const token = this.runnerReviveTokens[i];
      if (!token?.mesh) continue;
      token.mesh.rotation.y += dt * 2.4;
      const distance = token.mesh.position.distanceTo(pPos);
      const pathDistanceSq = runnerSegmentDistanceSquared3D(token.mesh.position, previousRunnerPosition, pPos);
      if (distance < 1.55 || pathDistanceSq < 1.55 * 1.55) {
        if (saveManager.addReviveToken()) {
          audio.playCoin();
          this.particles.createCelebrationConfetti(token.mesh.position, 16);
          this.ui.updateReviveTokenCount(saveManager.getReviveTokenCount());
          this.ui.showAnnouncement(
            `✨ RESCUE TOKEN! ${saveManager.getReviveTokenCount()} AVAILABLE`,
            '#ffd700'
          );
        } else if (saveManager.getReviveTokenCount() < MAX_REVIVE_TOKENS) {
          console.error('[SAVE] Could not persist collected runner Rescue Token.');
          this.ui.showAnnouncement('Could not save this Rescue Token. Check device storage.', '#ff5252');
        }
        this.disposeRunnerObject(token.mesh);
        this.runnerReviveTokens.splice(i, 1);
      }
    }

    // 11. Check Runner Obstacle Collisions
    if ((this.runnerInvulnerableTimer || 0) <= 0) {
      for (let i = 0; i < this.runnerObstacles.length; i++) {
        const obs = this.runnerObstacles[i];
        if (!obs || obs.isHit || !obs.mesh) continue;

        // Shrink obstacle bounding box by 20% relative to visual meshes (1.4 -> 1.12)
        const crossesObstacle = runnerSegmentCrossesZ(obs.z, previousRunnerPosition.z, pPos.z, 1.12);
        const crossesVisualZ = runnerSegmentCrossesZ(obs.z, previousRunnerPosition.z, pPos.z, 1.40);
        const isLowHazard = obs.hazardType === 'LOW_HAZARD' ||
          ['gutter', 'digging', 'sewage', 'pothole', 'football', 'combined_roadwork'].includes(obs.type);
        const obstacleGroundY = this.getCorridorGroundHeight(obs.z, obs.laneX || 0);
        const clearsLowHazard = isLowHazard && (
          (!this.player.isGrounded && pPos.y > obstacleGroundY + 0.28) ||
          previousRunnerPosition.y > obstacleGroundY + 0.28
        );
        if (crossesObstacle) {
          if (obs.type === 'overhead_bridge_sign') {
            if (!this.isBusSurfing) {
              // Ground runners pass safely underneath high overhead bridge sign clearance (3.52m)
              obs.isHit = true;
            } else {
              // Roof surfing: check if player swiped left/right to open lane OR is sliding
              const isLaneBlocked = !obs.blockedLanes || obs.blockedLanes.some(lx => Math.abs(this.targetLaneX - lx) < 1.0);
              if (!isLaneBlocked) {
                // Dodged by swiping left/right across the bus roof
                obs.isHit = true;
                this.awardRunnerXP(250);
                this.score += 250;
                this.ui?.showFloatingFeedback?.('⚡ DODGED BRIDGE SIGN! +250 XP', this.player.position, '#00e5ff');
              } else if (this.isSliding) {
                // Dodged by ducking / sliding under low sign on bus roof
                obs.isHit = true;
                this.awardRunnerXP(300);
                this.score += 300;
                audio.playSlide();
                this.ui?.showFloatingFeedback?.('💨 SLID UNDER BRIDGE! +300 XP', this.player.position, '#76ff03');
              } else {
                this.handleRunnerHit(obs, '🌉 Low-Hanging Bridge Sign');
              }
            }
          } else if (this.isBusSurfing && (obs.hazardType === 'LOW_HAZARD' || obs.type === 'gutter' || obs.type === 'digging' ||
                     obs.type === 'sewage' || obs.type === 'pothole' || obs.type === 'football' ||
                     obs.type === 'combined_roadwork' || obs.hazardType === 'FULL_BLOCK' || obs.type === 'rickshaw' ||
                     obs.type === 'snatcher' || obs.type === 'water_tanker' || obs.type === 'market_cart')) {
            // Invulnerable to ground hazards (gutters/potholes/traffic) while surfing on roof!
            if (!obs.isGrazed) {
              obs.isGrazed = true;
              this.ui?.showFloatingFeedback?.('🏄 SURFED OVER HAZARD!', this.player.position, '#00e5ff');
            }
          } else if (obs.hazardType === 'HIGH_HAZARD' || obs.type === 'wire' || obs.type === 'heritage_scaffold') {
            if (this.isSliding) {
              obs.isHit = true;
              this.awardRunnerXP(150);
              this.score += 150;
              audio.playSlide();
              this.ui.showFloatingFeedback(
                obs.type === 'wire' ? '⚡ SLID UNDER!' : '🏛️ CLEARED THE SCAFFOLD!',
                this.player.position,
                '#00e5ff'
              );
            } else {
              this.handleRunnerHit(
                obs,
                obs.type === 'wire' ? '⚡ Hanging Wires' : '🏛️ Saddar Heritage Scaffolding'
              );
            }
          } else if (obs.hazardType === 'LOW_HAZARD' || obs.type === 'gutter' || obs.type === 'digging' ||
                     obs.type === 'sewage' || obs.type === 'pothole' || obs.type === 'football' ||
                     obs.type === 'combined_roadwork') {
            const laneDistanceSq = runnerSegmentDistanceSquared(
              obs.laneX,
              obs.z,
              previousRunnerPosition,
              pPos
            );
            // Shrink obstacle bounding box by 20% (1.35 -> 1.08)
            if (laneDistanceSq < 1.08 * 1.08) {
              const groundYAtObstacle = this.getCorridorGroundHeight(obs.z, obs.laneX || 0);
              const isAirborneAboveObstacle = (!this.player.isGrounded && this.player.position.y > groundYAtObstacle + 0.28) ||
                (previousRunnerPosition.y > groundYAtObstacle + 0.28);
              if (isAirborneAboveObstacle) {
                obs.isHit = true;
                this.guttersJumped = (this.guttersJumped || 0) + 1;
                this.awardRunnerXP(150);
                this.score += 150;
                this.ui.showFloatingFeedback('💨 CLEARED JUMP!', this.player.position, '#00e676');
              } else {
                const label = obs.type === 'gutter'
                  ? '🕳️ Open Gutter'
                  : obs.type === 'digging'
                    ? '🚧 Road Digging'
                    : obs.type === 'pothole'
                      ? '🕳️ Rain-Softened Pothole'
                      : obs.type === 'football'
                        ? '⚽ Lyari Street Football'
                        : obs.type === 'combined_roadwork'
                          ? '🚧 Combined Roadwork'
                          : '🌊 Sewage Overflow';
                this.handleRunnerHit(obs, label);
              }
            } else if (laneDistanceSq < 1.35 * 1.35 && !obs.isGrazed && !clearsLowHazard) {
              // Collision forgiveness window saves player from heart loss -> trigger stumble
              obs.isGrazed = true;
              const label = obs.type === 'gutter'
                ? '🕳️ Open Gutter'
                : obs.type === 'digging'
                  ? '🚧 Road Digging'
                  : obs.type === 'pothole'
                    ? '🕳️ Rain-Softened Pothole'
                    : obs.type === 'football'
                      ? '⚽ Lyari Street Football'
                      : obs.type === 'combined_roadwork'
                        ? '🚧 Combined Roadwork'
                        : '🌊 Sewage Overflow';
              this.triggerRunnerStumble(obs, label);
            }
          } else if (obs.hazardType === 'FULL_BLOCK' || obs.type === 'rickshaw' || obs.type === 'snatcher' ||
                     obs.type === 'water_tanker' || obs.type === 'market_cart') {
            const laneDistanceSq = runnerSegmentDistanceSquared(
              obs.laneX,
              obs.z,
              previousRunnerPosition,
              pPos
            );
            // Shrink obstacle bounding box by 20% (1.35 -> 1.08)
            if (laneDistanceSq < 1.08 * 1.08) {
              const label = obs.type === 'rickshaw'
                ? '🛺 Stalled Qingqi Rickshaw'
                : obs.type === 'snatcher'
                  ? '🏍️ 70cc Snatcher'
                  : obs.type === 'water_tanker'
                    ? '🚰 PECHS Water-Tanker Queue'
                    : obs.type === 'market_cart'
                      ? '🛒 Saddar Market Handcart'
                      : '🚧 Full Block Hazard';
              this.handleRunnerHit(obs, label);
            } else if (laneDistanceSq < 1.35 * 1.35 && !obs.isGrazed) {
              // Collision forgiveness window saves player from heart loss -> trigger stumble
              obs.isGrazed = true;
              const label = obs.type === 'rickshaw'
                ? '🛺 Stalled Qingqi Rickshaw'
                : obs.type === 'snatcher'
                  ? '🏍️ 70cc Snatcher'
                  : obs.type === 'water_tanker'
                    ? '🚰 PECHS Water-Tanker Queue'
                    : obs.type === 'market_cart'
                      ? '🛒 Saddar Market Handcart'
                      : '🚧 Full Block Hazard';
              this.triggerRunnerStumble(obs, label);
            }
          }
        } else if (crossesVisualZ && !obs.isGrazed) {
          if (this.isBusSurfing) continue;
          if (obs.hazardType === 'HIGH_HAZARD' || obs.type === 'wire' || obs.type === 'heritage_scaffold') {
            if (!this.isSliding) {
              obs.isGrazed = true;
              this.triggerRunnerStumble(
                obs,
                obs.type === 'wire' ? '⚡ Hanging Wires' : '🏛️ Saddar Heritage Scaffolding'
              );
            }
          } else {
            const laneDistanceSq = runnerSegmentDistanceSquared(
              obs.laneX,
              obs.z,
              previousRunnerPosition,
              pPos
            );
            if (laneDistanceSq < 1.35 * 1.35 && !clearsLowHazard) {
              obs.isGrazed = true;
              const label = obs.type === 'gutter'
                ? '🕳️ Open Gutter'
                : obs.type === 'rickshaw'
                  ? '🛺 Stalled Qingqi Rickshaw'
                  : obs.type === 'digging'
                    ? '🚧 Road Digging'
                    : obs.type === 'pothole'
                      ? '🕳️ Rain-Softened Pothole'
                      : obs.type === 'snatcher'
                        ? '🏍️ 70cc Snatcher'
                        : obs.type === 'water_tanker'
                          ? '🚰 PECHS Water-Tanker Queue'
                          : obs.type === 'market_cart'
                            ? '🛒 Saddar Market Handcart'
                            : obs.type === 'football'
                              ? '⚽ Lyari Street Football'
                              : obs.type === 'combined_roadwork'
                                ? '🚧 Combined Roadwork'
                                : '🚧 Road Hazard';
              this.triggerRunnerStumble(obs, label);
            }
          }
        }
        if (previousRunnerPosition.z >= obs.z && pPos.z <= obs.z &&
            !obs.nearMissRewarded && !obs.isHit && !obs.isGrazed && !this.isBusSurfing &&
            obs.hazardType !== 'HIGH_HAZARD' && obs.type !== 'wire' &&
            obs.type !== 'heritage_scaffold' && obs.type !== 'overhead_bridge_sign') {
          const dz = previousRunnerPosition.z - pPos.z;
          const t = dz > 0 ? (previousRunnerPosition.z - obs.z) / dz : 0;
          const crossingX = THREE.MathUtils.lerp(previousRunnerPosition.x, pPos.x, t);
          const lateralDist = Math.abs((obs.laneX || 0) - crossingX);
          if (lateralDist > 1.35 && lateralDist < 3.4) {
            obs.nearMissRewarded = true;
            this.score += 250;
            this.awardRunnerXP(250);
            this.runnerNearMissCount = (this.runnerNearMissCount || 0) + 1;
            this.nearMissCount = (this.nearMissCount || 0) + 1;
            if (this.runnerNearMissCount >= 5) this.unlockRunnerBadge('road_safety');
            this.particles.createDevourSparkles(this.player.position, 8, 0xffd700);
            audio.playNearMiss();
            this.ui.showFloatingFeedback('⚡ NEAR MISS! +250 PTS', this.player.position, '#ffd700');
          }
        }
      }
    }

    // 11b. Update Highway Cruising Traffic Vehicles & Drafting Physics
    const nowTime = performance.now();
    this.isDrafting = false;

    if (this.runnerTraffic) {
      for (let i = 0; i < this.runnerTraffic.length; i++) {
        const v = this.runnerTraffic[i];
        if (!v || !v.mesh) continue;

        // Traffic vehicles cruise forward along the street
        const previousTrafficZ = v.mesh.position.z;
        v.mesh.position.z -= v.speed * dt;
        v.mesh.position.x = v.laneX;
        v.mesh.position.y = this.getCorridorGroundHeight(v.mesh.position.z, v.laneX);

        // Check if player is drafting directly behind vehicle
        const distZ = pPos.z - v.mesh.position.z; // positive when player is behind vehicle
        const distX = Math.abs(pPos.x - v.laneX);

        if (distX < 1.35 && distZ > 1.8 && distZ < 12.0) {
          this.isDrafting = true;
          this.draftCharge = Math.min(1.0, (this.draftCharge || 0) + dt * 0.85);
          if (v.ribbons) v.ribbons.visible = true;

          if (!this.lastDraftSfx || (nowTime - this.lastDraftSfx > 350)) {
            audio.playDraftingWhoosh();
            this.lastDraftSfx = nowTime;
          }
        } else {
          if (v.ribbons) v.ribbons.visible = false;
        }

        // Check crash into traffic vehicle (Shrunk bounding box by 20%)
        if (!v.isHit && (this.runnerInvulnerableTimer || 0) <= 0 && !this.isBusSurfing) {
          const absDz = Math.abs(pPos.z - v.mesh.position.z);
          const relativeStartX = previousRunnerPosition.x - v.laneX;
          const relativeStartZ = previousRunnerPosition.z - previousTrafficZ;
          const relativeEndX = pPos.x - v.laneX;
          const relativeEndZ = pPos.z - v.mesh.position.z;
          const relativeDx = relativeEndX - relativeStartX;
          const relativeDz = relativeEndZ - relativeStartZ;
          const relativeLengthSq = relativeDx * relativeDx + relativeDz * relativeDz;
          const closestT = relativeLengthSq > 0
            ? THREE.MathUtils.clamp(-(relativeStartX * relativeDx + relativeStartZ * relativeDz) / relativeLengthSq, 0, 1)
            : 0;
          const closestRelativeX = relativeStartX + relativeDx * closestT;
          const closestRelativeZ = relativeStartZ + relativeDz * closestT;
          const sweptDistanceSq = closestRelativeX * closestRelativeX + closestRelativeZ * closestRelativeZ;
          if ((absDz < 1.28 && distX < 1.04) || sweptDistanceSq < 1.04 * 1.04) {
            if (this.chingchiTimer > 0) {
              v.isHit = true;
              audio.playSmashObstacle();
              this.cameraShakeTimer = 0.35;
              this.particles.createCelebrationConfetti(v.mesh.position, 28);
              this.particles.createImpactDust(v.mesh.position, 18);
              this.ui.showAnnouncement(`🛺💥 CHINGCHI RAM! ${v.label} OBLITERATED! +1,000 PTS`, '#ffd600');
              this.ui.showFloatingFeedback('🛺 RAMMED! +1000', this.player.position, '#ffd600');
              this.awardRunnerXP(1000);
              this.score += 1000;
              this.disposeRunnerObject(v.mesh);
            } else if (this.nitroTimer > 0) {
              v.isHit = true;
              audio.playCrash();
              this.particles.createDevourSparkles(v.mesh.position, 25, 0xffd700);
              this.ui.showAnnouncement(`💥 TRAFFIC CRASH! ${v.label} CLEARED! +500 PTS`, '#ff9100');
              this.awardRunnerXP(500);
              this.score += 500;
              this.disposeRunnerObject(v.mesh);
            } else {
              this.handleRunnerHit(v, v.label);
            }
          } else if (((absDz < 1.55 && distX < 1.30) || sweptDistanceSq < 1.30 * 1.30) && !v.isGrazed) {
            // Collision forgiveness window on traffic: grazing without direct hit
            v.isGrazed = true;
            this.triggerRunnerStumble(v, v.label);
          } else if (
            ((absDz < 1.5 && distX >= 1.04 && distX <= 2.2) ||
              (sweptDistanceSq >= 1.04 * 1.04 && sweptDistanceSq <= 2.2 * 2.2)) &&
            !v.nearMissAwarded && !v.isGrazed && kmh >= 75
          ) {
            v.nearMissAwarded = true;
            audio.playNearMiss();
            this.awardRunnerXP(250);
            this.runnerNearMissCount++;
            this.nearMissCount = (this.nearMissCount || 0) + 1;
            if (this.runnerNearMissCount >= 5) this.unlockRunnerBadge('road_safety');
            this.score += 250;
            this.ui.showFloatingFeedback('⚡ DRAFT OVERTAKE! +250 XP', pPos, '#00e5ff');
          }
        }
      }
    }

    if (!this.isDrafting) {
      this.draftCharge = Math.max(0, (this.draftCharge || 0) - dt * 0.45);
    }

    // 11c. Check NASCAR Asphalt Nitro Boost Pads
    if (this.runnerBoostPads) {
      for (let i = 0; i < this.runnerBoostPads.length; i++) {
        const b = this.runnerBoostPads[i];
        if (!b || !b.mesh || b.isUsed) continue;
        const absDz = Math.abs(pPos.z - b.z);
        const distX = Math.abs(pPos.x - b.laneX);
        const pathDistanceSq = runnerSegmentDistanceSquared(
          b.laneX,
          b.z,
          previousRunnerPosition,
          pPos
        );
        if ((absDz < 1.9 && distX < 1.3) || pathDistanceSq < 1.3 * 1.3) {
          b.isUsed = true;
          if (b.isSpringPad) {
            audio.playJump();
            this.player.jump(12.5);
            this.superJumpTimer = Math.max(this.superJumpTimer || 0, 6.0);
            this.cameraShakeTimer = 0.25;
            this.awardRunnerXP(300);
            this.score += 300;
            this.particles.createCelebrationConfetti(b.mesh.position, 28);
            this.ui.showAnnouncement('👟 HYDRAULIC TRAMPOLINE! Mega Aerial Launch! 🏙️', '#76ff03');
            this.ui.showFloatingFeedback('🚀 AERIAL LAUNCH!', pPos, '#76ff03');
            // High sky coin trail ahead
            for (let s = 1; s <= 6; s++) {
              const skyZ = pPos.z - s * 5.5;
              const arcY = 4.5 + Math.sin((s / 6) * Math.PI) * 2.2;
              const skyCoin = KarachiModels.createRupeeCoin(100);
              skyCoin.position.set(b.laneX, arcY, skyZ);
              this.scene.add(skyCoin);
              this.runnerCoins.push({ mesh: skyCoin, x: b.laneX, z: skyZ, value: 100, isRoofCoin: true });
            }
          } else {
            audio.playBoostPad();
            this.nitroTimer = Math.max(this.nitroTimer, 3.8);
            this.cameraShakeTimer = 0.3;
            this.awardRunnerXP(300);
            this.score += 300;
            this.particles.createDevourSparkles(b.mesh.position, 22, 0x00e5ff);
            this.ui.showAnnouncement('🚀 STREET BOOST PAD! 180+ KM/H!', '#76ff03');
            this.ui.showFloatingFeedback('⚡ SPEED BOOST!', pPos, '#76ff03');
          }
        }
      }
    }

    // 11c2. Update W-11 Surfing Buses, Rear Ramp Trigger & Surfing Lifecycle
    if (this.surfingBuses && this.surfingBuses.length > 0) {
      for (let i = this.surfingBuses.length - 1; i >= 0; i--) {
        const bus = this.surfingBuses[i];
        if (!bus || !bus.mesh) continue;

        if (bus.isRetiring) {
          bus.mesh.position.z -= (bus.speed || 6.0) * dt;
          bus.mesh.position.x += 1.8 * dt; // Pull aside to shoulder
          if (bus.mesh.position.z > pPos.z + 30 || bus.mesh.position.z < pPos.z - 90) {
            this.disposeRunnerObject(bus.mesh);
            this.surfingBuses.splice(i, 1);
          }
          continue;
        }

        if (!this.isBusSurfing && !bus.isSurfed) {
          bus.mesh.position.z -= bus.speed * dt;
          bus.mesh.position.y = this.getCorridorGroundHeight(bus.mesh.position.z, bus.laneX);

          const busZ = bus.mesh.position.z;
          const distZ = pPos.z - busZ; // positive when player is behind bus
          const distX = Math.abs(pPos.x - bus.laneX);

          // 1. The Trigger: Rear Ramp attached to back of moving W-11 minibus
          if (distX < 2.0) {
            if (distZ <= 8.5 && distZ >= 3.1) {
              // Running up the ramp
              const rampProgress = (8.5 - distZ) / 5.4; // 0 at bottom, 1 at top
              const targetRampY = bus.mesh.position.y + 0.05 + rampProgress * 3.07;
              this.player.position.y = Math.max(this.player.position.y, targetRampY);
              this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, bus.laneX, 0.12);
              this.player.isGrounded = true;
            } else if (distZ < 3.1 && distZ > -3.5) {
              // Snaps to the roof of the bus!
              bus.isSurfed = true;
              this.isBusSurfing = true;
              this.busSurfingTimer = 15.0;
              this.surfingBus = bus;
              this.player.position.y = bus.mesh.position.y + 3.15;
              this.player.velocityY = 0;
              this.player.isGrounded = true;

              audio.playPowerUp();
              audio.playMusicalHorn();
              this.particles?.createCelebrationConfetti?.(this.player.position, 40);
              this.ui?.showAnnouncement?.('🏄 W-11 MINIBUS SURFING! +50% SPEED BOOST!', '#00e5ff');
              this.ui?.showFloatingFeedback?.('🏄 ROOF SURFING! +50% SPEED', this.player.position, '#00e5ff');
              this.awardRunnerXP(500);
              this.score += 500;
              try { leaderboardService.recordChallengeProgress('surf_minibus', 1); } catch {}
              this.recordGameOpsEvent?.('runner.w11_surfing_start', { distanceMeters: Math.round(this.distanceMeters) });
            }
          }
        } else if (this.isBusSurfing && this.surfingBus === bus) {
          // Synchronize bus position with player on the roof
          bus.mesh.position.z = this.player.position.z;
          bus.mesh.position.y = this.getCorridorGroundHeight(this.player.position.z, this.player.position.x);
          bus.mesh.position.x = THREE.MathUtils.lerp(bus.mesh.position.x, this.player.position.x * 0.72, Math.min(1.0, dt * 12.0));

          // Surfing timer countdown (15 seconds)
          this.busSurfingTimer -= dt;
          if (this.busSurfingTimer <= 0) {
            // 3. The Exit: 15s expired -> Hard brake screech & launch onto asphalt
            this.exitBusSurfing();
          }
        }
      }
    }

    // 11d. Dynamic Banking Roll & Camera FOV Punch
    if (this.player?.group) {
      this.player.group.rotation.z = this.currentBankRoll || 0;
    }
    if (this.player?.avatarMesh) {
      this.player.avatarMesh.rotation.z = this.currentBankRoll || 0;
    }

    if (this.camera) {
      const baseSpeed = 13.5;
      const speedNorm = THREE.MathUtils.clamp((speed - baseSpeed) / 14.5, 0, 1);
      const feverBonus = this.isFeverActive ? 8.0 : 0.0;
      const targetFov = 62.0 + (speedNorm * 5.0) + (this.nitroTimer > 0 ? 3.5 : 0.0) + feverBonus;
      const clampedFov = THREE.MathUtils.clamp(targetFov, 60.0, 75.0);
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, clampedFov, Math.min(1.0, dt * 4.0));
      this.camera.updateProjectionMatrix();

      const rollAngle = (this.targetLaneX - this.player.position.x) * -0.015;
      this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, rollAngle, dt * 6.0);
    }

    // 11e. Update Havaldar CD-70 Chaser System
    if (this.chaserMesh) {
      if (this.chaserStumbleGraceTimer > 0) {
        this.chaserStumbleGraceTimer = Math.max(0, this.chaserStumbleGraceTimer - dt);
        if (this.chaserStumbleGraceTimer <= 0) {
          this.targetChaserDistance = 12.0;
        }
      }
      if (this.targetChaserDistance > 9.0 && this.chaserDistance > 8.0) {
        this.isChaserClose = false;
      }
      this.chaserDistance = THREE.MathUtils.lerp(
        this.chaserDistance,
        this.targetChaserDistance,
        Math.min(1.0, dt * 2.5)
      );

      const targetChaserX = THREE.MathUtils.lerp(this.chaserMesh.position.x, this.player.position.x, Math.min(1.0, dt * 7.0));
      const chaserZ = this.player.position.z + this.chaserDistance;
      const chaserGroundY = this.getCorridorGroundHeight(chaserZ, targetChaserX);
      this.chaserMesh.position.set(targetChaserX, chaserGroundY, chaserZ);

      if (this.chaserMesh.userData?.frontWheel) {
        this.chaserMesh.userData.frontWheel.rotation.x -= dt * (speed / 0.35);
      }
      if (this.chaserMesh.userData?.rearWheel) {
        this.chaserMesh.userData.rearWheel.rotation.x -= dt * (speed / 0.35);
      }
      if (this.chaserMesh.userData?.blueSiren && this.chaserMesh.userData?.redSiren) {
        const strobe = (Math.floor(Date.now() / 120) % 2 === 0);
        this.chaserMesh.userData.blueSiren.material.emissiveIntensity = strobe ? 2.0 : 0.1;
        this.chaserMesh.userData.redSiren.material.emissiveIntensity = strobe ? 0.1 : 2.0;
      }
      if (Math.random() < 0.25) {
        this.particles?.createSkidSmoke?.(new THREE.Vector3(targetChaserX, chaserGroundY + 0.15, chaserZ + 0.9), 1);
      }
    }

    // 11f. Update Qingqi Hover-Surfer Skateboard
    if (this.hoverboardTimer > 0) {
      this.hoverboardTimer = Math.max(0, this.hoverboardTimer - dt);
      if (this.hoverboardMesh) {
        this.hoverboardMesh.visible = true;
        this.hoverboardMesh.position.set(this.player.position.x, this.player.position.y + 0.12, this.player.position.z);
        this.hoverboardMesh.rotation.y = this.player.group.rotation.y;
        this.hoverboardMesh.rotation.z = this.currentBankRoll || 0;
        if (Math.random() < 0.3) {
          this.particles?.createDevourSparkles?.(this.hoverboardMesh.position, 1, 0x00e5ff);
        }
      }
      if (this.hoverboardTimer <= 0) {
        this.hoverboardCooldown = 12.0;
        if (this.hoverboardMesh) this.hoverboardMesh.visible = false;
        this.ui?.showAnnouncement?.('🛹 Hover-Surfer Expired', '#ffd700');
      }
    } else {
      if (this.hoverboardMesh) this.hoverboardMesh.visible = false;
      if (this.hoverboardCooldown > 0) {
        this.hoverboardCooldown = Math.max(0, this.hoverboardCooldown - dt);
      }
    }
    if (this.ui?.updateHoverboard) {
      this.ui.updateHoverboard(this.hoverboardTimer, this.hoverboardCooldown);
    }

    // 11g. Update 🏏 Tape-Ball Cricket Master Bat
    if (this.cricketBatTimer > 0) {
      this.cricketBatTimer = Math.max(0, this.cricketBatTimer - dt);
      if (this.cricketBatMesh) {
        this.cricketBatMesh.visible = true;
        this.cricketBatMesh.rotation.x = 0.4 + Math.sin(Date.now() * 0.012) * 0.35;
      }
      if (this.cricketBatTimer <= 0) {
        if (this.cricketBatMesh && this.player?.group) {
          this.player.group.remove(this.cricketBatMesh);
          this.disposeRunnerObject(this.cricketBatMesh);
          this.cricketBatMesh = null;
        }
        this.ui?.showAnnouncement?.('🏏 Cricket Bat Expired', '#ffd700');
      }
    }

    // 11h. Update Junoon Fever Rush
    if (this.isFeverActive) {
      this.feverTimer = Math.max(0, this.feverTimer - dt);
      if (Math.random() < 0.4) {
        this.particles?.createDevourSparkles?.(this.player.position, 2, 0x00e5ff);
      }
      if (this.ui?.updateFeverMeter) {
        this.ui.updateFeverMeter((this.feverTimer / 8.5) * 100, true);
      }
      if (this.feverTimer <= 0) {
        this.isFeverActive = false;
        this.feverCharge = 0;
        if (this.ui?.updateFeverMeter) this.ui.updateFeverMeter(0, false);
        this.ui?.showAnnouncement?.('⚡ Junoon Fever Rush Ended', '#ffd700');
      }
    } else {
      if (this.feverCharge > 0) {
        this.feverCharge = Math.max(0, this.feverCharge - dt * 1.5);
        if (this.ui?.updateFeverMeter) this.ui.updateFeverMeter(this.feverCharge, false);
      }
    }

    // 11i. Update Combo Streak Multiplier
    if (this.runnerComboTimer > 0) {
      this.runnerComboTimer = Math.max(0, this.runnerComboTimer - dt);
      if (this.runnerComboTimer <= 0) {
        this.runnerComboStreak = 1;
        const comboEl = document.getElementById('hud-combo');
        if (comboEl) comboEl.style.display = 'none';
      }
    }

    // 12. Despawn Passed Objects Behind Player (> 28m)
    for (let i = this.runnerObstacles.length - 1; i >= 0; i--) {
      const obs = this.runnerObstacles[i];
      if (obs && obs.z > pPos.z + 28.0) {
        if (obs.mesh) this.disposeRunnerObject(obs.mesh);
        this.runnerObstacles.splice(i, 1);
      }
    }
    for (let i = this.runnerCoins.length - 1; i >= 0; i--) {
      const c = this.runnerCoins[i];
      if (c && c.z > pPos.z + 28.0) {
        if (c.mesh) this.disposeRunnerObject(c.mesh);
        this.runnerCoins.splice(i, 1);
      }
    }
    for (let i = this.runnerPowerups.length - 1; i >= 0; i--) {
      const p = this.runnerPowerups[i];
      if (p && p.z > pPos.z + 28.0) {
        if (p.mesh) this.disposeRunnerObject(p.mesh);
        this.runnerPowerups.splice(i, 1);
      }
    }
    for (let i = this.runnerReviveTokens.length - 1; i >= 0; i--) {
      const token = this.runnerReviveTokens[i];
      if (token && token.z > pPos.z + 28.0) {
        if (token.mesh) this.disposeRunnerObject(token.mesh);
        this.runnerReviveTokens.splice(i, 1);
      }
    }
    if (this.runnerTraffic) {
      for (let i = this.runnerTraffic.length - 1; i >= 0; i--) {
        const v = this.runnerTraffic[i];
        if (v && v.mesh && v.mesh.position.z > pPos.z + 32.0) {
          this.disposeRunnerObject(v.mesh);
          this.runnerTraffic.splice(i, 1);
        }
      }
    }
    if (this.surfingBuses) {
      for (let i = this.surfingBuses.length - 1; i >= 0; i--) {
        const b = this.surfingBuses[i];
        if (b && b.mesh && !this.isBusSurfing && b.mesh.position.z > pPos.z + 32.0) {
          this.disposeRunnerObject(b.mesh);
          this.surfingBuses.splice(i, 1);
        }
      }
    }
    if (this.runnerBoostPads) {
      for (let i = this.runnerBoostPads.length - 1; i >= 0; i--) {
        const b = this.runnerBoostPads[i];
        if (b && b.mesh && b.z > pPos.z + 32.0) {
          this.disposeRunnerObject(b.mesh);
          this.runnerBoostPads.splice(i, 1);
        }
      }
    }

    // 13. Auto-Stuck Watchdog (Triggers rescue if player stops moving forward for > 1.8s)
    if (this.lastRunnerZ === undefined) this.lastRunnerZ = this.player.position.z;
    const deltaRunnerZ = Math.abs(this.player.position.z - this.lastRunnerZ);
    if (deltaRunnerZ < 0.25) {
      this.stuckWatchdogTimer = (this.stuckWatchdogTimer || 0) + dt;
      if (this.stuckWatchdogTimer >= 1.8) {
        this.stuckWatchdogTimer = 0;
        this.lastRunnerZ = this.player.position.z;
        this.recoverStuckRunner();
      }
    } else {
      this.stuckWatchdogTimer = 0;
      this.lastRunnerZ = this.player.position.z;
    }
  }

  /**
   * Interactive Citizen Dialogue Interaction
   */
  interactWithNearbyCitizen() {
    if (!this.player || !this.isGameStarted || this.isPaused) return;
    const nearby = this.findNearbyKeyCitizen(4.5);
    if (nearby && nearby.userData && nearby.userData.citizenId) {
      this.pauseGame();
      this.ui.showCitizenDialogue(
        nearby.userData.citizenId,
        (citizenId, choice) => {
          if (this.player && choice.xpBonus) {
            this.player.addXP(choice.xpBonus);
            audio.playDialogueChime();
            this.particles.createCelebrationConfetti(this.player.position, 25);
            this.ui.showFloatingFeedback(`+${choice.xpBonus} XP • CITIZEN ALLY`, this.player.position, '#00e676');
          }
          saveManager.recordCitizenConversation(citizenId, choice.id);
          saveManager.addPlayerXP(choice.xpBonus || 50);
          saveManager.updateDistrictGauges(this.currentDistrictLevel, { safety: 5, cleanliness: 3 });
          saveManager.save();
        },
        () => {
          this.resumeGame();
        }
      );
    }
  }

  findNearbyKeyCitizen(maxDistance = 4.5) {
    if (!this.keyCitizens || !this.player) return null;
    let closest = null;
    let closestDistSq = maxDistance * maxDistance;

    for (let i = 0; i < this.keyCitizens.length; i++) {
      const npc = this.keyCitizens[i];
      if (!npc || !npc.position) continue;
      const dx = this.player.position.x - npc.position.x;
      const dz = this.player.position.z - npc.position.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = npc;
      }
    }
    return closest;
  }

  /**
   * Mission Journal & District Restoration Gauges Modal
   */
  openMissionJournal() {
    if (!this.isGameStarted || this.isTempleRun) return;
    this.pauseGame();

    const dConfig = getDistrictConfig(this.currentDistrictLevel);
    const savedDistrict = (saveManager.get().districts && saveManager.get().districts[this.currentDistrictLevel]) || {};

    const districtData = {
      name: dConfig.name,
      subtitle: dConfig.tagline || dConfig.urdu || 'Civic Cleansing',
      gauges: {
        cleanliness: savedDistrict.cleanliness || 45,
        infrastructure: savedDistrict.infrastructure || 40,
        trafficFlow: savedDistrict.trafficFlow || 55,
        safety: savedDistrict.safety || 60
      },
      missions: (dConfig.missions || []).map(m => ({
        ...m,
        completed: (savedDistrict.completedMissions || []).includes(m.id)
      }))
    };

    const careerStats = saveManager.get().player;
    const badges = new Set(saveManager.get().badges || ['water_guardian']);

    this.ui.showMissionJournal(districtData, careerStats, badges, () => {
      this.resumeGame();
    });
  }

  /**
   * Resume Previous Player Career Progression
   */
  loadCareerSave(saveData) {
    if (!saveData || !saveData.player) return;
    if (this.player) {
      this.player.name = saveData.player.name || 'Karachi Hero';
      if (saveData.player.avatarId) {
        this.player.setAvatar(saveData.player.avatarId);
      }
      this.player.level = Math.max(1, Number(saveData.player.level) || 1);
      this.player.xp = Number(saveData.player.careerXP) || 0;
      this.player.score = Number(saveData.player.careerXP) || 0;
      this.score = Number(this.score) || 0;
      const targetRadius = (LEVEL_CONFIG[Math.min(this.player.level - 1, LEVEL_CONFIG.length - 1)] || LEVEL_CONFIG[0]).radius;
      this.player.radius = targetRadius;
      this.player.targetRadius = targetRadius;
      this.player.updateNameTag();
    }

    const targetDistrict = Math.min(saveData.highestDistrictUnlocked || 1, Object.keys(DISTRICT_CONFIGS).length);
    if (targetDistrict > 1) {
      this.currentDistrictLevel = targetDistrict - 1;
      this.advanceToNextDistrict();
    }

    this.isGameStarted = true;
    this.clock.getDelta();
    audio.startMusic();
    this.ui.showAnnouncement(`💾 CAREER RESUMED: WELCOME ${this.player.name.toUpperCase()} (LV.${this.player.level})!`, '#00e5ff');
  }

  restoreSavedCareerProgress() {
    const savedPlayer = saveManager.get().player;
    if (!this.player || !savedPlayer) return;
    this.player.name = savedPlayer.name || 'Karachi Hero';
    this.player.setAvatar(
      saveManager.isAvatarUnlocked(savedPlayer.avatarId) ? savedPlayer.avatarId : 'tariq'
    );
    this.player.level = Math.max(1, Number(savedPlayer.level) || 1);
    this.player.xp = Number(savedPlayer.careerXP) || 0;
    this.player.score = Number(savedPlayer.careerXP) || 0;
    this.score = Number(this.score) || 0;
    this.player.radius = 1.45;
    this.player.targetRadius = 1.45;
    this.player.updateNameTag();
  }

  resetCareerProgress() {
    if (this.player) {
      this.player.name = 'Karachi Hero';
      this.player.setAvatar('tariq');
      this.player.level = 1;
      this.player.xp = 0;
      this.player.score = 0;
      this.player.radius = 1.45;
      this.player.targetRadius = 1.45;
      this.player.updateNameTag();
    }
    this.runnerDifficulty = 'standard';
    this.runSpeed = RUNNER_SPEEDS.standard;
    this.currentDistrictLevel = 1;
    this.distanceMeters = 0;
    this.lastFunnelMeters = 0;
    this.coins = 0;
    this.runnerRunRecorded = true;
    this.hearts = 3;
    this.loadDistrictLevel(1, false);
    this.returnToMainMenu();
  }

  startGame() {
    if (this.isGameStarted && !this.isPaused) return;
    if (!this.isGameStarted && this.isTempleRun) {
      this.runnerRunRecorded = false;
      this.resetRunnerNavigation();
    }
    this.isGameStarted = true;
    this.isPaused = false;
    this.clock.getDelta(); // Clear delta buffer so physics ticks smoothly from frame 1
    audio.startMusic();
    audio.resumeAudio();

    if (this.isTempleRun) {
      this.clearRunnerObjects();
      this.score = 0;
      this.magnetTimer = 0;
      this.turboTimer = 0;
      this.nitroTimer = 0;
      this.shieldTimer = 0;
      this.superJumpTimer = 0;
      this.hornCooldownTimer = 0;
      const hornButton = document.getElementById('btn-horn');
      if (hornButton) {
        hornButton.classList.remove('is-cooling-down', 'is-recharged');
        const hint = hornButton.querySelector('.horn-hint');
        if (hint) hint.textContent = 'TAP / H';
      }
      this.chingchiTimer = 0;
      this.jetpackTimer = 0;
      this.runnerInvulnerableTimer = 0;
      this.activePowerUp = null;
      this.coinComboCount = 0;
      this.lastCoinPickupTime = 0;
      this.isNascarSuperSpeed = false;
      this.isBoosting = false;
      this.isSliding = false;
      this.slideTimer = 0;
      this.currentBankRoll = 0;
      this.targetBankRoll = 0;
      this.passedMilestoneIndices = new Set([0]);
      this.player.velocityY = 0;
      this.player.isGrounded = true;
      this.player.isShielded = false;
      if (this.player.avatarMesh) this.player.avatarMesh.position.y = 0;
      this.distanceMeters = 0;
      if (saveManager.data?.hasHeadstart > 0) {
        saveManager.data.hasHeadstart--;
        saveManager.save();
        this.distanceMeters = 500;
        this.nitroTimer = 8.0;
        this.runnerInvulnerableTimer = 8.0;
        this.isBoosting = true;
        if (this.player) this.player.isBoosting = true;
        this.ui?.showAnnouncement?.('🚀 HEADSTART ENGAGED! 500M ROCKET LAUNCH!', '#00e5ff');
      }
      this.lastFunnelMeters = 0;
      this.runnerRouteComplete = false;
      this.runnerNeighborhoodIndex = 1;
      this.runnerAreaIndex = 0;
      this.currentDistrictLevel = 1;
      this.currentMilestone = getKarachiNeighborhoodName(1);
      this.player.position.set(0, 0, 60.0);
      this.player.group.position.set(0, 0, 60.0);
      this.initCorridorTerrain();
      this.runnerWeatherState = 'clear';
      this.runnerRainOverride = null;
      this.coins = 0;
      this.hearts = 3;
      this.runnerWaveCount = 0;
      this.runnerPowerupDropCount = 0;
      this.runnerNearMissCount = 0;
      this.nearMissCount = 0;
      this.currentLane = 0;
      this.targetLaneX = 0;
      this.nextRunnerWaveZ = 40.0;
    this.nextWordLetterZ = -30.0;
    this.wordHuntCollected = [];
    this.nextSurfingBusDist = 60.0;
    if (this.ui?.updateWordHunt) this.ui.updateWordHunt([]); // safe coin-only warmup ahead
      if (this.camera) {
        this.camera.position.set(0, 2.85, 65.2);
        this.camera.lookAt(0, 1.25, 42.0);
      }
      if (this.ui) {
        this.ui.setRunnerMode(true);
        const tutorialSeenKey = 'karachi_runner_tutorial_seen_v1';
        let hasSeenTutorial = false;
        try {
          hasSeenTutorial = localStorage.getItem(tutorialSeenKey) === 'true';
        } catch (error) {
          console.warn('[RUNNER_TUTORIAL] Could not read tutorial state:', error);
        }
        if (!hasSeenTutorial) {
          this.isPaused = true;
          this.ui.showRunnerTutorial(4000, () => {
            this.__runnerTutorialResumeTimeout = setTimeout(() => {
              try {
                localStorage.setItem(tutorialSeenKey, 'true');
              } catch (error) {
                console.warn('[RUNNER_TUTORIAL] Could not save tutorial state:', error);
              }
              if (this.isGameStarted && this.isTempleRun && !this.isGameOver) {
                this.isPaused = false;
                this.clock.getDelta();
              }
            }, 1000);
          });
        } else {
          this.ui.hideRunnerTutorial();
        }
      }
    } else {
      if (this.ui) {
        this.ui.setRunnerMode(false);
      }
    }

    if (this.ui) {
      if (this.ui.hud) this.ui.hud.style.display = '';
      if (this.ui.startModal) this.ui.startModal.style.display = 'none';
      if (this.ui.hideAutoPauseModal) this.ui.hideAutoPauseModal();
      if (this.ui.hideTapToStartPrompt) this.ui.hideTapToStartPrompt();
    }
  }

  setMajorGameVersion(versionId, reloadDistrict = true, source = 'main') {
    if (!['v1', 'v2', 'v3'].includes(versionId)) {
      if (versionId === 'holeDevourer' || versionId === 'classic') versionId = 'v1';
      else if (versionId === 'civicSavior' || versionId === 'openWorld') versionId = 'v2';
      else if (versionId === 'templeRun' || versionId === 'runner') versionId = 'v3';
      else versionId = 'v3';
    }
    if (versionId !== 'v3' && source !== 'master-control') {
      this.ui?.syncActiveVersionUI(this.majorVersion);
      this.ui?.showAnnouncement('🔒 v1 and v2 are available from Master Mode only.', '#ffd700');
      return false;
    }
    this.majorVersion = versionId;
    try {
      localStorage.setItem('karachi_major_version', versionId);
    } catch (e) {}

    this.isTempleRun = (versionId === 'v3');
    if (this.isTempleRun) {
      if (this.navGuideGroup) this.navGuideGroup.visible = false;
      this.currentTargetObjective = null;
    } else if (this.runnerRainEffect) {
      this.runnerRainEffect.mesh.visible = false;
    }
    this.cityGen?.setWorldVisible(!this.isTempleRun);
    if (this.ui && typeof this.ui.setRunnerMode === 'function') {
      this.ui.setRunnerMode(this.isTempleRun);
    }

    if (this.player) {
      if (versionId === 'v1') {
        // v1.0: Classic Hole Devourer
        if (this.player.avatarMesh) this.player.avatarMesh.visible = false;
        if (this.player.ringMesh) this.player.ringMesh.visible = true;
        if (this.player.innerRingMesh) this.player.innerRingMesh.visible = true;
        if (this.player.shadowMesh) this.player.shadowMesh.visible = false;
        this.cameraWideMode = true;
      } else {
        // v2.0 Civic Hero or v3.0 Temple Run
        if (this.player.avatarMesh) this.player.avatarMesh.visible = true;
        if (this.player.ringMesh) this.player.ringMesh.visible = false;
        if (this.player.innerRingMesh) this.player.innerRingMesh.visible = false;
        if (this.player.shadowMesh) this.player.shadowMesh.visible = true;
        this.cameraWideMode = false;
      }
    }

    if (this.ui && typeof this.ui.syncActiveVersionUI === 'function') {
      this.ui.syncActiveVersionUI(versionId);
    }

    const versionNames = {
      v1: 'v1.0 Classic Hole Devourer 🕳️',
      v2: 'v2.0 Karachi Civic Hero (3D Patrol) 🦸',
      v3: 'KARACHI RUNNER 🏃'
    };
    if (this.ui) {
      this.ui.showAnnouncement(`🔄 MODE ACTIVE: ${versionNames[versionId] || versionId}`, '#00e5ff');
    }

    if (reloadDistrict) {
      this.loadDistrictLevel(this.currentDistrictLevel || 1, this.isGameStarted);
    }
    return true;
  }

  initAudioTriggers() {
    // Unlock Web Audio API on first user interaction without starting game prematurely
    const startAudio = () => {
      audio.startMusic();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
  }

  restartGame() {
    this.persistRunnerRun();
    this.timeLeft = this.matchDuration;
    this.isGameOver = false;
    this.isGameStarted = true;
    this.isPaused = false;
    this.runnerRunRecorded = false;
    this.runnerRouteComplete = false;
    this.resetRunnerNavigation();
    this.runnerNeighborhoodIndex = 1;
    this.runnerAreaIndex = 0;
    if (this.isTempleRun) this.currentDistrictLevel = 1;
    this.clock.getDelta();
    const diff = DIFFICULTY_CONFIG[this.difficulty] || DIFFICULTY_CONFIG.kidsEasy;

    // Reset Karachi Temple Run Runner State
    this.clearRunnerObjects();
    this.moveVector = { x: 0, y: 0 };
    this.score = 0;
    this.distanceMeters = 0;
    this.lastFunnelMeters = 0;
    this.runnerWeatherState = 'clear';
    this.runnerRainOverride = null;
    this.coins = 0;
    this.hearts = 3;
    this.maxHearts = 3;
    this.runnerWaveCount = 0;
    this.runnerPowerupDropCount = 0;
    this.runnerNearMissCount = 0;
    this.nearMissCount = 0;
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.isSliding = false;
    this.slideTimer = 0;
    this.nextRunnerWaveZ = 40.0;
    this.nextWordLetterZ = -30.0;
    this.wordHuntCollected = [];
    this.nextSurfingBusDist = 60.0;
    if (this.ui?.updateWordHunt) this.ui.updateWordHunt([]);
    this.currentMilestone = getKarachiNeighborhoodName(1);
    this.passedMilestoneIndices = new Set([0]);
    this.magnetTimer = 0;
    this.turboTimer = 0;
    this.nitroTimer = 0;
    this.shieldTimer = 0;
    this.superJumpTimer = 0;
    this.hornCooldownTimer = 0;
    const hornButton = document.getElementById('btn-horn');
    if (hornButton) {
      hornButton.classList.remove('is-cooling-down', 'is-recharged');
      const hint = hornButton.querySelector('.horn-hint');
      if (hint) hint.textContent = 'TAP / H';
    }
    this.chingchiTimer = 0;
    this.jetpackTimer = 0;
    this.coinComboCount = 0;
    this.lastCoinPickupTime = 0;
    this.runnerInvulnerableTimer = 0;
    this.activePowerUp = null;
    this.isNascarSuperSpeed = false;
    this.isDrafting = false;
    this.draftCharge = 0;
    this.isBoosting = false;
    this.currentBankRoll = 0;
    this.targetBankRoll = 0;
    this.lastRunnerZ = undefined;
    this.stuckWatchdogTimer = 0;
    this.player.isShielded = false;
    this.player.isTrappedInGutter = false;
    this.player.gutterTrapTimer = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    if (this.player.avatarMesh) {
      this.player.avatarMesh.scale.set(1, 1, 1);
      this.player.avatarMesh.position.y = 0;
    }

    if (this.isTempleRun) {
      this.player.position.set(0, 0, 60.0);
      this.player.group.position.set(0, 0, 60.0);
      this.initCorridorTerrain();
      if (this.ui) {
        this.ui.setRunnerMode(true);
        this.ui.hideRunnerTutorial();
      }
    } else {
      const startZ = (this.currentDistrictLevel === 1) ? 70.0 : 0.0;
      this.player.position.set(0, 0, startZ);
      this.player.group.position.copy(this.player.position);
      if (this.ui) this.ui.setRunnerMode(false);
    }
    this.player.level = 1;
    this.player.xp = 0;
    this.player.score = 0;
    this.player.radius = diff.startRadius;
    this.player.targetRadius = this.player.radius;
    this.player.swallowedCount = 0;
    this.player.politiciansDevoured = 0;
    this.player.turboTimer = 0;
    this.player.kills = 0;
    this.player.baseSpeed = 13.5;
    this.player.currentSpeed = 13.5;
    this.player.isAlive = true;
    this.player.group.visible = true;
    this.player.group.rotation.set(0, Math.PI, 0);
    this.player.facingAngle = Math.PI;
    this.player.targetRotationY = Math.PI;
    this.player.updateNameTag();
    if (this.camera) {
      if (this.isTempleRun) {
        this.camera.position.set(0, 2.85, this.player.position.z + 5.2);
        this.camera.lookAt(0, 1.25, this.player.position.z - 18.0);
      } else {
        this.camera.position.set(0, 6.2 + this.player.radius * 1.15, 6.8 + this.player.radius * 1.15);
        this.camera.lookAt(0, 1.2, -4.5);
      }
      this.camera.updateMatrixWorld(true);
    }

    // Reset Bots (Friendly tuning in Kids/Easy mode)
    const botPositions = [[-45, 15], [-20, 45], [45, 45], [-55, 30], [45, -35]];
    this.holes.forEach((h, idx) => {
      if (h.isPlayer) return;
      const pos = botPositions[idx - 1] || [0, 0];
      h.position.set(pos[0], 0, pos[1]);
      h.group.position.copy(h.position);
      h.level = 1;
      h.xp = 0;
      h.score = 0;
      h.radius = LEVEL_CONFIG[0].radius * 0.9;
      h.targetRadius = h.radius;
      h.baseSpeed = 6.5 * diff.botSpeedMult;
      h.currentSpeed = h.baseSpeed;
      h.swallowedCount = 0;
      h.kills = 0;
      h.isAlive = true;
      h.group.visible = true;
      h.updateNameTag();
    });

    if (this.isTempleRun) {
      this.cityGen.setWorldVisible(false);
    } else {
      // Re-generate city objects, civic evils, and food stalls for open-world play.
      this.edibleObjects.forEach(obj => {
        this.scene.remove(obj.mesh);
      });
      if (this.interactiveVictims) this.interactiveVictims.forEach(v => this.scene.remove(v));
      if (this.interactiveTraffic) this.interactiveTraffic.forEach(v => this.scene.remove(v));
      if (this.interactiveResidents) this.interactiveResidents.forEach(v => this.scene.remove(v));

      const generated = this.cityGen.generateCity();
      this.edibleObjects = generated.edibleObjects;
      this.politicians = generated.politicians || [];
      this.animals = generated.animals || [];
      this.robberies = generated.robberies || [];
      this.badGuys = generated.badGuys || [];
      this.foodStalls = generated.foodStalls || [];
      this.buildings = generated.buildings || [];
      this.citizens = generated.citizens || [];
      this.interactiveVictims = generated.interactiveVictims || [];
      this.interactiveTraffic = generated.interactiveTraffic || [];
      this.interactiveResidents = generated.interactiveResidents || [];
      this.currentDistrictLevel = 1;
      this.districtClearing = false;
      this.districtEvils = generated.currentDistrictEvils || this.badGuys.filter(b => b.isDistrictEvil);
      this.districtTotal = Math.max(1, this.districtEvils.length);
      this.districtRemaining = this.districtTotal;
      this.civicTotal = this.districtTotal;
      this.civicCleansed = 0;
      this.frenzyTimer = 0;
      this.frenzyTriggered = false;
    }
    this.particles.clear();
    if (this.cleanedMonuments) {
      this.cleanedMonuments.forEach(m => this.scene.remove(m));
      this.cleanedMonuments = [];
    }
    this.recentCleaned = [];
    this.initDistrictChallenges(getDistrictConfig(this.currentDistrictLevel));
    if (this.ui) {
      this.ui.hideDistrictClearedModal();
      this.ui.hideGameOverModal();
      this.ui.hideAutoPauseModal();
      this.ui.setRunnerMode(this.isTempleRun);
      if (this.ui.hud) this.ui.hud.style.display = '';
      if (this.ui.startModal) this.ui.startModal.style.display = 'none';
    }
  }

  initDistrictChallenges(config) {
    const list = (config && (config.missions || config.challenges)) || [];
    this.crisisChallenges = list.map(c => ({
      ...c,
      current: 0,
      completed: false
    }));
    this.currentCrisisIndex = 0;
  }

  // 3D Ground Navigation Guide Chevron (Direct visual route to active objectives)
  createNavigationGuide() {
    this.navGuideGroup = new THREE.Group();

    // 3D Ground Chevron/Arrow (Pointing along +Z in local coordinates)
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.1);       // Forward tip
    shape.lineTo(0.55, -0.45);  // Right outer fin
    shape.lineTo(0.22, -0.3);   // Right inner nook
    shape.lineTo(0.22, -0.85);  // Right tail
    shape.lineTo(-0.22, -0.85); // Left tail
    shape.lineTo(-0.22, -0.3);  // Left inner nook
    shape.lineTo(-0.55, -0.45); // Left outer fin
    shape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(shape);
    arrowGeo.rotateX(-Math.PI / 2);
    arrowGeo.rotateY(Math.PI);

    this.navArrowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.navArrowMesh = new THREE.Mesh(arrowGeo, this.navArrowMat);
    this.navGuideGroup.add(this.navArrowMesh);

    // Nav ring mesh (hidden - remove circle around player)
    const ringGeo = new THREE.RingGeometry(0.75, 0.95, 32);
    ringGeo.rotateX(-Math.PI / 2);
    this.navRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.navRingMesh = new THREE.Mesh(ringGeo, this.navRingMat);
    this.navRingMesh.visible = false;
    this.navGuideGroup.add(this.navRingMesh);

    this.navGuideGroup.position.set(0, 0.05, 0);
    this.navGuideGroup.visible = false;
    this.scene.add(this.navGuideGroup);
  }

  // Tests if a 2D line segment (x1, z1) -> (x2, z2) intersects any solid building/stall obstacle
  isSegmentClearOfObstacles(x1, z1, x2, z2, obstacles = [], margin = 1.6) {
    if (!obstacles || obstacles.length === 0) return true;
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lenSq = dx * dx + dz * dz;
    if (lenSq < 0.04) return true;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs) continue;
      if (obs.mesh && (obs.mesh.userData?.isSwallowed || obs.mesh.parent === null || obs.mesh.visible === false)) continue;

      if (obs.isBox) {
        let minX = (obs.minX !== undefined ? obs.minX : (obs.cx || 0) - 2) - margin;
        let maxX = (obs.maxX !== undefined ? obs.maxX : (obs.cx || 0) + 2) + margin;
        let minZ = (obs.minZ !== undefined ? obs.minZ : (obs.cz || 0) - 2) - margin;
        let maxZ = (obs.maxZ !== undefined ? obs.maxZ : (obs.cz || 0) + 2) + margin;

        if (obs.mesh && obs.halfW) {
          minX = obs.mesh.position.x - obs.halfW - margin;
          maxX = obs.mesh.position.x + obs.halfW + margin;
          minZ = obs.mesh.position.z - obs.halfD - margin;
          maxZ = obs.mesh.position.z + obs.halfD + margin;
        }

        const segMinX = Math.min(x1, x2);
        const segMaxX = Math.max(x1, x2);
        const segMinZ = Math.min(z1, z2);
        const segMaxZ = Math.max(z1, z2);
        if (segMaxX < minX || segMinX > maxX || segMaxZ < minZ || segMinZ > maxZ) continue;

        // Liang-Barsky line clipping
        const p = [-dx, dx, -dz, dz];
        const q = [x1 - minX, maxX - x1, z1 - minZ, maxZ - z1];
        let u1 = 0.0;
        let u2 = 1.0;
        let hit = true;
        for (let k = 0; k < 4; k++) {
          if (p[k] === 0) {
            if (q[k] < 0) { hit = false; break; }
          } else {
            const t = q[k] / p[k];
            if (p[k] < 0) {
              if (t > u2) { hit = false; break; }
              if (t > u1) u1 = t;
            } else {
              if (t < u1) { hit = false; break; }
              if (t < u2) u2 = t;
            }
          }
        }
        if (hit && u1 <= u2) return false;
      }
    }
    return true;
  }

  // Calculates a safe waypoint route on the Karachi street grid around buildings to the target
  findStreetPath(playerPos, targetPos, obstacles = []) {
    const roadCoords = [-96, -48, 0, 48, 96];

    // If direct line is already completely clear of obstacles, navigate straight!
    if (this.isSegmentClearOfObstacles(playerPos.x, playerPos.z, targetPos.x, targetPos.z, obstacles)) {
      return [{ x: targetPos.x, z: targetPos.z }];
    }

    const getClosestRoad = (val) => {
      let best = roadCoords[0], bestDist = Infinity;
      for (let i = 0; i < roadCoords.length; i++) {
        const d = Math.abs(val - roadCoords[i]);
        if (d < bestDist) { bestDist = d; best = roadCoords[i]; }
      }
      return best;
    };

    const prx = getClosestRoad(playerPos.x);
    const prz = getClosestRoad(playerPos.z);
    const trx = getClosestRoad(targetPos.x);
    const trz = getClosestRoad(targetPos.z);

    const distToNS = Math.abs(playerPos.x - prx);
    const distToEW = Math.abs(playerPos.z - prz);

    const waypoints = [];

    const getNextGrid = (current, destination) => {
      if (Math.abs(current - destination) < 5.0) return destination;
      if (destination > current) {
        for (let i = 0; i < roadCoords.length; i++) {
          if (roadCoords[i] > current + 3.0) return Math.min(roadCoords[i], destination);
        }
      } else {
        for (let i = roadCoords.length - 1; i >= 0; i--) {
          if (roadCoords[i] < current - 3.0) return Math.max(roadCoords[i], destination);
        }
      }
      return destination;
    };

    if (distToNS <= 7.0 && (distToEW > 7.0 || Math.abs(prz - trz) > 4.0)) {
      // Follow North-South avenue corridor
      const nextZ = getNextGrid(playerPos.z, trz);
      waypoints.push({ x: prx, z: nextZ });
      if (Math.abs(prx - trx) > 5.0) {
        waypoints.push({ x: trx, z: trz });
      }
      waypoints.push({ x: targetPos.x, z: targetPos.z });
    } else if (distToEW <= 7.0) {
      // Follow East-West boulevard corridor
      const nextX = getNextGrid(playerPos.x, trx);
      waypoints.push({ x: nextX, z: prz });
      if (Math.abs(prz - trz) > 5.0) {
        waypoints.push({ x: trx, z: trz });
      }
      waypoints.push({ x: targetPos.x, z: targetPos.z });
    } else {
      // Off-street: guide player to nearest open street intersection
      const ptNS = { x: prx, z: playerPos.z };
      const ptEW = { x: playerPos.x, z: prz };
      const clearNS = this.isSegmentClearOfObstacles(playerPos.x, playerPos.z, ptNS.x, ptNS.z, obstacles);
      const wp1 = clearNS ? ptNS : ptEW;
      waypoints.push(wp1);
      waypoints.push({ x: trx, z: trz });
      waypoints.push({ x: targetPos.x, z: targetPos.z });
    }

    return waypoints.length > 0 ? waypoints : [{ x: targetPos.x, z: targetPos.z }];
  }

  updateNavigationGuide(dt, elapsedTime) {
    if (!this.player || !this.navGuideGroup) return;
    if (this.isTempleRun) {
      this.navGuideGroup.visible = false;
      this.currentTargetObjective = null;
      return;
    }

    const playerPos = this.player.position;
    let target = null;
    let minDist = Infinity;

    // 1. Prioritize active crisis mission target
    const activeCrisis = this.crisisChallenges ? this.crisisChallenges[this.currentCrisisIndex] : null;
    const candidates = (this.districtEvils || []).filter(e => e && e.mesh && e.state !== 'swallowed');

    if (activeCrisis && !activeCrisis.completed) {
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        if (c.evilType === activeCrisis.evilType || (activeCrisis.evilType === 'pothole' && c.evilType === 'trash')) {
          const d = playerPos.distanceTo(c.mesh.position);
          if (d < minDist) {
            minDist = d;
            target = c;
          }
        }
      }
    }

    // 2. Fallback to any nearest district evil
    if (!target) {
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const d = playerPos.distanceTo(c.mesh.position);
        if (d < minDist) {
          minDist = d;
          target = c;
        }
      }
    }

    if (target && target.mesh && minDist < 150) {
      this.navGuideGroup.visible = true;
      const tPos = target.mesh.position;

      // Calculate street-grid route avoiding solid building obstacles
      const obstacles = (this.cityGen && this.cityGen.obstacles) ? this.cityGen.obstacles : [];
      const streetPath = this.findStreetPath(playerPos, tPos, obstacles);

      let activeWaypoint = streetPath[0];
      const distToWp = Math.hypot(activeWaypoint.x - playerPos.x, activeWaypoint.z - playerPos.z);
      if (distToWp < 3.5 && streetPath.length > 1) {
        activeWaypoint = streetPath[1];
      }

      const dx = activeWaypoint.x - playerPos.x;
      const dz = activeWaypoint.z - playerPos.z;
      const targetAngle = Math.atan2(dx, dz);

      // Place arrow 1.95 meters in front of avatar toward next clear street waypoint
      const offsetDist = 1.95;
      this.navGuideGroup.position.x = playerPos.x + Math.sin(targetAngle) * offsetDist;
      this.navGuideGroup.position.y = 0.05;
      this.navGuideGroup.position.z = playerPos.z + Math.cos(targetAngle) * offsetDist;

      // Rotate arrow to point directly down the open street toward waypoint
      this.navGuideGroup.rotation.y = targetAngle;

      // Pulse glow & scale
      const pulse = 0.85 + Math.sin(elapsedTime * 6.0) * 0.15;
      this.navGuideGroup.scale.set(pulse, 1.0, pulse);
      if (this.navArrowMat) {
        this.navArrowMat.opacity = 0.7 + Math.sin(elapsedTime * 6.0) * 0.3;
      }

      this.currentTargetObjective = {
        name: target.name || 'Objective',
        evilType: target.evilType || 'evil',
        dist: Math.round(minDist),
        dx,
        dz,
        targetAngle,
        targetPos: tPos,
        activeWaypoint,
        waypoints: streetPath
      };
    } else {
      this.navGuideGroup.visible = false;
      this.currentTargetObjective = null;
    }
  }

  handleCrisisProgress(evilType) {
    if (!this.crisisChallenges || this.crisisChallenges.length === 0) return;

    let anyMissionJustCompleted = false;
    this.crisisChallenges.forEach(mission => {
      if (!mission.completed && (mission.evilType === evilType || (evilType === 'trash' && mission.evilType === 'pothole'))) {
        mission.current = (mission.current || 0) + 1;
        if (mission.current >= mission.targetCount) {
          mission.completed = true;
          anyMissionJustCompleted = true;
          audio.playChallengeSuccess();
          if (this.player) this.player.addXP(mission.xpReward || 1000);
          this.ui.showCrisisCompleteBanner(mission);
          this.timeLeft += 25;

          // Record restoration progress in local save
          saveManager.recordMissionCompleted(this.currentDistrictLevel, mission.id, { [mission.evilType]: 'restored' }, mission.xpReward || 1000);
          const gaugeDeltas = { cleanliness: 4, infrastructure: 4, trafficFlow: 4, safety: 4 };
          if (mission.evilType === 'tanker') gaugeDeltas.infrastructure += 10;
          if (mission.evilType === 'pothole') gaugeDeltas.infrastructure += 8;
          if (mission.evilType === 'vip') gaugeDeltas.trafficFlow += 12;
          if (mission.evilType === 'robber') gaugeDeltas.safety += 12;
          if (mission.evilType === 'bhatta') { gaugeDeltas.safety += 14; gaugeDeltas.cleanliness += 8; }
          if (mission.evilType === 'onewheeler') { gaugeDeltas.trafficFlow += 14; gaugeDeltas.safety += 8; }
          if (mission.evilType === 'chinacutting') { gaugeDeltas.infrastructure += 12; gaugeDeltas.safety += 8; }
          if (mission.evilType === 'politician') { gaugeDeltas.cleanliness += 15; gaugeDeltas.infrastructure += 10; }
          if (mission.evilType === 'ke') { gaugeDeltas.infrastructure += 14; gaugeDeltas.safety += 10; }
          if (mission.evilType === 'gutka') { gaugeDeltas.cleanliness += 12; gaugeDeltas.safety += 10; }
          saveManager.updateDistrictGauges(this.currentDistrictLevel, gaugeDeltas);

          // Unlock relevant civic achievement badges
          if (mission.evilType === 'tanker') saveManager.unlockBadge('water_guardian');
          if (mission.evilType === 'onewheeler') saveManager.unlockBadge('road_safety');
          if (mission.evilType === 'pothole' || mission.evilType === 'trash') saveManager.unlockBadge('clean_green');
          if (mission.evilType === 'vip') saveManager.unlockBadge('lifesaver');
          if (mission.evilType === 'ke') saveManager.unlockBadge('power_saver');
          if (mission.evilType === 'chinacutting') saveManager.unlockBadge('green_planter');
          saveManager.save();

          if (this.ui?.appendDevLog) {
            this.ui.appendDevLog(`[MISSION] Cleared: ${mission.title} (+${mission.xpReward || 1000} XP)`, 'info');
          }

          // Check if this was the last remaining mission
          const willFinishAll = this.crisisChallenges.every(m => m.completed);
          if (!willFinishAll && this.civicQuizEnabled) {
            // Mid-game educational challenge for completed crisis (ONLY IF EXPLICITLY ENABLED IN SETTINGS)
            setTimeout(() => {
              let quizCategory = 'cleanliness';
              if (mission.evilType === 'vip') quizCategory = 'ambulance';
              else if (mission.evilType === 'robber') quizCategory = 'safety';
              else if (mission.evilType === 'tanker') quizCategory = 'water';
              else if (mission.evilType === 'ke') quizCategory = 'electricity';
              else if (mission.evilType === 'pothole' || mission.evilType === 'trash') quizCategory = 'cleanliness';

              this.ui.openEducationalQuiz(quizCategory);
            }, 1500);
          }
        }
      }
    });

    // Advance current crisis pointer for banner
    while (this.currentCrisisIndex < this.crisisChallenges.length && this.crisisChallenges[this.currentCrisisIndex].completed) {
      this.currentCrisisIndex++;
    }

    if (this.currentCrisisIndex < this.crisisChallenges.length && anyMissionJustCompleted) {
      const nextCrisis = this.crisisChallenges[this.currentCrisisIndex];
      if (nextCrisis && !nextCrisis.completed) {
        setTimeout(() => {
          this.ui.showAnnouncement(`🚨 NEW CRISIS: ${nextCrisis.title}!`, '#ff9800');
        }, 1400);
      }
    }

    // Check if ALL district missions are finished
    const allDone = this.crisisChallenges.every(m => m.completed);
    if (allDone && !this.districtClearing) {
      this.handleDistrictCleared();
    }
  }

  /**
   * Practical, tactile street resolution for District Evils and Threats.
   * Eliminates the passive "standing around waiting to sink into hole" feel.
   * Hands-on interventions: slamming manhole covers shut, clamping tanker wheels,
   * deploying KMC roadblocks to halt VIP convoys, grounding reckless racers, etc.
   */
  resolveDistrictThreat(obj, hole) {
    if (!obj || obj.state === 'resolving' || obj.state === 'swallowed') return;
    obj.state = 'resolving';
    if (this.ui) this.ui.hideInterventionProgress();

    const objPos = (obj.mesh && obj.mesh.position) ? obj.mesh.position : (obj.position || { x: 0, y: 0, z: 0 });
    const evilType = obj.evilType || 'evil';

    // 1. Visceral GTA Hit-Stop Camera Shake
    this.cameraShakeTimer = 0.24;

    // 2. Tactile Audio & Practical 3D Street Model Deployment
    let actionInfo = {
      icon: '🛡️',
      tag: 'THREAT RESOLVED',
      title: 'STREET THREAT RESOLVED!',
      desc: 'Karachi Hero restored civic safety and peace to the neighborhood!',
      color: '#00e5ff'
    };

    if (evilType === 'pothole') {
      audio.playMetallicSlam();
      this.particles.createImpactDust(objPos, 28);

      // Heavy KMC Iron Manhole Cover slammed shut
      const cover = KarachiModels.createHeavyManholeCover();
      cover.position.set(objPos.x, 0.04, objPos.z);
      this.scene.add(cover);

      actionInfo = {
        icon: '🔒',
        tag: 'OPEN SEWER SEALED',
        title: 'MANHOLE COVER SLAMMED & BOLTED SHUT!',
        desc: 'Hazardous gutter sealed with heavy cast-iron cover. Pedestrian risk eliminated!',
        color: '#00e5ff'
      };
    } else if (evilType === 'vip') {
      audio.playBrakeScreech();
      audio.playVIPHooter();
      this.particles.createSkidSmoke(objPos, 24);

      // Deploy high-visibility KMC Roadblock Barricades flanking the convoy
      const barrierF = KarachiModels.createKMCBarrier();
      barrierF.position.set(objPos.x, 0, objPos.z + 3.2);
      barrierF.rotation.y = Math.PI / 2;
      this.scene.add(barrierF);

      const barrierR = KarachiModels.createKMCBarrier();
      barrierR.position.set(objPos.x, 0, objPos.z - 3.2);
      barrierR.rotation.y = Math.PI / 2;
      this.scene.add(barrierR);

      // Free stuck traffic vehicles
      const stuckVehicles = obj.mesh.userData?.stuckVehicles;
      if (stuckVehicles && stuckVehicles.length > 0) {
        stuckVehicles.forEach((v, vIdx) => {
          v.userData.isFreed = true;
          v.userData.freedSpeed = 5.5 + Math.random() * 2.5;
          if (v.userData.drawTrafficBubble) {
            const happyPhrases = [
              "🥳 TRAFFIC FREED! VIP culture murdabad! Shukriya Street Hero!",
              "🏥 Hospital ka rasta khul gaya! Zindabad Street Hero!",
              "🚗 Wah Street Hero wah! Ab hum time pe pohanchengy!"
            ];
            v.userData.drawTrafficBubble(happyPhrases[vIdx % happyPhrases.length], true);
          }
          this.particles.createCelebrationConfetti(v.position, 25);
        });
      }

      actionInfo = {
        icon: '🛑',
        tag: 'VIP PROTOCOL INTERCEPTED',
        title: 'VIP CONVOY HALTED & ROADWAY RESTORED!',
        desc: 'Unlawful protocol escort intercepted. Blocked emergency ambulances and citizen commuters are now moving freely!',
        color: '#ff3d00'
      };
    } else if (evilType === 'tanker') {
      audio.playBrakeScreech();
      audio.playFreshwaterEruption();
      audio.playWaterTankerDevour();
      this.particles.createFreshwaterGeyser(objPos, 55);

      // Remove illegal suction hoses & booster motor
      const hoseGroup = obj.mesh.userData?.hoseGroup;
      if (hoseGroup && hoseGroup.parent) {
        hoseGroup.parent.remove(hoseGroup);
      }

      // Police Heavy Steel Wheel Clamp on tanker wheels
      const clamp = KarachiModels.createPoliceWheelClamp();
      clamp.position.set(objPos.x - 1.2, 0.25, objPos.z);
      this.scene.add(clamp);

      // Restore water to dry homes
      const dryHomes = obj.mesh.userData?.dryHomes;
      if (dryHomes && dryHomes.length > 0) {
        dryHomes.forEach(home => {
          home.userData.isRestored = true;
          if (home.userData.updateWaterBillboard) home.userData.updateWaterBillboard(true);
          this.particles.createWaterFlowStream(hole.position, home.position, 32);
          if (home.userData.rooftopTank) {
            const tankWorldPos = new THREE.Vector3();
            home.userData.rooftopTank.getWorldPosition(tankWorldPos);
            setTimeout(() => {
              this.particles.createRooftopWaterOverflow(tankWorldPos, 45);
              this.particles.createHeartBurst(tankWorldPos, 16);
            }, 250);
          }
          const res = home.userData.resident;
          if (res && res.userData && res.userData.drawBubble) {
            res.userData.drawBubble("🌊 Tap water is back! Taps are full! Thank you Hero!", true);
            this.particles.createHeartBurst(res.position, 14);
          }
        });
      }

      // Thirsty residents celebrate
      const residents = obj.mesh.userData?.thirstyResidents;
      if (residents && residents.length > 0) {
        residents.forEach((r, rIdx) => {
          r.userData.isWaterReceived = true;
          if (r.userData.drawBubble) {
            const waterPhrases = [
              "💧 PANI MIL GAYA! Free water for Karachi! Zindabad!",
              "🌊 Tanker mafia doob gaya! Karachi ko pani mil gaya!"
            ];
            r.userData.drawBubble(waterPhrases[rIdx % waterPhrases.length], true);
          }
          this.particles.createHeartBurst(r.position, 14);
          this.particles.createCelebrationConfetti(r.position, 20);
        });
      }

      actionInfo = {
        icon: '🚰',
        tag: 'WATER THEFT INTERCEPTED',
        title: 'ILLEGAL TANKER IMPOUNDED & VALVES SEALED!',
        desc: 'Pirate suction pipelines severed and closed. Sweet water pumped to neighborhood dry taps!',
        color: '#00e5ff'
      };
    } else if (evilType === 'onewheeler') {
      audio.playBrakeScreech();
      audio.playOneWheelerImpound();
      this.particles.createSkidSmoke(objPos, 14);

      // Deploy tactical traffic safety cones cluster
      const cones = KarachiModels.createTrafficConesCluster();
      cones.position.set(objPos.x, 0, objPos.z);
      this.scene.add(cones);

      actionInfo = {
        icon: '🏍️',
        tag: 'STREET RACER IMPOUNDED',
        title: 'RECKLESS 70cc RACER GROUNDED!',
        desc: 'Hazardous one-wheeling halted. Traffic police safety cones placed and narrow streets secured!',
        color: '#ffea00'
      };
    } else if (evilType === 'robber') {
      audio.playRobberDevour();
      audio.playRescuedCitizenCheer();
      this.particles.createMoneyBurst(objPos, 35);
      this.particles.createCelebrationConfetti(objPos, 35);

      const victim = obj.mesh.userData?.victimCitizen;
      if (victim) {
        victim.userData.isRescued = true;
        if (victim.userData.drawBubble) {
          victim.userData.drawBubble("🎉 PRAISE BE! My phone is saved! Hero zindabad!", true);
        }
        this.particles.createCelebrationConfetti(victim.position, 35);
        this.particles.createHeartBurst(victim.position, 16);
      }

      actionInfo = {
        icon: '📱',
        tag: 'STREET SNATCHER ARRESTED',
        title: 'ROBBER APPREHENDED & PHONES RECOVERED!',
        desc: 'Armed mugger cornered. Snatched mobile phones and wallets safely handed back to victims!',
        color: '#00e676'
      };
    } else if (evilType === 'bhatta') {
      audio.playBhattaConfiscate();
      this.particles.createMoneyBurst(objPos, 35);

      actionInfo = {
        icon: '💼',
        tag: 'EXTORTION MAFIA BUSTED',
        title: 'BHATTA MAFIA DISMANTLED & CHITS SEIZED!',
        desc: 'Extortion slip network confiscated. Local bazaar shopkeepers freed from illegal extortion threats!',
        color: '#e040fb'
      };
    } else if (evilType === 'ke') {
      audio.playMetallicSlam();
      audio.playKESpark();
      this.particles.createImpactDust(objPos, 24);

      actionInfo = {
        icon: '⚡',
        tag: 'ELECTRICAL HAZARD GROUNDED',
        title: 'DANGEROUS WIRES ISOLATED & CUT!',
        desc: 'High-voltage dangling kundas disconnected and safely grounded into solar utility station!',
        color: '#ffea00'
      };
    } else if (evilType === 'chinacutting') {
      audio.playChinaCuttingDemolish();
      this.particles.createImpactDust(objPos, 36);

      actionInfo = {
        icon: '🧱',
        tag: 'ENCROACHMENT CLEARED',
        title: 'ILLEGAL FOOTPATH WALL DEMOLISHED!',
        desc: 'Encroaching concrete wall torn down. Wide public sidewalk reopened for pedestrians!',
        color: '#ff9800'
      };
    } else if (evilType === 'politician') {
      audio.playPoliticianSwallow();
      audio.playRescuedCitizenCheer();
      this.particles.createMoneyBurst(objPos, 45);
      const pName = obj.mesh.userData?.name || "VIP Politician";
      actionInfo = {
        icon: '⚖️',
        tag: 'CORRUPTION HALTED',
        title: `${pName.toUpperCase()} APPREHENDED!`,
        desc: 'Embezzled public funds frozen and redirected to free neighborhood dispensary!',
        color: '#ffd700'
      };
    } else if (evilType === 'trash') {
      audio.playMetallicSlam();
      this.particles.createCleanseSparkleBurst(objPos, 25);
      actionInfo = {
        icon: '🌿',
        tag: 'ILLEGAL DUMP CLEARED',
        title: 'ROT PILE ENCLOSED & JASMINE PLANTED!',
        desc: 'Waste sealed in modern compactor containers. Fragrant jasmine planter installed!',
        color: '#00e676'
      };
    }

    // 3. Show prominent HUD Action Resolution Banner
    this.ui.showActionResolution(actionInfo);

    // 4. Civic Cleanse Audio & Particle Transformation
    audio.playCleanseTransformation();
    this.particles.createCleanseSparkleBurst(hole.position, 45);

    // 5. Spawn permanent civic upgrade monument
    const replacement = KarachiModels.createCleanedReplacement(evilType);
    replacement.position.set(objPos.x, 0, objPos.z);
    this.scene.add(replacement);
    this.cleanedMonuments.push(replacement);

    // 6. Nearby citizens celebrate
    if (this.citizens) {
      this.citizens.forEach(c => {
        if (c && c.position && Math.hypot(c.position.x - objPos.x, c.position.z - objPos.z) < 22) {
          c.isDancing = true;
          c.danceTimer = 4.5;
        }
      });
    }

    // 7. Mini-map tracking
    this.recentCleaned.push({
      x: objPos.x,
      z: objPos.z,
      time: performance.now()
    });

    // 8. Before / After Toast
    const beforeAfterMap = {
      pothole: { before: "Broken Road Pothole", after: "Smooth Asphalt Repaired!" },
      trash: { before: "Overflowing Trash Heap", after: "Blooming Jasmine Planter!" },
      gutka: { before: "Shady Gutka Peddler", after: "Chilled Sabeel Water Cooler!" },
      robber: { before: "Armed Mobile Robbery", after: "Crime-Free Safe Zone!" },
      vip: { before: "2-Hour VIP Traffic Jam", after: "Free Flowing Road!" },
      tanker: { before: "Illegal Water Tanker", after: "Free Sabeel-e-Aab Fountain!" },
      ke: { before: "Dangerous Kundas & Sparks", after: "Clean Solar Energy Kiosk!" },
      chinacutting: { before: "Illegal Footpath Wall", after: "Public Pedestrian Walkway!" },
      bhatta: { before: "Extortion Bhatta Parchi", after: "Peaceful Aman Bazaar!" },
      onewheeler: { before: "Reckless 70cc Racer", after: "Safe Driving Street!" },
      politician: { before: "Corrupt VIP Politician", after: "Public Welfare & Library Fund!" }
    };
    const ba = beforeAfterMap[evilType] || { before: "Civic Crime", after: "Karachi Restored!" };
    this.ui.showBeforeAfterToast(ba.before, ba.after);

    // 9. Update civic counts & Crisis Progress
    this.civicCleansed++;
    this.handleCrisisProgress(evilType);

    // 10. Award XP & Points
    let points = obj.points || 600;
    if (this.frenzyTimer > 0) points *= 2;
    if (hole.comboCount > 1) points = Math.round(points * (1 + hole.comboCount * 0.25));
    hole.addXP(points, (h) => {
      if (h.isPlayer) this.handlePlayerLevelUp(h);
    });

    // 11. Remove enemy mesh
    obj.state = 'swallowed';
    if (obj.mesh && obj.mesh.parent) {
      this.scene.remove(obj.mesh);
    }

    // 12. Check District Completion
    this.districtRemaining = this.districtEvils.filter(b => b && b.state !== 'swallowed').length;
    if (this.districtRemaining === 0 && !this.districtClearing) {
      this.handleDistrictCleared();
    } else {
      this.ui.showAnnouncement(
        `${actionInfo.icon} ${actionInfo.title} (${this.districtRemaining} CRISES REMAINING)`,
        actionInfo.color || '#00e5ff'
      );
    }
  }

  getDistrictResolvedSummary(level) {
    const defaultThreatsByLevel = {
      1: [
        { icon: '🔒', title: 'Road Hazards Repaired', reform: 'Heavy KMC cast-iron covers bolted shut. Hazard-free road restored!' },
        { icon: '📱', title: 'Armed Mobile Snatcher Cornered', reform: 'Apprehended on West Avenue. Stolen smartphones safely returned!' },
        { icon: '🚰', title: 'Water Tanker Mafia Intercepted', reform: 'Pirate booster pipeline severed. Free tap water restored to neighborhood!' }
      ],
      2: [
        { icon: '📜', title: 'Bhatta Extortion Racket Busted', reform: 'Extortion slip network confiscated. Bazaar shopkeepers protected!' },
        { icon: '🏍️', title: 'Reckless One-Wheelers Grounded', reform: 'Hazardous 70cc racers stopped. High-vis safety cones deployed!' },
        { icon: '🕳️', title: 'Lyari Potholes Repaired', reform: 'Road trenches filled with durable asphalt. Safe driving restored!' }
      ],
      3: [
        { icon: '🚑', title: 'VIP Traffic Jam Diverted', reform: 'Protocol convoy halted with KMC roadblocks. Blocked ambulances & commuters freed!' },
        { icon: '📱', title: 'Empress Market Snatchers', reform: 'Bazaar pickpockets apprehended & shoppers secured!' },
        { icon: '🌿', title: 'Burns Road Trash Cleared', reform: 'Compactor bins installed & fragrant jasmine planters blooming!' }
      ],
      4: [
        { icon: '🏍️', title: 'Midnight Drag Racers', reform: 'Illegal highway racing halted & road safety restored!' },
        { icon: '🌲', title: 'Margalla Timber Poachers', reform: 'Illegal chainsaws seized & green forest reserve protected!' },
        { icon: '⚖️', title: 'Corrupt VIP Bureaucrats', reform: 'Embezzled funds frozen & redirected to public dispensary!' }
      ],
      5: [
        { icon: '📜', title: 'Quetta Bazaar Extortionists', reform: 'Merchant protection enforced & Aman Bazaar peace restored!' },
        { icon: '⚡', title: 'Sparking Transformers Grounded', reform: 'Dangling kundas disconnected & clean solar energy kiosk installed!' }
      ]
    };
    return defaultThreatsByLevel[level] || defaultThreatsByLevel[1];
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handlePlayerLevelUp(hole) {
    this.particles.createLevelUpShockwave(hole.position, hole.radius * 1.5);
    audio.playLevelUp();
    this.ui.showAnnouncement(
      `🎉 LEVEL UP! ${LEVEL_CONFIG[hole.level - 1].title.toUpperCase()}!`,
      '#00ffff'
    );
  }

  activatePowerUp(type = 'mystery') {
    if (audio.playPowerUp) {
      audio.playPowerUp();
    } else if (audio.playChallengeSuccess) {
      audio.playChallengeSuccess();
    }
    audio.vibrate(35);
    this.cameraShakeTimer = 0.25;

    const playerPos = this.player ? this.player.position : { x: 0, y: 0, z: 0 };

    if (type === 'mystery') {
      const roll = ['nitro', 'shield', 'horn', 'biryani', 'jump', 'magnet', 'double_coins'];
      type = roll[Math.floor(Math.random() * roll.length)];
    }

    if (type === 'nitro' || type === 'turbo' || type === 'cng') {
      const nitroLvl = saveManager.getPowerUpUpgradeLevel('nitro');
      const baseTimer = 5.5;
      const duration = baseTimer * (1.0 + (nitroLvl - 1) * 0.25);
      this.nitroTimer = duration;
      if (this.player) this.player.isBoosting = true;
      this.particles.createSkidSmoke(playerPos, 35);
      this.ui.showAnnouncement(`🚀 CNG NITRO TURBO! 2.4x Speed! (${duration.toFixed(1)}s · Lvl ${nitroLvl})`, '#ff3d00');
      this.activePowerUp = { type: 'nitro', title: 'CNG NITRO', icon: '🚀', timer: duration, maxDuration: duration };
    } else if (type === 'shield') {
      const shieldLvl = saveManager.getPowerUpUpgradeLevel('shield');
      const baseTimer = 8.5;
      const duration = baseTimer * (1.0 + (shieldLvl - 1) * 0.25);
      this.shieldTimer = duration;
      if (this.player) this.player.isShielded = true;
      this.particles.createCelebrationConfetti(playerPos, 35);
      this.ui.showAnnouncement(`🛡️ WATER TANKER SHIELD! Invincible! (${duration.toFixed(1)}s · Lvl ${shieldLvl})`, '#00e5ff');
      this.activePowerUp = { type: 'shield', title: 'TANKER SHIELD', icon: '🛡️', timer: duration, maxDuration: duration };
    } else if (type === 'horn') {
      this.triggerKingPressureHorn();
      this.activePowerUp = { type: 'horn', title: 'KING HORN', icon: '📢', timer: 3.0, maxDuration: 3.0 };
    } else if (type === 'biryani' || type === 'magnet') {
      const magnetLvl = saveManager.getPowerUpUpgradeLevel('magnet');
      const baseTimer = 10.0;
      const duration = baseTimer * (1.0 + (magnetLvl - 1) * 0.25);
      this.magnetTimer = duration;
      if (type === 'biryani') {
        this.score = (this.score || 0) + 300;
        this.awardRunnerXP(300);
        if (this.hearts < this.maxHearts) {
          this.hearts = this.maxHearts;
          this.unlockRunnerBadge('lifesaver');
        }
        this.particles.createCelebrationConfetti(playerPos, 45);
        this.ui.showAnnouncement(`🍲 BURNS ROAD BIRYANI FEAST! Full Repair + Magnet (${duration.toFixed(1)}s · Lvl ${magnetLvl})!`, '#76ff03');
        this.activePowerUp = { type: 'biryani', title: 'BIRYANI FEAST', icon: '🍲', timer: duration, maxDuration: duration };
      } else {
        this.particles.createCleanseSparkleBurst(playerPos, 35);
        this.ui.showAnnouncement(`🧲 MEGA MAGNET ACTIVATED! Street Litter Vacuum (${duration.toFixed(1)}s · Lvl ${magnetLvl})!`, '#00e5ff');
        if (this.player && this.player.ringMat) {
          this.player.ringMat.color.setHex(0x00e5ff);
        }
        this.activePowerUp = { type: 'magnet', title: 'MAGNET', icon: '🧲', timer: duration, maxDuration: duration };
      }
    } else if (type === 'double_coins' || type === 'double' || type === 'coins') {
      const doubleLvl = saveManager.getPowerUpUpgradeLevel('double_coins');
      const baseTimer = 10.0;
      const duration = baseTimer * (1.0 + (doubleLvl - 1) * 0.25);
      this.doubleCoinsTimer = duration;
      this.particles.createCelebrationConfetti(playerPos, 45);
      this.ui.showAnnouncement(`🪙 DOUBLE RUPEES ACTIVE! 2X Coins (${duration.toFixed(1)}s · Lvl ${doubleLvl})!`, '#ffd700');
      this.activePowerUp = { type: 'double_coins', title: 'DOUBLE RUPEES', icon: '🪙', timer: duration, maxDuration: duration };
    } else if (type === 'jump') {
      this.superJumpTimer = 12.0;
      this.particles.createCleanseSparkleBurst(playerPos, 30);
      this.ui.showAnnouncement('🦘 HYDRAULIC SUSPENSION BOOST! High Clearance Jump!', '#d500f9');
      this.activePowerUp = { type: 'jump', title: 'SUPER JUMP', icon: '🦘', timer: 12.0, maxDuration: 12.0 };
    } else if (type === 'frenzy') {
      this.frenzyTimer = 8.0;
      this.particles.createCelebrationConfetti(playerPos, 45);
      this.ui.showAnnouncement('🌟 HERO FRENZY! 2X SCORE & MEGA POWER!', '#ff007f');
      if (this.player && this.player.ringMat) {
        this.player.ringMat.color.setHex(0xffd700);
      }
      this.activePowerUp = { type: 'frenzy', title: 'FRENZY', icon: '🌟', timer: 8.0, maxDuration: 8.0 };
    } else if (type === 'timer') {
      this.timeLeft = (this.timeLeft || 120) + 20;
      this.particles.createCelebrationConfetti(playerPos, 35);
      this.ui.showAnnouncement('⏱️ TIME BONUS! +20 SECONDS ADDED!', '#00e676');
    }

    if (this.player && this.player.triggerDevourPulse) {
      this.player.triggerDevourPulse();
    }
  }

  openShop() {
    this.ui?.showRunnerShop?.(this);
  }

  handleDistrictCleared() {
    if (this.districtClearing) return;
    this.districtClearing = true;
    this.isPaused = true; // Pause match timer while victory modal is active so user time is never drained!

    audio.playDistrictClearedFanfare();
    this.particles.createCelebrationConfetti(this.player.position, 65);
    this.particles.createLevelUpShockwave(this.player.position, 16);

    const cfg = getDistrictConfig(this.currentDistrictLevel);
    const isFinalDistrict = this.currentDistrictLevel >= DISTRICT_CONFIGS.length;
    const nextCfg = getDistrictConfig(this.currentDistrictLevel + 1);

    // Apply District Rewards to Player safely with fallback protection against NaN
    this.player.addXP(cfg.bonusScore || 3000, (h) => {
      if (h.isPlayer) this.handlePlayerLevelUp(h);
    });
    saveManager.addPlayerXP(cfg.bonusScore || 3000);
    saveManager.recordDistrictCleared(this.currentDistrictLevel, this.score, cfg.heroTitle);
    this.ui?.refreshProgressionContent();
    this.timeLeft += (cfg.timeBonus || 60);
    const rBonus = Number(cfg.holeRadiusBonus) || 0.35;
    const sBonus = Number(cfg.speedBonus) || 0.8;
    this.player.targetRadius = (isFinite(this.player.targetRadius) && this.player.targetRadius > 0 ? this.player.targetRadius : 1.6) + rBonus;
    this.player.baseSpeed = (isFinite(this.player.baseSpeed) && this.player.baseSpeed > 0 ? this.player.baseSpeed : 13.5) + sBonus;
    this.player.currentSpeed = this.player.baseSpeed;

    this.ui.showAnnouncement(
      `🏆 ALL CRISES RESOLVED! ${cfg.name.toUpperCase()} IS SECURED! (+${cfg.bonusScore} XP, +${cfg.timeBonus}s)`,
      '#ffd700'
    );

    const resolvedThreats = this.getDistrictResolvedSummary(this.currentDistrictLevel);

    this.ui.showDistrictClearedModal({
      level: cfg.level,
      districtName: cfg.name,
      districtUrdu: cfg.urdu,
      heroTitle: cfg.heroTitle,
      bonusScore: cfg.bonusScore,
      timeBonus: cfg.timeBonus,
      nextDistrictName: nextCfg.name,
      nextDistrictUrdu: nextCfg.urdu,
      isFinalDistrict,
      resolvedThreats,
      onNextDistrict: () => {
        if (isFinalDistrict) {
          this.endMatch();
        } else {
          this.advanceToNextDistrict();
        }
      }
    });
  }

  advanceToNextDistrict() {
    this.loadDistrictLevel(this.currentDistrictLevel + 1);
  }

  loadDistrictLevel(targetLevel, autoStart = true) {
    const districtLevel = Number(targetLevel);
    if (!Number.isInteger(districtLevel) || districtLevel < 1 || districtLevel > DISTRICT_CONFIGS.length) {
      console.warn('[DISTRICT] Ignoring invalid patrol area:', targetLevel);
      return false;
    }
    if (this.isTempleRun && !saveManager.isDistrictUnlocked(districtLevel)) {
      this.ui?.showAnnouncement('🔒 Complete more patrol achievements to unlock this Karachi area.', '#ffd700');
      return false;
    }
    this.currentDistrictLevel = districtLevel;
    this.districtClearing = false;
    this.isGameOver = false;
    this.isPaused = false;
    if (autoStart) {
      this.isGameStarted = true;
    }
    this.timeLeft = this.matchDuration || 240.0;
    this.frenzyTriggered = false;
    this.frenzyTimer = 0;
    this.clock.getDelta(); // Crucial: clear pending delta so timer and physics tick smoothly from frame 1!

    if (this.ui) {
      this.ui.isAutoPaused = false;
      this.ui.hideAutoPauseModal();
      this.ui.hideGameOverModal();
      this.ui.hideDistrictClearedModal();
      if (this.ui.appendDevLog) {
        this.ui.appendDevLog(`[LEVEL_LOAD] District ${this.currentDistrictLevel} loaded. Timer set to ${this.timeLeft}s`, 'info');
      }
    }
    audio.resumeAudio();

    // Repopulate dynamic district evils for the new level
    const result = this.cityGen.populateDistrict(this.currentDistrictLevel);
    this.cityGen.setWorldVisible(!this.isTempleRun);
    this.edibleObjects = this.cityGen.edibleObjects;
    this.badGuys = this.cityGen.badGuys;
    this.interactiveVictims = result.interactiveVictims || [];
    this.interactiveTraffic = result.interactiveTraffic || [];
    this.interactiveResidents = result.interactiveResidents || [];
    this.districtEvils = result.districtEvils || [];
    this.districtTotal = Math.max(1, this.districtEvils.length);
    this.districtRemaining = this.districtTotal;
    this.civicTotal = this.districtTotal;
    this.civicCleansed = 0;

    if (this.cleanedMonuments) {
      this.cleanedMonuments.forEach(m => this.scene.remove(m));
      this.cleanedMonuments = [];
    }
    this.recentCleaned = [];

    // Reset player position smoothly: In Temple Run Karachi mode, start at Z=60 for the sprint; in v1 / v2 start at center (Z=0)
    const startZ = this.isTempleRun ? 60.0 : 0.0;
    this.player.position.set(0, 0, startZ);
    this.player.group.position.set(0, 0, startZ);
    this.player.facingAngle = Math.PI;
    this.player.targetRotationY = Math.PI;
    this.player.group.rotation.y = Math.PI;
    this.moveVector = { x: 0, y: 0 };
    this.clearRunnerObjects();
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.isSliding = false;
    this.slideTimer = 0;
    this.nextRunnerWaveZ = 40.0;
    this.nextWordLetterZ = -30.0;
    this.wordHuntCollected = [];
    this.nextSurfingBusDist = 60.0;
    if (this.ui?.updateWordHunt) this.ui.updateWordHunt([]);
    this.player.targetRadius = 1.45;
    if (!isFinite(this.player.baseSpeed) || this.player.baseSpeed <= 0) {
      this.player.baseSpeed = 13.5;
    }
    this.player.currentSpeed = this.player.baseSpeed;

    if (this.isTempleRun) {
      this.initCorridorTerrain();
      if (this.ui) this.ui.setRunnerMode(true);
    } else {
      if (this.ui) this.ui.setRunnerMode(false);
    }

    // Apply version-specific mesh visibility and camera setup
    if (this.majorVersion === 'v1') {
      if (this.player.avatarMesh) this.player.avatarMesh.visible = false;
      if (this.player.ringMesh) this.player.ringMesh.visible = true;
      if (this.player.innerRingMesh) this.player.innerRingMesh.visible = true;
      if (this.player.shadowMesh) this.player.shadowMesh.visible = false;
      this.camAngle = Math.PI;
      this.cameraPivot = null;
      this.camera.position.set(0, 22.0, 14.0);
      this.camera.lookAt(0, 0, 0);
    } else {
      if (this.player.avatarMesh) this.player.avatarMesh.visible = true;
      if (this.player.ringMesh) this.player.ringMesh.visible = false;
      if (this.player.innerRingMesh) this.player.innerRingMesh.visible = false;
      if (this.player.shadowMesh) this.player.shadowMesh.visible = true;
      this.camAngle = Math.PI;
      this.cameraPivot = null;
      this.backwardBaseAngle = null;
      this.smoothGazeLead = 0;
      this.cameraBankX = 0;
      if (this.isTempleRun) {
        this.camera.position.set(0, 2.85, startZ + 5.2);
        this.camera.lookAt(0, 1.25, startZ - 18.0);
      } else {
        this.camera.position.set(0, 3.4, startZ + 5.8);
        this.camera.lookAt(0, 1.5, startZ - 9.5);
      }
    }
    this.camera.updateMatrixWorld(true);

    const cfg = getDistrictConfig(this.currentDistrictLevel);
    this.initDistrictChallenges(cfg);
    if (this.isTempleRun) {
      this.ui.showAnnouncement(`🏃 KARACHI RUNNER · ${cfg.name.toUpperCase()}`, '#00e5ff');
    } else {
      this.particles.createLevelUpShockwave(this.player.position, 18);
      this.particles.createCelebrationConfetti(this.player.position, 50);
      audio.playLevelUp();
      this.ui.showAnnouncement(
        `🚀 COMMUTE ROUTE: ${cfg.name.toUpperCase()} (${cfg.urdu})!`,
        '#00e5ff'
      );
    }

    // Save district progression to local storage
    saveManager.unlockDistrict(this.currentDistrictLevel);
    saveManager.save();

    // Clear previous district route hazards & finish gate
    if (this.gutterHazards) {
      this.gutterHazards.forEach(g => this.scene.remove(g));
      this.gutterHazards = [];
    }
    if (this.finishGate) {
      this.scene.remove(this.finishGate);
      this.finishGate = null;
    }

    if (this.currentDistrictLevel === 1 && !this.isTempleRun) {
      this.spawnPECHSFinishGate(0, -82);
      // Spawn authentic open gutters along the Soldier Bazar -> PECHS avenue
      this.spawnGutterHazard(1.8, 52, 1.5);
      this.spawnGutterHazard(-2.2, 34, 1.6);
      this.spawnGutterHazard(2.2, 12, 1.6);
      this.spawnGutterHazard(-2.0, -14, 1.6);
      this.spawnGutterHazard(2.0, -38, 1.7);
      this.spawnGutterHazard(-1.8, -58, 1.6);

      // Spawn NASCAR / Mario Kart style mystery crates along the route
      this.spawnMysteryCrate(0, 60, 'biryani');
      this.spawnMysteryCrate(-1.5, 42, 'nitro');
      this.spawnMysteryCrate(1.5, 22, 'jump');
      this.spawnMysteryCrate(0, -2, 'mystery');
      this.spawnMysteryCrate(-1.8, -26, 'shield');
      this.spawnMysteryCrate(1.5, -46, 'nitro');
      this.spawnMysteryCrate(0, -68, 'horn');
    }
    return true;
  }

  spawnMysteryCrate(x, z, type = 'mystery') {
    const mesh = KarachiModels.createPowerUpCrate(type);
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);
    this.cityGen.registerEdible(mesh, 1, 100, `Power-Up [${type.toUpperCase()}]`, 1.2, {
      isPowerUp: true,
      powerUpType: type,
      isBadGuy: true,
      isDistrictEvil: false
    });
    return mesh;
  }

  spawnGutterHazard(x, z, radius = 1.6) {
    const mesh = KarachiModels.createOpenGutterHazard(radius);
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);
    if (!this.gutterHazards) this.gutterHazards = [];
    this.gutterHazards.push(mesh);
    return mesh;
  }

  spawnPECHSFinishGate(x = 0, z = -85) {
    const mesh = KarachiModels.createPECHSFinishGate();
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);
    this.finishGate = mesh;
    return mesh;
  }

  handlePECHSArrival() {
    if (this.districtClearing) return;
    this.districtClearing = true;
    audio.playDistrictClearedFanfare();
    this.particles.createCelebrationConfetti(this.player.position, 80);
    this.particles.createLevelUpShockwave(this.player.position, 20);
    this.score = (this.score || 0) + 5000;
    this.player.addXP(2000);
    this.ui.showAnnouncement('🏁 DESTINATION REACHED: SOLDIER BAZAR ➔ PECHS TARIQ ROAD! +5000 PTS', '#00e676');
    this.handleDistrictCleared();
  }

  updatePhysics(dt) {
    // Check Turbo boost (Button or Bun Kabab Spicy Chutney turbo boost or Arcade Nitro)
    this.player.isBoosting = this.isBoosting || window.isBoostPressed || (this.player.turboTimer > 0) || (this.turboTimer > 0) || (this.nitroTimer > 0);
    if (this.player.turboTimer > 0) {
      this.player.turboTimer -= dt;
    }
    if (this.turboTimer > 0) {
      this.turboTimer -= dt;
    }
    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
    }
    // Check Nitro, Shield, and Super Jump power-up timers
    if (this.nitroTimer > 0) {
      this.nitroTimer -= dt;
      this.player.isBoosting = true;
      this.player.currentSpeed = this.player.baseSpeed * 2.4;
      this.particles.createSkidSmoke(this.player.position, 2);
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.player) this.player.isShielded = (this.shieldTimer > 0);
    } else if (this.player) {
      this.player.isShielded = false;
    }
    if (this.superJumpTimer > 0) {
      this.superJumpTimer -= dt;
    }
    if (this.hornCooldownTimer > 0) {
      this.hornCooldownTimer = Math.max(0, this.hornCooldownTimer - dt);
      const hornButton = document.getElementById('btn-horn');
      if (hornButton) {
        if (this.hornCooldownTimer > 0) {
          hornButton.classList.add('is-cooling-down');
          const hint = hornButton.querySelector('.horn-hint');
          if (hint) hint.textContent = `${Math.ceil(this.hornCooldownTimer)}s`;
        } else {
          hornButton.classList.remove('is-cooling-down');
          hornButton.classList.add('is-recharged');
          setTimeout(() => hornButton.classList.remove('is-recharged'), 500);
          const hint = hornButton.querySelector('.horn-hint');
          if (hint) hint.textContent = 'TAP / H';
          audio?.playHornReady?.();
        }
      }
    }
    if (this.activePowerUp && this.activePowerUp.timer > 0) {
      this.activePowerUp.timer -= dt;
    } else {
      this.activePowerUp = null;
    }

    if (this.isTempleRun) {
      if (!this.isGameStarted) {
        this.updateMenuShowcase(dt);
        return;
      }
      this.updateTempleRunCorridor(dt);
      this.player.update(dt);
      this.particles.update(dt);
      return;
    }

    // Check Bun Kabab Stalls for Spicy Chutney Turbo Boost
    for (let i = 0; i < this.foodStalls.length; i++) {
      const stall = this.foodStalls[i];
      if (stall.state === 'swallowed') continue;

      const sPos = stall.mesh.position;
      const distToPlayer = this.player.position.distanceTo(sPos);

      // Proximity gives Spicy Chutney Turbo Boost!
      if (stall.name.includes('Bun Kabab') && distToPlayer < 4.2 && !stall.mesh.userData.hasGivenBoost) {
        stall.mesh.userData.hasGivenBoost = true;
        this.player.turboTimer = 5.0; // 5 seconds of super speed!
        audio.playBunKababSizzle();
        this.particles.createSwallowBurst(sPos, 2, 20);
        this.ui.showAnnouncement("🍔 BURNS ROAD BUN KABAB: SPICY CHUTNEY TURBO BOOST! ⚡", "#ff9100");
      }
    }

    // Camera-relative street movement & Karachi Temple Run corridor progression
    if (this.isAutoPilotActive && this.player && this.player.isAlive) {
      this.executeAutoPilotSteering(dt);
    } else if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
      const inputForward = -this.moveVector.y; // W / Joystick Up is +1 forward
      const inputRight = this.moveVector.x;    // D / Joystick Right is +1 right

      const curAngle = (this.camAngle !== undefined) ? this.camAngle : Math.PI;
      const sinCam = Math.sin(curAngle);
      const cosCam = Math.cos(curAngle);

      // Transform camera-space input into 3D world movement
      const worldDx = inputForward * sinCam - inputRight * cosCam;
      const worldDz = inputForward * cosCam + inputRight * sinCam;

      if (Math.abs(worldDx) > 0.001 || Math.abs(worldDz) > 0.001) {
        this.player.move(worldDx, worldDz, dt, 96.0, this.cityGen.obstacles || []);
      }
    }

    // =============================================================
    // COASTAL WATER CORNERS & BOUNDARY SPLASH DETECTION
    // =============================================================
    if (this.player && this.player.isAlive) {
      if (this.player.splashCooldown > 0) this.player.splashCooldown -= dt;
      if (this.player.boundaryNoticeCooldown > 0) this.player.boundaryNoticeCooldown -= dt;

      const pPos = this.player.position;
      const distToManoraSW = Math.hypot(pPos.x - (-94), pPos.z - 94);
      const distToDoDaryaSE = Math.hypot(pPos.x - 94, pPos.z - 94);
      const isAtSouthCoast = pPos.z >= 92.0;
      const isAtWaterCorner = distToManoraSW < 18.0 || distToDoDaryaSE < 18.0 || isAtSouthCoast;

      if (isAtWaterCorner && (!this.player.splashCooldown || this.player.splashCooldown <= 0)) {
        this.player.splashCooldown = 0.85; // 850ms debounce
        audio.playWaterSplash();
        this.particles.createWaterSplash(pPos, 32);

        // Gentle Arabian Sea wave surge pushback
        this.player.position.z -= 0.35;
        this.player.group.position.copy(this.player.position);

        if (distToManoraSW < 18.0) {
          this.ui.showAnnouncement("🌊 SPLASH! MANORA POINT & ARABIAN SEA! Coastal Corner! ⚓", "#00e5ff");
        } else if (distToDoDaryaSE < 18.0) {
          this.ui.showAnnouncement("🌊 SPLASH! DO DARYA WATERFRONT! Coastal Pier Waves! 🦞", "#00e5ff");
        } else {
          this.ui.showAnnouncement("🌊 SPLASH! CLIFTON SEA VIEW! Arabian Sea Coastline! 🏖️", "#00e5ff");
        }
      } else if (!isAtWaterCorner) {
        // Northern, Eastern, and Western Land Barriers
        const isNearNorth = pPos.z <= -94.0;
        const isNearEast = pPos.x >= 94.0;
        const isNearWest = pPos.x <= -94.0;

        if ((isNearNorth || isNearEast || isNearWest) && (!this.player.boundaryNoticeCooldown || this.player.boundaryNoticeCooldown <= 0)) {
          this.player.boundaryNoticeCooldown = 1.4;
          audio.vibrate([30, 20]);
          if (isNearNorth) {
            this.ui.showAnnouncement("🏛️ BAB-E-KARACHI PORTAL! Northern City Boundary!", "#ffd700");
          } else if (isNearEast) {
            this.ui.showAnnouncement("🚧 KMC HAZARD BARRIERS! Eastern Boundary Reached! ⚠️", "#ff9100");
          } else {
            this.ui.showAnnouncement("🧱 SADDAR HERITAGE WALL! Western Boundary Reached! 🏛️", "#ffd700");
          }
        }
      }
    }

    // =============================================================
    // OPEN GUTTER HAZARDS & MANHOLE SEWER TRAPS (کھلے گٹر)
    // =============================================================
    if (this.gutterHazards && this.player && this.player.isAlive) {
      const pPos = this.player.position;
      for (let g = 0; g < this.gutterHazards.length; g++) {
        const gutter = this.gutterHazards[g];
        if (!gutter || !gutter.position) continue;
        const d = pPos.distanceTo(gutter.position);
        const trapRadius = (gutter.hazardRadius || 1.6) * 0.75 + this.player.radius * 0.45;

        if (d < trapRadius) {
          // If player is in the air jumping over!
          if (!this.player.isGrounded && this.player.position.y > 0.4) {
            if (!gutter.userData.hasBeenJumped) {
              gutter.userData.hasBeenJumped = true;
              this.score = (this.score || 0) + 150;
              this.player.addXP(150);
              this.guttersJumped = (this.guttersJumped || 0) + 1;
              audio.playJump();
              this.particles.createDevourSparkles(pPos, 12, 0x00e676);
              this.ui.showFloatingFeedback('+150 🦘 GUTTER LEAPED!', pPos, '#00e676');
            }
          } else if (this.shieldTimer > 0 || this.player.isShielded) {
            // Shield rolls safely over!
            if (!gutter.userData.shieldToastTime || Date.now() - gutter.userData.shieldToastTime > 1500) {
              gutter.userData.shieldToastTime = Date.now();
              this.ui.showFloatingFeedback('🛡️ SHIELD DEFLECTS SEWER!', pPos, '#00e5ff');
            }
          } else if (!this.player.isTrappedInGutter) {
            // Player falls into the open sewer hole!
            this.player.isTrappedInGutter = true;
            this.player.gutterTrapTimer = 1.6;
            this.player.position.y = -0.35;
            this.gutterFalls = (this.gutterFalls || 0) + 1;
            this.score = Math.max(0, (this.score || 0) - 50);
            audio.playGutterSplash();
            this.cameraShakeTimer = 0.4;
            this.particles.createSkidSmoke(pPos, 25);
            this.ui.showAnnouncement('🕳️ TRAPPED IN OPEN GUTTER! Tap [SPACE] or JUMP to escape!', '#ff1744');
            this.ui.showFloatingFeedback('-50 🕳️ GUTTER TRAP!', pPos, '#ff1744');
            if (window.__DEV_TELEMETRY__) {
              window.__DEV_TELEMETRY__.gutterFalls = this.gutterFalls;
            }
          }
        }
      }

      if (this.player.isTrappedInGutter) {
        this.player.gutterTrapTimer -= dt;
        this.player.currentSpeed = 2.5; // Severely slowed in sewer muck
        if (this.player.gutterTrapTimer <= 0) {
          this.player.isTrappedInGutter = false;
          this.player.position.y = 0;
          this.player.jump(6.5);
          this.ui.showFloatingFeedback('💨 ESCAPED SEWER!', pPos, '#00e676');
        }
      }
    }

    // =============================================================
    // 70CC MOTORCYCLE ROBBER CHASE & AMBUSH LOGIC
    // =============================================================
    if (this.districtEvils && this.player && this.player.isAlive) {
      this.districtEvils.forEach(evil => {
        if (!evil || evil.state === 'swallowed' || !evil.mesh) return;
        if (evil.evilType === 'robber') {
          const d = this.player.position.distanceTo(evil.mesh.position);
          if (evil.isFleeing) {
            evil.fleeTimer = (evil.fleeTimer || 0) - dt;
            if (evil.fleeTimer <= 0) evil.isFleeing = false;
            const away = new THREE.Vector3().subVectors(evil.mesh.position, this.player.position).normalize();
            evil.mesh.position.addScaledVector(away, dt * 12.0);
            evil.mesh.rotation.y = Math.atan2(away.x, away.z);
          } else if (d < 18.0) {
            const toward = new THREE.Vector3().subVectors(this.player.position, evil.mesh.position).normalize();
            evil.mesh.position.addScaledVector(toward, dt * 10.2);
            evil.mesh.rotation.y = Math.atan2(toward.x, toward.z);

            if (d < (this.player.radius + 1.1)) {
              if (this.shieldTimer > 0 || this.player.isShielded) {
                evil.state = 'swallowed';
                this.resolveDistrictThreat(evil, this.player);
                audio.playDevourMajor();
                this.particles.createCelebrationConfetti(evil.mesh.position, 40);
                this.ui.showAnnouncement('💥 TANKER SHIELD RAMMED ROBBER! +1000 PTS', '#00e5ff');
              } else if (!evil.hasRobbedCooldown || Date.now() - evil.hasRobbedCooldown > 3000) {
                evil.hasRobbedCooldown = Date.now();
                evil.isFleeing = true;
                evil.fleeTimer = 4.0;
                this.robberyLosses = (this.robberyLosses || 0) + 1;
                this.score = Math.max(0, (this.score || 0) - 150);
                audio.vibrate([100, 50, 100]);
                this.cameraShakeTimer = 0.3;
                this.ui.showAnnouncement('⚠️ SNATCHER ATTACK! -150 PTS! Outrun or Horn next time!', '#ff1744');
                this.ui.showFloatingFeedback('-150 📱 SNATCHED!', this.player.position, '#ff1744');
                if (window.__DEV_TELEMETRY__) {
                  window.__DEV_TELEMETRY__.robberyLosses = this.robberyLosses;
                }
              }
            }
          }
        }
      });
    }

    // =============================================================
    // PECHS TARIQ ROAD DESTINATION ARRIVAL CHECK
    // =============================================================
    if (this.currentDistrictLevel === 1 && this.player && this.player.isAlive) {
      if (this.player.position.z <= -80.0 && !this.districtClearing) {
        this.handlePECHSArrival();
      }
    }

    // Update Player & Bots
    this.holes.forEach(hole => {
      hole.update(dt);
      if (!hole.isPlayer) {
        hole.updateAI(dt, this.edibleObjects, this.holes, this.cityGen.obstacles || []);
      }
    });

    // Hole vs Hole Swallowing Interactions
    const isKidsMode = (this.difficulty || 'kidsEasy') === 'kidsEasy';
    for (let i = 0; i < this.holes.length; i++) {
      for (let j = 0; j < this.holes.length; j++) {
        if (i === j) continue;
        const hunter = this.holes[i];
        const victim = this.holes[j];

        if (!hunter.isAlive || !victim.isAlive) continue;

        // In Kids / Easy mode, bots NEVER devour the player!
        if (victim.isPlayer && isKidsMode) {
          continue;
        }

        // Hunter eats victim if larger
        const threshold = (hunter.isPlayer && isKidsMode) ? 1.15 : 1.25;
        if (hunter.radius > victim.radius * threshold) {
          const dist = hunter.position.distanceTo(victim.position);
          if (dist < hunter.radius) {
            // Devour victim hole!
            const bonus = 1000 * victim.level;
            hunter.addXP(bonus, (h) => {
              if (h.isPlayer) this.handlePlayerLevelUp(h);
            });
            hunter.kills++;

            this.particles.createSwallowBurst(victim.position, 4, 25);
            audio.playHoleKill(victim.isPlayer);

            if (hunter.isPlayer) {
              this.ui.showAnnouncement(`💥 DEVOURED ${victim.name}! (+${bonus} XP)`, '#ffd700');
            } else if (victim.isPlayer) {
              this.ui.showAnnouncement(`💀 DEVOURED BY ${hunter.name}!`, '#ff1744');
            }

            // Safe respawn position on a random open road within active district
            const safeX = (Math.random() - 0.5) * 88;
            const safeZ = (Math.random() - 0.5) * 88;
            victim.killAndRespawn({ x: safeX, z: safeZ });
          }
        }
      }
    }

    // Update Karachi Civic Evils: Lively GTA-Style Evasive Pursuits & Panic Banter!
    const nowTime = performance.now() * 0.001;
    for (let i = 0; i < this.badGuys.length; i++) {
      const bg = this.badGuys[i];
      if (!bg || bg.state === 'swallowed' || bg.state === 'resolving') continue;

      const bgMesh = bg.mesh;
      if (!bgMesh) continue;
      const bgPos = bgMesh.position;
      const ud = bgMesh.userData;

      // Sparking utility wires
      if (bg.evilType === 'ke' && ud && ud.sparkGroup) {
        ud.sparkGroup.children.forEach(sp => {
          sp.visible = Math.random() > 0.35;
        });
      }

      // Mobile targets: vehicles (tanker, vip, onewheeler) and pedestrian runners (politician, robber, gutka, chinacutting, bhatta)
      const isVehicle = (bg.evilType === 'tanker' || bg.evilType === 'vip' || bg.evilType === 'onewheeler');
      const isMobile = isVehicle || (bg.evilType === 'politician' || bg.evilType === 'robber' ||
                       bg.evilType === 'gutka' || bg.evilType === 'chinacutting' || bg.evilType === 'bhatta');

      if (isMobile && this.player && this.player.isAlive) {
        const playerDist = this.player.position.distanceTo(bgPos);
        const alertRange = isVehicle ? 26.0 : 20.0;
        const interceptRange = this.player.radius + (isVehicle ? 1.6 : 1.2);

        // Active Pursuit & Interception State
        if (playerDist < alertRange && bg.state === 'idle') {
          bg.isAlerted = true;

          // 1. Interception Braking Check: Hero caught up to the target!
          const isIntercepted = (playerDist <= interceptRange) || (bg.resolveTimer && bg.resolveTimer > 0) || (bg.interceptHoldTimer && bg.interceptHoldTimer > 0);

          if (playerDist <= interceptRange || (bg.resolveTimer && bg.resolveTimer > 0)) {
            bg.isInterceptionBraking = true;
            bg.interceptHoldTimer = 3.0; // Stays fully immobilized for 3 seconds so player can position over it

            if (!bg.hasTriggeredInterceptBrake) {
              bg.hasTriggeredInterceptBrake = true;
              audio.playBrakeScreech();
              audio.vibrate(25);
              this.particles.createSkidSmoke(bgPos, 8);

              const brakePhrases = {
                tanker: "🛑 TIRES LOCKED! Tanker immobilized!",
                vip: "🛑 ROADBLOCK! VIP convoy halted!",
                onewheeler: "🛑 ENGINE CUT! Bike grounded!",
                robber: "🛑 CORNERED! Hands in the air!",
                bhatta: "🛑 HALT! Bhatta slips confiscated!",
                politician: "🛑 STOPPED! Anti-corruption interception!",
                chinacutting: "🛑 HALT! Encroachment seized!",
                gutka: "🛑 CORNERED! Contraband seized!"
              };
              const phrase = brakePhrases[bg.evilType] || "🛑 INTERCEPTED! Target halted!";
              if (ud && ud.drawBubble) {
                ud.drawBubble(phrase);
              }
            }
          } else if (playerDist > 16.0) {
            // Player moved far away; release interception hold
            bg.isInterceptionBraking = false;
            bg.hasTriggeredInterceptBrake = false;
            bg.interceptHoldTimer = 0;
          } else if (bg.interceptHoldTimer > 0) {
            bg.interceptHoldTimer -= dt;
          }

          // Speeds
          const speedMap = {
            onewheeler: 9.8,
            vip: 9.0,
            tanker: 8.0,
            robber: 7.8,
            bhatta: 7.4,
            politician: 7.0
          };
          const baseFleeSpeed = ud?.runSpeed || speedMap[bg.evilType] || 7.0;
          const isDevFrozen = (typeof window !== 'undefined' && window.__DEV_FREEZE_THREATS__);
          // Proximity surge when chased at medium distance, but drops to 0 when intercepted or dev frozen
          const proximitySurge = (playerDist < 12.0 && playerDist > interceptRange + 0.8) ? 1.15 : 1.0;
          const effectiveFleeSpeed = (isIntercepted || isDevFrozen) ? 0 : baseFleeSpeed * proximitySurge;

          // 2. Road Network Corridor Navigation for Vehicles (Avenues & Connecting Cross-Streets)
          if (isVehicle) {
            const roadGrid = [-96, -72, -48, -24, 0, 24, 48, 72, 96];

            let bestRx = roadGrid[0];
            let minDiffX = Math.abs(bgPos.x - bestRx);
            for (let r = 1; r < roadGrid.length; r++) {
              const d = Math.abs(bgPos.x - roadGrid[r]);
              if (d < minDiffX) { minDiffX = d; bestRx = roadGrid[r]; }
            }

            let bestRz = roadGrid[0];
            let minDiffZ = Math.abs(bgPos.z - bestRz);
            for (let r = 1; r < roadGrid.length; r++) {
              const d = Math.abs(bgPos.z - roadGrid[r]);
              if (d < minDiffZ) { minDiffZ = d; bestRz = roadGrid[r]; }
            }

            if (!bg.roadAxis) {
              bg.roadAxis = (minDiffX <= minDiffZ) ? 'NS' : 'EW';
            }

            if (effectiveFleeSpeed > 0) {
              let moveDirX = 0;
              let moveDirZ = 0;

              if (bg.roadAxis === 'NS') {
                let dirZ = (this.player.position.z > bgPos.z) ? -1 : 1;
                const nearIntersection = (minDiffZ < 5.0);
                const nearBoundary = (bgPos.z < -82 && dirZ < 0) || (bgPos.z > 82 && dirZ > 0);

                if (nearIntersection && nearBoundary) {
                  bg.roadAxis = 'EW';
                  let dirX = (this.player.position.x > bgPos.x) ? -1 : 1;
                  moveDirX = dirX;
                  moveDirZ = 0;
                } else {
                  moveDirZ = dirZ;
                  const laneOffset = (i % 2 === 0 ? 1.6 : -1.6);
                  const targetX = bestRx + laneOffset;
                  moveDirX = THREE.MathUtils.clamp((targetX - bgPos.x) * 2.2, -1.0, 1.0);
                }
              } else {
                let dirX = (this.player.position.x > bgPos.x) ? -1 : 1;
                const nearIntersection = (minDiffX < 5.0);
                const nearBoundary = (bgPos.x < -82 && dirX < 0) || (bgPos.x > 82 && dirX > 0);

                if (nearIntersection && nearBoundary) {
                  bg.roadAxis = 'NS';
                  let dirZ = (this.player.position.z > bgPos.z) ? -1 : 1;
                  moveDirZ = dirZ;
                  moveDirX = 0;
                } else {
                  moveDirX = dirX;
                  const laneOffset = (i % 2 === 0 ? 1.6 : -1.6);
                  const targetZ = bestRz + laneOffset;
                  moveDirZ = THREE.MathUtils.clamp((targetZ - bgPos.z) * 2.2, -1.0, 1.0);
                }
              }

              let nextX = bgPos.x + moveDirX * dt * effectiveFleeSpeed;
              let nextZ = bgPos.z + moveDirZ * dt * effectiveFleeSpeed;

              // Road lane clamping - vehicle stays strictly within the asphalt road corridor!
              const isMajorRoadX = (bestRx % 48 === 0);
              const isMajorRoadZ = (bestRz % 48 === 0);
              const halfCorridorX = isMajorRoadX ? 5.2 : 3.2;
              const halfCorridorZ = isMajorRoadZ ? 5.2 : 3.2;

              if (bg.roadAxis === 'NS') {
                nextX = THREE.MathUtils.clamp(nextX, bestRx - halfCorridorX, bestRx + halfCorridorX);
                nextZ = THREE.MathUtils.clamp(nextZ, -88, 88);
              } else {
                nextX = THREE.MathUtils.clamp(nextX, -88, 88);
                nextZ = THREE.MathUtils.clamp(nextZ, bestRz - halfCorridorZ, bestRz + halfCorridorZ);
              }

              bgPos.x = nextX;
              bgPos.z = nextZ;

              const targetRotY = Math.atan2(moveDirX, moveDirZ);
              let diff = targetRotY - bgMesh.rotation.y;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              bgMesh.rotation.y += diff * Math.min(1.0, dt * 10.0);

              if (bg.evilType === 'onewheeler') {
                bgMesh.rotation.x = -0.32; // Wheelie!
              }

              if (Math.random() < 0.28) {
                this.particles.createSkidSmoke(bgPos, 3);
              }
            } else {
              // Intercepted / Halted vehicle state
              if (Math.random() < 0.12) {
                this.particles.createSkidSmoke(bgPos, 2);
              }
              if (bg.evilType === 'onewheeler') {
                bgMesh.rotation.x = 0;
              }
            }
          } else {
            // 3. Pedestrian Runners (Robbers, Bhatta Collectors, Corrupt Officials)
            if (effectiveFleeSpeed > 0) {
              const fleeX = bgPos.x - this.player.position.x;
              const fleeZ = bgPos.z - this.player.position.z;
              const len = Math.hypot(fleeX, fleeZ) || 1.0;
              let normX = fleeX / len;
              let normZ = fleeZ / len;

              let nextX = THREE.MathUtils.clamp(bgPos.x + normX * dt * effectiveFleeSpeed, -88, 88);
              let nextZ = THREE.MathUtils.clamp(bgPos.z + normZ * dt * effectiveFleeSpeed, -88, 88);

              // Slide smoothly along box obstacles without vibrating into corners
              const obstacles = this.cityGen?.obstacles || [];
              const pad = 1.3;
              for (let o = 0; o < obstacles.length; o++) {
                const obs = obstacles[o];
                if (!obs || !obs.isBox || obs.item === bg) continue;
                if (nextX > obs.minX - pad && nextX < obs.maxX + pad && nextZ > obs.minZ - pad && nextZ < obs.maxZ + pad) {
                  if (Math.abs(normX) > Math.abs(normZ)) {
                    nextX = (bgPos.x < obs.cx) ? obs.minX - pad : obs.maxX + pad;
                  } else {
                    nextZ = (bgPos.z < obs.cz) ? obs.minZ - pad : obs.maxZ + pad;
                  }
                }
              }

              bgPos.x = nextX;
              bgPos.z = nextZ;
              bgMesh.rotation.y = Math.atan2(normX, normZ);

              if (ud && ud.legL && ud.legR) {
                ud.runCycle = (ud.runCycle || 0) + dt * 22;
                ud.legL.rotation.x = Math.sin(ud.runCycle) * 1.1;
                ud.legR.rotation.x = -Math.sin(ud.runCycle) * 1.1;
                if (ud.armL && ud.armR) {
                  ud.armL.rotation.z = 1.4 + Math.sin(ud.runCycle) * 0.6;
                  ud.armR.rotation.z = -1.4 - Math.sin(ud.runCycle) * 0.6;
                }
              }
            } else {
              // Intercepted / Cornered suspect raises hands in surrender
              if (ud && ud.armL && ud.armR) {
                ud.armL.rotation.z = 2.4;
                ud.armR.rotation.z = -2.4;
              }
            }
          }

          // Initial escape alert speech & sound
          if (!bg.hasPanickedEscape) {
            bg.hasPanickedEscape = true;
            if (bg.evilType === 'vip') audio.playVIPHooter();
            else if (bg.evilType === 'tanker' || bg.evilType === 'onewheeler') audio.playBrakeScreech();

            const escapeLines = {
              politician: "🚨 Run! The Anti-Corruption Patrol is right behind us!",
              robber: "🏃 Drop the purse! Hero is cutting through the street!",
              gutka: "🏃 Flee into the bazaar! Protect the stash!",
              chinacutting: "⚠️ Abandon the illegal construction! Run!",
              bhatta: "💼 Protect the extortion slips! Speed up!",
              tanker: "💧 Step on the gas! Don't let the Hero seize the water tanker!",
              vip: "🚨 Clear the road! VIP Protocol motorcade will not yield!",
              onewheeler: "🏍️ Lyari 70cc speed! You can't catch my wheelie!"
            };
            const line = escapeLines[bg.evilType] || "Run! Karachi Hero is approaching!";
            if (ud && ud.drawBubble) {
              ud.drawBubble(line);
            }
          }
        }
      }

      bgPos.x = THREE.MathUtils.clamp(bgPos.x, -94, 94);
      bgPos.z = THREE.MathUtils.clamp(bgPos.z, -94, 94);
    }

    // Update Karachi Stray Animals (Dogs barking, Cats roaming, Rats scurrying)
    for (let i = 0; i < this.animals.length; i++) {
      const animal = this.animals[i];
      if (animal.state === 'swallowed') continue;

      const aMesh = animal.mesh;
      const aPos = aMesh.position;
      const ud = aMesh.userData;
      if (!ud) continue;

      let nearestHole = null;
      let minHoleDist = Infinity;
      for (let h = 0; h < this.holes.length; h++) {
        const hole = this.holes[h];
        if (!hole.isAlive) continue;
        const d = hole.position.distanceTo(aPos);
        if (d < minHoleDist) {
          minHoleDist = d;
          nearestHole = hole;
        }
      }

      if (aMesh.name === 'Stray-Dog') {
        ud.walkCycle = (ud.walkCycle || 0) + dt * 8;
        if (ud.legFL && ud.legFR && ud.legBL && ud.legBR) {
          ud.legFL.rotation.x = Math.sin(ud.walkCycle) * 0.55;
          ud.legFR.rotation.x = -Math.sin(ud.walkCycle) * 0.55;
          ud.legBL.rotation.x = -Math.sin(ud.walkCycle) * 0.55;
          ud.legBR.rotation.x = Math.sin(ud.walkCycle) * 0.55;
        }
        if (ud.tail) {
          ud.tail.rotation.y = Math.sin(ud.walkCycle * 2.2) * 0.45;
        }

        // Flee if hole approaches within 12m
        if (nearestHole && minHoleDist < 12 && animal.state === 'idle') {
          const fleeX = aPos.x - nearestHole.position.x;
          const fleeZ = aPos.z - nearestHole.position.z;
          const len = Math.sqrt(fleeX * fleeX + fleeZ * fleeZ);
          if (len > 0.1) {
            aPos.x += (fleeX / len) * dt * (ud.moveSpeed || 5.5);
            aPos.z += (fleeZ / len) * dt * (ud.moveSpeed || 5.5);
            aMesh.rotation.y = Math.atan2(fleeX, fleeZ);
          }

          // Bark sound when player approaches
          ud.barkTimer = (ud.barkTimer || 3) - dt;
          if (ud.barkTimer <= 0 && minHoleDist < 10) {
            ud.barkTimer = 3.5 + Math.random() * 3.0;
            if (nearestHole.isPlayer) {
              audio.playDogBark();
            }
          }
        }
      } else if (aMesh.name === 'Street-Cat') {
        ud.walkCycle = (ud.walkCycle || 0) + dt * 10;
        if (nearestHole && minHoleDist < 9 && animal.state === 'idle') {
          const fleeX = aPos.x - nearestHole.position.x;
          const fleeZ = aPos.z - nearestHole.position.z;
          const len = Math.sqrt(fleeX * fleeX + fleeZ * fleeZ);
          if (len > 0.1) {
            aPos.x += (fleeX / len) * dt * (ud.moveSpeed || 6.5);
            aPos.z += (fleeZ / len) * dt * (ud.moveSpeed || 6.5);
            aMesh.rotation.y = Math.atan2(fleeX, fleeZ);
          }
        }
      } else if (aMesh.name === 'Sewer-Rat') {
        ud.walkCycle = (ud.walkCycle || 0) + dt * 14;
        if (nearestHole && minHoleDist < 7 && animal.state === 'idle') {
          const fleeX = aPos.x - nearestHole.position.x;
          const fleeZ = aPos.z - nearestHole.position.z;
          const len = Math.sqrt(fleeX * fleeX + fleeZ * fleeZ);
          if (len > 0.1) {
            aPos.x += (fleeX / len) * dt * (ud.moveSpeed || 7.5);
            aPos.z += (fleeZ / len) * dt * (ud.moveSpeed || 7.5);
            aMesh.rotation.y = Math.atan2(fleeX, fleeZ);
          }
        }
      }

      aPos.x = THREE.MathUtils.clamp(aPos.x, -94, 94);
      aPos.z = THREE.MathUtils.clamp(aPos.z, -94, 94);
    }

    // =============================================================
    // ANIMATE INTERACTIVE SCENE ACTORS & EVIL TARGET DECALS
    // =============================================================
    const currentTime = this.clock.getElapsedTime();

    // 1. Robbery Victims (Shivering in fear if robber active, jumping & dancing in joy if rescued!)
    if (this.interactiveVictims) {
      for (let i = 0; i < this.interactiveVictims.length; i++) {
        const v = this.interactiveVictims[i];
        const ud = v.userData;
        if (!ud) continue;

        if (ud.isRescued) {
          ud.danceCycle = (ud.danceCycle || 0) + dt * 10;
          v.position.y = Math.abs(Math.sin(ud.danceCycle)) * 0.45;
          if (ud.handL && ud.handR) {
            ud.handL.rotation.z = -1.4 + Math.sin(ud.danceCycle) * 0.4;
            ud.handR.rotation.z = 1.4 - Math.sin(ud.danceCycle) * 0.4;
          }
        } else {
          // Terrified trembling
          const tremble = Math.sin(currentTime * 30 + i) * 0.03;
          if (ud.vBody) ud.vBody.position.x = tremble;
        }
      }
    }

    // 2. Stuck Traffic Vehicles (Impatient honking when blocked, joyous driving when freed!)
    if (this.interactiveTraffic) {
      for (let i = 0; i < this.interactiveTraffic.length; i++) {
        const tr = this.interactiveTraffic[i];
        const ud = tr.userData;
        if (!ud) continue;

        if (ud.isFreed) {
          const speed = ud.freedSpeed || 6.0;
          const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), tr.rotation.y);
          tr.position.addScaledVector(forward, dt * speed);
        } else {
          tr.position.y = Math.abs(Math.sin(currentTime * 12 + i)) * 0.04;
        }
      }
    }

    // 3. Thirsty Residents (Pleading when dry, dancing with full water drums when tanker is devoured!)
    if (this.interactiveResidents) {
      for (let i = 0; i < this.interactiveResidents.length; i++) {
        const res = this.interactiveResidents[i];
        const ud = res.userData;
        if (!ud) continue;

        if (ud.isWaterReceived) {
          ud.danceCycle = (ud.danceCycle || 0) + dt * 8;
          res.position.y = Math.abs(Math.sin(ud.danceCycle)) * 0.35;
          res.rotation.y += dt * 1.5;
        }
      }
    }

    // 3b. Animate Pedestrians & Innocent Citizens (Walk cycles, breathing, greeting hero!)
    if (this.edibleObjects) {
      const heroPos = this.player ? this.player.position : null;
      for (let i = 0; i < this.edibleObjects.length; i++) {
        const obj = this.edibleObjects[i];
        if (!obj || obj.state === 'swallowed') continue;
        const mesh = obj.mesh;
        const ud = mesh?.userData;
        if (!ud || !ud.isCitizen) continue;

        ud.animCycle = (ud.animCycle || 0) + dt * (ud.walkSpeed || 1.4) * 4.2;
        const stride = Math.sin(ud.animCycle);

        // Articulated limb swings
        if (ud.legLGroup && ud.legRGroup) {
          ud.legLGroup.rotation.x = stride * 0.42;
          ud.legRGroup.rotation.x = -stride * 0.42;
        }
        if (ud.armLGroup && ud.armRGroup) {
          ud.armLGroup.rotation.x = -stride * 0.38;
          ud.armRGroup.rotation.x = stride * 0.38;
        }

        // Proximity reaction: turn to face hero & give a friendly Pakistani greeting wave!
        if (heroPos) {
          const distToHero = Math.hypot(mesh.position.x - heroPos.x, mesh.position.z - heroPos.z);
          if (distToHero < 5.5) {
            const targetYaw = Math.atan2(heroPos.x - mesh.position.x, heroPos.z - mesh.position.z);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetYaw, dt * 5.0);
            if (ud.armRGroup) {
              ud.armRGroup.rotation.x = -1.4 + Math.sin(currentTime * 8.0) * 0.35;
              ud.armRGroup.rotation.z = 0.35;
            }
          }
        }
      }
    }

    // 4. Animate Glowing Evil Target Decals (Pulse rings and bob overhead billboards)
    let activeResolvingThreat = false;
    for (let i = 0; i < this.edibleObjects.length; i++) {
      const obj = this.edibleObjects[i];
      if (obj.state === 'swallowed') continue;
      const decal = obj.mesh.userData?.targetDecal;
      if (decal && decal.userData) {
        const ring = decal.userData.ring;
        if (ring) {
          const s = 1.0 + Math.sin(currentTime * 4.0 + i) * 0.12;
          ring.scale.set(s, s, s);
        }
        const badge = decal.userData.badge;
        if (badge) {
          badge.position.y = 3.8 + Math.sin(currentTime * 2.5 + i) * 0.15;
        }
        const beacon = decal.userData.beacon;
        if (beacon) {
          const showBeacon = this.districtRemaining <= 4 && this.districtRemaining > 0;
          beacon.visible = showBeacon;
          if (showBeacon) {
            beacon.rotation.y += dt * 1.5;
            if (beacon.userData && beacon.userData.chevron) {
              beacon.userData.chevron.position.y = 8.5 + Math.sin(currentTime * 3.5 + i) * 0.45;
            }
          }
        }
      }
    }

    // 5. Animate Cleaned Transformation Monuments (Rising up smoothly from ground & floating billboards)
    if (this.cleanedMonuments && this.cleanedMonuments.length > 0) {
      for (let i = 0; i < this.cleanedMonuments.length; i++) {
        const mon = this.cleanedMonuments[i];
        if (mon.position.y < 0) {
          mon.position.y = Math.min(0, mon.position.y + dt * 2.5);
        }
        const ud = mon.userData;
        if (ud) {
          if (ud.auraRing) {
            const s = 1.0 + Math.sin(currentTime * 3.5 + i) * 0.08;
            ud.auraRing.scale.set(s, s, s);
          }
          if (ud.sprite) {
            ud.sprite.position.y = 3.6 + Math.sin(currentTime * 2.2 + i) * 0.12;
          }
        }
      }
    }

    // Arcade Power-Up Active Timers
    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
      if (Math.random() < 0.35 && this.player) {
        this.particles.createCleanseSparkleBurst(this.player.position, 2);
      }
    }
    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
      if (this.player && this.player.ringMat) {
        const rainbowColors = [0xff0055, 0xff9900, 0xffea00, 0x00e676, 0x00e5ff, 0x7c4dff];
        const rCol = rainbowColors[Math.floor((currentTime * 8) % rainbowColors.length)];
        this.player.ringMat.color.setHex(rCol);
      }
    } else if (this.player && this.player.ringMat && !this.magnetTimer) {
      this.player.ringMat.color.setHex(0x00e5ff);
    }

    // Edible Objects Suction & Collision (Ultra-fast Bounding Box check for 60 FPS)
    // In Temple Run Karachi mode, corridor movement, obstacles and coins are handled by updateTempleRunCorridor
    if (!this.isTempleRun && this.edibleObjects) {
      const pullSpeed = isKidsMode ? 10.0 : 7.0;
      for (let i = 0; i < this.edibleObjects.length; i++) {
      const obj = this.edibleObjects[i];
      if (obj.state === 'swallowed') continue;

      // Update cooldowns on boost / cheers / pet interaction
      if (obj.boostCooldown > 0) obj.boostCooldown -= dt;
      if (obj.cheerCooldown > 0) obj.cheerCooldown -= dt;
      if (obj.petCooldown > 0) obj.petCooldown -= dt;

      const objPos = obj.mesh.position;

      // Animate overhead Red Chevrons & Pulsing Rings for Bad Guys; Green Halos & Badges for Friends
      const ud = obj.mesh.userData;
      if (ud) {
        if (ud.isBadGuy || obj.isBadGuy) {
          if (ud.arrow) {
            ud.arrow.position.y = 4.8 + Math.sin(currentTime * 6.0 + i) * 0.35;
            ud.arrow.rotation.y += dt * 2.5;
          }
          if (ud.ring) {
            const s = 1.0 + Math.sin(currentTime * 5.0 + i) * 0.12;
            ud.ring.scale.set(s, s, 1);
          }
        }
        if (ud.isFriendly || ud.friendlyDecal) {
          const fd = ud.friendlyDecal?.userData;
          if (fd && fd.ring) {
            fd.ring.rotation.z += dt * 0.4;
          }
          if (fd && fd.badge) {
            fd.badge.position.y = (ud.friendlyType === 'food' || ud.friendlyType === 'chai' ? 3.4 : 2.5) + Math.sin(currentTime * 3.0 + i) * 0.12;
          }
        }
      }

      // =========================================================
      // RULE: ONLY BAD STUFF CAN BE DEVOURED!
      // Innocent things (food stalls, honest citizens, stray animals, landmarks, transport) cannot be eaten!
      // =========================================================
      if (!obj.isBadGuy) {
        if (this.player && this.player.isAlive) {
          const dx = this.player.position.x - objPos.x;
          const dz = this.player.position.z - objPos.z;
          const r = this.player.radius;

          if (Math.abs(dx) <= r + 1.2 && Math.abs(dz) <= r + 1.2 && (dx * dx + dz * dz < (r + 1.2) * (r + 1.2))) {
            if (obj.isFoodStall && (!obj.boostCooldown || obj.boostCooldown <= 0)) {
              this.handleFoodStallBoost(obj);
            } else if (obj.isCitizen && (!obj.cheerCooldown || obj.cheerCooldown <= 0)) {
              this.handleCitizenCheer(obj);
            } else if (obj.isPet && (!obj.petCooldown || obj.petCooldown <= 0)) {
              this.handlePetInteraction(obj);
            }
          }
        }
        continue; // Never sucked into hole!
      }

      // =========================================================
      // 1. ARCADE POWER-UP MYSTERY CRATES
      // =========================================================
      if (obj.isPowerUp) {
        if (obj.mesh) {
          obj.mesh.rotation.y += dt * 3.0;
          const baseY = obj.mesh.userData?.baseY || 0.55;
          obj.mesh.position.y = baseY + Math.sin(currentTime * 4.5 + i) * 0.15;
          if (obj.mesh.userData?.ring) {
            obj.mesh.userData.ring.rotation.z += dt * 2.0;
          }
        }
        if (this.player && this.player.isAlive) {
          const dx = this.player.position.x - objPos.x;
          const dz = this.player.position.z - objPos.z;
          const grabDist = this.player.radius + 0.95;
          if (dx * dx + dz * dz < grabDist * grabDist) {
            this.activatePowerUp(obj.powerUpType || 'magnet');
            obj.state = 'swallowed';
            if (obj.mesh && obj.mesh.parent) {
              this.scene.remove(obj.mesh);
            }
          }
        }
        continue;
      }

      // =========================================================
      // 2. STREET LITTER MUNCHIES (Instant arcade suction & growth!)
      // =========================================================
      if (obj.isLitter) {
        if (this.player && this.player.isAlive) {
          const dx = this.player.position.x - objPos.x;
          const dz = this.player.position.z - objPos.z;
          const distSq = dx * dx + dz * dz;
          const pullDist = (this.magnetTimer > 0) ? 14.0 : (this.player.radius + 1.2);

          if (distSq < pullDist * pullDist) {
            const pullSpeedFactor = (this.magnetTimer > 0) ? 22.0 : 16.0;
            objPos.x += (this.player.position.x - objPos.x) * dt * pullSpeedFactor;
            objPos.z += (this.player.position.z - objPos.z) * dt * pullSpeedFactor;
            if (obj.mesh) {
              obj.mesh.rotation.y += dt * 25.0;
              obj.mesh.rotation.x += dt * 15.0;
              const curScale = obj.mesh.scale.x;
              if (curScale > 0.25) {
                obj.mesh.scale.setScalar(Math.max(0.2, curScale - dt * 2.5));
              }
            }

            const swallowDist = Math.max(0.85, this.player.radius * 0.75);
            if (distSq < swallowDist * swallowDist) {
              obj.state = 'swallowed';
              if (obj.mesh && obj.mesh.parent) {
                this.scene.remove(obj.mesh);
              }
              audio.playScore();
              audio.vibrate(15);
              this.particles.createCleanseSparkleBurst(objPos, 8);
              if (this.player.triggerDevourPulse) {
                this.player.triggerDevourPulse();
              }

              let points = (obj.points || 20);
              if (this.frenzyTimer > 0) points *= 2;
              this.score = (this.score || 0) + points;
              this.player.addXP(points);

              // Maintain nimble commuter profile
              this.player.targetRadius = 1.45;

              // Floating score feedback
              if (this.ui && this.ui.showFloatingFeedback) {
                const screenPos = this.worldToScreen(new THREE.Vector3(objPos.x, objPos.y + 0.8, objPos.z));
                this.ui.showFloatingFeedback(`+${points} 📦 ${obj.name || 'CIVIC AID'}`, screenPos.x, screenPos.y, '#00e676');
              }
            }
          }
        }
        continue;
      }

      // =========================================================
      // 3. DISTRICT EVILS & BOSS THREATS (Must be resolved directly)
      // =========================================================
      if (obj.isDistrictEvil || (obj.isBadGuy && !obj.isLitter && !obj.isPowerUp)) {
        if (obj.state === 'idle' && this.player && this.player.isAlive) {
          const dx = this.player.position.x - objPos.x;
          const dz = this.player.position.z - objPos.z;
          const distSq = dx * dx + dz * dz;

          // Target radius adjustment (large vehicles like tanker are ~3.0m)
          const isLargeTarget = (obj.evilType === 'tanker' || obj.evilType === 'vip' || (obj.radius && obj.radius >= 2.5));
          // Strict "UPON THEM" center-dwell condition: player must genuinely center the hole directly over the target!
          // Eliminates devouring when merely near/passing adjacent to an object.
          const onTopThreshold = isLargeTarget
            ? Math.max(1.15, this.player.radius * 0.65)
            : Math.max(0.70, this.player.radius * 0.52);
          const isOnTop = (distSq <= onTopThreshold * onTopThreshold);

          // If hero reaches proximity of moving target, trigger interception hold immediately
          if (distSq <= (this.player.radius + 1.8) * (this.player.radius + 1.8)) {
            obj.isInterceptionBraking = true;
            obj.interceptHoldTimer = 3.0;
          }

          if (isOnTop) {
            activeResolvingThreat = true;
            if (obj.resolveTimer === undefined || obj.resolveTimer === null) {
              obj.resolveTimer = 0;
              obj.baseY = (obj.mesh && obj.mesh.position) ? obj.mesh.position.y : objPos.y;
              if (obj.mesh && obj.mesh.scale) {
                obj.baseScaleY = obj.mesh.scale.y;
              }
            }

            const isMobileOrVehicle = (obj.evilType === 'tanker' || obj.evilType === 'vip' ||
                                       obj.evilType === 'onewheeler' || obj.evilType === 'robber' ||
                                       obj.evilType === 'bhatta' || obj.evilType === 'politician' ||
                                       obj.evilType === 'chinacutting' || obj.evilType === 'gutka');
            const REQUIRED_RESOLVE_TIME = isMobileOrVehicle ? 0.75 : 0.85;
            obj.resolveTimer += dt;
            const progress = Math.min(1.0, obj.resolveTimer / REQUIRED_RESOLVE_TIME);

            // Active visual feedback: mesh vibrations, rotation, sinking slightly
            if (obj.mesh) {
              obj.mesh.rotation.y += dt * (3.0 + progress * 8.0);
              obj.mesh.position.y = (obj.baseY !== undefined ? obj.baseY : objPos.y) - (progress * 0.35);
              const scaleDown = Math.max(0.72, 1.0 - progress * 0.22);
              obj.mesh.scale.set(scaleDown, scaleDown, scaleDown);
            }

            // Sparkle particles & periodic haptic pulses
            if (Math.random() < 0.35) {
              this.particles.createCleanseSparkleBurst(objPos, 3);
            }
            if (!obj.lastHaptic || performance.now() - obj.lastHaptic > 300) {
              audio.vibrate(15);
              obj.lastHaptic = performance.now();
            }

            if (this.ui) {
              this.ui.showInterventionProgress(obj.evilType || 'evil', progress);
            }

            // Once dwell time completes, officially resolve the threat!
            if (progress >= 1.0) {
              if (this.ui) this.ui.hideInterventionProgress();
              this.resolveDistrictThreat(obj, this.player);
            }
          } else {
            // Player moved off the object: decay gently so minor thumb adjustments don't wipe out progress
            if (obj.resolveTimer && obj.resolveTimer > 0) {
              obj.resolveTimer = Math.max(0, obj.resolveTimer - dt * 1.0);
              if (obj.resolveTimer === 0) {
                if (obj.mesh) {
                  obj.mesh.position.y = obj.baseY !== undefined ? obj.baseY : objPos.y;
                  obj.mesh.scale.set(1, 1, 1);
                }
              }
            }
          }
        }
        continue; // BOTS CAN NEVER EAT OR SUCK DISTRICT EVILS!
      }

      // If ambient object is currently idle, check for nearest hole that can eat it
      if (obj.state === 'idle') {
        for (let h = 0; h < this.holes.length; h++) {
          const hole = this.holes[h];
          if (!hole.isAlive) continue;

          const canEat = (obj.tier <= hole.level);
          if (canEat) {
            const dx = hole.position.x - objPos.x;
            const dz = hole.position.z - objPos.z;
            const captureRadius = Math.max(0.70, hole.radius * 0.72);

            // Fast bounding box reject first
            if (Math.abs(dx) <= captureRadius && Math.abs(dz) <= captureRadius && (dx * dx + dz * dz < captureRadius * captureRadius)) {
              obj.state = 'sucking';
              obj.suckingHole = hole;
              obj.suctionProgress = 0;
              obj.hasTriggeredScream = false;
              break;
            }
          }
        }
      }

      // If object is in suction towards a hole (Slow, Dramatic Comic Struggle ~1.4s)
      if (obj.state === 'sucking' && obj.suckingHole) {
        const hole = obj.suckingHole;
        if (!hole.isAlive) {
          obj.state = 'idle';
          obj.suckingHole = null;
          continue;
        }

        // Slowed down so player can clearly see who is getting devoured and read their last words!
        obj.suctionProgress += dt * 0.72;

        // Trigger comic panicked scream words on first frame of suction
        if (!obj.hasTriggeredScream) {
          obj.hasTriggeredScream = true;
          this.triggerDevourScream(obj, hole);
        }

        // Gravitational magnetic pull / street tackle towards hero
        objPos.x += (hole.position.x - objPos.x) * dt * (pullSpeed * 0.72);
        objPos.z += (hole.position.z - objPos.z) * dt * (pullSpeed * 0.72);

        // Street hero action takedown at ground level (stay grounded, not sinking into sewer hole)
        if (obj.isBadGuy || obj.isDistrictEvil) {
          objPos.y = 0; // Grounded street takedown
          obj.mesh.rotation.y += dt * 10.0;
        } else {
          obj.mesh.rotation.y += dt * 8.0;
          obj.mesh.rotation.z = Math.sin(obj.suctionProgress * 18.0) * 0.4;
          objPos.y -= dt * 2.2;
        }

        // Flail limbs wildly if character
        const ud = obj.mesh.userData;
        if (ud && ud.legL && ud.legR) {
          ud.runCycle = (ud.runCycle || 0) + dt * 28;
          ud.legL.rotation.x = Math.sin(ud.runCycle) * 1.2;
          ud.legR.rotation.x = -Math.sin(ud.runCycle) * 1.2;
          if (ud.armL && ud.armR) {
            ud.armL.rotation.z = 1.6 + Math.sin(ud.runCycle) * 0.8;
            ud.armR.rotation.z = -1.6 - Math.sin(ud.runCycle) * 0.8;
          }
        }

        // Scale down smoothly into the sewer void
        const scaleFactor = Math.max(0.01, 1.0 - obj.suctionProgress * 0.88);
        obj.mesh.scale.set(
          obj.scaleX * scaleFactor,
          obj.scaleY * scaleFactor,
          obj.scaleZ * scaleFactor
        );

        // Fully Swallowed!
        if (obj.suctionProgress >= 1.0 || objPos.y < -2.6) {
          obj.state = 'swallowed';
          this.scene.remove(obj.mesh);

          // Calculate points with combo multiplier & Hero Frenzy bonus
          let points = obj.points;
          if (this.frenzyTimer > 0) {
            points = points * 2; // 2X Score during Hero Frenzy!
          }
          if (hole.comboCount > 1) {
            points = Math.round(points * (1 + hole.comboCount * 0.25));
          }

          hole.addXP(points, (h) => {
            if (h.isPlayer) this.handlePlayerLevelUp(h);
          });

          // Civic Cleanser System: Delegate to resolveDistrictThreat
          if (obj.isBadGuy || obj.isDistrictEvil) {
            if (hole.isPlayer) {
              this.resolveDistrictThreat(obj, hole);
            }
          } else {
            this.particles.createSwallowBurst(hole.position, obj.tier || 1);
            if (hole.isPlayer) {
              audio.playGutterSplash();
              audio.playSwallow(obj.tier || 1);
            }
          }

          if (hole.isPlayer) {
            if (hole.comboCount > 2) {
              audio.playCombo(hole.comboCount);
            }

            // Screen floating score feedback
            const screenPos = this.worldToScreen(hole.position);
            this.ui.showFloatingFeedback(`+${points} ${obj.name}`, screenPos.x, screenPos.y);
          }
        }
      }
    }
  }

    if (!activeResolvingThreat && this.ui) {
      this.ui.hideInterventionProgress();
    }

    // Update Particles
    this.particles.update(dt);
  }

  worldToScreen(pos) {
    const vector = pos.clone().project(this.camera);
    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
    };
  }

  triggerDevourScream(obj, hole) {
    const ud = obj.mesh?.userData;
    let scream = "";
    const type = obj.evilType;

    const screams = {
      politician: [
        "No! My offshore secret accounts!",
        "I resign! Spare my briefcases!",
        "My VIP protocol is sinking! Help!",
        "You can't devour an MNA!"
      ],
      robber: [
        "Take the phone back! Don't devour me!",
        "I surrender! The gun was fake!",
        "Spare my bike! I will be good!",
        "Mercy! I will never steal again!"
      ],
      tanker: [
        "I will forgive the water bill!",
        "Free tap water for Karachi!",
        "The water tanker is sinking into the hole!"
      ],
      vip: [
        "MOVE ASIDE! VIP convoy is falling in!",
        "Turn off the sirens! Help us!",
        "Where is our security escort?!"
      ],
      gutka: [
        "My gutka bags spilled! Run!",
        "I will never sell harmful betel again!",
        "I promise spotless clean walls!"
      ],
      ke: [
        "ZZZZT! Load shedding cancelled!",
        "Live wires chopped! Sparks stopped!",
        "Illegal kunda line removed!"
      ],
      chinacutting: [
        "Take the footpath back! Free public walkway!",
        "The illegal land registry was fake!",
        "Public sidewalks reclaimed!"
      ],
      bhatta: [
        "Take the extortion slips back!",
        "Shopkeepers forgive me! Mercy!",
        "I will never demand extortion money again!"
      ],
      onewheeler: [
        "My racing bike is sinking!",
        "No more dangerous one-wheeling!",
        "Brakes failed! Save me!"
      ],
      pothole: [
        "Pothole filled! Smooth road paved!",
        "Underground pipeline leak sealed!"
      ],
      trash: [
        "Trash cleared! Clean green city!"
      ]
    };

    const list = screams[type] || ["Help! Sinking into the patrol hole!"];
    scream = list[Math.floor(Math.random() * list.length)];

    if (ud && ud.drawBubble) {
      ud.drawBubble(scream);
    }

    if (hole.isPlayer) {
      this.ui.showAnnouncement(`🗯️ "${scream}"`, "#ffffff");
      audio.vibrate([30, 20, 50]);
    }
  }

  handleFoodStallBoost(stall) {
    stall.boostCooldown = 6.0;
    this.player.turboTimer = 5.0;
    this.player.currentSpeed = this.player.baseSpeed * 1.45;

    if (stall.name.includes("Bun Kabab")) {
      audio.playBunKababSizzle();
      this.particles.createLevelUpShockwave(this.player.position, 3.5);
      this.ui.showAnnouncement("🍔 BURNS ROAD BUN KABAB! SPICY CHUTNEY TURBO BOOST! 🌶️", "#ff5722");
    } else {
      audio.playChaiSip();
      this.particles.createLevelUpShockwave(this.player.position, 3.0);
      this.ui.showAnnouncement("☕ QUETTA DUDH PATTI! KARAK CHAI RECHARGE! ⚡", "#ffd700");
    }
  }

  handleCitizenCheer(citizen) {
    citizen.cheerCooldown = 6.0;
    audio.playCitizenCheer();
    this.particles.createHeartBurst(citizen.mesh.position, 14);
    const cheers = [
      "🗣️ Citizen: 'Jeetay raho Gutter Hero! Only eat RED bad guys! ❌'",
      "🗣️ Citizen: 'Shukriya bhai! Karachi ko saaf aur safe kar do! 💚'",
      "🗣️ Citizen: 'Zindabad! Tanker aur chor mafia ko khatam karo! 💚'",
      "🗣️ Citizen: 'Aap sachay hero ho! Good citizens are safe with you! 💚'"
    ];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    this.ui.showAnnouncement(cheer, "#00e676");
  }

  handlePetInteraction(pet) {
    pet.petCooldown = 5.0;
    audio.playCitizenCheer();
    this.particles.createHeartBurst(pet.mesh.position, 16);
    const petType = pet.mesh.userData?.petType || 'dog';
    if (petType === 'dog') {
      const barks = [
        "🐕 Stray Puppy: *Woof woof!* (Wags tail happily! 💚)",
        "🐕 Friendly Doggo: *Happy panting!* You are a good human! 💚",
        "🐕 Gali Ka Hero Puppy: Woof! Thank you for protecting Karachi! 💚"
      ];
      this.ui.showAnnouncement(barks[Math.floor(Math.random() * barks.length)], "#00e5ff");
    } else {
      const purrs = [
        "🐈 Street Kitty: *Purrrrr meow!* (Rubs against your hole! 💚)",
        "🐈 Karachi Billi: Meow! Only eat bad guys, leave kitties alone! 💚",
        "🐈 Fluffy Cat: *Happy purr!* Keep Karachi clean and safe! 💚"
      ];
      this.ui.showAnnouncement(purrs[Math.floor(Math.random() * purrs.length)], "#00e5ff");
    }
  }

  updateCamera(dt) {
    if (!this.player) return;
    if (this.isTempleRun) return; // Dedicated elevated runner camera runs in updateTempleRunCorridor

    // Enhanced 3D Chase Camera: elevated height and clear street viewing angle
    const isPortrait = (window.innerHeight || 1) > (window.innerWidth || 1);
    const wideMult = this.cameraWideMode ? 1.35 : 1.0;
    const camDist = (isPortrait ? 7.0 : 6.0) * wideMult;
    const camHeight = (isPortrait ? 4.4 : 3.6) * (this.cameraWideMode ? 1.25 : 1.0);
    const lookAheadDist = (isPortrait ? 9.8 : 8.8) * (this.cameraWideMode ? 1.2 : 1.0);
    const lookTargetY = isPortrait ? 1.6 : 1.35;

    if (this.camAngle === undefined) this.camAngle = Math.PI;

    // Initialize or re-sync camera pivot to prevent camera warping across map
    if (!this.cameraPivot) {
      this.cameraPivot = this.player.position.clone();
    } else if (this.cameraPivot.distanceTo(this.player.position) > 15.0) {
      this.cameraPivot.copy(this.player.position);
    } else {
      // Exponential frame-rate independent pivot tracking
      const pivotLerp = 1.0 - Math.exp(-12.0 * dt);
      this.cameraPivot.x = THREE.MathUtils.lerp(this.cameraPivot.x, this.player.position.x, pivotLerp);
      this.cameraPivot.z = THREE.MathUtils.lerp(this.cameraPivot.z, this.player.position.z, pivotLerp);
      this.cameraPivot.y = this.player.position.y;
    }

    // Dynamic Camera Rotation Tracking:
    const mx = this.moveVector.x;
    const my = this.moveVector.y;
    const isMoving = (Math.abs(mx) > 0.05 || Math.abs(my) > 0.05);

    let targetCamAngle = this.camAngle;
    let turnRate = 0;

    if (my > 0.4) {
      // Backward movement (holding S / Down): over-the-shoulder angle shift
      if (this.backwardBaseAngle === undefined || this.backwardBaseAngle === null) {
        this.backwardBaseAngle = this.camAngle;
      }
      targetCamAngle = this.backwardBaseAngle - 0.32;
      turnRate = 2.2;
      this.lateralStrafeTimer = 0;
    } else {
      this.backwardBaseAngle = null;
      if (isMoving && this.player && this.player.facingAngle !== undefined) {
        targetCamAngle = this.player.facingAngle;
        const forwardRatio = Math.max(0, -my); // 1.0 when full forward (W), 0.0 when pure lateral (A/D)
        if (forwardRatio < 0.2 && Math.abs(mx) > 0.1) {
          // Pure lateral strafe (TC-11 precision): controlled ease-in (<=0.05 rad in 0.1s)
          this.lateralStrafeTimer = (this.lateralStrafeTimer || 0) + dt;
          turnRate = (this.lateralStrafeTimer <= 0.12) ? 0.28 : Math.min(2.6, 0.28 + (this.lateralStrafeTimer - 0.12) * 4.0);
        } else {
          // Forward driving/cornering: smooth and responsive fluid tracking
          this.lateralStrafeTimer = 0;
          turnRate = 2.6;
        }
      } else {
        this.lateralStrafeTimer = 0;
        turnRate = 0; // maintain rock-solid stable perspective when idle
      }
    }

    if (turnRate > 0) {
      let angleDiff = targetCamAngle - this.camAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const angleLerp = 1.0 - Math.exp(-turnRate * dt);
      this.camAngle += angleDiff * angleLerp;
      while (this.camAngle > Math.PI) this.camAngle -= Math.PI * 2;
      while (this.camAngle < -Math.PI) this.camAngle += Math.PI * 2;
    }

    // Camera orbit position placed behind smoothed cameraPivot with spring-arm lag sway
    const targetCamX = this.cameraPivot.x - Math.sin(this.camAngle) * camDist;
    const targetCamY = Math.max(1.85, this.cameraPivot.y + camHeight + ((this.player?.position?.y || 0) * 0.8));
    const targetCamZ = this.cameraPivot.z - Math.cos(this.camAngle) * camDist;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, Math.min(1.0, dt * 6.0));
    this.camera.position.y = targetCamY;
    this.camera.position.z = targetCamZ;

    // Tactile Hit-Stop Camera Shake on threat takedown
    if (this.cameraShakeTimer > 0) {
      this.cameraShakeTimer -= dt;
      const shakeMag = (this.cameraShakeTimer / 0.24) * 0.15;
      this.camera.position.x += (Math.random() - 0.5) * shakeMag;
      this.camera.position.y += (Math.random() - 0.5) * shakeMag;
      this.camera.position.z += (Math.random() - 0.5) * shakeMag;
    }

    // Smooth camera-relative gaze lead (prevents instantaneous angular twitching)
    const targetGaze = (this.moveVector?.x || 0) * 1.0;
    const gazeLerp = 1.0 - Math.exp(-5.0 * dt);
    this.smoothGazeLead = THREE.MathUtils.lerp(this.smoothGazeLead || 0, targetGaze, gazeLerp);

    const targetLookX = this.cameraPivot.x + Math.sin(this.camAngle) * lookAheadDist - this.smoothGazeLead * Math.cos(this.camAngle);
    const targetLookY = (this.cameraPivot.y || 0) + lookTargetY;
    const targetLookZ = this.cameraPivot.z + Math.cos(this.camAngle) * lookAheadDist + this.smoothGazeLead * Math.sin(this.camAngle);

    // Native Three.js banking tilt via camera.up (completely eliminates 60Hz roll/lookAt flicker)
    const targetBank = -(this.moveVector?.x || 0) * 0.035;
    const bankLerp = 1.0 - Math.exp(-5.0 * dt);
    this.cameraBankX = THREE.MathUtils.lerp(this.cameraBankX || 0, targetBank, bankLerp);
    this.camera.up.set(this.cameraBankX, 1.0, 0).normalize();
    if (
      isNaN(targetLookX) || targetLookX === undefined ||
      isNaN(targetLookY) || targetLookY === undefined ||
      isNaN(targetLookZ) || targetLookZ === undefined
    ) {
      this.camera.lookAt(this.player.position);
    } else {
      this.camera.lookAt(targetLookX, targetLookY, targetLookZ);
    }

    // =========================================================
    // Dynamic Obstacle Transparency: Never let buildings, stalls, or vehicles block the view!
    // Any large prop between camera and player becomes a translucent ghost silhouette
    // =========================================================
    const occluderLists = [this.buildings, this.foodStalls, this.transportVehicles];
    const camPos = this.camera.position;
    const playerPos = this.player.position;

    const segX = playerPos.x - camPos.x;
    const segZ = playerPos.z - camPos.z;
    const segLenSq = segX * segX + segZ * segZ;

    if (segLenSq > 0.01) {
      for (let l = 0; l < occluderLists.length; l++) {
        const list = occluderLists[l];
        if (!list || list.length === 0) continue;

        for (let b = 0; b < list.length; b++) {
          const item = list[b];
          if (!item || item.state === 'swallowed' || !item.mesh) continue;

          const bMesh = item.mesh;
          const bPos = bMesh.position;

          const bx = bPos.x - camPos.x;
          const bz = bPos.z - camPos.z;
          const t = (bx * segX + bz * segZ) / segLenSq;

          let isOccluding = false;
          if (t > -0.15 && t < 1.15) {
            const projX = camPos.x + segX * t;
            const projZ = camPos.z + segZ * t;
            const dX = bPos.x - projX;
            const dZ = bPos.z - projZ;
            const distToPath = Math.sqrt(dX * dX + dZ * dZ);

            if (distToPath < (item.radius * 1.15 || 4.5)) {
              isOccluding = true;
            }
          }

          if (isOccluding && !item.isGhost) {
            item.isGhost = true;
            bMesh.traverse(child => {
              if (child.isMesh && child.material) {
                if (!child.userData.origMaterial) {
                  child.userData.origMaterial = child.material;
                  child.material = Array.isArray(child.material)
                    ? child.material.map(m => m.clone())
                    : child.material.clone();
                }
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => { m.transparent = true; m.opacity = 0.20; });
              }
            });
          } else if (!isOccluding && item.isGhost) {
            item.isGhost = false;
            bMesh.traverse(child => {
              if (child.isMesh && child.userData.origMaterial) {
                child.material = child.userData.origMaterial;
                child.userData.origMaterial = null;
              }
            });
          }
        }
      }
    }

    // Automatic district completion check: if all threats eliminated, advance immediately!
    if (this.isGameStarted && !this.isGameOver && !this.districtClearing && this.districtTotal > 0) {
      const activeThreats = (this.districtEvils || []).filter(b => b && b.state !== 'swallowed').length;
      this.districtRemaining = activeThreats;
      if (activeThreats === 0) {
        this.handleDistrictCleared();
      }
    }

    // Keep Directional Sunlight centered around player for sharp shadows
    if (this.dirLight) {
      this.dirLight.position.set(
        this.player.position.x + 35,
        60,
        this.player.position.z + 25
      );
      this.dirLight.target.position.copy(this.player.position);
      this.dirLight.target.updateMatrixWorld();
    }
  }

  updateMatchTimer(dt) {
    if (this.isTimerFrozen || this.isTempleRun) return;
    if (this.gameMode === 'battleRoyale' && this.isGameStarted && !this.isGameOver) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.endMatch();
      }
    }
  }

  endMatch() {
    this.isGameOver = true;
    const ranked = [...this.holes].sort((a, b) => b.score - a.score);
    const canAdvanceNext = (this.districtRemaining <= 4) || (this.player && this.player.score >= 2000);
    this.ui.showGameOver({
      rankedHoles: ranked,
      player: this.player,
      canAdvanceNext
    });
  }

  updateMenuShowcase(dt) {
    if (!this.player || !this.camera) return;

    if (!this.corridorChunks || this.corridorChunks.length === 0) {
      this.initCorridorTerrain();
    }

    const time = (this.menuShowcaseTimer = (this.menuShowcaseTimer || 0) + dt);
    const pZ = this.player.position.z || 0;

    // 1. Cinematic 3D Camera Orbit showcase looking at runner
    const camX = Math.sin(time * 0.45) * 1.5;
    const camY = 1.95 + Math.sin(time * 0.35) * 0.12;
    const camZ = pZ + 4.2 + Math.cos(time * 0.45) * 0.35;
    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.25, pZ - 3.0);

    // 2. Ground and animate runner avatar idle breathing bounce
    const groundY = this.getCorridorGroundHeight(pZ, 0);
    this.player.position.set(0, groundY, pZ);
    if (this.player.group) {
      this.player.group.position.set(0, groundY, pZ);
      this.player.group.rotation.y = Math.PI + Math.sin(time * 0.7) * 0.08;
      this.player.group.rotation.z = 0;
    }
    if (this.player.avatarMesh) {
      this.player.avatarMesh.position.y = Math.sin(time * 3.2) * 0.035;
    }

    // 3. Havaldar CD-70 Chaser motorcycle parked in background with pulsing sirens
    if (this.chaserMesh) {
      const chaserZ = pZ + 12.0;
      const chaserY = this.getCorridorGroundHeight(chaserZ, 0);
      this.chaserMesh.position.set(0, chaserY, chaserZ);
      if (this.chaserMesh.userData?.blueSiren && this.chaserMesh.userData?.redSiren) {
        const strobe = (Math.floor(Date.now() / 200) % 2 === 0);
        this.chaserMesh.userData.blueSiren.material.emissiveIntensity = strobe ? 1.5 : 0.05;
        this.chaserMesh.userData.redSiren.material.emissiveIntensity = strobe ? 0.05 : 1.5;
      }
    }

    // 4. Parallax backdrop synchronization
    if (this.skyDome) {
      this.skyDome.position.set(0, 0, pZ);
    }
    if (this.skylineBackdrop) {
      this.skylineBackdrop.position.set(0, 0, pZ);
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    try {
      const dt = Math.min(this.clock.getDelta(), 0.1);

      if (!this.isGameOver) {
        if (!this.isGameStarted && this.isTempleRun) {
          this.updateMenuShowcase(dt);
        } else if (!this.isPaused) {
          this.updatePhysics(dt);
          this.updateMatchTimer(dt);
        }
      }

      // Dynamic Arabian Sea wave motion and coastal bay buoy bobbing
      const elapsedTime = this.clock.getElapsedTime();
      if (this.cityGen && this.cityGen.seaMesh) {
        this.cityGen.seaMesh.position.y = -0.32 + Math.sin(elapsedTime * 1.5) * 0.05;
      }
      if (this.cityGen && this.cityGen.coastalBays) {
        this.cityGen.coastalBays.forEach((bay, idx) => {
          const ud = bay.userData;
          if (ud) {
            if (ud.waterMesh) {
              ud.waterMesh.position.y = 0.05 + Math.sin(elapsedTime * 1.6 + idx * 1.3) * 0.03;
            }
            if (ud.foam) {
              const s = 1.0 + Math.sin(elapsedTime * 2.1 + idx) * 0.04;
              ud.foam.scale.set(s, s, s);
            }
            if (ud.buoyGroup) {
              ud.buoyGroup.position.y = 0.4 + Math.sin(elapsedTime * 2.3 + idx) * 0.12;
              ud.buoyGroup.rotation.z = Math.sin(elapsedTime * 1.7 + idx) * 0.08;
              ud.buoyGroup.rotation.x = Math.cos(elapsedTime * 1.5 + idx) * 0.06;
            }
          }
        });
      }

      this.updateCamera(dt);
      this.updateNavigationGuide(dt, elapsedTime);

      // Check proximity to key story citizens and toggle HUD prompt
      const nearbyCitizen = this.findNearbyKeyCitizen(4.5);
      if (nearbyCitizen && nearbyCitizen.userData) {
        this.ui.setTalkPrompt(true, nearbyCitizen.userData.name);
      } else {
        this.ui.setTalkPrompt(false);
      }

      // Gentle floating animation for citizen dialogue beacons
      if (this.keyCitizens) {
        this.keyCitizens.forEach((npc, i) => {
          if (npc.userData && npc.userData.friendlyDecal) {
            npc.userData.friendlyDecal.position.y = 1.95 + Math.sin(elapsedTime * 2.5 + i) * 0.08;
            npc.userData.friendlyDecal.rotation.y = elapsedTime * 1.2;
          }
        });
      }

      // Calculate nearest active crimes & evils for HUD Radar Compass
      const playerPos = this.player ? this.player.position : new THREE.Vector3();
      const nearestEvils = (this.edibleObjects || [])
        .filter(o => o && o.mesh && o.mesh.position && o.isBadGuy && o.state !== 'swallowed')
        .map(o => {
          const dx = o.mesh.position.x - playerPos.x;
          const dz = o.mesh.position.z - playerPos.z;
          const dist = Math.hypot(dx, dz);
          let icon = "⚠️";
          if (o.evilType === 'robber') icon = "🔫";
          else if (o.evilType === 'vip') icon = "🚨";
          else if (o.evilType === 'tanker') icon = "💧";
          else if (o.evilType === 'politician') icon = "💰";
          else if (o.evilType === 'gutka') icon = "🛑";
          else if (o.evilType === 'ke') icon = "⚡";
          else if (o.evilType === 'pothole') icon = "🕳️";

          return {
            name: o.name,
            evilType: o.evilType,
            icon,
            dist: Math.round(dist),
            dx,
            dz
          };
        })
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);

      // Calculate active district targets and breakdown chips
      const activeEvils = (this.districtEvils || []).filter(b => b && b.state !== 'swallowed');
      this.districtRemaining = activeEvils.length;

      const evilMeta = {
        robber: { label: 'Chor / Dakoo', icon: '🔫' },
        gutka: { label: 'Gutka Mafia', icon: '🛑' },
        pothole: { label: 'Pothole', icon: '🕳️' },
        trash: { label: 'Trash Pile', icon: '🗑️' },
        vip: { label: 'VIP Protocol', icon: '🚨' },
        bhatta: { label: 'Bhatta Parchi', icon: '📜' },
        onewheeler: { label: 'One-Wheeler', icon: '🏍️' },
        tanker: { label: 'Water Tanker', icon: '💧' },
        ke: { label: 'Exposed Utility Wires', icon: '⚡' },
        chinacutting: { label: 'China Cutting', icon: '📐' },
        politician: { label: 'Corrupt Neta', icon: '💰' }
      };

      const typeCountMap = {};
      activeEvils.forEach(e => {
        const t = e.evilType || 'evil';
        typeCountMap[t] = (typeCountMap[t] || 0) + 1;
      });

      const targetBreakdown = Object.keys(typeCountMap).map(type => ({
        type,
        count: typeCountMap[type],
        label: evilMeta[type]?.label || type,
        icon: evilMeta[type]?.icon || '⚠️'
      }));

      const districtConfig = getDistrictConfig(this.currentDistrictLevel);
      const activeCrisis = this.crisisChallenges ? this.crisisChallenges[this.currentCrisisIndex] : null;

      // Runner HUD tracks the full Karachi loop; civic mode retains its local route meter.
      const startZ = 70.0;
      const destZ = -82.0;
      const totalSpan = 152.0;
      const pZ = this.player ? this.player.position.z : startZ;
      const routePct = Math.min(100, Math.max(0, Math.round(((startZ - pZ) / totalSpan) * 100)));
      const distLeft = Math.max(0, Math.round(pZ - destZ));

      const routeProgress = this.isTempleRun
        ? {
          routePct: Math.min(100, (this.distanceMeters / RUNNER_CITY_LOOP_METERS) * 100),
          distLeft: Math.max(0, Math.ceil(RUNNER_CITY_LOOP_METERS - this.distanceMeters)),
          neighborhoodName: getKarachiNeighborhoodName(this.runnerNeighborhoodIndex),
          origin: 'Soldier Bazar',
          destination: 'Soldier Bazar · Finish'
        }
        : {
          routePct,
          distLeft,
          origin: 'Soldier Bazar',
          destination: 'PECHS Tariq Road'
        };

      // Update HUD with Civic Cleanser progress, Hero Frenzy status, District Mission, Route & Active Power-Up
      if (this.ui) {
        const ranked = [...(this.holes || [])].sort((a, b) => b.score - a.score);
        const civicPct = (this.civicCleansed / Math.max(1, this.civicTotal || 1)) * 100;
        this.ui.updateHUD({
          player: this.player,
          timeLeft: this.timeLeft,
          rankedHoles: ranked,
          gameMode: this.gameMode,
          civicPercent: civicPct,
          frenzyActive: this.frenzyTimer > 0,
          nearestEvils,
          targetObjective: this.currentTargetObjective,
          districtConfig,
          districtRemaining: this.districtRemaining,
          districtTotal: this.districtTotal,
          targetBreakdown,
          districtEvils: this.districtEvils,
          recentCleaned: this.recentCleaned,
          activeCrisis,
          missions: this.crisisChallenges,
          routeProgress,
          activePowerUp: this.activePowerUp,
          distanceMeters: this.distanceMeters,
          runScore: this.score,
          coins: this.coins,
          hearts: this.hearts,
          currentMilestone: this.currentMilestone,
          speedKmh: this.currentKmh || 60,
          rpm: this.currentRpm || 3200,
          gear: this.currentGear || 2,
          isDrafting: !!this.isDrafting,
          draftPct: Math.round((this.draftCharge || 0) * 100),
          isSlingshotReady: (this.draftCharge || 0) >= 0.72,
          isRunnerMode: this.isTempleRun
        });

        // Real-Time Dev Mode Telemetry Bridge
        if (!this.__frameCount) this.__frameCount = 0;
        this.__frameCount++;
        if (!this.__lastFpsTime) this.__lastFpsTime = performance.now();
        const now = performance.now();
        if (now - this.__lastFpsTime >= 500) {
          this.currentFPS = Math.round((this.__frameCount * 1000) / (now - this.__lastFpsTime));
          this.__frameCount = 0;
          this.__lastFpsTime = now;
        }

        const activeThreatsList = (this.districtEvils || [])
          .filter(e => e && e.state !== 'swallowed')
          .map(e => ({
            type: e.evilType || 'unknown',
            name: e.name || e.evilType,
            x: Number((e.mesh?.position?.x || 0).toFixed(2)),
            z: Number((e.mesh?.position?.z || 0).toFixed(2)),
            dist: Number((this.player ? this.player.position.distanceTo(e.mesh.position) : 0).toFixed(2)),
            isBraking: !!e.isInterceptionBraking,
            state: e.state
          }));

        const getClientInfo = () => {
          const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
          const isAndroid = /Android/i.test(ua);
          const isIOS = /iPhone|iPad|iPod/i.test(ua);
          const isCapacitor = Boolean(window.Capacitor?.isNativePlatform?.());
          const w = window.innerWidth || 0;
          const h = window.innerHeight || 0;
          const dpr = Number((window.devicePixelRatio || 1).toFixed(2));
          const touch = Boolean(typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
          const deviceCategory = (w < 600 || (touch && Math.max(w, h) < 950)) ? 'mobile' :
            (w <= 1024 && touch) ? 'tablet' : 'desktop';

          let consentChoice = 'unset';
          try {
            consentChoice = localStorage.getItem('kr_analytics_consent') || 'unset';
          } catch {}

          let persistentId = '';
          try {
            persistentId = localStorage.getItem('kr_client_instance_id');
            if (!persistentId) {
              persistentId = 'kr_inst_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
              localStorage.setItem('kr_client_instance_id', persistentId);
            }
          } catch {
            persistentId = 'kr_inst_ephemeral';
          }

          return {
            instanceId: persistentId,
            runtime: isCapacitor ? 'capacitor-android' : 'web-browser',
            platform: isAndroid ? 'Android' : isIOS ? 'iOS' : (navigator.userAgentData?.platform || navigator.platform || 'Web'),
            deviceCategory,
            viewport: `${w}x${h}`,
            pixelRatio: dpr,
            screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : `${w}x${h}`,
            language: typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US',
            online: typeof navigator !== 'undefined' ? (navigator.onLine !== false) : true,
            connectionType: (typeof navigator !== 'undefined' && navigator.connection?.effectiveType) || 'standard',
            deviceMemoryGb: (typeof navigator !== 'undefined' && navigator.deviceMemory) || null,
            hardwareConcurrency: (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || null,
            consentStatus: consentChoice,
            appVersion: '2.2.23',
            appBundleId: isCapacitor ? 'pk.karachi.runner' : 'karachi-runner-web'
          };
        };

        const clientInfo = this.__cachedClientInfo || (this.__cachedClientInfo = getClientInfo());
        clientInfo.online = typeof navigator !== 'undefined' ? (navigator.onLine !== false) : true;
        try {
          clientInfo.consentStatus = localStorage.getItem('kr_analytics_consent') || 'unset';
        } catch {}

        const mmpPayload = {
          schema_version: '1.0.0-mmp',
          provider_targets: ['AppsFlyer', 'Adjust', 'Singular', 'Firebase', 'GA4'],
          app_id: clientInfo.appBundleId,
          instance_id: clientInfo.instanceId,
          runtime_environment: clientInfo.runtime,
          platform: clientInfo.platform,
          device: {
            category: clientInfo.deviceCategory,
            viewport: clientInfo.viewport,
            screen_res: clientInfo.screen,
            dpr: clientInfo.pixelRatio,
            language: clientInfo.language,
            memory_gb: clientInfo.deviceMemoryGb,
            cores: clientInfo.hardwareConcurrency,
            connection: clientInfo.connectionType,
            online: clientInfo.online
          },
          privacy: {
            consent_status: clientInfo.consentStatus,
            ad_id_collected: false,
            gps_location_collected: false,
            pii_collected: false
          },
          session: {
            game_mode: this.gameMode || 'runner',
            status: this.isGameOver ? 'game_over' : this.isPaused ? 'paused' : this.isGameStarted ? 'running' : 'idle',
            district_level: this.currentDistrictLevel || 1,
            neighborhood: getKarachiNeighborhoodName(this.runnerNeighborhoodIndex),
            distance_meters: Math.round(this.distanceMeters || 0),
            score: this.score || 0,
            coins: this.coins || 0,
            hearts: this.hearts || 0,
            speed_kmh: this.currentKmh || 60,
            fps: this.currentFPS || 60,
            heading: this.getRunnerHeadingLabel?.() || 'N',
            weather: this.isTempleRun ? this.getRunnerWeatherState() : 'clear'
          }
        };

        window.__DEV_TELEMETRY__ = {
          timestamp: new Date().toISOString(),
          fps: this.currentFPS || 0,
          level: this.currentDistrictLevel,
          clientInfo,
          mmpPayload,
          isPaused: this.isPaused,
          isGameOver: this.isGameOver,
          isGameStarted: this.isGameStarted,
          isRunnerMode: this.isTempleRun,
          gameMode: this.gameMode,
          timeLeft: Number(this.timeLeft.toFixed(2)),
          score: this.score || 0,
          distanceMeters: Math.round(this.distanceMeters || 0),
          runnerNeighborhoodIndex: this.runnerNeighborhoodIndex,
          runnerNeighborhoodCount: RUNNER_NEIGHBORHOOD_COUNT,
          runnerNeighborhoodName: getKarachiNeighborhoodName(this.runnerNeighborhoodIndex),
          runnerChallengeTier: this.getRunnerChallengeTier(),
          runnerRouteComplete: this.runnerRouteComplete,
          autoPilot: !!this.isAutoPilotActive,
          heading: this.getRunnerHeadingLabel(),
          turnsCompleted: this.runnerTurnsCompleted || 0,
          nextJunction: this.runnerJunction && !this.runnerJunction.resolved
            ? { kind: this.runnerJunction.kind, dir: this.runnerJunction.dir }
            : null,
          runnerSection: this.runnerSection?.type || null,
          immortal: !!(this.isMasterImmortal || this.isGodImmortal),
          speedMult: this.masterSpeedMult,
          coins: this.coins || 0,
          hearts: this.hearts || 0,
          currentLane: this.currentLane || 0,
          currentMilestone: this.currentMilestone || '',
          runnerWeather: this.isTempleRun ? this.getRunnerWeatherState() : 'n/a',
          runnerObstacleCount: (this.runnerObstacles || []).filter(obstacle => !obstacle.isHit).length,
          runnerTrafficCount: (this.runnerTraffic || []).length,
          activePowerUp: this.activePowerUp?.title || 'None',
          nascar: {
            speedKmh: this.currentKmh || 60,
            rpm: this.currentRpm || 3200,
            gear: this.currentGear || 2,
            isDrafting: !!this.isDrafting,
            draftPct: Math.round((this.draftCharge || 0) * 100),
            isSlingshotReady: (this.draftCharge || 0) >= 0.72,
            trafficCount: (this.runnerTraffic || []).length
          },
          player: {
            x: Number((this.player?.position?.x || 0).toFixed(2)),
            z: Number((this.player?.position?.z || 0).toFixed(2)),
            radius: Number((this.player?.radius || 1.6).toFixed(2)),
            level: this.player?.level || 1,
            score: this.player?.score || 0,
            xp: this.player?.xp || 0,
            speed: Number((this.player?.currentSpeed || 13.5).toFixed(2)),
            combo: this.player?.comboCount || 0
          },
          threatsRemaining: activeThreatsList.length,
          threatsTotal: this.districtTotal,
          nearestThreat: activeThreatsList[0] || null,
          activeThreats: activeThreatsList,
          missions: (this.crisisChallenges || []).map(m => ({
            id: m.id,
            title: m.title,
            evilType: m.evilType,
            current: m.current || 0,
            targetCount: m.targetCount,
            completed: !!m.completed
          })),
          routeProgress: {
            origin: 'Soldier Bazar',
            destination: 'PECHS Tariq Road',
            pct: routePct,
            distLeftMeters: distLeft,
            gutterFalls: this.gutterFalls || 0,
            guttersJumped: this.guttersJumped || 0,
            robbersEvaded: this.robbersEvaded || 0,
            robberyLosses: this.robberyLosses || 0,
            powerUp: this.activePowerUp ? this.activePowerUp.title : 'None'
          }
        };

        if (this.isTempleRun && !this.isPaused &&
            (!this.__lastGameOpsSample || now - this.__lastGameOpsSample >= 5000)) {
          this.__lastGameOpsSample = now;
          try {
            this.opsEngine ||= new PortableGameOpsEngine();
            this.opsEngine.observeTelemetry(window.__DEV_TELEMETRY__);
            if (this.opsEngine.lowFpsSamples >= 3 && this.renderer &&
                (this.__lowFpsFixCount || 0) < 2) {
              const previousRatio = this.renderer.getPixelRatio();
              const nextRatio = getNextSafeRenderScale(previousRatio);
              if (nextRatio < previousRatio) {
                this.renderer.setPixelRatio(nextRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight, false);
                this.__lowFpsFixCount = (this.__lowFpsFixCount || 0) + 1;
                this.recordGameOpsEvent('fix.applied', {
                  rule: 'reduce-render-resolution',
                  summary: 'Reduced device render scale after sustained low frame rate.',
                  previousRatio,
                  nextRatio,
                  attempt: this.__lowFpsFixCount,
                  limit: 2
                });
              }
              this.opsEngine.lowFpsSamples = 0;
            }
          } catch (error) {
            if (!this.__gameOpsStorageErrorLogged) {
              this.__gameOpsStorageErrorLogged = true;
              console.error('[GAME_OPS] Telemetry could not be saved to the local operations log.', error);
            }
          }
        }

        // Automated Anomaly Detection & Flight Recording
        if (!this.__devAnomalyWatch) {
          this.__devAnomalyWatch = {
            lastTimeLeft: this.timeLeft,
            stuckTimerCount: 0,
            reportedTimerStuck: false,
            reportedOOB: false,
            reportedUnderground: false
          };
        }
        
        // Check 1: Timer freezing anomaly detection
        if (this.isGameStarted && !this.isPaused && !this.isGameOver && this.gameMode === 'battleRoyale') {
          if (Math.abs(this.timeLeft - this.__devAnomalyWatch.lastTimeLeft) < 0.0001) {
            this.__devAnomalyWatch.stuckTimerCount += dt;
            if (this.__devAnomalyWatch.stuckTimerCount >= 3.0 && !this.__devAnomalyWatch.reportedTimerStuck) {
              this.__devAnomalyWatch.reportedTimerStuck = true;
              this.recordDevNote('ANOMALY_TIMER_STUCK', 'Match timer appears halted while match is active', { timeLeft: this.timeLeft });
            }
          } else {
            this.__devAnomalyWatch.stuckTimerCount = 0;
            this.__devAnomalyWatch.reportedTimerStuck = false;
            this.__devAnomalyWatch.lastTimeLeft = this.timeLeft;
          }
        }

        // Check 2: Player out-of-bounds anomaly detection
        if (this.player && this.player.isAlive) {
          const px = this.player.position.x;
          const pz = this.player.position.z;
          if (Math.abs(px) > 96 || Math.abs(pz) > 96) {
            if (!this.__devAnomalyWatch.reportedOOB) {
              this.__devAnomalyWatch.reportedOOB = true;
              this.recordDevNote('ANOMALY_OUT_OF_BOUNDS', 'Player drifted outside playable street boundaries', { x: px, z: pz });
            }
          } else {
            this.__devAnomalyWatch.reportedOOB = false;
          }
        }

        // Check 3: Camera underground anomaly
        if (this.camera && this.camera.position.y < 1.0 && !this.player.isTrappedInGutter) {
          if (!this.__devAnomalyWatch.reportedCameraSink) {
            this.__devAnomalyWatch.reportedCameraSink = true;
            this.recordDevNote('ANOMALY_CAMERA_UNDERGROUND', 'Camera sank beneath the asphalt', { y: this.camera.position.y });
          }
        } else {
          this.__devAnomalyWatch.reportedCameraSink = false;
        }

        // Check 4: NaN Crash Protection
        if (Number.isNaN(this.player.position.x) || (this.camera && Number.isNaN(this.camera.position.x))) {
          if (!this.__devAnomalyWatch.reportedNaN) {
            this.__devAnomalyWatch.reportedNaN = true;
            this.recordDevNote('ANOMALY_NAN_CRASH', 'NaN coordinate detected, triggering failsafe reset', {});
            this.player.position.set(0, 0, this.lastRunnerZ || 0);
            if (this.camera) {
               this.camera.position.set(0, 2.85, (this.lastRunnerZ || 0) + 5.2);
            }
          }
        } else {
          this.__devAnomalyWatch.reportedNaN = false;
        }

        if (this.ui?.updateDevModeHUD) {
          this.ui.updateDevModeHUD(window.__DEV_TELEMETRY__);
        }

        // Broadcast telemetry through the unified Master/Developer channel and localStorage so all tabs/windows/WebViews sync
        const nowMs = performance.now();
        const telemetryInterval = this.masterChannel ? 120 : 350;
        if (!this.__lastMasterTelemetryBroadcast ||
            nowMs - this.__lastMasterTelemetryBroadcast > telemetryInterval) {
          this.__lastMasterTelemetryBroadcast = nowMs;
          const teleMsg = {
            type: 'TELEMETRY_UPDATE',
            telemetry: window.__DEV_TELEMETRY__
          };
          if (this.masterChannel) {
            try {
              this.masterChannel.postMessage(teleMsg);
            } catch (err) {
              console.warn('[MASTER_MODE] BroadcastChannel post failed.', err);
            }
          }
          try {
            localStorage.setItem('karachi_mastermode_telemetry', JSON.stringify(teleMsg));
          } catch (error) {
            // Quota or sandboxed storage
          }
        }

        // Check connection status to sync locally batched telemetry payloads when online
        if (typeof navigator !== 'undefined' && navigator.onLine === true) {
          if (this.opsEngine && typeof this.opsEngine.hasOfflineQueue === 'function' && this.opsEngine.hasOfflineQueue()) {
            this.opsEngine.syncOfflineQueue();
          }
        }

        this.recordPeriodicRuntimeSnapshot();
      }
    } catch (e) {
      console.error('Error during animate loop:', e);
      if (this.ui?.appendDevLog) {
        this.ui.appendDevLog(`[ERROR] ${e.message}`, 'err');
      }
      this.recordDevNote?.('RUNTIME_EXCEPTION', e.message, { stack: e.stack });
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // =========================================================================
  // MASTER MODE & BIDIRECTIONAL CONTROL SUITE (Formerly God Mode)
  // =========================================================================
  initMasterModeComms() {
    try {
      this.masterChannel = new BroadcastChannel('karachi_hole_mastermode');
      this.masterChannel.onmessage = (event) => this.handleMasterModeCommand(event.data);
    } catch (e) {
      console.warn('[MASTER_MODE] BroadcastChannel unsupported in game');
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'karachi_mastermode_cmd' && e.newValue) {
        try {
          const cmd = JSON.parse(e.newValue);
          this.handleMasterModeCommand(cmd);
        } catch (error) {
          console.error('[MASTER_MODE] Could not parse fallback command.', error);
        }
      }
    });
  }

  spawnRunnerTestObstacle(type, laneIndex = 0) {
    if (!this.isTempleRun || !this.player || !this.scene) {
      throw new Error('Runner test obstacles require an initialized Runner scene.');
    }
    const factories = {
      pothole: () => this.createRunnerPotholeMesh(),
      wire: () => KarachiModels.createHangingWireHazard(12.4),
      gutter: () => KarachiModels.createOpenGutterHazard(1.4),
      digging: () => KarachiModels.createRoadDiggingObstacle(2.8),
      sewage: () => KarachiModels.createSewageSpillHazard(3.0),
      rickshaw: () => KarachiModels.createStalledRickshawObstacle(),
      water_tanker: () => KarachiModels.createWaterTanker(),
      football: () => KarachiModels.createLyariStreetFootball(),
      market_cart: () => KarachiModels.createSaddarMarketHandcart(),
      heritage_scaffold: () => KarachiModels.createSaddarHeritageScaffold(7.5)
    };
    const factory = factories[type];
    if (!factory) throw new TypeError(`Unsupported Runner test obstacle: ${type}`);
    const lane = Math.max(-1, Math.min(1, Math.round(Number(laneIndex) || 0)));
    const laneX = lane * this.laneWidth;
    const z = this.player.position.z - 34;
    const mesh = factory();
    mesh.position.set(laneX, type === 'pothole' ? 0 : mesh.position.y, z);
    this.scene.add(mesh);
    this.runnerObstacles.push({
      type,
      laneX,
      z,
      requiredAction: ['wire', 'heritage_scaffold'].includes(type)
        ? 'slide'
        : ['gutter', 'digging', 'sewage', 'pothole'].includes(type)
          ? 'jump_or_dodge'
          : 'dodge',
      mesh,
      isHit: false,
      isTestObstacle: true
    });
    this.recordGameOpsEvent('master.obstacle_spawned', { type, lane, distanceMeters: this.distanceMeters });
    return mesh;
  }

  clearRunnerTestObstacles() {
    let cleared = 0;
    this.runnerObstacles = this.runnerObstacles.filter(obstacle => {
      if (!obstacle?.isTestObstacle) return true;
      if (obstacle.mesh) this.disposeRunnerObject(obstacle.mesh);
      cleared += 1;
      return false;
    });
    this.recordGameOpsEvent('master.obstacles_cleared', { count: cleared });
    return cleared;
  }

  runRunnerSelfCheck() {
    const checks = [
      ['runner-mode', Boolean(this.isTempleRun)],
      ['scene-ready', Boolean(this.scene && this.player && this.player.position)],
      ['three-lanes', Number.isFinite(this.laneWidth) && this.laneWidth > 0],
      ['player-position', Boolean(this.player &&
        Number.isFinite(this.player.position.x) &&
        Number.isFinite(this.player.position.z))],
      ['camera-valid-matrix', !Number.isNaN(this.camera.position.x) && !Number.isNaN(this.camera.position.y) && !Number.isNaN(this.camera.position.z)],
      ['camera-elevation-safe', this.camera.position.y >= 1.0],
      ['camera-elevation-sync', this.camera.position.y >= (this.player.position.y || 0) + 1.0],
      ['camera-turn-clearance', !this.runnerTurn || this.camera.position.distanceTo(this.player.position) < 4.0],
      ['player-y-bounds', (this.player.position.y || 0) >= -1.0],
      ['matrix-nan-guard', !Number.isNaN(this.camera.position.x) && !Number.isNaN(this.player.position.x)],
      ['hazard-metadata', (this.runnerObstacles || []).filter(obstacle =>
        obstacle && !obstacle.isHit
      ).every(obstacle =>
        obstacle.mesh && typeof obstacle.type === 'string' &&
        typeof obstacle.requiredAction === 'string'
      )],
      ['route-bounds', Number.isFinite(this.distanceMeters) && this.distanceMeters >= 0]
    ];
    const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
    const result = {
      status: failed.length ? 'failed' : 'passed',
      checks: checks.length,
      failed,
      timestamp: new Date().toISOString()
    };
    this.recordGameOpsEvent('check.result', {
      name: 'Runner live self-check',
      status: result.status,
      summary: failed.length ? `Failed: ${failed.join(', ')}` : `${checks.length} checks passed`
    });
    if (window.__DEV_TELEMETRY__) window.__DEV_TELEMETRY__.opsLastCheck = result;
    this.ui?.showDevToast(
      failed.length ? `Runner self-check failed: ${failed.join(', ')}` : `Runner self-check passed (${checks.length} checks).`
    );
    return result;
  }

  handleMasterModeCommand(data) {
    if (!data || !data.type) return;
    const { type, payload } = data;

    switch (type) {
      case 'PING':
        const reply = { type: 'PONG', telemetry: window.__DEV_TELEMETRY__ };
        if (this.masterChannel) {
          this.masterChannel.postMessage(reply);
        } else if (window.__DEV_TELEMETRY__) {
          try {
            localStorage.setItem('karachi_mastermode_telemetry', JSON.stringify(reply));
          } catch (error) {
            console.error('[MASTER_MODE] Could not send fallback telemetry reply.', error);
          }
        }
        break;

      case 'RUNNER_SELF_CHECK':
        if (data.sender !== 'MASTERMODE_DASHBOARD') break;
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session before running a self-check.');
          break;
        }
        this.runRunnerSelfCheck();
        break;

      case 'SPAWN_TEST_OBSTACLE':
        if (data.sender !== 'MASTERMODE_DASHBOARD') break;
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session before spawning a test obstacle.');
          break;
        }
        try {
          this.spawnRunnerTestObstacle(payload?.type, payload?.lane);
          this.ui?.showDevToast(`Test ${String(payload?.type).replaceAll('_', ' ')} spawned.`);
        } catch (error) {
          console.error('[GAME_OPS] Could not spawn test obstacle.', error);
          this.ui?.showDevToast('Could not spawn that test obstacle.');
        }
        break;

      case 'CLEAR_TEST_OBSTACLES':
        if (data.sender !== 'MASTERMODE_DASHBOARD') break;
        this.clearRunnerTestObstacles();
        this.ui?.showDevToast('Test obstacles cleared.');
        break;

      case 'SPAWN_JUNCTION':
        if (data.sender !== 'MASTERMODE_DASHBOARD') break;
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        {
          const kind = payload?.kind === 'fork' ? 'fork' : 'turn';
          const dir = payload?.dir === 'right' ? 1 : -1;
          if (this.spawnRunnerJunction(kind, dir, 90)) {
            this.ui?.showDevToast(`${kind === 'fork' ? 'Fork' : `Turn ${dir === -1 ? 'left' : 'right'}`} junction spawned ahead.`);
          } else {
            this.ui?.showDevToast('A junction is already active.');
          }
        }
        break;

      case 'CLEAR_ALL_HAZARDS':
      case 'COMPLETE_RUNNER_AREA':
      case 'COMPLETE_RUNNER_ROUTE':
      case 'RESTORE_RUNNER_HEARTS':
        if (data.sender !== 'MASTERMODE_DASHBOARD') break;
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        if (type === 'CLEAR_ALL_HAZARDS') {
          this.ui?.showDevToast(`Cleared ${this.clearAllRunnerHazards()} hazards and vehicles.`);
        } else if (type === 'COMPLETE_RUNNER_AREA') {
          this.completeRunnerArea();
          this.ui?.showDevToast('Patrol area completed.');
        } else if (type === 'COMPLETE_RUNNER_ROUTE') {
          this.setRunnerDistance(RUNNER_CITY_LOOP_METERS);
        } else {
          this.hearts = this.maxHearts;
          this.ui?.showDevToast('Hearts restored.');
        }
        break;

      case 'SET_VERSION':
      case 'SWITCH_VERSION':
        const targetVer = payload?.version || payload?.versionId;
        if (targetVer) {
          this.setMajorGameVersion(targetVer, true, 'master-control');
        }
        break;

      case 'UNLOCK_ALL_RUNNER_CONTENT':
        if (data.sender !== 'MASTERMODE_DASHBOARD') {
          console.warn('[MASTER_MODE] Ignoring runner unlock command from an untrusted sender.');
          break;
        }
        if (!saveManager.unlockAllContentForMasterMode()) {
          console.error('[SAVE] Master Mode could not persist all runner unlocks.');
          this.ui?.showAnnouncement('Master unlock failed. Check device storage.', '#ff5252');
          break;
        }
        this.ui?.refreshProgressionContent();
        this.ui?.showAnnouncement('🔓 All Karachi patrol areas and getups unlocked in Master Mode.', '#ffd700');
        break;

      case 'TRIGGER_SLINGSHOT':
        this.nitroTimer = 5.0;
        this.draftCharge = 0;
        this.score += 500;
        if (this.player) this.player.addXP(500);
        audio.playSlingshotBoost();
        if (this.ui) {
          this.ui.showAnnouncement('🏁 STREET SLINGSHOT OVERTAKE! +500 PTS!', '#ffd700');
          this.ui.showFloatingFeedback('🚀 SLINGSHOT BOOST!', this.player?.position, '#ffd700');
        }
        break;

      case 'MAX_DRAFT':
        this.draftCharge = 1.0;
        this.isDrafting = true;
        audio.playDraftingWhoosh();
        if (this.ui) {
          this.ui.showAnnouncement('💨 100% SLIPSTREAM DRAFTING CHARGE! Slingshot Ready!', '#00e5ff');
          this.ui.showFloatingFeedback('💨 100% DRAFT', this.player?.position, '#00e5ff');
        }
        break;

      case 'SPAWN_CONVOY':
        this.spawnTrafficConvoyAhead();
        if (this.ui?.showDevToast) this.ui.showDevToast('🏎️ Highway Traffic Convoy Deployed!');
        break;

      case 'TRIGGER_SURF':
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        this.spawnW11SurfingSetPiece();
        this.ui?.showDevToast('🏄 W-11 Minibus Roof Surfing Spawned Ahead!');
        break;

      case 'TRIGGER_WORDHUNT':
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        this.wordHuntCollected = ['K', 'A', 'R', 'A', 'C', 'H', 'I'];
        this.coins += 5000;
        this.score += 5000;
        this.awardRunnerXP(5000);
        this.activateJunoonFever();
        if (this.ui?.updateWordHunt) this.ui.updateWordHunt(['K', 'A', 'R', 'A', 'C', 'H', 'I']);
        this.ui?.showAnnouncement('🎉 WORD COMPLETE: K-A-R-A-C-H-I! 5,000 RS + JUNOON FEVER RUSH! 🎸🔥', '#ffd700');
        this.ui?.showDevToast('🎸 KARACHI Word Complete & Junoon Fever Rush Triggered!');
        break;

      case 'TRIGGER_SPRING_TRAMPOLINE':
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        {
          const laneX = [-this.laneWidth, 0, this.laneWidth][(this.currentLane || 0) + 1] || 0;
          const pz = this.player ? this.player.position.z - 20.0 : -30.0;
          const pad = KarachiModels.createSpringLaunchPad(2.4, 3.8);
          pad.position.set(laneX, 0.02, pz);
          this.scene.add(pad);
          this.runnerBoostPads.push({
            mesh: pad,
            laneX,
            z: pz,
            isUsed: false,
            isSpringPad: true
          });
          [-2.0, 0, 2.0].forEach(zOff => {
            const coin = KarachiModels.createRupeeCoin(100);
            coin.position.set(laneX, 2.8, pz + zOff);
            this.scene.add(coin);
            this.runnerCoins.push({ mesh: coin, value: 100, x: laneX, z: pz + zOff, isRoofCoin: true });
          });
          this.ui?.showDevToast('🦘 Hydraulic Spring Trampoline Pad Spawned Ahead!');
        }
        break;

      case 'TRIGGER_SLANG_BILLBOARD':
        if (!this.isTempleRun || !this.isGameStarted || this.isPaused || this.isGameOver) {
          this.ui?.showDevToast('Start an active Runner session first.');
          break;
        }
        {
          const pz = this.player ? this.player.position.z - 25.0 : -30.0;
          const side = Math.random() < 0.5 ? -1 : 1;
          const slangBoard = KarachiModels.createSlangBillboard?.(Math.floor(Math.random() * 8));
          if (slangBoard) {
            const groundY = typeof this.getCorridorGroundHeight === 'function' ? this.getCorridorGroundHeight(pz, side * 9.5) : 0;
            slangBoard.position.set(side * 9.5, groundY, pz);
            this.scene.add(slangBoard);
            this.scenery.push(slangBoard);
          }
          this.ui?.showDevToast('📢 Karachi Slang Billboard Spawned Ahead!');
        }
        break;

      case 'COMPLETE_DAILY_QUESTS':
        if (leaderboardService.completeAllDailyChallenges) {
          leaderboardService.completeAllDailyChallenges();
          this.ui?.renderDailyChallenges?.();
          this.ui?.showDevToast('🎯 All 3 Daily Challenges Completed!');
        }
        break;

      case 'RESET_DAILY_QUESTS':
        if (leaderboardService.resetDailyChallenges) {
          leaderboardService.resetDailyChallenges();
          this.ui?.renderDailyChallenges?.();
          this.ui?.showDevToast('🔄 Daily Challenges Reset to Fresh Seed!');
        }
        break;

      case 'TOGGLE_NASCAR_SPEED':
        this.isNascarSuperSpeed = !this.isNascarSuperSpeed;
        if (this.ui?.showDevToast) this.ui.showDevToast(this.isNascarSuperSpeed ? '🏁 HIGH-SPEED MODE ACTIVE!' : '🏎️ STANDARD SPEED ACTIVE');
        break;

      case 'SET_RUNNER_RAIN':
        if (this.isTempleRun) {
          this.runnerRainOverride = payload?.enabled === true ? true : null;
          this.runnerWeatherState = this.getRunnerWeatherState();
          if (this.ui?.showDevToast) {
            this.ui.showDevToast(this.runnerRainOverride ? '🌧️ Rain test enabled.' : '🌦️ Natural runner weather restored.');
          }
        }
        break;

      case 'FLEET_NITRO':
        this.nitroTimer = 6.0;
        if (this.player) this.player.isBoosting = true;
        audio.playSlingshotBoost();
        if (this.ui) {
          this.ui.showAnnouncement('🚀 FLEET BROADCAST: CNG TURBO NITRO INJECTED TO ALL!', '#00e5ff');
        }
        break;

      case 'FLEET_SHIELD':
        this.shieldTimer = 18.0;
        if (this.player) this.player.isShielded = true;
        audio.playShieldAbsorb();
        if (this.ui) {
          this.ui.showAnnouncement('🛡️ FLEET BROADCAST: WATER TANKER IRON SHIELDS DEPLOYED!', '#00bcd4');
        }
        break;

      case 'FLEET_HORN':
        if (typeof this.triggerKingPressureHorn === 'function') {
          this.triggerKingPressureHorn();
        }
        if (this.ui) {
          this.ui.showAnnouncement('📢 FLEET BROADCAST: CITY-WIDE KING PRESSURE HORN BLASTED!', '#ffd700');
        }
        break;

      case 'SET_RADIUS':
        if (payload.radius) {
          const r = Math.max(1.0, Math.min(30.0, payload.radius));
          this.masterRadius = r;
          this.vortexRadius = r;
          this.vortexTimer = 35.0;
          if (this.player) {
            this.player.radius = r;
            this.player.targetRadius = r;
            if (typeof this.player.updateScale === 'function') this.player.updateScale(0.016);
            if (!this.isTempleRun && this.camera) {
              this.camera.position.set(0, 6.2 + r * 1.15, 6.8 + r * 1.15);
            }
          }
          if (this.ui?.showDevToast) this.ui.showDevToast(`👑 Master Vortex Radius: ${r.toFixed(1)}m`);
        }
        break;

      case 'SET_SPEED':
        if (payload.speedMult) {
          this.masterSpeedMult = Math.max(0.2, Math.min(10.0, payload.speedMult));
          this.godSpeedMult = this.masterSpeedMult;
          if (this.isTempleRun) {
            this.runSpeed = RUNNER_SPEEDS.standard * this.masterSpeedMult;
          } else if (this.player) {
            this.player.baseSpeed = 13.5 * this.masterSpeedMult;
            this.player.currentSpeed = this.player.baseSpeed;
          }
          if (this.ui?.showDevToast) this.ui.showDevToast(`⚡ Master Speed: ${this.masterSpeedMult.toFixed(1)}x`);
        }
        break;

      case 'FREEZE_TIMER':
        this.isTimerFrozen = !!payload.frozen;
        if (this.ui?.showDevToast) this.ui.showDevToast(this.isTimerFrozen ? '⏱️ Mission Timer FROZEN!' : '⏱️ Mission Timer Resumed');
        break;

      case 'TOGGLE_IMMORTAL':
        this.isMasterImmortal = !!payload.immortal;
        this.isGodImmortal = this.isMasterImmortal;
        if (this.ui?.showDevToast) this.ui.showDevToast(this.isMasterImmortal ? '🛡️ Master Invincibility ACTIVE!' : '🛡️ Standard Vulnerability');
        break;

      case 'TOGGLE_AUTOPILOT':
        this.isAutoPilotActive = !!payload.enabled;
        if (this.isAutoPilotActive) {
          if (!this.isGameStarted) {
            this.startGame();
          } else if (this.isPaused) {
            this.resumeGame();
          }
          if (this.isGameOver) {
            if (typeof this.reviveRunner === 'function' && saveManager.getReviveTokenCount() > 0) {
              this.reviveRunner();
            } else if (typeof this.restartGame === 'function') {
              this.restartGame();
            }
          }
        }
        if (this.ui?.showDevToast) this.ui.showDevToast(this.isAutoPilotActive ? '🤖 AI Auto-Pilot ENGAGED!' : '🤖 AI Auto-Pilot Disengaged');
        break;

      case 'FREEZE_THREATS':
        window.__DEV_FREEZE_THREATS__ = !!payload.frozen;
        this.isTrafficFrozen = window.__DEV_FREEZE_THREATS__;
        if (this.ui?.showDevToast) this.ui.showDevToast(window.__DEV_FREEZE_THREATS__ ? '🛑 Threats & Traffic FROZEN' : '🏃 Threats Resumed Fleeing');
        break;

      case 'DEVOUR_ALL':
        if (this.isTempleRun) {
          this.clearAllRunnerHazards();
          this.score += 1500;
          this.awardRunnerXP(1000);
          if (this.player) this.particles?.createDevourSparkles?.(this.player.position, 24, 0x00e5ff);
          audio.playCoin?.();
          if (this.ui?.showDevToast) this.ui.showDevToast('🕳️ HOLE DEVOUR! All Road Hazards Swallowed!');
        } else if (this.districtEvils && this.player) {
          const active = this.districtEvils.filter(e => e && e.state !== 'swallowed');
          active.forEach(evil => {
            this.resolveDistrictThreat(evil, this.player);
          });
          if (this.ui?.showDevToast) this.ui.showDevToast(`💥 Devoured ${active.length} Evils!`);
        }
        break;

      case 'ADD_TIME':
        this.timeLeft += (payload.seconds || 60);
        if (this.ui?.showDevToast) this.ui.showDevToast(`⏱️ Added +${payload.seconds || 60}s!`);
        break;

      case 'SPAWN_MUNCHIES':
        if (this.isTempleRun) {
          const baseZ = this.player ? this.player.position.z - 20.0 : -30.0;
          const lanes = [-this.laneWidth, 0, this.laneWidth];
          const count = payload.count || 21;
          for (let i = 0; i < count; i++) {
            const laneX = lanes[i % lanes.length];
            const z = baseZ - (Math.floor(i / lanes.length) * 4.0);
            const coin = KarachiModels.createRupeeCoin(0.44);
            coin.position.set(laneX, 0.75 + (Math.sin(i) * 0.2), z);
            this.scene.add(coin);
            this.runnerCoins.push({ mesh: coin, value: 50, x: laneX, z });
          }
          if (this.ui?.showDevToast) this.ui.showDevToast(`🥫 Spawned ${count} Street Munchies & Rupees!`);
        } else if (typeof this.populateBoulevardClutter === 'function') {
          this.populateBoulevardClutter(payload.count || 25);
          if (this.ui?.showDevToast) this.ui.showDevToast(`🥫 Spawned ${payload.count || 25} Street Munchies!`);
        }
        break;

      case 'SPAWN_POWERUP':
        if (this.isTempleRun) {
          const type = payload.type || 'cng';
          const laneX = this.currentLane * this.laneWidth;
          const pz = (this.player ? this.player.position.z : 0) - 18.0;
          const pMesh = this.createRunnerPowerupMesh(type);
          pMesh.position.set(laneX, 0.9, pz);
          this.scene.add(pMesh);
          if (type === 'revive_token') {
            this.runnerReviveTokens.push({ mesh: pMesh, laneX, z: pz });
          } else {
            this.runnerPowerups.push({ type, mesh: pMesh, x: laneX, z: pz });
          }
          if (this.ui?.showDevToast) this.ui.showDevToast(`⚡ Spawned [${type.toUpperCase()}] Power-Up Ahead!`);
        }
        break;

      case 'SPAWN_CRATE':
        if (typeof this.spawnMysteryCrate === 'function' && this.player) {
          const type = payload.crateType || 'magnet';
          const px = this.player.position.x + (Math.random() - 0.5) * 6;
          const pz = this.player.position.z + (Math.random() - 0.5) * 6;
          this.spawnMysteryCrate(px, pz, type);
          if (this.ui?.showDevToast) this.ui.showDevToast(`📦 Spawned [${type.toUpperCase()}] Crate!`);
        }
        break;

      case 'WARP_DISTRICT':
        if (payload.district && DISTRICT_CONFIGS[payload.district - 1]) {
          const dLevel = Number(payload.district);
          saveManager.unlockDistrict(dLevel);
          this.currentDistrictLevel = dLevel;
          if (this.isTempleRun) {
            this.corridorDistrictLevel = dLevel;
            this.initCorridorTerrain();
            this.distanceMeters = (dLevel - 1) * RUNNER_METERS_PER_NEIGHBORHOOD;
          } else {
            this.loadDistrictLevel(dLevel, this.isGameStarted);
          }
          if (this.ui?.showDevToast) this.ui.showDevToast(`🚀 Warped to District ${dLevel}: ${DISTRICT_CONFIGS[dLevel - 1].name}!`);
        }
        break;

      case 'TRIGGER_AUDIT':
        this.recordDevNote(
          'QA_TELEMETRY_SNAPSHOT',
          'A QA telemetry snapshot was requested from the Master/Developer console; no automated tests or APK checks were run.',
          payload.audit || {}
        );
        break;

      case 'NEW_DEV_NOTE':
        if (payload.note) {
          this.recordDevNote(payload.note.category || 'USER_DIRECTIVE', payload.note.message, payload.note.details || {});
        }
        break;
    }
  }

  clearAllRunnerHazards() {
    let cleared = 0;
    (this.runnerObstacles || []).forEach(obstacle => {
      if (obstacle?.mesh) this.disposeRunnerObject(obstacle.mesh);
      cleared += 1;
    });
    this.runnerObstacles = [];
    (this.runnerTraffic || []).forEach(vehicle => {
      if (vehicle?.mesh) this.disposeRunnerObject(vehicle.mesh);
      cleared += 1;
    });
    this.runnerTraffic = [];
    this.isDrafting = false;
    this.draftCharge = 0;
    this.recordGameOpsEvent('master.hazards_cleared', { count: cleared });
    return cleared;
  }

  completeRunnerArea() {
    let target = RUNNER_CITY_LOOP_METERS;
    for (let i = 0; i < RUNNER_AREA_THRESHOLDS.length; i++) {
      if (RUNNER_AREA_THRESHOLDS[i] > this.distanceMeters + 10) {
        target = RUNNER_AREA_THRESHOLDS[i];
        break;
      }
    }
    this.setRunnerDistance(target >= RUNNER_CITY_LOOP_METERS ? RUNNER_CITY_LOOP_METERS : target);
  }

  setRunnerDistance(distance) {
    const next = Math.max(this.distanceMeters, Math.min(RUNNER_CITY_LOOP_METERS, distance));
    this.distanceMeters = next;
    // Silently mark skipped milestones so completing an area does not replay every celebration.
    (this.milestones || []).forEach((milestone, index) => {
      if (next >= milestone.dist) this.passedMilestoneIndices.add(index);
    });
    this.updateRunnerProgression();
    this.recordGameOpsEvent('master.distance_set', { distanceMeters: Math.round(next) });
  }

  getRunnerThreatLane(item) {
    const x = item.laneX ?? item.mesh?.position?.x ?? 0;
    return THREE.MathUtils.clamp(Math.round(x / this.laneWidth), -1, 1);
  }

  spawnRunnerSectionExtras(z) {
    if (this.isRunnerJunctionZone(z)) return;
    const section = this.runnerSection;
    if (!section) return;
    if (section.type === 'flyover') {
      const laneX = [-this.laneWidth, 0, this.laneWidth][Math.floor(Math.random() * 3)];
      [-3, -1.5, 0, 1.5, 3].forEach(zOff => {
        const coin = KarachiModels.createRupeeCoin(50);
        coin.position.set(laneX, 0, z + zOff);
        this.scene.add(coin);
        this.runnerCoins.push({ mesh: coin, value: 50, x: laneX, z: z + zOff });
      });
    } else {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.7, 2.2),
        new THREE.MeshBasicMaterial({ color: 0x2b2b30 })
      );
      beam.position.set(0, 6.2, z);
      this.scene.add(beam);
      this.runnerSectionDecor.push(beam);
    }
  }

  resetRunnerNavigation() {
    this.ui?.clearAnnouncement?.();
    this.removeRunnerJunction();
    (this.runnerSectionDecor || []).forEach(mesh => this.disposeRunnerObject(mesh));
    this.runnerSectionDecor = [];
    this.runnerHeading = 0;
    this.runnerTurn = null;
    this.runnerSection = null;
    this.runnerTurnsCompleted = 0;
    this.runnerJunctionIndex = 0;
    this.runnerCameraLift = 0;
    this.nextJunctionAt = this.getRunnerNavProfile().firstAt;
    if (this.scene?.fog) this.scene.fog.density = 0.0065;
    this.ui?.updateRunnerNav?.(null);
  }

  removeRunnerJunction() {
    if (this.runnerJunction?.group) {
      this.disposeRunnerObject(this.runnerJunction.group);
    }
    if (this.runnerJunction?.turnGroup) {
      this.scene?.remove(this.runnerJunction.turnGroup);
      (this.runnerJunction.turnChunks || []).forEach(chunk => this.disposeCorridorChunk(chunk));
    }
    this.runnerJunction = null;
    this.setCorridorZoneHidden(null);
  }

  getRunnerHeadingLabel() {
    return ['N', 'W', 'S', 'E'][((this.runnerHeading || 0) % 4 + 4) % 4];
  }

  updateRunnerCoins(dt, previousPosition) {
    const position = this.player.position;
    for (let i = this.runnerCoins.length - 1; i >= 0; i--) {
      const coin = this.runnerCoins[i];
      if (!coin?.mesh) continue;
      coin.mesh.quaternion.copy(this.camera.quaternion);
      const dist = coin.mesh.position.distanceTo(position);
      if ((this.magnetTimer > 0 || this.isFeverActive) && dist < (this.isFeverActive ? 28 : 20)) {
        coin.mesh.position.lerp(position, Math.min(1, dt * (this.isFeverActive ? 14.0 : 8.5)));
      }
      if (runnerSegmentDistanceSquared3D(coin.mesh.position, previousPosition, position) >= 1.45 * 1.45) continue;
      const streakMult = Math.max(1, this.runnerComboStreak || 1);
      const multiplier = (this.doubleCoinsTimer > 0 ? 2 : 1) * streakMult;
      const earned = (coin.value || 50) * multiplier;
      this.coins += earned;
      try { leaderboardService.recordChallengeProgress('collect_coins', 1); } catch {}
      this.awardRunnerXP(100 * streakMult);
      if (this.coins >= 1000) this.unlockRunnerBadge('clean_green');
      this.score += 100 * multiplier;
      this.addFeverCharge(3.0);
      this.runnerComboTimer = 3.5;
      const now = performance.now();
      this.coinComboCount = now - (this.lastCoinPickupTime || 0) < 650
        ? Math.min(8, (this.coinComboCount || 0) + 1) : 1;
      this.lastCoinPickupTime = now;
      audio.playMelodicCoin(this.coinComboCount);
      this.particles.createDevourSparkles(coin.mesh.position, 8, 0xffd700);
      this.ui.showFloatingFeedback(`+${earned} Rs${multiplier > 1 ? ` (${multiplier}X!)` : ''}`, coin.mesh.position, '#ffd700');
      this.disposeRunnerObject(coin.mesh);
      this.runnerCoins.splice(i, 1);
    }
  }

  isRunnerJunctionZone(z) {
    return !!this.runnerJunction && z >= this.runnerJunction.z - 35 && z <= this.runnerJunction.z + 80;
  }

  clearRunnerJunctionApproach() {
    for (const key of ['runnerObstacles', 'runnerTraffic', 'runnerCoins', 'surfingBuses', 'runnerPowerups', 'runnerBoostPads', 'runnerReviveTokens']) {
      this[key] = (this[key] || []).filter(item => {
        if (!item?.mesh || !this.isRunnerJunctionZone(item.mesh.position.z)) return true;
        if (key === 'surfingBuses' && this.isBusSurfing) this.exitBusSurfing();
        this.disposeRunnerObject(item.mesh);
        return false;
      });
    }
    this.runnerSectionDecor = (this.runnerSectionDecor || []).filter(mesh => {
      if (!this.isRunnerJunctionZone(mesh.position.z)) return true;
      this.disposeRunnerObject(mesh);
      return false;
    });
  }

  buildRunnerJunctionMesh(kind, dir) {
    const group = new THREE.Group();
    const mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
    const addBoard = (x, color, arrowRotation, turnSign = false) => {
      const width = turnSign ? 4.6 : kind === 'fork' ? 5.2 : 9;
      const height = turnSign ? 2.4 : 3.4;
      const y = turnSign ? 4.2 : 5.6;
      const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.3), mat(color));
      board.position.set(x, y, -5.8);
      if (turnSign) board.userData.runnerTurnSign = true;
      group.add(board);
      const arrow = new THREE.Mesh(RUNNER_DIRECTION_ARROW_GEOMETRY, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
      arrow.scale.setScalar(turnSign ? 1.8 : kind === 'fork' ? 2.4 : 3.4);
      arrow.rotation.z = arrowRotation;
      arrow.position.set(x, y, -5.62);
      group.add(arrow);
      const postXs = turnSign ? [x] : [-1, 1].map(side => x + side * (kind === 'fork' ? 2.4 : 4.2));
      postXs.forEach(postX => {
        const postHeight = turnSign ? 3.8 : 5.6;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, postHeight, 0.35), mat(0x37474f));
        post.position.set(postX, postHeight / 2, -5.8);
        group.add(post);
      });
    };

    if (kind === 'turn') {
      const roadColors = { 1: 0x181e26, 2: 0x302b28, 3: 0x242326 };
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(13, 13).rotateX(-Math.PI / 2),
        mat(roadColors[this.currentDistrictLevel] || roadColors[1])
      );
      road.position.set(0, 0.03, 0);
      group.add(road);

      // Dead-End Marked Direction Barrier (satisfies TC-45 geometry contracts)
      const barrierX = dir === -1 ? 3.4 : -3.4;
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1, 0.6), mat(0xff6d00));
      barrier.position.set(barrierX, 0.5, -6.7);
      barrier.userData.runnerTurnBarrier = true;
      group.add(barrier);
      [-2.3, -0.8, 0.8, 2.3].forEach(offset => {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.64), mat(0xffffff));
        stripe.position.set(barrierX + offset, 0.72, -6.7);
        group.add(stripe);
      });

      // Flashing amber hazard beacons on dead-end barrier
      [-2.2, 2.2].forEach(bOff => {
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.28, 8), new THREE.MeshBasicMaterial({ color: 0xffab00 }));
        beacon.position.set(barrierX + bOff, 1.15, -6.7);
        group.add(beacon);
      });

      // Overhead Municipal Road Gantry: High-visibility Karachi Highway Signboard over the turn
      const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.4, 0.4), mat(0x263238));
      gantryBeam.position.set(0, 5.4, -5.8);
      group.add(gantryBeam);
      [-6.2, 6.2].forEach(gx => {
        const gPost = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 0.4), mat(0x37474f));
        gPost.position.set(gx, 2.75, -5.8);
        group.add(gPost);
      });

      // Master Directional Overhead Board (Karachi Highway Green)
      const overheadBoard = new THREE.Mesh(
        new THREE.BoxGeometry(7.8, 1.9, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x0a5c28, roughness: 0.35, metalness: 0.15 })
      );
      overheadBoard.position.set(0, 5.3, -5.6);
      overheadBoard.userData.runnerTurnSign = true;
      group.add(overheadBoard);

      // Glowing directional chevrons on overhead sign
      [-2.2, 0, 2.2].forEach(cx => {
        const gArrow = new THREE.Mesh(
          RUNNER_DIRECTION_ARROW_GEOMETRY,
          new THREE.MeshBasicMaterial({ color: 0xffeb3b, side: THREE.DoubleSide })
        );
        gArrow.scale.setScalar(1.15);
        gArrow.rotation.z = dir === -1 ? Math.PI / 2 : -Math.PI / 2;
        gArrow.position.set(cx, 5.3, -5.45);
        group.add(gArrow);
      });

      // 3D Road-Surface Projector Chevrons on Approach Asphalt
      [14, 28, 42].forEach(aheadDist => {
        const floorArrow = new THREE.Mesh(
          RUNNER_DIRECTION_ARROW_GEOMETRY,
          new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
        );
        floorArrow.rotation.x = -Math.PI / 2;
        floorArrow.rotation.z = dir === -1 ? Math.PI / 2 : -Math.PI / 2;
        floorArrow.scale.setScalar(2.2);
        floorArrow.position.set(dir === -1 ? -1.2 : 1.2, 0.04, aheadDist);
        group.add(floorArrow);
      });

      addBoard(dir === -1 ? -7.5 : 7.5, 0x1b5e20, dir === -1 ? Math.PI / 2 : -Math.PI / 2, true);
    } else {
      addBoard(-4, 0xf9a825, 0);
      addBoard(4, 0x37474f, Math.PI);
      [-1, 1].forEach(side => {
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.5, 0.5), mat(side < 0 ? 0xffc400 : 0x263238));
        lintel.position.set(side * 4, 4.4, 0);
        group.add(lintel);
      });
    }
    return group;
  }

  spawnRunnerJunction(kind = 'turn', dir = -1, aheadMeters = 170) {
    if (!this.player || this.runnerJunction || this.runnerTurn) return false;
    const z = this.player.position.z - aheadMeters;
    const group = this.buildRunnerJunctionMesh(kind, dir);
    group.position.z = z;
    this.scene.add(group);
    this.runnerJunction = { kind, dir, z, group, resolved: false };

    if (kind === 'turn') this.levelRunnerJunctionTerrain(z);
    this.clearRunnerJunctionApproach();
    this.runnerCoins = this.runnerCoins.filter(coin => {
      if (!this.isRunnerJunctionZone(coin.mesh.position.z)) return true;
      this.disposeRunnerObject(coin.mesh);
      return false;
    });

    if (kind === 'turn') {
      // A real cross-road built from corridor chunks so the corner already looks like the street.
      const turnGroup = new THREE.Group();
      turnGroup.position.set(0, 0.012, z);
      turnGroup.rotation.y = dir === -1 ? Math.PI / 2 : -Math.PI / 2;
      const turnChunks = [];
      for (let i = 0; i < 3; i++) {
        const chunk = this.createCorridorChunk(z - i * 60, 'FLAT', 0);
        chunk.position.set(0, 0, -i * 60);
        if (i === 0) {
          chunk.userData.turnExitClearance = true;
          chunk.userData.slabs.forEach(slab => {
            if (!slab.userData.roadSurface) slab.visible = false;
          });
        }
        turnGroup.add(chunk);
        turnChunks.push(chunk);
      }
      this.scene.add(turnGroup);
      this.runnerJunction.turnGroup = turnGroup;
      this.runnerJunction.turnChunks = turnChunks;
      this.setCorridorZoneHidden(z - 32, z + 45);
    }

    // Turns are kept 100% clean and coin-free for ultra-smooth 60fps cornering
    this.recordGameOpsEvent('runner.junction', { kind, dir, distanceMeters: Math.round(this.distanceMeters) });
    return true;
  }

  levelRunnerJunctionTerrain(junctionZ) {
    const objects = [
      ...(this.runnerObstacles || []), ...(this.runnerTraffic || []),
      ...(this.runnerCoins || []), ...(this.runnerPowerups || []),
      ...(this.runnerReviveTokens || []), ...(this.runnerBoostPads || []),
      ...(this.surfingBuses || [])
    ].filter(item => item?.mesh).map(item => ({
      mesh: item.mesh,
      ground: this.getCorridorGroundHeight(item.mesh.position.z, item.mesh.position.x)
    }));
    const playerGround = this.getCorridorGroundHeight(this.player.position.z, this.player.position.x);
    const chunks = [...this.corridorChunks].sort((a, b) => b.position.z - a.position.z);
    const firstFlat = chunks.findIndex(chunk => chunk.position.z - 30 <= junctionZ + 80);
    if (firstFlat < 0) return;
    for (let i = Math.max(0, firstFlat - 1); i < chunks.length; i++) {
      const old = chunks[i];
      if (old.position.z + 30 < junctionZ - 90) break;
      const transition = i === firstFlat - 1;
      const start = transition ? old.userData.startElevation : 0;
      const slope = start > 0 ? 'RAMP_DOWN' : start < 0 ? 'RAMP_UP' : 'FLAT';
      const replacement = this.createCorridorChunk(old.position.z, slope, start);
      this.scene.add(replacement);
      replacement.updateWorldMatrix(true, true);
      this.corridorChunks[this.corridorChunks.indexOf(old)] = replacement;
      this.disposeCorridorChunk(old);
    }
    this.corridorElevation = [...this.corridorChunks].sort((a, b) => a.position.z - b.position.z)[0]?.userData.endElevation || 0;
    for (const { mesh, ground } of objects) {
      mesh.position.y += this.getCorridorGroundHeight(mesh.position.z, mesh.position.x) - ground;
    }
    const newGround = this.getCorridorGroundHeight(this.player.position.z, this.player.position.x);
    const heightChange = newGround - playerGround;
    this.player.position.y = newGround + Math.max(0, this.player.position.y - playerGround);
    this.player.group.position.copy(this.player.position);
    this.camera.position.y += heightChange;
  }

  /**
   * Handle a lane input in the junction zone. Returns true when the input was consumed.
   */
  attemptRunnerTurn(dir) {
    const junction = this.runnerJunction;
    if (!junction || junction.resolved || this.runnerTurn || !this.player) return false;
    const ahead = this.player.position.z - junction.z;
    if (ahead > RUNNER_TURN_INPUT_METERS || ahead < RUNNER_TURN_LAST_INPUT_METERS) return false;

    if (junction.kind === 'fork') {
      junction.resolved = true;
      this.enterRunnerSection(dir < 0 ? 'flyover' : 'underpass');
      return true;
    }

    // In the approach queue zone (ahead > RUNNER_TURN_ENTRY_METERS, ~12m):
    if (ahead > RUNNER_TURN_ENTRY_METERS) {
      if (dir === junction.dir) {
        if (!junction.turnQueued) {
          junction.turnQueued = true;
          const bonus = 300;
          this.score = (Number(this.score) || 0) + bonus;
          this.awardRunnerXP(bonus);
          audio.playPowerUp();
          this.ui.showAnnouncement(`🧭 TURN QUEUED +${bonus}`, '#76ff03');
          this.updateRunnerNavigation(0);
        }
        return true;
      } else {
        // Player pressed opposite direction while still far ahead:
        // They want to dodge obstacles or switch lanes!
        // A lane dodge must not undo an already-confirmed corner input.
        return false;
      }
    }

    // In the immediate turn zone (ahead <= RUNNER_TURN_ENTRY_METERS):
    junction.resolved = true;
    if (dir === junction.dir) {
      const perfect = ahead <= 10;
      const bonus = perfect ? 500 : 300;
      this.score = (Number(this.score) || 0) + bonus;
      this.awardRunnerXP(bonus);
      audio.playPowerUp();
      this.ui.showAnnouncement(perfect ? `🧭 PERFECT TURN! +${bonus}` : `🧭 CLEAN TURN +${bonus}`, '#76ff03');
      this.beginRunnerTurn(junction, junction.dir);
      return true;
    } else {
      this.beginRunnerTurn(junction, junction.dir);
      this.handleRunnerHit({ type: 'wrong_turn', isHit: false, mesh: null }, 'WRONG WAY');
      return true;
    }
  }

  beginRunnerTurn(junction, dir) {
    const z0 = this.player.position.z;
    const incomingLane = Math.max(-1, Math.min(1, this.currentLane ?? 0));
    const radius = z0 - junction.z - dir * incomingLane * this.laneWidth;
    this.runnerTurn = {
      dir,
      sign: dir,
      t: 0,
      startZ: z0,
      startX: this.player.position.x,
      startY: this.player.position.y,
      cameraStartPosition: this.camera.position.clone(),
      cameraStartQuaternion: this.camera.quaternion.clone(),
      incomingLane,
      pivotZ: junction.z,
      radius,
      duration: THREE.MathUtils.clamp(1.57 * radius / Math.max(12, this.getRunnerSpeed()), 1.05, 1.5)
    };
    this.runnerCoins = (this.runnerCoins || []).filter(coin => {
      if (!this.isRunnerJunctionZone(coin.mesh.position.z)) return true;
      this.disposeRunnerObject(coin.mesh);
      return false;
    });
    if (this.player.avatarMesh) this.player.avatarMesh.visible = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    if (this.player.avatarMesh) {
      this.player.avatarMesh.scale.set(1, 1, 1);
      this.player.avatarMesh.position.y = 0;
    }
    this.ui.updateRunnerNav?.(null);
    audio.playTireScreech();
    this.particles.createSkidSmoke(this.player.position, 8);
  }

  // The runner follows a real quarter-circle onto the cross-road while the camera swings with it.
  updateRunnerTurnAnimation(dt) {
    const turn = this.runnerTurn;
    const player = this.player;
    const previousPosition = player.position.clone();
    turn.t = Math.min(1, turn.t + dt / turn.duration);
    const p = turn.t;
    const theta = p * Math.PI / 2;
    const s = turn.sign;
    const R = turn.radius;
    const pivotX = turn.startX + (turn.sign * R);
    const pivotZ = turn.startZ;
    const x = pivotX - (turn.sign * R * Math.cos(theta));
    const z = pivotZ - (R * Math.sin(theta));
    const angle = -s * theta;
    const fx = -Math.sin(angle);
    const fz = -Math.cos(angle);

    const y = THREE.MathUtils.lerp(turn.startY || 0, 0, p);
    player.position.set(x, y, z);
    player.group.position.copy(player.position);
    if (player.avatarMesh) {
      player.avatarMesh.visible = true;
      // Dynamic motorcycle/runner athletic banking roll into the turn
      player.avatarMesh.rotation.z = s * 0.32 * Math.sin(Math.PI * p);
    }
    player.group.rotation.y = Math.PI + angle;
    player.facingAngle = Math.PI + angle;
    player.targetRotationY = Math.PI + angle;

    // Active running animation during turn so runner legs and arms never freeze
    if (typeof AvatarBuilder !== 'undefined' && AvatarBuilder.updateAnimation && player.avatarMesh) {
      const runPace = Math.max(12, this.getRunnerSpeed()) / 14.0;
      AvatarBuilder.updateAnimation(player.avatarMesh, true, dt, runPace, false);
    }

    // Dynamic drifting tire/shoe smoke during the turn apex
    if (p > 0.15 && p < 0.85 && Math.random() < 0.35) {
      this.particles?.createSkidSmoke?.(player.position, 1);
    }

    // Accumulate distance and score smoothly through the turn
    const curSpeed = this.getRunnerSpeed();
    this.distanceMeters += curSpeed * dt;
    this.score += Math.round(curSpeed * dt * 0.5);

    const lift = this.runnerCameraLift || 0;
    const apex = Math.sin(Math.PI * p);
    const camDist = 5.2 - (apex * 1.6); // Pull in dynamically at apex to avoid corner building intersections
    const camX = x - (fx * camDist);
    const camZ = z - (fz * camDist);
    const lookX = x + (fx * 16.0);
    const lookZ = z + (fz * 16.0);
    this.camera.position.set(camX, (this.player.position.y || 0) + 2.85 + lift, camZ);
    this.camera.lookAt(lookX, (this.player.position.y || 0) + 1.25, lookZ);
    if (p < 0.2) {
      const blend = THREE.MathUtils.smoothstep(p, 0, 0.2);
      this.camera.position.lerpVectors(turn.cameraStartPosition, this.camera.position, blend);
      this.camera.quaternion.slerpQuaternions(turn.cameraStartQuaternion, this.camera.quaternion.clone(), blend);
    }
    this.updateRunnerCoins(dt, previousPosition);

    if (this.playerBlobShadow) {
      this.playerBlobShadow.visible = true;
      const turnGroundY = this.getCorridorGroundHeight(z, x);
      this.playerBlobShadow.position.set(x, turnGroundY + 0.03, z);
      this.playerBlobShadow.scale.set(1.0, 1, 1.0);
      this.playerBlobShadow.material.opacity = 0.70;
    }

    if (this.skyDome) {
      this.skyDome.position.set(x * 0.1, 0, z);
    }
    if (this.skylineBackdrop) {
      this.skylineBackdrop.position.set(x * 0.15, 0, z);
    }

    if (turn.t >= 1) this.finishRunnerTurn();
  }

  finishRunnerTurn() {
    const turn = this.runnerTurn;
    const junctionZ = turn.pivotZ;
    const R = turn.radius;
    const junction = this.runnerJunction;
    const exitX = turn.startX + turn.dir * R;
    const streetOriginZ = junctionZ + turn.dir * exitX;
    const cameraPosition = this.camera.position.clone();
    const cameraRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), turn.dir * Math.PI / 2);
    this.runnerHeading = (this.runnerHeading + (turn.dir === -1 ? 1 : 3)) % 4;
    this.runnerTurn = null;
    this.runnerTurnsCompleted = (this.runnerTurnsCompleted || 0) + 1;

    // Re-frame the world around the new heading: the cross-road chunks become the straight corridor.
    const crossChunks = junction?.turnChunks || [];
    if (crossChunks.length) {
      crossChunks.forEach((chunk, i) => {
        junction.turnGroup.remove(chunk);
        chunk.position.set(0, 0, streetOriginZ - i * 60);
        chunk.rotation.set(0, 0, 0);
        if (i > 0) chunk.userData.slabs.forEach(slab => { slab.visible = true; });
        this.scene.add(chunk);
      });
      junction.turnChunks = [];
      const oldChunks = this.corridorChunks || [];
      oldChunks.forEach(chunk => {
        this.scene.remove(chunk);
        this.disposeCorridorChunk(chunk);
      });
      this.corridorChunks = [...crossChunks];
      let minZ = streetOriginZ - (crossChunks.length - 1) * 60;
      this.corridorElevation = 0.0;
      while (this.corridorChunks.length < 7) {
        const newZ = minZ - 60;
        const newChunk = this.createCorridorChunk(newZ);
        this.scene.add(newChunk);
        this.corridorChunks.push(newChunk);
        minZ = newZ;
      }
    }
    this.removeRunnerJunction();
    this.clearRunnerObjects(true);
    this.nextWordLetterZ = junctionZ - 30.0;
    this.corridorElevation = 0.0;
    if (!crossChunks.length) this.initCorridorTerrain();
    const preservedLane = Math.max(-1, Math.min(1, turn?.incomingLane ?? this.currentLane ?? 0));
    this.currentLane = preservedLane;
    this.targetLaneX = preservedLane * this.laneWidth;
    this.laneChangeStartX = this.targetLaneX;
    this.laneChangeTimer = this.laneChangeDuration || 0.18;
    this.currentBankRoll = 0;
    this.targetBankRoll = 0;
    this.player.position.set(this.targetLaneX, 0, junctionZ);
    this.player.group.position.set(this.targetLaneX, 0, junctionZ);
    this.player.group.rotation.set(0, Math.PI, 0);
    this.player.facingAngle = Math.PI;
    this.player.targetRotationY = Math.PI;
    if (this.player.avatarMesh) {
      this.player.avatarMesh.rotation.z = 0;
    }

    // Reset wave spawner safely ahead on the new street
    this.nextRunnerWaveZ = junctionZ - 60.0;
    this.lastRunnerZ = junctionZ;
    this.runnerInvulnerableTimer = Math.max(this.runnerInvulnerableTimer || 0, 2.5);

    // Smooth post-turn camera handoff: frame runner on new heading
    if (this.camera) {
      this.camera.position.set(
        turn.dir * (cameraPosition.z - junctionZ),
        cameraPosition.y,
        junctionZ - turn.dir * (cameraPosition.x - exitX)
      );
      this.camera.quaternion.premultiply(cameraRotation);
      this.cameraSmoothPos = this.camera.position.clone();
      this.cameraSmoothLookAt = this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(18).add(this.camera.position);
      this.cameraSmoothTimer = 0.4;
    }

    this.ui.showAnnouncement(`🧭 NOW HEADING ${this.getRunnerHeadingLabel()}`, '#00e5ff');
    const navProfile = this.getRunnerNavProfile();
    this.nextJunctionAt = this.distanceMeters + (this.runnerJunctionIndex % 4 === 1 ? navProfile.chainGap : navProfile.gap);
  }

  enterRunnerSection(type) {
    this.runnerSection = { type, endDist: this.distanceMeters + this.getRunnerNavProfile().sectionMeters };
    const flyover = type === 'flyover';
    if (this.scene?.fog) this.scene.fog.density = flyover ? 0.004 : 0.012;
    audio.playPowerUp();
    this.ui.showAnnouncement(
      flyover ? '⬆ FLYOVER! Fast road, bonus coins!' : '⬇ UNDERPASS! Low wires - slide!',
      flyover ? '#ffd700' : '#90a4ae'
    );
    this.nextJunctionAt = this.distanceMeters + this.getRunnerNavProfile().gap;
    this.recordGameOpsEvent('runner.section', { type, distanceMeters: Math.round(this.distanceMeters) });
  }

  endRunnerSection() {
    if (!this.runnerSection) return;
    this.score = (Number(this.score) || 0) + 400;
    this.awardRunnerXP(400);
    this.ui.showAnnouncement('✅ SECTION CLEARED! +400', '#76ff03');
    this.runnerSection = null;
    if (this.scene?.fog) this.scene.fog.density = 0.0065;
  }

  // Pace-specific route layout: Easy has no left/right turns (only forks), Hard chains turns more often.
  getRunnerNavProfile() {
    const profiles = {
      easy: { turns: false, firstAt: 200, gap: 640, chainGap: 640, sectionMeters: 500, forkEvery: 1 },
      cruiser: { turns: true, firstAt: 175, gap: 560, chainGap: 360, sectionMeters: 600, forkEvery: 2 },
      standard: { turns: true, firstAt: 150, gap: 480, chainGap: 260, sectionMeters: 700, forkEvery: 3 },
      hard: { turns: true, firstAt: 120, gap: 360, chainGap: 200, sectionMeters: 800, forkEvery: 3 }
    };
    return profiles[this.runnerDifficulty] || profiles.cruiser;
  }

  updateRunnerNavigation(dt) {
    if (this.runnerJunction) {
      this.clearRunnerJunctionApproach();
      if (this.runnerJunction.kind === 'turn') {
        this.setCorridorZoneHidden(this.runnerJunction.z - 32, this.runnerJunction.z + 45);
      }
    }
    const profile = this.getRunnerNavProfile();
    if (!this.runnerJunction && !this.runnerSection && this.distanceMeters >= this.nextJunctionAt - 170) {
      const i = this.runnerJunctionIndex || 0;
      const dir = [-1, 1, 1, -1, 1, -1][i % 6];
      const isFork = !profile.turns || i % profile.forkEvery === profile.forkEvery - 1;
      this.spawnRunnerJunction(isFork ? 'fork' : 'turn', dir, 170);
      this.runnerJunctionIndex = i + 1;
    }

    const junction = this.runnerJunction;
    if (junction) {
      const ahead = this.player.position.z - junction.z;
      if (junction.kind === 'turn' && junction.turnQueued && ahead <= RUNNER_TURN_ENTRY_METERS + 1e-6 && ahead > -3) {
        junction.resolved = true;
        this.beginRunnerTurn(junction, junction.dir);
        return;
      }
      if (!junction.resolved && ahead <= (junction.kind === 'turn' ? RUNNER_TURN_LAST_INPUT_METERS + 1e-6 : -0.5)) {
        junction.resolved = true;
        if (junction.kind === 'fork') {
          this.enterRunnerSection('underpass');
        } else {
          this.beginRunnerTurn(junction, junction.dir);
          this.handleRunnerHit({ type: 'missed_turn', isHit: false, mesh: null }, 'MISSED TURN');
          if (this.isGameOver) return;
        }
      }
      if (junction.kind === 'fork' && junction.resolved && ahead < -14) this.removeRunnerJunction();
  }

  const section = this.runnerSection;
  if (section && this.distanceMeters >= section.endDist) this.endRunnerSection();
  const targetLift = this.runnerSection?.type === 'flyover' ? 1.1 : this.runnerSection ? -0.7 : 0;
  this.runnerCameraLift = THREE.MathUtils.lerp(this.runnerCameraLift || 0, targetLift, Math.min(1, dt * 3));

  (this.runnerSectionDecor || []).forEach((mesh, index, list) => {
    if (mesh.position.z > this.player.position.z + 20) {
      this.disposeRunnerObject(mesh);
      list[index] = null;
    }
  });
  this.runnerSectionDecor = (this.runnerSectionDecor || []).filter(Boolean);


  let nav = null;
  const heading = this.getRunnerHeadingLabel();
  if (this.runnerJunction && !this.runnerJunction.resolved) {
    const meters = Math.max(0, Math.round(this.player.position.z - this.runnerJunction.z));
    if (meters < 320) {
      const j = this.runnerJunction;
      const turnKey = j.dir === -1 ? 'A / ←' : 'D / →';
      const turnDirText = j.dir === -1 ? 'LEFT' : 'RIGHT';
      nav = j.kind === 'fork'
        ? { arrow: '⬆⬇', text: 'FORK: ⬅ FLYOVER · UNDERPASS ➡', meters, heading, urgent: meters < 45 }
        : {
            arrow: j.turnQueued ? '✔' : (j.dir === -1 ? '↰' : '↱'),
            text: j.turnQueued
              ? `🧭 TURN ${turnDirText} LOCKED IN!`
              : meters <= 45
                ? `TURN ${turnDirText}: SWIPE / ${turnKey} · MISS = -1 HEART`
                : `TURN ${turnDirText}`,
            meters,
            heading,
            urgent: meters < 45
          };
    }
  }
  if (!nav) {
    nav = {
      arrow: this.runnerSection ? (this.runnerSection.type === 'flyover' ? '⬆' : '⬇') : '⬆',
      text: this.runnerSection ? this.runnerSection.type.toUpperCase() : 'KEEP STRAIGHT',
      meters: null,
      heading,
      urgent: false
    };
  }
  this.ui.updateRunnerNav?.(nav);
}

  executeRunnerAutoPilot(dt) {
    const junction = this.runnerJunction;
    if (junction && !junction.resolved) {
      const junctionAhead = this.player.position.z - junction.z;
      if (junctionAhead <= 11 && junctionAhead >= 0 && this.attemptRunnerTurn(junction.dir)) return;
    }
    this.runnerAutoPilotCooldown = Math.max(0, (this.runnerAutoPilotCooldown || 0) - dt);
    const pPos = this.player.position;
    const speed = this.player.currentSpeed || this.getRunnerSpeed();
    const threats = [];
    (this.runnerObstacles || []).forEach(obstacle => {
      if (!obstacle || obstacle.isHit || obstacle.z === undefined) return;
      const ahead = pPos.z - obstacle.z;
      if (ahead < -1 || ahead > 34) return;
      const action = obstacle.requiredAction || 'dodge';
      threats.push({ ahead, action, lane: this.getRunnerThreatLane(obstacle), fullWidth: action === 'slide' });
    });
    (this.runnerTraffic || []).forEach(vehicle => {
      if (!vehicle?.mesh || vehicle.isHit) return;
      const ahead = pPos.z - vehicle.mesh.position.z;
      if (ahead < -2 || ahead > 34) return;
      threats.push({ ahead, action: 'dodge', lane: this.getRunnerThreatLane(vehicle), fullWidth: false });
    });

    const dodgeClearance = lane => {
      let clearance = 40;
      threats.forEach(threat => {
        const needsLane = threat.action === 'dodge' || threat.action === 'dodge_or_horn';
        if (needsLane && threat.lane === lane) clearance = Math.min(clearance, threat.ahead);
      });
      return clearance;
    };

    if (this.runnerAutoPilotCooldown <= 0 && dodgeClearance(this.currentLane) < 26) {
      const options = [-1, 0, 1]
        .filter(lane => Math.abs(lane - this.currentLane) <= 1 && lane !== this.currentLane)
        .map(lane => ({ lane, clearance: dodgeClearance(lane) }))
        .sort((a, b) => b.clearance - a.clearance);
      if (options[0] && options[0].clearance > dodgeClearance(this.currentLane) + 4) {
        this._autoLaneChange = true;
        this.changeLane(options[0].lane - this.currentLane);
        this._autoLaneChange = false;
        this.runnerAutoPilotCooldown = 0.25;
      }
    }

    const jumpWindow = speed * 0.33 + 1.5;
    const slideWindow = speed * 0.25 + 2.5;
    threats.forEach(threat => {
      if (threat.ahead < 0) return;
      if (threat.fullWidth && threat.ahead < slideWindow && !this.isSliding) {
        this.performSlide();
      } else if (
        (threat.action === 'jump' || threat.action === 'jump_or_dodge') &&
        threat.lane === this.currentLane && threat.ahead < jumpWindow && this.player.isGrounded
      ) {
        this.performJump();
      }
    });

    // Auto-Pilot Tactical Powers: Slingshot release & Horn for Snatchers
    if ((this.slingshotCharge || 0) >= 100 && typeof this.triggerRunnerSlingshot === 'function') {
      this.triggerRunnerSlingshot();
    }
    const snatcherInLane = (this.runnerObstacles || []).find(obs =>
      !obs.isHit && (obs.type === 'snatcher' || obs.type === 'robber') &&
      obs.z && (pPos.z - obs.z > 0 && pPos.z - obs.z < 28) &&
      Math.abs(obs.laneX - this.player.position.x) < 1.5
    );
    if (snatcherInLane && typeof this.triggerRunnerHorn === 'function') {
      this.triggerRunnerHorn();
    }
  }

  executeAutoPilotSteering(dt) {
    if (!this.player || !this.player.isAlive) return;

    let targetPos = null;
    let minDist = Infinity;

    // 1. Seek active district threats (politicians, tankers, bad guys)
    if (this.districtEvils) {
      for (const e of this.districtEvils) {
        if (e && e.state !== 'swallowed' && e.mesh) {
          const d = this.player.position.distanceTo(e.mesh.position);
          if (d < minDist) {
            minDist = d;
            targetPos = e.mesh.position;
          }
        }
      }
    }

    // 2. If no threats in immediate range, seek mystery power crates
    if (this.powerUpCrates && minDist > 16) {
      for (const c of this.powerUpCrates) {
        if (c && c.active && c.mesh) {
          const d = this.player.position.distanceTo(c.mesh.position);
          if (d < minDist) {
            minDist = d;
            targetPos = c.mesh.position;
          }
        }
      }
    }

    // 3. If no crates or threats nearby, seek street munchies
    if (this.clutterItems && minDist > 22) {
      for (const item of this.clutterItems) {
        if (item && item.state !== 'swallowed' && item.mesh) {
          const d = this.player.position.distanceTo(item.mesh.position);
          if (d < minDist) {
            minDist = d;
            targetPos = item.mesh.position;
          }
        }
      }
    }

    if (targetPos) {
      const dx = targetPos.x - this.player.position.x;
      const dz = targetPos.z - this.player.position.z;
      const len = Math.hypot(dx, dz);
      if (len > 0.05) {
        this.player.move(dx / len, dz / len, dt, 94.0, this.cityGen?.obstacles || []);
      }
    }
  }

  recordPeriodicRuntimeSnapshot() {
    if (!this.isGameStarted || this.isPaused || this.isGameOver || !this.player) return;
    const now = performance.now();
    if (!this.__lastRuntimeSnapshot) this.__lastRuntimeSnapshot = now;
    if (now - this.__lastRuntimeSnapshot < 15000) return;
    this.__lastRuntimeSnapshot = now;

    const fps = this.currentFPS || 0;
    const activeHazards = this.isTempleRun
      ? (this.runnerObstacles || []).filter(obstacle => !obstacle.isHit).length +
        (this.runnerTraffic || []).filter(vehicle => !vehicle.isHit).length
      : (this.districtEvils || []).filter(evil => evil && evil.state !== 'swallowed').length;
    const isPlayerInBounds = this.isTempleRun
      ? Math.abs(this.player.position.x) <= this.laneWidth
      : Math.abs(this.player.position.x) <= 95 && Math.abs(this.player.position.z) <= 95;
    const runtimeHealthy = fps >= 30 && isPlayerInBounds;

    const auditEntry = {
      id: `RUNTIME-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      type: 'RUNTIME_TELEMETRY',
      summary: `${this.isTempleRun ? 'Runner' : 'Civic'} runtime snapshot · ${fps} FPS · ${activeHazards} active hazards`,
      details: `Player in bounds: ${isPlayerInBounds}. ${this.isTempleRun ? `Distance: ${Math.round(this.distanceMeters)} m · Weather: ${this.getRunnerWeatherState()}.` : `Patrol area: ${this.currentDistrictLevel}.`} This is runtime telemetry, not a test-suite or APK validation result.`,
      status: runtimeHealthy ? 'RUNTIME_HEALTHY' : 'RUNTIME_WARNING'
    };

    try {
      const storedAudits = JSON.parse(localStorage.getItem('karachi_ai_audit_log') || '[]');
      if (!Array.isArray(storedAudits)) throw new TypeError('Stored QA history is not a list.');
      storedAudits.unshift(auditEntry);
      if (storedAudits.length > 50) storedAudits.length = 50;
      localStorage.setItem('karachi_ai_audit_log', JSON.stringify(storedAudits));
    } catch (error) {
      console.error('[MASTER_MODE] Could not persist runtime telemetry snapshot.', error);
      return;
    }
  }

  // =========================================================================
  // DEV MODE OBSERVER ACTION METHODS
  // =========================================================================
  devWarpToNearestThreat() {
    if (!this.player || !this.districtEvils) return;
    const active = this.districtEvils.filter(e => e && e.state !== 'swallowed');
    if (active.length === 0) {
      if (this.ui?.showDevToast) this.ui.showDevToast('No active threats remaining in current district!');
      return;
    }
    let nearest = active[0];
    let minDist = this.player.position.distanceTo(nearest.mesh.position);
    for (let i = 1; i < active.length; i++) {
      const d = this.player.position.distanceTo(active[i].mesh.position);
      if (d < minDist) {
        minDist = d;
        nearest = active[i];
      }
    }
    const tPos = nearest.mesh.position;
    this.player.position.set(tPos.x, 0, tPos.z);
    this.player.group.position.copy(this.player.position);
    if (this.ui?.showDevToast) this.ui.showDevToast(`📍 Warped upon ${nearest.name || nearest.evilType}!`);
    if (this.ui?.appendDevLog) this.ui.appendDevLog(`[WARP] Teleported player to ${nearest.name || nearest.evilType} @ (${tPos.x.toFixed(1)}, ${tPos.z.toFixed(1)})`, 'info');
  }

  devResolveNearestThreat() {
    if (!this.player || !this.districtEvils) return;
    const active = this.districtEvils.filter(e => e && e.state !== 'swallowed');
    if (active.length === 0) return;
    let nearest = active[0];
    let minDist = this.player.position.distanceTo(nearest.mesh.position);
    for (let i = 1; i < active.length; i++) {
      const d = this.player.position.distanceTo(active[i].mesh.position);
      if (d < minDist) {
        minDist = d;
        nearest = active[i];
      }
    }
    this.resolveDistrictThreat(nearest, this.player);
    if (this.ui?.showDevToast) this.ui.showDevToast(`⚡ Resolved ${nearest.name || nearest.evilType}!`);
  }

  recordDevNote(category, message, details = {}) {
    if (!window.__DEV_NOTES__) {
      window.__DEV_NOTES__ = [];
      try {
        const stored = localStorage.getItem('karachi_dev_flight_recorder');
        if (stored) window.__DEV_NOTES__ = JSON.parse(stored);
      } catch (e) {}
    }
    const note = {
      timestamp: new Date().toISOString(),
      category,
      message,
      district: this.currentDistrictLevel || 1,
      timeLeft: this.timeLeft ? Number(this.timeLeft.toFixed(2)) : null,
      score: this.score || 0,
      player: this.player ? {
        x: Number(this.player.position.x.toFixed(2)),
        z: Number(this.player.position.z.toFixed(2)),
        radius: Number(this.player.radius.toFixed(2)),
        isAlive: this.player.isAlive
      } : null,
      activeEvilsCount: this.districtEvils ? this.districtEvils.filter(e => e && e.state !== 'swallowed').length : 0,
      details
    };
    window.__DEV_NOTES__.push(note);
    if (String(category).startsWith('USER_')) {
      this.recordGameOpsEvent('developer.feedback', {
        category,
        message: String(message || '').slice(0, 2000),
        distanceMeters: Math.round(this.distanceMeters || 0),
        area: this.currentMilestone || `Area ${this.currentDistrictLevel || 1}`
      });
    }
    if (window.__DEV_NOTES__.length > 100) {
      window.__DEV_NOTES__.shift();
    }
    try {
      localStorage.setItem('karachi_dev_flight_recorder', JSON.stringify(window.__DEV_NOTES__));
    } catch (e) {}
    if (this.ui?.appendDevLog) {
      this.ui.appendDevLog(`[${category}] ${message}`, category.includes('ANOMALY') || category.includes('EXCEPTION') ? 'err' : 'info');
    }
    console.log(`[DEV_NOTE:${category}]`, message, note);
    return note;
  }
}

// Robust Bootstrap: Check readyState immediately in case DOMContentLoaded already fired
function bootKarachiGame() {
  if (window.__karachi_game_initialized__) return;
  window.__karachi_game_initialized__ = true;
  window.KarachiModels = KarachiModels;

  try {
    window.game = new Game();
  } catch (err) {
    console.error('[CRITICAL_BOOT_ERROR] Failed to start Karachi Street Hero:', err ? (err.stack || err.message || String(err)) : 'Unknown error');
    const errBox = document.createElement('div');
    errBox.style.cssText = 'position:fixed;inset:0;background:#050b14;color:#ff3366;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;z-index:999999;text-align:center;';
    errBox.innerHTML = `
      <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
      <h2 style="color:#00e5ff;margin:0 0 8px 0;letter-spacing:1px;">KARACHI STREET HERO - GRAPHICS NOTICE</h2>
      <p style="color:#e2e8f0;max-width:520px;margin-bottom:16px;line-height:1.5;font-size:0.95rem;">${err.message || 'WebGL context could not be created'}</p>
      <button onclick="location.reload()" style="background:#00e5ff;color:#050b14;border:none;padding:12px 28px;border-radius:24px;font-weight:bold;cursor:pointer;font-size:0.95rem;">🔄 Reload Game</button>
    `;
    document.body.appendChild(errBox);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootKarachiGame);
} else {
  bootKarachiGame();
}
