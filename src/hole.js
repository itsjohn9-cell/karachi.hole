import * as THREE from 'three';
import { TextureGenerator } from './textures.js';
import { AvatarBuilder } from './avatar.js';

export const DIFFICULTY_CONFIG = {
  kidsEasy: {
    startRadius: 1.65,
    xpMultiplier: 1.8,
    suctionPull: 11.5,
    botSpeedMult: 0.85,
    botAggression: false, // Bots never attack player
    title: "Kids / Easy (Default)"
  },
  classic: {
    startRadius: 1.15,
    xpMultiplier: 1.0,
    suctionPull: 8.5,
    botSpeedMult: 1.0,
    botAggression: true,
    title: "Classic Arcade"
  }
};

export const LEVEL_CONFIG = [
  { level: 1, radius: 1.45, maxXP: 220, title: "Street Patrol Hero" },
  { level: 2, radius: 2.35, maxXP: 650, title: "District Protector" },
  { level: 3, radius: 3.8, maxXP: 1600, title: "Karachi Civic Captain" },
  { level: 4, radius: 6.4, maxXP: 3400, title: "Metropolitan Guardian" },
  { level: 5, radius: 11.2, maxXP: 7500, title: "Supreme City Savior" },
  { level: 6, radius: 17.5, maxXP: 99999, title: "KARACHI LEGEND" }
];

export class Hole {
  constructor({
    scene,
    name,
    isPlayer = false,
    skin = 'tariq',
    avatarId = null,
    initialPos = { x: 0, z: 0 },
    color = 0x00e5ff,
    difficulty = 'kidsEasy'
  }) {
    this.scene = scene;
    this.name = name;
    this.isPlayer = isPlayer;
    this.skin = skin;
    this.avatarId = avatarId || (isPlayer ? (skin || 'tariq') : 'farooq');
    this.baseColor = color;
    this.difficulty = difficulty;

    // Robust coordinate extraction handling both {x, z} and [x, z]
    const posX = Array.isArray(initialPos) ? initialPos[0] : (initialPos.x ?? 0);
    const posZ = Array.isArray(initialPos) ? initialPos[1] : (initialPos.z ?? 0);
    this.position = new THREE.Vector3(Number.isFinite(posX) ? posX : 0, 0, Number.isFinite(posZ) ? posZ : 0);

    this.velocity = new THREE.Vector3();
    this.targetDirection = new THREE.Vector2();
    this.facingAngle = 0;
    this.targetRotationY = 0;

    // Progression & Score
    const diff = DIFFICULTY_CONFIG[this.difficulty] || DIFFICULTY_CONFIG.kidsEasy;
    this.level = 1;
    this.xp = 0;
    this.score = 0;
    this.radius = isPlayer ? 1.45 : LEVEL_CONFIG[0].radius * 0.9;
    this.targetRadius = this.radius;
    this.swallowedCount = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.kills = 0;

    // Movement speed
    this.baseSpeed = isPlayer ? 10.5 : 7.2 * diff.botSpeedMult;
    this.currentSpeed = this.baseSpeed;
    this.isBoosting = false;

    // State
    this.isAlive = true;
    this.respawnTimer = 0;

    // AI navigation variables
    this.aiTarget = null;
    this.aiState = 'roam';
    this.aiTimer = 0;
    this.aiScoreAccumulator = 0;

    this.createCharacterMesh();
    this.createNameTag();
  }

  /**
   * Create 3D Karachi Hero Avatar Model (replacing dark void hole)
   */
  createCharacterMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Build 3D Character Avatar with authentic Karachi outfits
    this.avatarMesh = AvatarBuilder.createAvatarMesh(this.avatarId);
    this.group.add(this.avatarMesh);

    // Ground interaction trigger radius indicator (subtle glowing neon street circle)
    const ringGeo = new THREE.RingGeometry(this.radius * 0.85, this.radius * 0.95, 32);
    ringGeo.rotateX(-Math.PI / 2);
    this.ringMat = new THREE.MeshBasicMaterial({
      color: this.isPlayer ? 0x00e5ff : this.baseColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: this.isPlayer ? 0.75 : 0.45
    });
    this.ringMesh = new THREE.Mesh(ringGeo, this.ringMat);
    this.ringMesh.position.y = 0.04;
    this.group.add(this.ringMesh);

    // Stencil/CSG dummy meshes for backward compatibility with existing cleanup routines
    this.voidMesh = new THREE.Group();
    this.plugMesh = new THREE.Group();
    this.accentMesh = new THREE.Group();
    this.rimMesh = this.ringMesh;

    this.scene.add(this.group);
  }

  setAvatar(newAvatarId) {
    this.avatarId = newAvatarId;
    if (this.avatarMesh && this.avatarMesh.parent) {
      this.group.remove(this.avatarMesh);
    }
    this.avatarMesh = AvatarBuilder.createAvatarMesh(newAvatarId);
    this.group.add(this.avatarMesh);
  }

  setSkin(newSkin) {
    this.skin = newSkin;
    this.setAvatar(newSkin);
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
    this.nameTag.scale.set(3.0, 0.75, 1);
    this.nameTag.position.y = 2.45;
    if (this.isPlayer) {
      this.nameTag.visible = false; // Player already has prominent top-left HUD profile
    }
    this.group.add(this.nameTag);

    this.updateNameTag();
  }

  updateNameTag() {
    if (!this.tagCtx) return;
    const ctx = this.tagCtx;
    ctx.clearRect(0, 0, 256, 64);

    ctx.fillStyle = this.isPlayer ? 'rgba(0, 229, 255, 0.9)' : 'rgba(20, 24, 33, 0.88)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 24);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = this.isPlayer ? '#ffffff' : '#ffd700';
    ctx.stroke();

    ctx.fillStyle = this.isPlayer ? '#001a24' : '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.name} [Lv.${this.level}]`, 128, 32);

    if (this.isPlayer) {
      this.nameTag.visible = false;
    }
    this.tagTexture.needsUpdate = true;
  }

  addXP(amount, onLevelUp) {
    this.score += amount;
    this.xp += amount;
    this.swallowedCount++;

    this.comboCount++;
    this.comboTimer = 3.0;

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
      this.ringMesh.scale.set(scale, scale, scale);
    }

    if (this.ringMesh) {
      this.ringMesh.rotation.z += dt * (this.isPlayer ? 1.0 : 0.5);
    }
  }

  /**
   * Character movement with solid obstacle collision (cannot walk through buildings/stalls)
   */
  move(dx, dz, dt, mapBound = 94.0, obstacles = []) {
    if (!this.isAlive) return;

    const isMoving = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01;
    const speed = this.isBoosting ? this.currentSpeed * 1.55 : this.currentSpeed;
    const maxCoord = Math.max(14.0, mapBound - 0.8);

    if (isMoving) {
      // Calculate desired facing angle and smoothly rotate character
      this.targetRotationY = Math.atan2(dx, dz);
      // Smooth angular interpolation
      let angleDiff = this.targetRotationY - this.facingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.facingAngle += angleDiff * Math.min(1.0, dt * 14.0);
      this.group.rotation.y = this.facingAngle;
    }

    // Update limb stride animations
    AvatarBuilder.updateAnimation(this.avatarMesh, isMoving, dt, this.isBoosting ? 1.5 : 1.0);

    // Tentative next coordinates
    let nextX = this.position.x + dx * speed * dt;
    let nextZ = this.position.z + dz * speed * dt;

    // Solid Obstacle Collision Prevention (Buildings, Stalls, Monuments)
    const avatarBodyRadius = 0.65;
    if (obstacles && obstacles.length > 0) {
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (!obs) continue;
        const oPos = obs.position || (obs.mesh && obs.mesh.position);
        if (!oPos) continue;

        // Effective obstacle boundary radius
        const oRad = obs.radius || obs.collisionRadius || 2.8;
        const totalClearance = oRad + avatarBodyRadius;

        const distSq = (nextX - oPos.x) * (nextX - oPos.x) + (nextZ - oPos.z) * (nextZ - oPos.z);
        if (distSq < totalClearance * totalClearance) {
          const dist = Math.sqrt(distSq);
          const normX = (nextX - oPos.x) / (dist || 1);
          const normZ = (nextZ - oPos.z) / (dist || 1);

          // Push character out to boundary perimeter and slide tangentially
          nextX = oPos.x + normX * totalClearance;
          nextZ = oPos.z + normZ * totalClearance;
        }
      }
    }

    // Boundary walls clamp
    this.position.x = THREE.MathUtils.clamp(nextX, -maxCoord, maxCoord);
    this.position.z = THREE.MathUtils.clamp(nextZ, -maxCoord, maxCoord);
    this.group.position.copy(this.position);
  }

  /**
   * Autonomous AI for Competitor Bots (Active street roaming, mission gathering & scoring)
   */
  updateAI(dt, edibleObjects, otherHoles, obstacles = []) {
    if (this.isPlayer || !this.isAlive) return;

    this.aiTimer -= dt;
    this.aiScoreAccumulator += dt;

    // Organic Score Growth by Difficulty Tier
    const isEasy = (this.difficulty === 'kidsEasy');
    const scoreInterval = isEasy ? 10.0 : 6.0;
    if (this.aiScoreAccumulator >= scoreInterval) {
      this.aiScoreAccumulator = 0;
      const bonusXP = isEasy
        ? 120 + Math.floor(Math.random() * 80)
        : 280 + Math.floor(Math.random() * 220);
      this.addXP(bonusXP);
    }

    // Target Selection: Seek nearest collectable street item or mission target
    if (!this.aiTarget || this.aiTimer <= 0 || (this.aiTarget.state && this.aiTarget.state === 'swallowed')) {
      let closestDist = Infinity;
      let chosenObj = null;

      if (edibleObjects && edibleObjects.length > 0) {
        // Sample candidate items
        const sampleLimit = Math.min(40, edibleObjects.length);
        for (let i = 0; i < sampleLimit; i++) {
          const idx = Math.floor(Math.random() * edibleObjects.length);
          const obj = edibleObjects[idx];
          if (obj && obj.state !== 'swallowed' && obj.mesh) {
            const d = this.position.distanceTo(obj.mesh.position);
            if (d < closestDist && d < 45.0) {
              closestDist = d;
              chosenObj = obj;
            }
          }
        }
      }

      this.aiTarget = chosenObj;
      this.aiTimer = 3.0 + Math.random() * 2.0;
    }

    let moveDir = new THREE.Vector2();
    if (this.aiTarget && this.aiTarget.mesh && this.aiTarget.state !== 'swallowed') {
      const tx = this.aiTarget.mesh.position.x - this.position.x;
      const tz = this.aiTarget.mesh.position.z - this.position.z;
      const len = Math.hypot(tx, tz);
      if (len > 0.2) {
        moveDir.set(tx / len, tz / len);
      }

      // If reached target, collect it
      if (len < 1.8) {
        this.addXP(this.aiTarget.points || 150);
        this.aiTarget.state = 'swallowed';
        if (this.aiTarget.mesh && this.aiTarget.mesh.parent) {
          this.aiTarget.mesh.parent.remove(this.aiTarget.mesh);
        }
        this.aiTarget = null;
      }
    } else {
      // Roam along avenues
      if (!this.roamDir || this.aiTimer <= 0) {
        const randAngle = Math.random() * Math.PI * 2;
        this.roamDir = new THREE.Vector2(Math.sin(randAngle), Math.cos(randAngle));
      }
      moveDir.copy(this.roamDir);
    }

    // Move bot with solid building collision
    this.move(moveDir.x, moveDir.y, dt, 92.0, obstacles);
  }

  killAndRespawn(safePos = { x: 0, z: 0 }) {
    this.isAlive = false;
    this.group.visible = false;
    this.respawnTimer = 4.0;
    this.pendingSafePos = safePos;
  }

  updateRespawn(dt) {
    if (this.isAlive) return;

    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.isAlive = true;
      this.group.visible = true;
      const posX = Array.isArray(this.pendingSafePos) ? this.pendingSafePos[0] : (this.pendingSafePos?.x ?? 0);
      const posZ = Array.isArray(this.pendingSafePos) ? this.pendingSafePos[1] : (this.pendingSafePos?.z ?? 0);
      this.position.set(posX, 0, posZ);
      this.group.position.copy(this.position);
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
