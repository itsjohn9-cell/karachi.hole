import * as THREE from 'three';
import { CityGenerator } from './cityGenerator.js';
import { Hole, LEVEL_CONFIG } from './hole.js';
import { DISTRICT_CONFIGS, getDistrictConfig } from './districts.js';
import { VirtualJoystick } from './joystick.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';
import { KarachiModels } from './karachiModels.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Game Mode & State
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.matchDuration = 120; // 2 minutes
    this.timeLeft = this.matchDuration;
    this.isGameOver = false;
    this.isPaused = false;

    // Karachi Civic District Progression System (Leveling up via Civic Cleanse!)
    this.currentDistrictLevel = 1;
    this.districtClearing = false;
    this.districtEvils = [];
    this.districtTotal = 0;
    this.districtRemaining = 0;

    // Before & After Transformation Monuments and Mini-Map Tracker
    this.cleanedMonuments = [];
    this.recentCleaned = [];

    // Movement vectors
    this.moveVector = { x: 0, y: 0 };
    this.isBoosting = false;

    this.initThree();
    this.initScene();
    this.initHoles();
    this.initJoystick();
    this.initDistrictChallenges(getDistrictConfig(1));
    this.initUI();
    this.initAudioTriggers();

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

    // Camera - closer framing for intimate Karachi street view
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.5,
      500
    );
    this.camera.position.set(0, 11, 9.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

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
        this.moveVector.x = vx;
        this.moveVector.y = vz;
      },
      onEnd: () => {
        this.moveVector.x = 0;
        this.moveVector.y = 0;
      },
      onBoost: (boosting) => {
        this.isBoosting = boosting;
      }
    });
  }

  initUI() {
    this.ui = new UIManager({
      onSelectSkin: (skinName) => {
        this.player.setSkin(skinName);
      },
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
      onOpenEducationalQuiz: (category) => {
        this.pauseGame();
      },
      onResolveEducationalQuiz: (challenge) => {
        if (this.player) {
          this.player.addXP(challenge.rewardXP || 500);
          this.particles.createCelebrationConfetti(this.player.position, 45);
        }
        this.timeLeft += (challenge.rewardTime || 20);
        this.ui.showAnnouncement(`🌟 CIVIC HERO: +${challenge.rewardXP} XP & +${challenge.rewardTime}s BONUS!`, '#00e676');
      },
      onResumeGame: () => {
        this.resumeGame();
      },
      onPauseGame: () => {
        this.pauseGame();
      }
    });
  }

  pauseGame() {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.moveVector) {
      this.moveVector.x = 0;
      this.moveVector.y = 0;
    }
  }

  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.clock.getDelta(); // Reset clock delta so physics doesn't leap
    audio.playClick();
  }

  initAudioTriggers() {
    // Start music on first user interaction
    const startAudio = () => {
      audio.startMusic();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
  }

  restartGame() {
    this.timeLeft = this.matchDuration;
    this.isGameOver = false;

    // Reset Player
    const diff = DIFFICULTY_CONFIG[this.difficulty || 'kidsEasy'] || DIFFICULTY_CONFIG.kidsEasy;
    this.player.position.set(0, 0, 0);
    this.player.group.position.copy(this.player.position);
    this.player.level = 1;
    this.player.xp = 0;
    this.player.score = 0;
    this.player.radius = diff.startRadius;
    this.player.targetRadius = this.player.radius;
    this.player.swallowedCount = 0;
    this.player.politiciansDevoured = 0;
    this.player.turboTimer = 0;
    this.player.kills = 0;
    this.player.baseSpeed = 9.5;
    this.player.currentSpeed = 9.5;
    this.player.isAlive = true;
    this.player.group.visible = true;
    this.player.updateNameTag();

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

    // Re-generate city objects, civic evils, and food stalls
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
    this.particles.clear();
    if (this.cleanedMonuments) {
      this.cleanedMonuments.forEach(m => this.scene.remove(m));
      this.cleanedMonuments = [];
    }
    this.recentCleaned = [];
    this.initDistrictChallenges(getDistrictConfig(1));
    if (this.ui) this.ui.hideDistrictClearedModal();
  }

  initDistrictChallenges(config) {
    if (config && config.challenges && config.challenges.length > 0) {
      this.crisisChallenges = config.challenges.map(c => ({
        ...c,
        current: 0,
        completed: false
      }));
      this.currentCrisisIndex = 0;
    } else {
      this.crisisChallenges = [];
      this.currentCrisisIndex = 0;
    }
  }

  handleCrisisProgress(evilType) {
    if (!this.crisisChallenges || this.crisisChallenges.length === 0) return;
    const active = this.crisisChallenges[this.currentCrisisIndex];
    if (active && !active.completed) {
      if (active.evilType === evilType || (evilType === 'trash' && active.evilType === 'pothole')) {
        active.current++;
        if (active.current >= active.targetCount) {
          active.completed = true;
          audio.playChallengeSuccess();
          if (this.player) this.player.addXP(active.xpReward || 1000);
          this.ui.showCrisisCompleteBanner(active);
          this.timeLeft += 25;

          // Automatically pause & present educational civic challenge for this crisis
          setTimeout(() => {
            let quizCategory = 'water';
            if (active.evilType === 'vip') quizCategory = 'ambulance';
            else if (active.evilType === 'robber') quizCategory = 'safety';
            else if (active.evilType === 'tanker') quizCategory = 'water';
            else if (active.evilType === 'kunda') quizCategory = 'electricity';
            else if (active.evilType === 'pothole' || active.evilType === 'trash') quizCategory = 'cleanliness';

            this.ui.openEducationalQuiz(quizCategory);
          }, 1500);

          setTimeout(() => {
            if (this.currentCrisisIndex < this.crisisChallenges.length - 1) {
              this.currentCrisisIndex++;
              const nextCrisis = this.crisisChallenges[this.currentCrisisIndex];
              this.ui.showAnnouncement(`🚨 NEW CRISIS: ${nextCrisis.title}!`, '#ff9800');
            }
          }, 1400);
        }
      }
    }
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

  handleDistrictCleared() {
    if (this.districtClearing) return;
    this.districtClearing = true;

    audio.playDistrictClearedFanfare();
    this.particles.createCelebrationConfetti(this.player.position, 65);
    this.particles.createLevelUpShockwave(this.player.position, 16);

    const cfg = getDistrictConfig(this.currentDistrictLevel);
    const isFinalDistrict = this.currentDistrictLevel >= DISTRICT_CONFIGS.length;
    const nextCfg = getDistrictConfig(this.currentDistrictLevel + 1);

    // Apply District Rewards to Player
    this.player.addXP(cfg.bonusScore, (h) => {
      if (h.isPlayer) this.handlePlayerLevelUp(h);
    });
    this.timeLeft += cfg.timeBonus;
    this.player.targetRadius += cfg.holeRadiusBonus;
    this.player.baseSpeed += cfg.speedBonus;
    this.player.currentSpeed = this.player.baseSpeed;

    this.ui.showAnnouncement(
      `🏆 DISTRICT ${cfg.level} CLEARED! ${cfg.name.toUpperCase()} IS SAFE! (+${cfg.bonusScore} XP, +${cfg.timeBonus}s)`,
      '#ffd700'
    );

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
    this.currentDistrictLevel++;
    this.districtClearing = false;

    // Repopulate dynamic district evils for the new level
    const result = this.cityGen.populateDistrict(this.currentDistrictLevel);
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

    // Reset player position smoothly back to center crossroads and blast celebration
    this.player.position.set(0, 0, 0);
    this.player.group.position.copy(this.player.position);
    this.particles.createLevelUpShockwave(this.player.position, 18);
    this.particles.createCelebrationConfetti(this.player.position, 50);

    const cfg = getDistrictConfig(this.currentDistrictLevel);
    this.initDistrictChallenges(cfg);
    audio.playLevelUp();
    this.ui.showAnnouncement(
      `🚀 ENTERED DISTRICT ${cfg.level}: ${cfg.name.toUpperCase()} (${cfg.urdu})!`,
      '#00e5ff'
    );
  }

  updatePhysics(dt) {
    // Check Turbo boost (Button or Bun Kabab Spicy Chutney turbo boost)
    this.player.isBoosting = this.isBoosting || window.isBoostPressed || (this.player.turboTimer > 0);
    if (this.player.turboTimer > 0) {
      this.player.turboTimer -= dt;
    }
    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
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

    // Move Player across expanded 200m map
    if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
      this.player.move(this.moveVector.x, this.moveVector.y, dt, 96.0);
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
            this.ui.showAnnouncement("🏛️ BAB-E-KARACHI PORTAL! Northern City Boundary! 🇵🇰", "#ffd700");
          } else if (isNearEast) {
            this.ui.showAnnouncement("🚧 KMC HAZARD BARRIERS! Eastern Boundary Reached! ⚠️", "#ff9100");
          } else {
            this.ui.showAnnouncement("🧱 SADDAR HERITAGE WALL! Western Boundary Reached! 🏛️", "#ffd700");
          }
        }
      }
    }

    // Update Player & Bots
    this.holes.forEach(hole => {
      hole.update(dt);
      if (!hole.isPlayer) {
        hole.updateAI(dt, this.edibleObjects, this.holes);
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

    // Update Karachi Civic Evils: Fleeing bad guys, sparking K-Electric, and comical panic banter!
    for (let i = 0; i < this.badGuys.length; i++) {
      const bg = this.badGuys[i];
      if (bg.state === 'swallowed') continue;

      const bgMesh = bg.mesh;
      const bgPos = bgMesh.position;
      const ud = bgMesh.userData;

      // K-Electric Sparking live wires
      if (bg.evilType === 'ke' && ud && ud.sparkGroup) {
        ud.sparkGroup.children.forEach(sp => {
          sp.visible = Math.random() > 0.35;
        });
      }

      // If mobile bad guy (politician, robber, gutka, chinacutting, bhatta, onewheeler, tanker, vip)
      const isMobile = bg.evilType === 'politician' || bg.evilType === 'robber' ||
                       bg.evilType === 'gutka' || bg.evilType === 'chinacutting' ||
                       bg.evilType === 'bhatta' || bg.evilType === 'onewheeler' ||
                       bg.evilType === 'tanker' || bg.evilType === 'vip';

      if (isMobile) {
        let nearestHole = null;
        let minHoleDist = Infinity;

        for (let h = 0; h < this.holes.length; h++) {
          const hole = this.holes[h];
          if (!hole.isAlive) continue;
          const d = hole.position.distanceTo(bgPos);
          if (d < minHoleDist) {
            minHoleDist = d;
            nearestHole = hole;
          }
        }

        // Bad guy panics and tries to escape when hole gets near!
        if (nearestHole && minHoleDist < 18 && bg.state === 'idle') {
          const fleeX = bgPos.x - nearestHole.position.x;
          const fleeZ = bgPos.z - nearestHole.position.z;
          const len = Math.sqrt(fleeX * fleeX + fleeZ * fleeZ);

          if (len > 0.1) {
            const normX = fleeX / len;
            const normZ = fleeZ / len;
            // Relaxed fleeing speed so player (speed ~9.5) can chase, observe, and read!
            const fleeSpeed = ud?.runSpeed || (bg.evilType === 'vip' ? 5.8 : bg.evilType === 'tanker' ? 5.2 : 4.4);
            bgPos.x += normX * dt * fleeSpeed;
            bgPos.z += normZ * dt * fleeSpeed;
            bgMesh.rotation.y = Math.atan2(normX, normZ);
          }

          // Flailing limb panic animations
          if (ud && ud.legL && ud.legR) {
            ud.runCycle = (ud.runCycle || 0) + dt * 20;
            ud.legL.rotation.x = Math.sin(ud.runCycle) * 0.95;
            ud.legR.rotation.x = -Math.sin(ud.runCycle) * 0.95;
            if (ud.armL && ud.armR) {
              ud.armL.rotation.z = 1.3 + Math.sin(ud.runCycle) * 0.55;
              ud.armR.rotation.z = -1.3 - Math.sin(ud.runCycle) * 0.55;
            }
          }

          // Escape banter on speech bubble
          if (minHoleDist < 14 && !bg.hasPanickedEscape) {
            bg.hasPanickedEscape = true;
            const escapeLines = {
              politician: "Bhago! Anti-Corruption aa gaya!",
              robber: "Abey bhaago, Gutter Hero aa gaya!",
              gutka: "Mera mawa chhalia gir gaya!",
              chinacutting: "Footpath chorr ke bhaago!",
              bhatta: "Extortion parchi bacha lo!",
              tanker: "15,000 ka tanker bhaag raha hai!",
              vip: "VIP Protocol ko rasta do!",
              onewheeler: "One-wheeling se bhaago!"
            };
            const line = escapeLines[bg.evilType] || "Bhaago! Gutter aa gaya!";
            if (ud && ud.drawBubble) {
              ud.drawBubble(line);
            }
          }

          bgPos.x = THREE.MathUtils.clamp(bgPos.x, -94, 94);
          bgPos.z = THREE.MathUtils.clamp(bgPos.z, -94, 94);
        }
      }
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

    // 4. Animate Glowing Evil Target Decals (Pulse rings and bob overhead billboards)
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

    // Edible Objects Suction & Collision (Ultra-fast Bounding Box check for 60 FPS)
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

      // If bad object is currently idle, check for nearest hole that can eat it
      if (obj.state === 'idle') {
        for (let h = 0; h < this.holes.length; h++) {
          const hole = this.holes[h];
          if (!hole.isAlive) continue;

          // Can hole swallow this tier?
          if (obj.tier <= hole.level) {
            const dx = hole.position.x - objPos.x;
            const dz = hole.position.z - objPos.z;
            const r = hole.radius;

            // Fast bounding box reject first
            if (Math.abs(dx) <= r && Math.abs(dz) <= r && (dx * dx + dz * dz < r * r)) {
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

        // Gravitational magnetic suction towards hole center
        objPos.x += (hole.position.x - objPos.x) * dt * (pullSpeed * 0.65);
        objPos.z += (hole.position.z - objPos.z) * dt * (pullSpeed * 0.65);

        // Dramatic comic struggle wobble & tilt
        obj.mesh.rotation.y += dt * 8.0;
        obj.mesh.rotation.z = Math.sin(obj.suctionProgress * 18.0) * 0.4;
        objPos.y -= dt * 2.2;

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

          // Civic Cleanser System: Devouring Karachi evils and mafias!
          if (hole.isPlayer && obj.isBadGuy) {
            this.civicCleansed++;
            this.districtRemaining = this.districtEvils.filter(b => b.state !== 'swallowed').length;

            // Trigger Uplifting Civic Cleanse Audio & Particle Transformation
            audio.playCleanseTransformation();
            this.particles.createCleanseSparkleBurst(hole.position, 35);

            // Spawn the "AFTER" Cleaned Monument right where the bad guy was!
            const replacement = KarachiModels.createCleanedReplacement(obj.evilType);
            replacement.position.set(objPos.x, -0.6, objPos.z);
            this.scene.add(replacement);
            this.cleanedMonuments.push(replacement);

            // Track recent cleaned location for the Mini-Map
            this.recentCleaned.push({
              x: objPos.x,
              z: objPos.z,
              time: performance.now()
            });

            // Before / After descriptions
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

            const ba = beforeAfterMap[obj.evilType] || { before: "Civic Crime", after: "Karachi Restored!" };
            this.ui.showBeforeAfterToast(ba.before, ba.after);

            if (this.districtRemaining === 0 && !this.districtClearing) {
              this.handleDistrictCleared();
            }

            const pct = Math.min(100, Math.round((this.civicCleansed / Math.max(1, this.civicTotal)) * 100));

            // Trigger Frenzy Mode when 100% cleansed
            if (pct >= 100 && !this.frenzyTriggered) {
              this.frenzyTriggered = true;
              this.frenzyTimer = 18.0;
              audio.playCrowdCheer();
              this.particles.createLevelUpShockwave(hole.position, 12);
              this.ui.showAnnouncement("🌟 KARACHI HERO FRENZY! قائد کا خواب پورا ہو گیا! 2X SCORE! 🌟", "#ffd700");
            }

            // Specialized audio, particles & announcements per evil type
            if (obj.evilType === 'ke') {
              this.particles.createSwallowBurst(hole.position, 3, 30);
              audio.playKESpark();
              this.ui.showAnnouncement(`⚡ K-ELECTRIC KUNDA CHOPPED! LOAD SHEDDING CLEARED! (+${points} XP)`, '#ffea00');
            } else if (obj.evilType === 'chinacutting') {
              this.particles.createSwallowBurst(hole.position, 2, 25);
              audio.playChinaCuttingDemolish();
              this.ui.showAnnouncement(`📐 CHINA CUTTING CANCELLED! FOOTPATH RECLAIMED! (+${points} XP)`, '#ff9800');
            } else if (obj.evilType === 'bhatta') {
              this.particles.createMoneyBurst(hole.position, 35);
              audio.playBhattaConfiscate();
              this.ui.showAnnouncement(`📜 BHATTA PARCHI CONFISCATED! BAZAAR SAVED! (+${points} XP)`, '#e040fb');
            } else if (obj.evilType === 'onewheeler') {
              this.particles.createSwallowBurst(hole.position, 2, 20);
              audio.playOneWheelerImpound();
              this.ui.showAnnouncement(`🏍️ RECKLESS ONE-WHEELER IMPOUNDED! STREETS SAFE! (+${points} XP)`, '#00e5ff');
            } else if (obj.evilType === 'tanker') {
              this.particles.createFreshwaterGeyser(hole.position, 55);
              this.particles.createCelebrationConfetti(hole.position, 40);
              audio.playWaterTankerDevour();
              audio.playFreshwaterEruption();

              // 1. Remove illegal suction hoses & booster motor
              const hoseGroup = obj.mesh.userData?.hoseGroup;
              if (hoseGroup && hoseGroup.parent) {
                hoseGroup.parent.remove(hoseGroup);
              }

              // 2. Animate Water Streams rushing to nearby dry homes & restore water!
              const dryHomes = obj.mesh.userData?.dryHomes;
              if (dryHomes && dryHomes.length > 0) {
                dryHomes.forEach((home, hIdx) => {
                  home.userData.isRestored = true;
                  if (home.userData.updateWaterBillboard) {
                    home.userData.updateWaterBillboard(true);
                  }

                  // Water pipeline stream flowing from hole to house
                  this.particles.createWaterFlowStream(hole.position, home.position, 32);

                  // Cascading overflow from rooftop water tank
                  if (home.userData.rooftopTank) {
                    const tankWorldPos = new THREE.Vector3();
                    home.userData.rooftopTank.getWorldPosition(tankWorldPos);
                    setTimeout(() => {
                      this.particles.createRooftopWaterOverflow(tankWorldPos, 45);
                      this.particles.createHeartBurst(tankWorldPos, 16);
                    }, 250);
                  }

                  // Resident on balcony celebrates
                  const res = home.userData.resident;
                  if (res && res.userData && res.userData.drawBubble) {
                    res.userData.drawBubble("🌊 پانی آگیا! نلکے بھر گئے! شکریہ گٹر ہیرو!", true);
                    this.particles.createHeartBurst(res.position, 14);
                  }
                });
              }

              // 3. Trigger Joyous Thirsty Residents with full water drums!
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
              this.ui.showAnnouncement(`🚰 TANKER MAFIA BUSTED! TAP WATER RESTORED TO HOMES! (+${points} XP)`, '#00e5ff');
            } else if (obj.evilType === 'vip') {
              this.particles.createCelebrationConfetti(hole.position, 45);
              this.particles.createSwallowBurst(hole.position, 4, 30);
              audio.playVIPHooter();
              audio.playGutterSplash();
              audio.playTrafficFreedCelebration();

              // Trigger Joyous Stuck Traffic Celebration!
              const stuckVehicles = obj.mesh.userData?.stuckVehicles;
              if (stuckVehicles && stuckVehicles.length > 0) {
                stuckVehicles.forEach((v, vIdx) => {
                  v.userData.isFreed = true;
                  v.userData.freedSpeed = 5.5 + Math.random() * 2.5;
                  if (v.userData.drawTrafficBubble) {
                    const happyPhrases = [
                      "🥳 TRAFFIC FREED! VIP culture murdabad! Shukriya Hero!",
                      "🏥 Hospital ka rasta khul gaya! Zindabad Gutter Hero!",
                      "🚗 Wah Gutter Hero wah! Ab hum time pe pohanchengy!"
                    ];
                    v.userData.drawTrafficBubble(happyPhrases[vIdx % happyPhrases.length], true);
                  }
                  this.particles.createCelebrationConfetti(v.position, 25);
                });
              }
              this.ui.showAnnouncement(`🚨 VIP CONVOY SMASHED! CITIZENS FREED FROM TRAFFIC JAM! (+${points} XP)`, '#00e5ff');
            } else if (obj.evilType === 'gutka') {
              this.particles.createSwallowBurst(hole.position, 2, 20);
              audio.playGutterSplash();
              this.ui.showAnnouncement(`🛑 GUTKA MAFIA CLEARED! STREETS CLEANSED! (+${points} XP)`, '#e040fb');
            } else if (obj.evilType === 'pothole') {
              this.particles.createSwallowBurst(hole.position, 1, 15);
              audio.playPotholeDevour();
              this.ui.showAnnouncement(`🛠️ ROAD POTHOLE REPAIRED! (+${points} XP)`, '#ff9100');
            } else if (obj.evilType === 'robber') {
              this.particles.createMoneyBurst(hole.position, 40);
              this.particles.createCelebrationConfetti(hole.position, 40);
              this.particles.createSwallowBurst(hole.position, 3, 25);
              audio.playRobberDevour();
              audio.playGutterSplash();
              audio.playRescuedCitizenCheer();

              // Trigger Joyous Rescued Citizen Celebration!
              const victim = obj.mesh.userData?.victimCitizen;
              if (victim) {
                victim.userData.isRescued = true;
                if (victim.userData.drawBubble) {
                  victim.userData.drawBubble("🎉 ALLAH KA SHUKAR! Mera mobile bach gaya! Hero zindabad!", true);
                }
                this.particles.createCelebrationConfetti(victim.position, 35);
                this.particles.createHeartBurst(victim.position, 16);
              }
              this.ui.showAnnouncement(`🔫 DAKOO DEVOURED! CITIZEN RESCUED WITH PHONE! (+${points} XP)`, '#00e676');
            } else if (obj.evilType === 'politician') {
              this.particles.createMoneyBurst(hole.position, 55);
              this.particles.createCelebrationConfetti(hole.position, 35);
              audio.playPoliticianSwallow();
              audio.playGutterSplash();
              audio.playRescuedCitizenCheer();
              this.player.politiciansDevoured = (this.player.politiciansDevoured || 0) + 1;
              const pName = obj.mesh.userData?.name || "VIP Politician";
              const quote = obj.mesh.userData?.quote || "Mujhe kyun nikala?!";
              this.ui.showAnnouncement(`💰 DEVOURED ${pName.toUpperCase()}! AWAM KA PAISA WAPIS! (+${points} XP)`, '#ffd700');
            } else if (obj.evilType === 'trash') {
              this.particles.createSwallowBurst(hole.position, 1, 10);
              audio.playGutterSplash();
              audio.playSwallow(1);
            }

            // Advance active Civic Crisis Challenge!
            this.handleCrisisProgress(obj.evilType);
          } else {
            this.particles.createSwallowBurst(hole.position, obj.tier);
            if (hole.isPlayer) {
              audio.playGutterSplash();
              audio.playSwallow(obj.tier);
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
        "Nahi! Mere Offshore Swiss Accounts!",
        "Mujhe kyun nikala?! Resign karta hoon!",
        "Tum jantay nahi mera baap MNA hai!",
        "VIP Protocol doob gaya! Bachao!"
      ],
      robber: [
        "Aray bhai mobile wapis le lo!",
        "Mera chori ka CD-70 chorr do!",
        "Pistol nakli tha sarkar! Maaf kardo!",
        "Ghalti ho gayi sarkar! Tauba!"
      ],
      tanker: [
        "15 hazar ka bill maaf kar dunga!",
        "Karachi ka sara pani free!",
        "Tanker gutter mein doob raha hai!"
      ],
      vip: [
        "HATO HATO! VIP gutter mein gir raha hai!",
        "Sirens band kar do! Bachao!",
        "Protocol security squad kidhar hai?!"
      ],
      gutka: [
        "Mawa thook raha hoon bacha lo!",
        "Aainda chhalia nahi bechunga!",
        "Deewaron pe laal rang nahi thookunga!"
      ],
      ke: [
        "ZZZZT! 14 ghantay load shedding maaf!",
        "Transformer phat gaya! Sparking band!",
        "Kunda taar cut gayi! Light aa gayi!"
      ],
      chinacutting: [
        "Footpath ka plot le lo free mein!",
        "Registry farzi thi meri bhai!",
        "Gutter mein china cutting nahi hoti!"
      ],
      bhatta: [
        "Bhatta ki 50,000 parchi wapis le lo!",
        "Shopkeeper bhai maaf kar do!",
        "Aainda bhatta nahi mangunga!"
      ],
      onewheeler: [
        "Mera 70cc silencer doob gaya!",
        "One-wheeling band bhai!",
        "Brake nahi lag rahi thi!"
      ],
      pothole: [
        "Khadda saaf! Smooth road ban gayi!",
        "KW&SB leak pipeline band!"
      ],
      trash: [
        "Kachra saaf! Clean Karachi!"
      ]
    };

    const list = screams[type] || ["Bachaooo! Gutter mein gir gaya!"];
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

    // Dramatic, intimate action camera: characters, crimes, cars, and facial expressions are crystal clear!
    // Much closer, lower action angle so player sees exactly who is getting devoured and how citizens celebrate
    const targetHeight = 4.6 + this.player.radius * 1.05;
    const targetDistZ = 4.8 + this.player.radius * 1.05;

    const targetCamX = this.player.position.x;
    const targetCamY = targetHeight;
    const targetCamZ = this.player.position.z + targetDistZ;

    // Responsive smooth camera follow
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 6.0);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 5.0);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, dt * 6.0);

    const lookTarget = new THREE.Vector3(
      this.player.position.x,
      1.15,
      this.player.position.z - 1.8
    );
    this.camera.lookAt(lookTarget);

    // =========================================================
    // Dynamic Building Transparency: Never let any building hide the hole!
    // Buildings between the camera and player become translucent ghost silhouettes
    // =========================================================
    if (this.buildings && this.buildings.length > 0) {
      const camPos = this.camera.position;
      const playerPos = this.player.position;

      const segX = playerPos.x - camPos.x;
      const segZ = playerPos.z - camPos.z;
      const segLenSq = segX * segX + segZ * segZ;

      if (segLenSq > 0.01) {
        for (let b = 0; b < this.buildings.length; b++) {
          const bld = this.buildings[b];
          if (bld.state === 'swallowed') continue;

          const bMesh = bld.mesh;
          const bPos = bMesh.position;

          const bx = bPos.x - camPos.x;
          const bz = bPos.z - camPos.z;
          const t = (bx * segX + bz * segZ) / segLenSq;

          let isOccluding = false;
          if (t > 0.05 && t < 0.95) {
            const projX = camPos.x + segX * t;
            const projZ = camPos.z + segZ * t;
            const dX = bPos.x - projX;
            const dZ = bPos.z - projZ;
            const distToPath = Math.sqrt(dX * dX + dZ * dZ);

            if (distToPath < (bld.radius * 0.9 || 5.0)) {
              isOccluding = true;
            }
          }

          if (isOccluding && !bld.isGhost) {
            bld.isGhost = true;
            bMesh.traverse(child => {
              if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(m => { m.transparent = true; m.opacity = 0.28; });
                } else {
                  child.material.transparent = true;
                  child.material.opacity = 0.28;
                }
              }
            });
          } else if (!isOccluding && bld.isGhost) {
            bld.isGhost = false;
            bMesh.traverse(child => {
              if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(m => { m.opacity = 1.0; m.transparent = false; });
                } else {
                  child.material.opacity = 1.0;
                  child.material.transparent = false;
                }
              }
            });
          }
        }
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
    if (this.gameMode === 'battleRoyale' && !this.isGameOver) {
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
    this.ui.showGameOver({
      rankedHoles: ranked,
      player: this.player
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isGameOver && !this.isPaused) {
      this.updatePhysics(dt);
      this.updateMatchTimer(dt);
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

    // Calculate nearest active crimes & evils for HUD Radar Compass
    const playerPos = this.player ? this.player.position : new THREE.Vector3();
    const nearestEvils = this.edibleObjects
      .filter(o => o.isBadGuy && o.state !== 'swallowed')
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
    const activeEvils = this.districtEvils.filter(b => b.state !== 'swallowed');
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
      ke: { label: 'K-Electric Kunda', icon: '⚡' },
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

    // Update HUD with Civic Cleanser progress, Hero Frenzy status, District Mission, Active Crisis & Live Radar
    const ranked = [...this.holes].sort((a, b) => b.score - a.score);
    const civicPct = (this.civicCleansed / Math.max(1, this.civicTotal)) * 100;
    this.ui.updateHUD({
      player: this.player,
      timeLeft: this.timeLeft,
      rankedHoles: ranked,
      gameMode: this.gameMode,
      civicPercent: civicPct,
      frenzyActive: this.frenzyTimer > 0,
      nearestEvils,
      districtConfig,
      districtRemaining: this.districtRemaining,
      districtTotal: this.districtTotal,
      targetBreakdown,
      districtEvils: this.districtEvils,
      recentCleaned: this.recentCleaned,
      activeCrisis
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
