import * as THREE from 'three';
import { CityGenerator } from './cityGenerator.js';
import { Hole, LEVEL_CONFIG } from './hole.js';
import { VirtualJoystick } from './joystick.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';
import { audio } from './audio.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Game Mode & State
    this.gameMode = 'battleRoyale'; // 'battleRoyale' or 'sandbox'
    this.matchDuration = 120; // 2 minutes
    this.timeLeft = this.matchDuration;
    this.isGameOver = false;

    // Movement vectors
    this.moveVector = { x: 0, y: 0 };
    this.isBoosting = false;

    this.initThree();
    this.initScene();
    this.initHoles();
    this.initJoystick();
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

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.5,
      500
    );
    this.camera.position.set(0, 24, 20);

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
    this.edibleObjects = this.cityGen.generateCity();
  }

  initHoles() {
    this.holes = [];

    // Player Hole
    this.player = new Hole({
      scene: this.scene,
      name: "You (Karachi King)",
      isPlayer: true,
      skin: 'truckArt',
      initialPos: { x: 0, z: -15 },
      color: 0x00e5ff
    });
    this.holes.push(this.player);

    // 5 Intelligent AI Bots with Karachi Personalities
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
        color: cfg.color
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
      }
    });
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
    this.player.position.set(0, 0, -15);
    this.player.group.position.copy(this.player.position);
    this.player.level = 1;
    this.player.xp = 0;
    this.player.score = 0;
    this.player.radius = LEVEL_CONFIG[0].radius;
    this.player.targetRadius = this.player.radius;
    this.player.swallowedCount = 0;
    this.player.kills = 0;
    this.player.isAlive = true;
    this.player.group.visible = true;
    this.player.updateNameTag();

    // Reset Bots
    const botPositions = [[-45, 15], [-20, 45], [45, 45], [-55, 30], [45, -35]];
    this.holes.forEach((h, idx) => {
      if (h.isPlayer) return;
      const pos = botPositions[idx - 1] || [0, 0];
      h.position.set(pos[0], 0, pos[1]);
      h.group.position.copy(h.position);
      h.level = 1;
      h.xp = 0;
      h.score = 0;
      h.radius = LEVEL_CONFIG[0].radius;
      h.targetRadius = h.radius;
      h.swallowedCount = 0;
      h.kills = 0;
      h.isAlive = true;
      h.group.visible = true;
      h.updateNameTag();
    });

    // Re-generate city objects
    this.edibleObjects.forEach(obj => {
      this.scene.remove(obj.mesh);
    });
    this.edibleObjects = this.cityGen.generateCity();
    this.particles.clear();
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

  updatePhysics(dt) {
    // Check Turbo boost
    this.player.isBoosting = this.isBoosting || window.isBoostPressed;

    // Move Player
    if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
      this.player.move(this.moveVector.x, this.moveVector.y, dt, 110);
    }

    // Update Player & Bots
    this.holes.forEach(hole => {
      hole.update(dt);
      if (!hole.isPlayer) {
        hole.updateAI(dt, this.edibleObjects, this.holes);
      }
    });

    // Hole vs Hole Swallowing Interactions
    for (let i = 0; i < this.holes.length; i++) {
      for (let j = 0; j < this.holes.length; j++) {
        if (i === j) continue;
        const hunter = this.holes[i];
        const victim = this.holes[j];

        if (!hunter.isAlive || !victim.isAlive) continue;

        // Hunter must be at least 25% larger to eat victim
        if (hunter.radius > victim.radius * 1.25) {
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

            // Safe respawn position on a random open road
            const safeX = (Math.random() - 0.5) * 80;
            const safeZ = (Math.random() - 0.5) * 80;
            victim.killAndRespawn({ x: safeX, z: safeZ });
          }
        }
      }
    }

    // Edible Objects Suction & Collision
    for (let i = 0; i < this.edibleObjects.length; i++) {
      const obj = this.edibleObjects[i];
      if (obj.state === 'swallowed') continue;

      const objPos = obj.mesh.position;

      // If object is currently idle, check for nearest hole that can eat it
      if (obj.state === 'idle') {
        for (let h = 0; h < this.holes.length; h++) {
          const hole = this.holes[h];
          if (!hole.isAlive) continue;

          // Can hole swallow this tier?
          if (obj.tier <= hole.level) {
            const dx = hole.position.x - objPos.x;
            const dz = hole.position.z - objPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < hole.radius) {
              obj.state = 'sucking';
              obj.suckingHole = hole;
              break;
            }
          }
        }
      }

      // If object is in suction towards a hole
      if (obj.state === 'sucking' && obj.suckingHole) {
        const hole = obj.suckingHole;
        if (!hole.isAlive) {
          obj.state = 'idle';
          obj.suckingHole = null;
          continue;
        }

        obj.suctionProgress += dt * 3.4;

        // Gravitational suction towards hole center
        objPos.x += (hole.position.x - objPos.x) * dt * 7.5;
        objPos.z += (hole.position.z - objPos.z) * dt * 7.5;

        // Tilt & drop into the abyss
        obj.mesh.rotation.x += dt * 3.5;
        obj.mesh.rotation.z += dt * 2.8;
        objPos.y -= dt * 6.5;

        // Scale down smoothly
        const scaleFactor = Math.max(0.01, 1.0 - obj.suctionProgress);
        obj.mesh.scale.set(
          obj.scaleX * scaleFactor,
          obj.scaleY * scaleFactor,
          obj.scaleZ * scaleFactor
        );

        // Fully Swallowed!
        if (obj.suctionProgress >= 1.0 || objPos.y < -2.8) {
          obj.state = 'swallowed';
          this.scene.remove(obj.mesh);

          // Calculate points with combo multiplier
          let points = obj.points;
          if (hole.comboCount > 1) {
            points = Math.round(points * (1 + hole.comboCount * 0.25));
          }

          hole.addXP(points, (h) => {
            if (h.isPlayer) this.handlePlayerLevelUp(h);
          });

          // Visual and Audio FX
          this.particles.createSwallowBurst(hole.position, obj.tier);

          if (hole.isPlayer) {
            audio.playSwallow(obj.tier);
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

  updateCamera(dt) {
    if (!this.player) return;

    // Dynamic zoom out based on hole radius / level
    const targetHeight = 16 + this.player.radius * 2.4;
    const targetDistZ = 14 + this.player.radius * 2.0;

    const targetCamX = this.player.position.x;
    const targetCamY = targetHeight;
    const targetCamZ = this.player.position.z + targetDistZ;

    // Smooth Lerp Camera Follow
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 5.0);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 4.0);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, dt * 5.0);

    const lookTarget = new THREE.Vector3(
      this.player.position.x,
      0,
      this.player.position.z - 2
    );
    this.camera.lookAt(lookTarget);

    // Keep Directional Sunlight centered around player for sharp shadows
    if (this.dirLight) {
      this.dirLight.position.set(
        this.player.position.x + 40,
        70,
        this.player.position.z + 30
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

    if (!this.isGameOver) {
      this.updatePhysics(dt);
      this.updateMatchTimer(dt);
    }

    this.updateCamera(dt);

    // Update HUD
    const ranked = [...this.holes].sort((a, b) => b.score - a.score);
    this.ui.updateHUD({
      player: this.player,
      timeLeft: this.timeLeft,
      rankedHoles: ranked,
      gameMode: this.gameMode
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
