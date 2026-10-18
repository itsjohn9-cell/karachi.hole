import * as THREE from 'three';
import { CityGenerator } from './cityGenerator.js';
import { Hole, LEVEL_CONFIG } from './hole.js';
import { DISTRICT_CONFIGS, getDistrictConfig } from './districts.js';
import { VirtualJoystick } from './joystick.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';
import { KarachiModels } from './karachiModels.js';
import { saveManager } from './saveManager.js';
import { CITIZEN_DIALOGUES } from './dialogueSystem.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Game Mode & State
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.matchDuration = 240; // 4 minutes match duration
    this.timeLeft = this.matchDuration;
    this.isGameStarted = false;
    this.isGameOver = false;
    this.isPaused = false;

    // Karachi Civic District Progression System (Leveling up via Civic Cleanse!)
    this.currentDistrictLevel = 1;
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

    this.initThree();
    this.initScene();
    this.initHoles();
    this.initJoystick();
    this.initDistrictChallenges(getDistrictConfig(1));
    this.createNavigationGuide();
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

    // Camera - Subway Surfers / GTA street-level chase perspective (Zoomed out for wide urban visibility)
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.3,
      500
    );
    this.camera.position.set(0, 3.4, 5.8);
    this.camera.lookAt(0, 1.5, -9.5);

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
      onStartGame: ({ playerName, ageTier, avatarId, districtLevel }) => {
        if (this.player) {
          this.player.name = playerName || "Karachi Hero";
          if (avatarId) {
            this.player.setAvatar(avatarId);
          }
          this.player.updateNameTag();
        }
        this.difficulty = ageTier === 'kids' ? 'kidsEasy' : 'classic';
        const targetLevel = districtLevel ? parseInt(districtLevel) : 1;
        if (targetLevel && targetLevel !== this.currentDistrictLevel) {
          this.loadDistrictLevel(targetLevel);
        } else {
          this.isGameStarted = true;
          this.clock.getDelta();
          audio.startMusic();
          this.ui.showAnnouncement(`🚀 PATROL STARTED: WELCOME ${this.player.name.toUpperCase()}!`, '#00e5ff');
        }
      },
      onContinueCareer: (saveData) => {
        this.loadCareerSave(saveData);
      },
      onSelectDistrict: (level) => {
        this.loadDistrictLevel(level);
      },
      onJump: () => {
        this.performJump();
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
    this.pauseGame();
    this.isGameStarted = false;
    audio.playClick();
    if (this.ui) {
      this.ui.returnToMainMenu();
    }
    // Also save current career state
    try {
      if (typeof saveManager !== 'undefined' && saveManager.save) {
        saveManager.save();
      }
    } catch (e) {}
  }

  /**
   * Agile Street Parkour Traversal Jump Mechanic
   */
  performJump() {
    if (!this.player || !this.isGameStarted || this.isPaused) return;
    const jumped = this.player.jump(6.2);
    if (jumped) {
      audio.playJump();
      this.particles.createDevourSparkles(this.player.position, 6, 0x00e5ff);
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
    if (!this.isGameStarted) return;
    this.pauseGame();

    const dConfig = DISTRICT_CONFIGS[this.currentDistrictLevel] || DISTRICT_CONFIGS[1];
    const savedDistrict = (saveManager.get().districts && saveManager.get().districts[this.currentDistrictLevel]) || {};

    const districtData = {
      name: dConfig.name,
      subtitle: dConfig.subtitle,
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
      this.player.level = Math.max(1, saveData.player.level || 1);
      this.player.xp = saveData.player.careerXP || 0;
      this.player.score = saveData.player.careerXP || 0;
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
    this.player.baseSpeed = 13.5;
    this.player.currentSpeed = 13.5;
    this.player.isAlive = true;
    this.player.group.visible = true;
    this.player.updateNameTag();
    this.camera.position.set(0, 6.2 + this.player.radius * 1.15, 6.8 + this.player.radius * 1.15);
    this.camera.lookAt(0, 1.2, -4.5);

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
          saveManager.recordMissionCompleted(this.currentDistrictLevel, mission.id, { [mission.evilType]: 'restored' });
          const gaugeDeltas = { cleanliness: 4, infrastructure: 4, trafficFlow: 4, safety: 4 };
          if (mission.evilType === 'tanker') gaugeDeltas.infrastructure += 10;
          if (mission.evilType === 'pothole') gaugeDeltas.infrastructure += 8;
          if (mission.evilType === 'vip') gaugeDeltas.trafficFlow += 12;
          if (mission.evilType === 'robber') gaugeDeltas.safety += 12;
          saveManager.updateDistrictGauges(this.currentDistrictLevel, gaugeDeltas);
          saveManager.save();

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

  handleDistrictCleared() {
    if (this.districtClearing) return;
    this.districtClearing = true;

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

  loadDistrictLevel(targetLevel) {
    this.currentDistrictLevel = Math.max(1, targetLevel);
    this.districtClearing = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.isGameStarted = true;
    this.timeLeft = this.matchDuration || 240.0;
    this.frenzyTriggered = false;
    this.frenzyTimer = 0;

    if (this.ui) {
      this.ui.hideGameOverModal();
      this.ui.hideDistrictClearedModal();
    }

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
    this.player.group.position.set(0, 0, 0);
    this.player.facingAngle = Math.PI;
    this.player.targetRotationY = Math.PI;
    this.player.group.rotation.y = Math.PI;
    this.moveVector = { x: 0, y: 0 };
    if (!isFinite(this.player.targetRadius) || this.player.targetRadius <= 0) {
      this.player.targetRadius = 1.6;
    }
    if (!isFinite(this.player.baseSpeed) || this.player.baseSpeed <= 0) {
      this.player.baseSpeed = 13.5;
    }
    this.player.currentSpeed = this.player.baseSpeed;

    // Reset bots to distant perimeter coordinates so they never collide with new district evils
    const botPositions = [[-45, 15], [-20, 45], [45, 45], [-55, 30], [45, -35]];
    this.holes.forEach((h, idx) => {
      if (h.isPlayer) return;
      const pos = botPositions[idx - 1] || [0, 0];
      h.position.set(pos[0], 0, pos[1]);
      h.group.position.copy(h.position);
      h.aiTarget = null;
      h.aiTimer = 0;
    });

    // Explicitly reset camera position and orientation behind player facing north down avenue
    this.camAngle = Math.PI;
    this.cameraPivot = null;
    this.backwardBaseAngle = null;
    this.smoothGazeLead = 0;
    this.cameraBankX = 0;
    this.camera.position.set(0, 2.35, 4.4);
    this.camera.lookAt(0, 1.35, -7.0);
    this.camera.updateMatrixWorld(true);

    this.particles.createLevelUpShockwave(this.player.position, 18);
    this.particles.createCelebrationConfetti(this.player.position, 50);

    const cfg = getDistrictConfig(this.currentDistrictLevel);
    this.initDistrictChallenges(cfg);
    audio.playLevelUp();
    this.ui.showAnnouncement(
      `🚀 ENTERED DISTRICT ${cfg.level}: ${cfg.name.toUpperCase()} (${cfg.urdu})!`,
      '#00e5ff'
    );

    // Save district progression to local storage
    saveManager.unlockDistrict(this.currentDistrictLevel);
    saveManager.addPlayerXP(400);
    saveManager.save();
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

    // Camera-relative street movement (Up is always forward into screen, Left is always left)
    if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
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

      if (isMobile && this.player && this.player.isAlive) {
        const playerDist = this.player.position.distanceTo(bgPos);
        const alertRange = (bg.evilType === 'vip' || bg.evilType === 'tanker' || bg.evilType === 'onewheeler') ? 26.0 : 20.0;

        // GTA-Style Active Pursuit State when Hero approaches
        if (playerDist < alertRange && bg.state === 'idle') {
          bg.isAlerted = true;
          const fleeX = bgPos.x - this.player.position.x;
          const fleeZ = bgPos.z - this.player.position.z;
          const len = Math.hypot(fleeX, fleeZ);

          if (len > 0.1) {
            let normX = fleeX / len;
            let normZ = fleeZ / len;

            // Energetic, challenging GTA-style getaway speeds
            const speedMap = {
              onewheeler: 10.4,
              vip: 9.6,
              tanker: 8.5,
              robber: 8.2,
              bhatta: 7.8,
              politician: 7.4
            };
            const fleeSpeed = ud?.runSpeed || speedMap[bg.evilType] || 7.2;

            // Smart Corridor Navigation: If approaching a building within 3.5m, steer 90 deg down an open avenue!
            const obstacles = this.cityGen?.obstacles || [];
            const checkDist = 3.5;
            let forwardBlocked = false;
            const lookX = bgPos.x + normX * checkDist;
            const lookZ = bgPos.z + normZ * checkDist;

            for (let o = 0; o < obstacles.length; o++) {
              const obs = obstacles[o];
              if (!obs || !obs.isBox) continue;
              if (lookX > obs.minX - 1.2 && lookX < obs.maxX + 1.2 && lookZ > obs.minZ - 1.2 && lookZ < obs.maxZ + 1.2) {
                forwardBlocked = true;
                break;
              }
            }

            if (forwardBlocked) {
              // Evasively turn down the cross-street avenue
              const altX = -normZ;
              const altZ = normX;
              normX = altX;
              normZ = altZ;
            }

            // Subtle lateral weaving for agile runners & racers
            const weave = (bg.evilType === 'onewheeler' || bg.evilType === 'robber') ? Math.sin(nowTime * 4.5 + i) * 0.25 : 0;
            const finalDirX = normX + (-normZ) * weave;
            const finalDirZ = normZ + (normX) * weave;
            const finalLen = Math.hypot(finalDirX, finalDirZ) || 1.0;

            // Proximity speed surge: if hero is breathing down their neck (<8m), they hit the gas / sprint frantically!
            const proximitySurge = (playerDist < 8.0) ? 1.25 : 1.0;
            const effectiveFleeSpeed = fleeSpeed * proximitySurge;

            let nextX = THREE.MathUtils.clamp(bgPos.x + (finalDirX / finalLen) * dt * effectiveFleeSpeed, -92, 92);
            let nextZ = THREE.MathUtils.clamp(bgPos.z + (finalDirZ / finalLen) * dt * effectiveFleeSpeed, -92, 92);

            // Wall slide collision guard
            const pad = 1.4;
            for (let o = 0; o < obstacles.length; o++) {
              const obs = obstacles[o];
              if (!obs || !obs.isBox) continue;
              if (nextX > obs.minX - pad && nextX < obs.maxX + pad && nextZ > obs.minZ - pad && nextZ < obs.maxZ + pad) {
                if (bgPos.x <= obs.minX - pad || bgPos.x >= obs.maxX + pad) nextX = bgPos.x;
                if (bgPos.z <= obs.minZ - pad || bgPos.z >= obs.maxZ + pad) nextZ = bgPos.z;
              }
            }

            bgPos.x = nextX;
            bgPos.z = nextZ;
            bgMesh.rotation.y = Math.atan2(finalDirX, finalDirZ);

            // Vehicle animations & stunts
            if (bg.evilType === 'onewheeler') {
              bgMesh.rotation.x = -0.32; // Wheelie!
            }

            // Tire skid smoke puffs as fleeing vehicles peel out down the road
            if ((bg.evilType === 'vip' || bg.evilType === 'tanker' || bg.evilType === 'onewheeler') && Math.random() < 0.28) {
              this.particles.createSkidSmoke(bgPos, 3);
            }
          }

          // Flailing limb panic animations for human runners
          if (ud && ud.legL && ud.legR) {
            const panicMult = (playerDist < 8.0) ? 1.4 : 1.0;
            ud.runCycle = (ud.runCycle || 0) + dt * 24 * panicMult;
            ud.legL.rotation.x = Math.sin(ud.runCycle) * 1.1;
            ud.legR.rotation.x = -Math.sin(ud.runCycle) * 1.1;
            if (ud.armL && ud.armR) {
              ud.armL.rotation.z = 1.4 + Math.sin(ud.runCycle) * 0.6;
              ud.armR.rotation.z = -1.4 - Math.sin(ud.runCycle) * 0.6;
            }
          }

          // Dynamic GTA escape speech bubble & audio alert
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

      // District Evils and Bad Guys: Must ONLY be resolved by the human player via active hero intervention!
      // CRITICAL USER REQUIREMENT: Player must be DIRECTLY ON TOP of the issue and dwell for animation duration to resolve it.
      if (obj.isDistrictEvil || obj.isBadGuy) {
        if (obj.state === 'idle' && this.player && this.player.isAlive) {
          const dx = this.player.position.x - objPos.x;
          const dz = this.player.position.z - objPos.z;
          const distSq = dx * dx + dz * dz;

          // Must be directly ON TOP of the object (inside player hole opening)
          const onTopThreshold = Math.max(1.1, this.player.radius * 0.88);
          const isOnTop = (distSq <= onTopThreshold * onTopThreshold);

          if (isOnTop) {
            activeResolvingThreat = true;
            if (obj.resolveTimer === undefined || obj.resolveTimer === null) {
              obj.resolveTimer = 0;
              obj.baseY = (obj.mesh && obj.mesh.position) ? obj.mesh.position.y : objPos.y;
              if (obj.mesh && obj.mesh.scale) {
                obj.baseScaleY = obj.mesh.scale.y;
              }
            }

            const REQUIRED_RESOLVE_TIME = 1.5; // ~1.5 seconds active dwell
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
            if (!obj.lastHaptic || performance.now() - obj.lastHaptic > 320) {
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
            // Player moved off the object: decay resolve timer
            if (obj.resolveTimer && obj.resolveTimer > 0) {
              obj.resolveTimer = Math.max(0, obj.resolveTimer - dt * 3.5);
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
            const captureRadius = hole.radius + Math.max(1.2, (obj.radius || 1.2) * 0.85);

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
      this.cameraPivot.lerp(this.player.position, pivotLerp);
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

    // Camera orbit position placed strictly at distance camDist behind smoothed cameraPivot
    const baseCamX = this.cameraPivot.x - Math.sin(this.camAngle) * camDist;
    const baseCamY = Math.max(1.85, (this.cameraPivot.y || 0) + camHeight);
    const baseCamZ = this.cameraPivot.z - Math.cos(this.camAngle) * camDist;
    this.camera.position.set(baseCamX, baseCamY, baseCamZ);

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
    this.camera.lookAt(targetLookX, targetLookY, targetLookZ);

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

  animate() {
    requestAnimationFrame(this.animate);

    try {
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
          missions: this.crisisChallenges
        });
      }
    } catch (e) {
      console.error('Error during animate loop:', e);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});

