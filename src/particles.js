import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.rings = [];

    // Shared geometries and materials
    this.sparkGeo = new THREE.DodecahedronGeometry(0.12);
    this.starGeo = new THREE.TetrahedronGeometry(0.25);

    this.palette = [
      new THREE.MeshBasicMaterial({ color: 0xffeb3b }), // Gold
      new THREE.MeshBasicMaterial({ color: 0x00e5ff }), // Cyan
      new THREE.MeshBasicMaterial({ color: 0xff4081 }), // Pink
      new THREE.MeshBasicMaterial({ color: 0x76ff03 }), // Lime
      new THREE.MeshBasicMaterial({ color: 0xff6d00 }), // Orange
    ];

    // Money note geometry & materials for devoured politicians
    this.moneyGeo = new THREE.PlaneGeometry(0.35, 0.18);
    this.moneyMat = new THREE.MeshBasicMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });
    this.goldMoneyMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });

    // Water splash droplet geometry & materials
    this.waterDropletGeo = new THREE.DodecahedronGeometry(0.18);
    this.waterMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Confetti geometry & vibrant festival materials
    this.confettiGeo = new THREE.PlaneGeometry(0.22, 0.14);
    this.confettiMats = [
      new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide }), // Bright Green
      new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide }), // Gold
      new THREE.MeshBasicMaterial({ color: 0xff1744, side: THREE.DoubleSide }), // Ruby Red
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide }), // Aqua
      new THREE.MeshBasicMaterial({ color: 0xe040fb, side: THREE.DoubleSide })  // Magenta
    ];

    // Heart shape for happy rescued citizens
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.15);
    heartShape.bezierCurveTo(0, 0.25, -0.15, 0.35, -0.22, 0.25);
    heartShape.bezierCurveTo(-0.3, 0.12, -0.2, -0.1, 0, -0.25);
    heartShape.bezierCurveTo(0.2, -0.1, 0.3, 0.12, 0.22, 0.25);
    heartShape.bezierCurveTo(0.15, 0.35, 0, 0.25, 0, 0.15);
    this.heartGeo = new THREE.ShapeGeometry(heartShape);
    this.heartMat = new THREE.MeshBasicMaterial({ color: 0xff4081, side: THREE.DoubleSide });
  }

  // Coastal Arabian Sea Water Splash & Foam Spray
  createWaterSplash(pos, count = 28) {
    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.4 ? this.waterMat : this.foamMat;
      const mesh = new THREE.Mesh(this.waterDropletGeo, mat);
      mesh.position.set(pos.x + (Math.random() - 0.5) * 1.5, 0.2, pos.z + (Math.random() - 0.5) * 1.5);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        4.5 + Math.random() * 6.5,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -18,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 0.9,
        scale: 0.9 + Math.random() * 0.7
      });
    }

    // Expanding water ripple ring
    const ringGeo = new THREE.RingGeometry(0.5, 0.9, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x80deea,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, 0.08, pos.z);
    this.scene.add(ring);
    this.rings.push({
      mesh: ring,
      scale: 1,
      opacity: 0.85,
      speed: 6.0
    });
  }

  // Burst of currency / rupee notes when a corrupt politician is devoured!
  createMoneyBurst(pos, count = 35) {
    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.3 ? this.moneyMat : this.goldMoneyMat;
      const mesh = new THREE.Mesh(this.moneyGeo, mat);
      mesh.position.copy(pos);
      mesh.position.y += 0.5;

      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        5 + Math.random() * 6,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -10, // Slower flutter
        life: 1.4 + Math.random() * 0.6,
        maxLife: 2.0,
        scale: 1.0,
        isMoney: true
      });
    }
  }

  // Confetti explosion for joyful rescued citizens and cleared traffic jams!
  createCelebrationConfetti(pos, count = 35) {
    for (let i = 0; i < count; i++) {
      const mat = this.confettiMats[Math.floor(Math.random() * this.confettiMats.length)];
      const mesh = new THREE.Mesh(this.confettiGeo, mat);
      mesh.position.set(pos.x + (Math.random() - 0.5) * 1.2, pos.y + 0.8, pos.z + (Math.random() - 0.5) * 1.2);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        5.5 + Math.random() * 5.0,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -7, // Gentle air flutter
        life: 1.6 + Math.random() * 0.7,
        maxLife: 2.3,
        scale: 1.0,
        isConfetti: true
      });
    }
  }

  // Floating love hearts when rescued citizens express heartfelt gratitude!
  createHeartBurst(pos, count = 14) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.heartGeo, this.heartMat);
      mesh.position.set(pos.x + (Math.random() - 0.5) * 1.0, pos.y + 1.2, pos.z + (Math.random() - 0.5) * 1.0);
      mesh.rotation.x = Math.PI;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 3.5,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -2.5, // Floats gently upwards
        life: 1.4 + Math.random() * 0.5,
        maxLife: 1.9,
        scale: 0.9 + Math.random() * 0.5,
        isHeart: true
      });
    }
  }

  // Pure crystal freshwater fountain geyser when water tanker mafia is devoured!
  createFreshwaterGeyser(pos, count = 42) {
    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.3 ? this.waterMat : this.foamMat;
      const mesh = new THREE.Mesh(this.waterDropletGeo, mat);
      mesh.position.set(pos.x + (Math.random() - 0.5) * 1.8, 0.4, pos.z + (Math.random() - 0.5) * 1.8);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 3.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        8.0 + Math.random() * 6.5, // High skyward jet
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -16,
        life: 1.1 + Math.random() * 0.4,
        maxLife: 1.5,
        scale: 1.2 + Math.random() * 0.6
      });
    }
  }

  // Flowing pipeline water stream surging from hole towards restored residential homes!
  createWaterFlowStream(fromPos, toPos, count = 28) {
    const dx = toPos.x - fromPos.x;
    const dz = toPos.z - fromPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    const normX = dx / dist;
    const normZ = dz / dist;

    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.3 ? this.waterMat : this.foamMat;
      const mesh = new THREE.Mesh(this.waterDropletGeo, mat);
      const progress = Math.random() * 0.35;
      mesh.position.set(
        fromPos.x + dx * progress + (Math.random() - 0.5) * 0.8,
        0.3 + Math.random() * 0.4,
        fromPos.z + dz * progress + (Math.random() - 0.5) * 0.8
      );

      const speed = 12 + Math.random() * 10;
      const vel = new THREE.Vector3(
        normX * speed + (Math.random() - 0.5) * 2,
        3.5 + Math.random() * 4.5,
        normZ * speed + (Math.random() - 0.5) * 2
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -10,
        life: 0.9 + Math.random() * 0.4,
        maxLife: 1.3,
        scale: 1.1 + Math.random() * 0.5
      });
    }
  }

  // Cascading water overflow from residential rooftop tank when water is restored!
  createRooftopWaterOverflow(tankPos, count = 35) {
    for (let i = 0; i < count; i++) {
      const mat = Math.random() > 0.4 ? this.waterMat : this.foamMat;
      const mesh = new THREE.Mesh(this.waterDropletGeo, mat);
      mesh.position.set(
        tankPos.x + (Math.random() - 0.5) * 1.2,
        tankPos.y + 0.6,
        tankPos.z + (Math.random() - 0.5) * 1.2
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.0;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 3.5,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -14,
        life: 1.2 + Math.random() * 0.5,
        maxLife: 1.7,
        scale: 1.0 + Math.random() * 0.6
      });
    }
  }

  // Burst when an object is swallowed
  createSwallowBurst(pos, tier = 1, count = 12) {
    const burstCount = count * Math.min(3, tier);
    for (let i = 0; i < burstCount; i++) {
      const mat = this.palette[Math.floor(Math.random() * this.palette.length)];
      const mesh = new THREE.Mesh(this.sparkGeo, mat);
      mesh.position.copy(pos);
      mesh.position.y += 0.3;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4 * Math.min(2.5, tier);
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 5,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -16,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.8,
        scale: 0.8 + Math.random() * 0.8
      });
    }
  }

  // Level Up Expanding Shockwave Ring
  createLevelUpShockwave(pos, radius = 2) {
    const ringGeo = new THREE.RingGeometry(radius * 0.8, radius, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.set(pos.x, 0.12, pos.z);

    this.scene.add(mesh);
    this.rings.push({
      mesh,
      scale: 1,
      maxScale: 3.5,
      opacity: 0.9,
      speed: 4.5
    });

    // Also spawn golden celebration stars!
    for (let i = 0; i < 24; i++) {
      const star = new THREE.Mesh(this.starGeo, this.palette[0]);
      star.position.set(pos.x, 0.5, pos.z);
      const a = (i * Math.PI * 2) / 24;
      const s = 6 + Math.random() * 3;
      const vel = new THREE.Vector3(Math.cos(a) * s, 6 + Math.random() * 4, Math.sin(a) * s);
      this.scene.add(star);
      this.particles.push({
        mesh: star,
        vel,
        gravity: -14,
        life: 1.2,
        maxLife: 1.2,
        scale: 1.2
      });
    }
  }

  // Magical Civic Cleanse Sparkle Shower (Spawns stars, green emerald orbs, and expanding renewal ring)
  createCleanseSparkleBurst(pos, count = 35) {
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < count; i++) {
      const isStar = Math.random() > 0.45;
      const geo = isStar ? this.starGeo : this.sparkGeo;
      const r = Math.random();
      const mat = r < 0.4 ? greenMat : (r < 0.8 ? goldMat : whiteMat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 1.6,
        0.3 + Math.random() * 0.5,
        pos.z + (Math.random() - 0.5) * 1.6
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.0;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        4.0 + Math.random() * 5.0,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -10,
        life: 0.9 + Math.random() * 0.6,
        maxLife: 1.5,
        scale: 0.9 + Math.random() * 0.6
      });
    }

    // Expanding emerald green renewal ring on ground
    const ringGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(pos.x, 0.06, pos.z);
    this.scene.add(ring);
    this.rings.push({
      mesh: ring,
      scale: 1,
      opacity: 0.9,
      speed: 4.8
    });
  }

  // Vehicle tire skid / exhaust smoke puff for high-speed GTA getaways
  createSkidSmoke(pos, count = 10) {
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.65 });
    for (let i = 0; i < count; i++) {
      const geo = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.16);
      const mesh = new THREE.Mesh(geo, smokeMat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.8,
        0.15 + Math.random() * 0.25,
        pos.z + (Math.random() - 0.5) * 0.8
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        0.8 + Math.random() * 1.5,
        (Math.random() - 0.5) * 1.8
      );
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: 0.2, // Drifts upward
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        scale: 1.0
      });
    }
  }

  // Heavy Impact Dust / Demolition debris burst (Manhole slam, wall demolish, roadblock deploy)
  createImpactDust(pos, count = 22) {
    const dustMat = new THREE.MeshBasicMaterial({ color: 0x8d6e63, transparent: true, opacity: 0.8 });
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    for (let i = 0; i < count; i++) {
      const isSpark = Math.random() > 0.65;
      const geo = isSpark ? this.sparkGeo : new THREE.BoxGeometry(0.16, 0.16, 0.16);
      const mesh = new THREE.Mesh(geo, isSpark ? sparkMat : dustMat);
      mesh.position.set(pos.x, 0.1, pos.z);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 4.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 4.0,
        Math.sin(angle) * speed
      );
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        gravity: -12.0,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        scale: 1.2
      });
    }
  }

  update(dt) {
    // Update individual particle meshes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose?.();
        this.particles.splice(i, 1);
        continue;
      }

      p.vel.y += p.gravity * dt;
      p.mesh.position.x += p.vel.x * dt;
      p.mesh.position.y += p.vel.y * dt;
      p.mesh.position.z += p.vel.z * dt;

      // Rotate
      if (p.isMoney) {
        p.mesh.rotation.x += dt * 8;
        p.mesh.rotation.z += dt * 5;
        p.mesh.rotation.y += dt * 3;
      } else if (p.isConfetti) {
        p.mesh.rotation.x += dt * 9;
        p.mesh.rotation.y += dt * 7;
        p.mesh.rotation.z += dt * 4;
      } else if (p.isHeart) {
        p.mesh.rotation.y += dt * 3.5;
        p.mesh.position.x += Math.sin(p.life * 6) * dt * 0.4;
      } else {
        p.mesh.rotation.x += dt * 4;
        p.mesh.rotation.y += dt * 6;
      }

      // Scale down with life
      const ratio = p.life / p.maxLife;
      const currentScale = p.scale * ratio;
      p.mesh.scale.set(currentScale, currentScale, currentScale);
    }

    // Update shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.scale += r.speed * dt;
      r.opacity -= dt * 1.2;

      if (r.opacity <= 0) {
        this.scene.remove(r.mesh);
        r.mesh.geometry.dispose?.();
        this.rings.splice(i, 1);
        continue;
      }

      r.mesh.scale.set(r.scale, 1, r.scale);
      r.mesh.material.opacity = Math.max(0, r.opacity);
    }
  }

  clear() {
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.rings.forEach(r => this.scene.remove(r.mesh));
    this.particles = [];
    this.rings = [];
  }
}
