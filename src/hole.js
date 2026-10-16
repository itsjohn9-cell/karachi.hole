import * as THREE from 'three';
import { TextureGenerator } from './textures.js';

export const DIFFICULTY_CONFIG = {
  kidsEasy: {
    startRadius: 1.65,
    xpMultiplier: 1.8,
    suctionPull: 11.5,
    botSpeedMult: 0.62,
    botAggression: false, // Bots never hunt the player!
    title: "Kids / Easy (Default)"
  },
  classic: {
    startRadius: 1.15,
    xpMultiplier: 1.0,
    suctionPull: 7.5,
    botSpeedMult: 0.88,
    botAggression: true,
    title: "Classic Arcade"
  }
};

export const LEVEL_CONFIG = [
  { level: 1, radius: 1.45, maxXP: 220, title: "Open Gutter (کھلا گٹر)" },
  { level: 2, radius: 2.35, maxXP: 650, title: "Sewer Drain (بڑی نالی)" },
  { level: 3, radius: 3.8, maxXP: 1600, title: "Lyari Nullah (لیاری نالہ)" },
  { level: 4, radius: 6.4, maxXP: 3400, title: "Bazaar Destroyer" },
  { level: 5, radius: 11.2, maxXP: 7500, title: "Chundrigar Void" },
  { level: 6, radius: 17.5, maxXP: 99999, title: "MAZAR MEGA VOID" }
];

export class Hole {
  constructor({ scene, name, isPlayer = false, skin = 'gutter', initialPos = { x: 0, z: 0 }, color = 0x00e5ff, difficulty = 'kidsEasy' }) {
    this.scene = scene;
    this.name = name;
    this.isPlayer = isPlayer;
    this.skin = skin;
    this.baseColor = color;
    this.difficulty = difficulty;

    this.position = new THREE.Vector3(initialPos.x, 0, initialPos.z);
    this.velocity = new THREE.Vector3();
    this.targetDirection = new THREE.Vector2();
    this.rotationY = 0;

    // Progression
    const diff = DIFFICULTY_CONFIG[this.difficulty] || DIFFICULTY_CONFIG.kidsEasy;
    this.level = 1;
    this.xp = 0;
    this.score = 0;
    this.radius = isPlayer ? 1.45 : LEVEL_CONFIG[0].radius * 0.85;
    this.targetRadius = this.radius;
    this.swallowedCount = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.kills = 0;

    // Movement speed - Tuned for relaxed, observable arcade pacing
    this.baseSpeed = isPlayer ? 9.5 : 6.5 * diff.botSpeedMult;
    this.currentSpeed = this.baseSpeed;
    this.isBoosting = false;

    // State
    this.isAlive = true;
    this.respawnTimer = 0;

    // AI navigation variables
    this.aiTarget = null;
    this.aiState = 'roam';
    this.aiTimer = 0;

    this.createHoleMesh();
    this.createNameTag();
  }

  createHoleMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Inner Deep Gutter Sewer Void (Inverted 3D cone into the earth)
    const voidGeo = new THREE.ConeGeometry(this.radius, 3.2, 32, 1, true);
    voidGeo.rotateX(Math.PI); // Point down into the ground
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x050b07, // Deep murky sewer green-black
      side: THREE.BackSide
    });
    this.voidMesh = new THREE.Mesh(voidGeo, voidMat);
    this.voidMesh.position.y = -1.6;
    this.group.add(this.voidMesh);

    // Murky sewage sludge water layer at the bottom of the open gutter
    const plugGeo = new THREE.CircleGeometry(this.radius * 0.88, 32);
    plugGeo.rotateX(-Math.PI / 2);
    this.plugMesh = new THREE.Mesh(plugGeo, new THREE.MeshBasicMaterial({ color: 0x0a160d }));
    this.plugMesh.position.y = -1.55;
    this.group.add(this.plugMesh);

    // Outer Animated Karachi Gutter Manhole Cast Iron Rim
    this.rimMat = this.createSkinMaterial(this.skin);
    const rimGeo = new THREE.RingGeometry(this.radius * 0.90, this.radius * 1.30, 32);
    rimGeo.rotateX(-Math.PI / 2);
    this.rimMesh = new THREE.Mesh(rimGeo, this.rimMat);
    this.rimMesh.position.y = 0.05;
    this.group.add(this.rimMesh);

    // Glowing Neon Accent Ring around the iron rim
    const accentGeo = new THREE.RingGeometry(this.radius * 1.28, this.radius * 1.33, 32);
    accentGeo.rotateX(-Math.PI / 2);
    this.accentMat = new THREE.MeshBasicMaterial({
      color: this.isPlayer ? 0x00ffcc : this.baseColor,
      side: THREE.DoubleSide
    });
    this.accentMesh = new THREE.Mesh(accentGeo, this.accentMat);
    this.accentMesh.position.y = 0.06;
    this.group.add(this.accentMesh);

    this.scene.add(this.group);
  }

  createSkinMaterial(skinName) {
    if (skinName === 'gutter') {
      return new THREE.MeshBasicMaterial({
        map: TextureGenerator.createManholeGutterTexture(),
        side: THREE.DoubleSide
      });
    } else if (skinName === 'truckArt') {
      return new THREE.MeshBasicMaterial({
        map: TextureGenerator.createTruckArtTexture(),
        side: THREE.DoubleSide
      });
    } else if (skinName === 'ajrak') {
      return new THREE.MeshBasicMaterial({
        map: TextureGenerator.createAjrakTexture(),
        side: THREE.DoubleSide
      });
    } else if (skinName === 'slime') {
      return new THREE.MeshBasicMaterial({
        map: TextureGenerator.createLyariSlimeTexture(),
        side: THREE.DoubleSide
      });
    } else if (skinName === 'emerald') {
      return new THREE.MeshBasicMaterial({
        color: 0x00e676,
        side: THREE.DoubleSide
      });
    } else if (skinName === 'quaid') {
      return new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide
      });
    } else {
      // Neon Cyber
      return new THREE.MeshBasicMaterial({
        color: 0xff007f,
        side: THREE.DoubleSide
      });
    }
  }

  setSkin(newSkin) {
    this.skin = newSkin;
    if (this.rimMesh) {
      this.rimMesh.material = this.createSkinMaterial(newSkin);
    }
  }

  createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    this.tagCtx = canvas.getContext('2d');
    this.tagTexture = new THREE.CanvasTexture(canvas);

    const spriteMat = new THREE.SpriteMaterial({
      map: this.tagTexture,
      transparent: true,
      depthTest: false
    });
    this.nameTag = new THREE.Sprite(spriteMat);
    this.nameTag.scale.set(3.5, 0.9, 1);
    this.nameTag.position.y = 2.4;
    this.group.add(this.nameTag);

    this.updateNameTag();
  }

  updateNameTag() {
    if (!this.tagCtx) return;
    const ctx = this.tagCtx;
    ctx.clearRect(0, 0, 256, 64);

    // Pill background
    ctx.fillStyle = this.isPlayer ? 'rgba(0, 229, 255, 0.85)' : 'rgba(20, 24, 33, 0.85)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 24);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = this.isPlayer ? '#ffffff' : '#ffd700';
    ctx.stroke();

    // Text
    ctx.fillStyle = this.isPlayer ? '#001a24' : '#ffffff';
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.name} [Lv.${this.level}]`, 128, 32);

    this.tagTexture.needsUpdate = true;
  }

  addXP(amount, onLevelUp) {
    this.score += amount;
    this.xp += amount;
    this.swallowedCount++;

    // Combo system
    this.comboCount++;
    this.comboTimer = 2.5; // 2.5s window to chain combos!

    const currentConfig = LEVEL_CONFIG[this.level - 1];
    if (this.level < LEVEL_CONFIG.length && this.xp >= currentConfig.maxXP) {
      this.level++;
      this.targetRadius = LEVEL_CONFIG[this.level - 1].radius;
      this.updateNameTag();
      if (onLevelUp) onLevelUp(this);
    }
  }

  updateScale(dt) {
    if (this.radius < this.targetRadius) {
      this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, dt * 4.0);
      const scale = this.radius / LEVEL_CONFIG[0].radius;
      this.voidMesh.scale.set(scale, 1, scale);
      this.plugMesh.scale.set(scale, scale, scale);
      this.rimMesh.scale.set(scale, scale, scale);
      this.accentMesh.scale.set(scale, scale, scale);
      this.nameTag.position.y = 2.4 + (this.level - 1) * 0.8;
      this.nameTag.scale.set(3.5 * Math.min(2.0, 1 + (this.level - 1) * 0.2), 0.9 * Math.min(2.0, 1 + (this.level - 1) * 0.2), 1);
    }

    // Animate Rim rotation
    if (this.rimMesh) {
      this.rimMesh.rotation.z += dt * (this.isPlayer ? 0.8 : 0.4);
    }
  }

  move(dx, dz, dt, mapBound = 70.0) {
    if (!this.isAlive) return;

    const speed = this.isBoosting ? this.currentSpeed * 1.5 : this.currentSpeed;
    this.position.x += dx * speed * dt;
    this.position.z += dz * speed * dt;

    // Firmly confine the hole within the active devour district
    // Subtract radius margin so neither hole center nor outer rim can ever penetrate boundary walls or enter empty void
    const maxCoord = Math.max(12.0, mapBound - this.radius * 0.45);
    this.position.x = THREE.MathUtils.clamp(this.position.x, -maxCoord, maxCoord);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -maxCoord, maxCoord);

    this.group.position.copy(this.position);
  }

  // AI Logic for Bot Holes
  updateAI(dt, edibleObjects, otherHoles) {
    if (this.isPlayer || !this.isAlive) return;

    this.aiTimer -= dt;

    // Check for threats (larger holes nearby) or targets (smaller holes nearby)
    let threat = null;
    let huntTarget = null;

    const diff = DIFFICULTY_CONFIG[this.difficulty] || DIFFICULTY_CONFIG.kidsEasy;

    otherHoles.forEach(other => {
      if (other === this || !other.isAlive) return;
      const d = this.position.distanceTo(other.position);

      if (other.radius > this.radius * 1.25 && d < 22) {
        // In kids mode, if player approaches, bot flees slowly so player can catch it!
        threat = other;
      } else if (this.radius > other.radius * 1.25 && d < 18) {
        // In kids mode, bots NEVER hunt the player!
        if (!other.isPlayer || diff.botAggression) {
          huntTarget = other;
        }
      }
    });

    let moveDir = new THREE.Vector2();

    if (threat) {
      // Flee in opposite direction from threat
      moveDir.x = this.position.x - threat.position.x;
      moveDir.y = this.position.z - threat.position.z;
      moveDir.normalize();
      this.aiState = 'flee';
    } else if (huntTarget) {
      // Chase down smaller hole
      moveDir.x = huntTarget.position.x - this.position.x;
      moveDir.y = huntTarget.position.z - this.position.z;
      moveDir.normalize();
      this.aiState = 'hunt';
    } else {
      // Roam towards closest edible object
      this.aiState = 'roam';
      if (!this.aiTarget || this.aiTimer <= 0 || this.aiTarget.state !== 'idle') {
        let bestDist = Infinity;
        let bestObj = null;

        for (let i = 0; i < Math.min(60, edibleObjects.length); i++) {
          const randIdx = Math.floor(Math.random() * edibleObjects.length);
          const obj = edibleObjects[randIdx];
          if (obj.state === 'idle' && obj.tier <= this.level) {
            const d = this.position.distanceTo(obj.mesh.position);
            if (d < bestDist) {
              bestDist = d;
              bestObj = obj;
            }
          }
        }

        this.aiTarget = bestObj;
        this.aiTimer = 2.0 + Math.random() * 1.5;
      }

      if (this.aiTarget && this.aiTarget.mesh) {
        moveDir.x = this.aiTarget.mesh.position.x - this.position.x;
        moveDir.y = this.aiTarget.mesh.position.z - this.position.z;
        moveDir.normalize();
      } else {
        moveDir.set((Math.random() - 0.5), (Math.random() - 0.5)).normalize();
      }
    }

    // Move bot
    this.move(moveDir.x, moveDir.y, dt, 68.0);
  }

  // Handle Respawn when swallowed by another hole
  killAndRespawn(safePos = { x: 0, z: 0 }) {
    this.isAlive = false;
    this.group.visible = false;
    this.respawnTimer = 4.5;
    this.pendingSafePos = safePos;
  }

  updateRespawn(dt) {
    if (this.isAlive) return;

    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.isAlive = true;
      this.group.visible = true;
      this.position.set(this.pendingSafePos.x, 0, this.pendingSafePos.z);
      this.group.position.copy(this.position);
      // Reset to level 1 on respawn
      this.level = 1;
      this.radius = LEVEL_CONFIG[0].radius;
      this.targetRadius = this.radius;
      this.xp = 0;
      this.voidMesh.scale.set(1, 1, 1);
      this.plugMesh.scale.set(1, 1, 1);
      this.rimMesh.scale.set(1, 1, 1);
      this.accentMesh.scale.set(1, 1, 1);
      this.updateNameTag();
    }
  }

  update(dt) {
    this.updateScale(dt);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    if (!this.isAlive) {
      this.updateRespawn(dt);
    }
  }
}
