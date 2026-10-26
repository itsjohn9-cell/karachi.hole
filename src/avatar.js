import * as THREE from 'three';

/**
 * KARACHI RUNNER 3D Avatars
 * Procedural 3D humanoid character models representing authentic Karachi residents
 * with walking / running limb animations, street-level GTA third-person camera,
 * and solid obstacle collision physics.
 */

export const AVATAR_PROFILES = [
  {
    id: 'tariq',
    name: 'Tariq - Street Hero',
    tag: 'Neighborhood Vigilante',
    icon: '👕',
    perk: '+10% Movement Speed',
    outfit: 'Green & White Shalwar Kameez with Karachi Waistcoat',
    colors: {
      kameez: 0x1b5e20, // Deep Pakistani Green
      shalwar: 0xf5f5f5, // Crisp White
      waistcoat: 0x212121, // Charcoal Black
      skin: 0xd79a6d,
      hair: 0x1a1a1a,
      shoes: 0xd32f2f // Red & White sneakers
    }
  },
  {
    id: 'ayesha',
    name: 'Ayesha - Civic Crusader',
    tag: 'University Student & Activist',
    icon: '🌸',
    perk: '+15% Cleansing Reach',
    outfit: 'Ajrak Scarf, Turquoise Tunic & Denim Jeans',
    colors: {
      kameez: 0x00838f, // Vibrant Turquoise Teal
      shalwar: 0x1565c0, // Denim Blue
      ajrak: 0xb71c1c, // Crimson Red Sindhi Ajrak
      skin: 0xe0a97d,
      hair: 0x111111,
      shoes: 0xffffff
    }
  },
  {
    id: 'farooq',
    name: 'Inspector Farooq',
    tag: 'Traffic Police Officer',
    icon: '👮‍♂️',
    perk: 'Siren Whistle Stuns Evils',
    outfit: 'Karachi Traffic Police White Uniform & Peaked Cap',
    colors: {
      kameez: 0xffffff, // Crisp White Uniform Shirt
      shalwar: 0x0d47a1, // Navy Police Trousers
      vest: 0xeeff41, // Fluorescent Safety Belt / Vest
      skin: 0xc68a5c,
      hair: 0x212121,
      shoes: 0x000000
    }
  },
  {
    id: 'bilal',
    name: 'Bilal - Edhi Volunteer',
    tag: 'Emergency Rescue Paramedic',
    icon: '🚑',
    perk: 'Double XP on Rescues',
    outfit: 'Edhi Rescue White Tunic & Green Medical Vest',
    colors: {
      kameez: 0xf5f5f5, // Clean White
      shalwar: 0xf5f5f5,
      vest: 0x2e7d32, // Edhi Green Rescue Vest
      skin: 0xd29b70,
      hair: 0x1e1e1e,
      shoes: 0x37474f
    }
  },
  {
    id: 'zain',
    name: 'Zain - Eco Cadet',
    tag: 'School Climate Crusader',
    icon: '🎒',
    perk: 'Bonus Points on Trash Sorting',
    outfit: 'Karachi School Uniform Blazer & Fluttering Hero Cape',
    colors: {
      kameez: 0x2e7d32, // Forest Green Blazer
      shalwar: 0x546e7a, // Slate Grey Trousers
      cape: 0x00e676, // Bright Green Superhero Cape
      skin: 0xe4b087,
      hair: 0x261e19,
      shoes: 0x1a1a1a
    }
  },
  {
    id: 'biryani_rider',
    name: 'Chacha Biryani - Fast Delivery',
    tag: 'Speedy Food Rider',
    icon: '🛵',
    perk: 'Biryani Super Boost + Magnet',
    outfit: 'Delivery Jacket, Yellow Helmet & Steaming Biryani Box',
    colors: {
      kameez: 0xff6d00, // Vibrant Orange Delivery Jacket
      shalwar: 0x212121, // Black Cargo Trousers
      vest: 0xffd600, // High-Vis Yellow Vest
      skin: 0xd29b70,
      hair: 0x111111,
      shoes: 0xff3d00
    }
  },
  {
    id: 'captain_karachi',
    name: 'Captain Karachi - Super Kid',
    tag: 'Cosmic Superhero',
    icon: '⚡',
    perk: 'Super Flying Boosts & Electric Cape',
    outfit: 'Red & Gold Super Suit with Electric Blue Flying Cape',
    colors: {
      kameez: 0xd50000, // Vibrant Hero Red
      shalwar: 0xffd600, // Hero Gold
      cape: 0x2979ff, // Electric Blue Hero Cape
      skin: 0xe0a97d,
      hair: 0x212121,
      shoes: 0xd50000
    }
  },
  {
    id: 'chai_wala',
    name: 'Ustad Chai Wala',
    tag: 'Burns Road Chai Legend',
    icon: '🫖',
    perk: 'Instant 2x Heart Restores & Kettle',
    outfit: 'Mustard Kurta, Red Apron & Metallic Chai Kettle',
    colors: {
      kameez: 0xfbc02d, // Classic Mustard Kurta
      shalwar: 0xffffff, // White Shalwar
      vest: 0xb71c1c, // Crimson Red Apron
      skin: 0xc68a5c,
      hair: 0x212121,
      shoes: 0x5d4037
    }
  }
];

export class AvatarBuilder {
  /**
   * Build a 3D procedural humanoid character model
   */
  static createAvatarMesh(avatarId = 'tariq', isPlayer = false) {
    const profile = AVATAR_PROFILES.find(a => a.id === avatarId) || AVATAR_PROFILES[0];
    const { colors } = profile;

    const group = new THREE.Group();
    group.name = `Avatar_${avatarId}`;

    // Common Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: colors.skin });
    const hairMat = new THREE.MeshLambertMaterial({ color: colors.hair });
    const kameezMat = new THREE.MeshLambertMaterial({ color: colors.kameez });
    const shalwarMat = new THREE.MeshLambertMaterial({ color: colors.shalwar });
    const shoeMat = new THREE.MeshLambertMaterial({ color: colors.shoes });

    // 1. Torso / Upper Body
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.72, 8);
    const torso = new THREE.Mesh(torsoGeo, kameezMat);
    torso.position.y = 0.98;
    torso.castShadow = true;
    group.add(torso);

    // Waistcoat / Vest overlay if applicable
    if (colors.waistcoat) {
      const vestGeo = new THREE.CylinderGeometry(0.25, 0.29, 0.58, 8);
      const vestMat = new THREE.MeshLambertMaterial({ color: colors.waistcoat });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.y = 1.05;
      group.add(vest);
    } else if (colors.vest) {
      const vestGeo = new THREE.CylinderGeometry(0.25, 0.29, 0.6, 8);
      const vestMat = new THREE.MeshLambertMaterial({ color: colors.vest });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.y = 1.04;
      group.add(vest);
    }

    // Ajrak Scarf draped around shoulders for Ayesha
    if (colors.ajrak) {
      const ajrakGeo = new THREE.TorusGeometry(0.28, 0.08, 6, 12);
      const ajrakMat = new THREE.MeshLambertMaterial({ color: colors.ajrak });
      const ajrak = new THREE.Mesh(ajrakGeo, ajrakMat);
      ajrak.rotation.x = Math.PI / 2;
      ajrak.position.y = 1.34;
      group.add(ajrak);
    }

    // Hero Cape for Zain
    let capeMesh = null;
    if (colors.cape) {
      const capeGeo = new THREE.PlaneGeometry(0.42, 0.75);
      const capeMat = new THREE.MeshLambertMaterial({ color: colors.cape, side: THREE.DoubleSide });
      capeMesh = new THREE.Mesh(capeGeo, capeMat);
      capeMesh.position.set(0, 0.98, -0.26);
      capeMesh.rotation.x = 0.15;
      group.add(capeMesh);
    }

    // 2. Head & Neck with Lively Facial Features
    const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.52;
    head.castShadow = true;
    group.add(head);

    // Expressive Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), eyeMat);
    eyeL.position.set(-0.06, 1.55, 0.16);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), eyeMat);
    eyeR.position.set(0.06, 1.55, 0.16);
    group.add(eyeR);

    // Authentic Groomed Mustache for Tariq & Farooq
    if (avatarId === 'tariq' || avatarId === 'farooq') {
      const mustacheMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.028, 0.035), mustacheMat);
      mustache.position.set(0, 1.48, 0.17);
      group.add(mustache);
    }

    // Hair / Helmets / Accessories
    if (avatarId === 'farooq') {
      // Traffic Police Peaked Cap with Golden Karachi Emblem
      const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.12, 12), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      capCrown.position.y = 1.66;
      group.add(capCrown);

      const capVisor = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 12, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x000000 }));
      capVisor.rotation.x = 0.2;
      capVisor.position.set(0, 1.62, 0.08);
      group.add(capVisor);

      const capBadge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), new THREE.MeshLambertMaterial({ color: 0xffd700 }));
      capBadge.position.set(0, 1.67, 0.19);
      group.add(capBadge);
    } else if (avatarId === 'biryani_rider') {
      // High-Visibility Delivery Helmet + Tinted Visor
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 12), new THREE.MeshLambertMaterial({ color: 0xffeb3b }));
      helmet.position.y = 1.54;
      group.add(helmet);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.12), new THREE.MeshLambertMaterial({ color: 0x212121 }));
      visor.position.set(0, 1.53, 0.14);
      group.add(visor);

      // Steaming Hot Biryani Delivery Backpack
      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.32), new THREE.MeshLambertMaterial({ color: 0xff6d00 }));
      backpack.position.set(0, 1.05, -0.32);
      group.add(backpack);

      const boxLid = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 0.34), new THREE.MeshLambertMaterial({ color: 0xffd600 }));
      boxLid.position.set(0, 1.28, -0.32);
      group.add(boxLid);
    } else if (avatarId === 'captain_karachi') {
      // Styled Hair + Superhero Gold Star Mask
      const hairGeo = new THREE.SphereGeometry(0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 1.54;
      group.add(hair);

      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.05), new THREE.MeshLambertMaterial({ color: 0xffd600 }));
      mask.position.set(0, 1.55, 0.16);
      group.add(mask);

      // Hero Lightning Emblem on Chest
      const emblem = new THREE.Mesh(new THREE.TetrahedronGeometry(0.10), new THREE.MeshLambertMaterial({ color: 0xffd600 }));
      emblem.position.set(0, 1.15, 0.24);
      group.add(emblem);
    } else {
      // Styled Hair
      const hairGeo = new THREE.SphereGeometry(0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 1.54;
      group.add(hair);

      if (avatarId === 'ayesha') {
        // Ponytail
        const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.32, 6), hairMat);
        ponytail.rotation.x = 0.6;
        ponytail.position.set(0, 1.52, -0.22);
        group.add(ponytail);
      }
    }

    // 3. Limbs (Arms & Legs with pivot groups for natural stride animations)
    // Left Arm
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.34, 1.3, 0);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), kameezMat);
    armL.position.y = -0.24;
    armLGroup.add(armL);
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), skinMat);
    handL.position.y = -0.52;
    armLGroup.add(handL);
    group.add(armLGroup);

    // Right Arm
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.34, 1.3, 0);
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6), kameezMat);
    armR.position.y = -0.24;
    armRGroup.add(armR);
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), skinMat);
    handR.position.y = -0.52;
    armRGroup.add(handR);

    // Metallic Chai Kettle for Ustad Chai Wala
    if (avatarId === 'chai_wala') {
      const kettle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.16, 8),
        new THREE.MeshLambertMaterial({ color: 0x90a4ae })
      );
      kettle.position.set(0, -0.62, 0.08);
      armRGroup.add(kettle);

      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.1, 6),
        new THREE.MeshLambertMaterial({ color: 0x78909c })
      );
      spout.rotation.x = -0.6;
      spout.position.set(0, -0.58, 0.18);
      armRGroup.add(spout);
    }

    group.add(armRGroup);

    // Left Leg
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.13, 0.65, 0);
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 6), shalwarMat);
    legL.position.y = -0.3;
    legLGroup.add(legL);
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
    shoeL.position.set(0, -0.6, 0.04);
    legLGroup.add(shoeL);
    group.add(legLGroup);

    // Right Leg
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.13, 0.65, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 6), shalwarMat);
    legR.position.y = -0.3;
    legRGroup.add(legR);
    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
    shoeR.position.set(0, -0.6, 0.04);
    legRGroup.add(shoeR);
    group.add(legRGroup);

    // Dummy aura group for backward compatibility (no visible ground circle)
    const aura = new THREE.Group();
    aura.visible = false;
    group.add(aura);

    // 5. Overhead Floating Name Banner
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10, 16, 28, 0.85)';
    ctx.roundRect(4, 4, 248, 56, 12);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00e5ff';
    ctx.roundRect(4, 4, 248, 56, 12);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${profile.icon} ${profile.name.split(' - ')[0]}`, 128, 38);

    const nameTex = new THREE.CanvasTexture(canvas);
    const nameMat = new THREE.SpriteMaterial({ map: nameTex, transparent: true });
    const nameSprite = new THREE.Sprite(nameMat);
    nameSprite.position.set(0, 2.1, 0);
    nameSprite.scale.set(1.4, 0.35, 1);
    group.add(nameSprite);
    if (isPlayer) {
      nameSprite.visible = false;
    }

    group.userData = {
      avatarId,
      profile,
      torso,
      head,
      eyeL,
      eyeR,
      armLGroup,
      armRGroup,
      legLGroup,
      legRGroup,
      aura,
      nameSprite,
      capeMesh,
      animCycle: 0,
      idleTimer: 0,
      isMoving: false,
      facingAngle: 0
    };

    return group;
  }

  /**
   * Trigger athletic stumble animation on character mesh
   */
  static triggerStumble(group, duration = 1.5) {
    if (!group || !group.userData) return;
    group.userData.stumbleTimer = duration;
  }

  /**
   * Update character walk/run and idle animations every frame
   */
  static updateAnimation(group, isMoving, dt, speedMult = 1.0, isJumping = false) {
    if (!group || !group.userData) return;
    const ud = group.userData;

    if ((ud.stumbleTimer || 0) > 0) {
      ud.stumbleTimer = Math.max(0, ud.stumbleTimer - dt);
      const stumbleProgress = ud.stumbleTimer / 1.5;
      const wobble = Math.sin(Date.now() * 0.025) * 0.28 * stumbleProgress;
      const pitchForward = 0.38 * Math.sin(Math.PI * stumbleProgress);

      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, pitchForward, dt * 12.0);
      ud.torso.rotation.z = THREE.MathUtils.lerp(ud.torso.rotation.z, wobble, dt * 14.0);
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, -1.0 + wobble, dt * 12.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, -0.8 - wobble, dt * 12.0);
      ud.armLGroup.rotation.z = THREE.MathUtils.lerp(ud.armLGroup.rotation.z, -0.45, dt * 10.0);
      ud.armRGroup.rotation.z = THREE.MathUtils.lerp(ud.armRGroup.rotation.z, 0.45, dt * 10.0);
      ud.legLGroup.rotation.x = Math.sin(Date.now() * 0.03) * 0.55;
      ud.legRGroup.rotation.x = -Math.sin(Date.now() * 0.03) * 0.55;
      return;
    }

    if (isJumping) {
      // Parkour Jump Traversal Pose: tuck legs up, arms spread for balance
      ud.legLGroup.rotation.x = THREE.MathUtils.lerp(ud.legLGroup.rotation.x, 0.55, dt * 12.0);
      ud.legRGroup.rotation.x = THREE.MathUtils.lerp(ud.legRGroup.rotation.x, 0.35, dt * 12.0);
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, -0.65, dt * 10.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, -0.65, dt * 10.0);
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, 0.15, dt * 8.0);
      return;
    }

    if (isMoving) {
      ud.animCycle += dt * 11.5 * speedMult;
      const stride = Math.sin(ud.animCycle);

      // Swing legs with knee stride
      ud.legLGroup.rotation.x = stride * 0.72;
      ud.legRGroup.rotation.x = -stride * 0.72;

      // Swing arms in natural opposition
      ud.armLGroup.rotation.x = -stride * 0.62;
      ud.armRGroup.rotation.x = stride * 0.62;

      // Dynamic forward athletic lean when sprinting
      const forwardLean = speedMult > 1.2 ? 0.22 : 0.10;
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, forwardLean, dt * 8.0);

      // Dynamic vertical footstep bounce
      ud.torso.position.y = 0.98 + Math.abs(Math.cos(ud.animCycle)) * 0.05;
      ud.head.position.y = 1.52 + Math.abs(Math.cos(ud.animCycle)) * 0.05;

      // Cape flutter
      if (ud.capeMesh) {
        ud.capeMesh.rotation.x = 0.38 + Math.sin(ud.animCycle * 1.6) * 0.22;
      }
    } else {
      // Rich Idle Breathing & Street Vigilante Scanning
      ud.idleTimer = (ud.idleTimer || 0) + dt;
      const t = ud.idleTimer;

      // Smoothly reset running tilt & limb extension
      ud.legLGroup.rotation.x = THREE.MathUtils.lerp(ud.legLGroup.rotation.x, 0, dt * 8.0);
      ud.legRGroup.rotation.x = THREE.MathUtils.lerp(ud.legRGroup.rotation.x, 0, dt * 8.0);
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, 0, dt * 8.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, 0, dt * 8.0);
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, 0, dt * 6.0);

      // Natural breathing chest expansion
      ud.torso.position.y = 0.98 + Math.sin(t * 2.8) * 0.016;
      ud.head.position.y = 1.52 + Math.sin(t * 2.8) * 0.016;

      // Vigilant street hero head turn: scanning left and right
      ud.head.rotation.y = Math.sin(t * 0.9) * 0.22;

      // Subtle weight shift on feet
      ud.torso.rotation.z = Math.sin(t * 1.4) * 0.02;
    }
  }
}
