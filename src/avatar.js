import * as THREE from 'three';

/**
 * Karachi Hero 3D Avatars
 * Procedural 3D humanoid character models representing authentic Karachi residents
 * with walking / running limb animations, street-level GTA third-person camera,
 * and solid obstacle collision physics.
 */

export const AVATAR_PROFILES = [
  {
    id: 'tariq',
    name: 'Tariq - Street Hero',
    tag: 'Neighborhood Vigilante',
    icon: '🇵🇰',
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

    // 2. Head & Neck
    const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.52;
    head.castShadow = true;
    group.add(head);

    // Hair / Police Cap
    if (avatarId === 'farooq') {
      // Traffic Police Peaked Cap
      const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.12, 12), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      capCrown.position.y = 1.66;
      group.add(capCrown);

      const capVisor = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 12, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x000000 }));
      capVisor.rotation.x = 0.2;
      capVisor.position.set(0, 1.62, 0.08);
      group.add(capVisor);
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

    // 4. Ground Civic Aura Disc (Subtle neon ring under feet)
    const auraGeo = new THREE.RingGeometry(0.45, 0.55, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.02;
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
      armLGroup,
      armRGroup,
      legLGroup,
      legRGroup,
      aura,
      nameSprite,
      capeMesh,
      animCycle: 0,
      isMoving: false,
      facingAngle: 0
    };

    return group;
  }

  /**
   * Update character walk/run animations every frame
   */
  static updateAnimation(group, isMoving, dt, speedMult = 1.0) {
    if (!group || !group.userData) return;
    const ud = group.userData;

    if (isMoving) {
      ud.animCycle += dt * 11.0 * speedMult;
      const stride = Math.sin(ud.animCycle);

      // Swing legs
      ud.legLGroup.rotation.x = stride * 0.65;
      ud.legRGroup.rotation.x = -stride * 0.65;

      // Swing arms in natural opposition
      ud.armLGroup.rotation.x = -stride * 0.55;
      ud.armRGroup.rotation.x = stride * 0.55;

      // Slight vertical bounce
      ud.torso.position.y = 0.98 + Math.abs(Math.cos(ud.animCycle)) * 0.04;
      ud.head.position.y = 1.52 + Math.abs(Math.cos(ud.animCycle)) * 0.04;

      // Cape flutter
      if (ud.capeMesh) {
        ud.capeMesh.rotation.x = 0.35 + Math.sin(ud.animCycle * 1.5) * 0.15;
      }

      // Rotate ground aura pulse
      ud.aura.rotation.z += dt * 2.0;
    } else {
      // Idle breathing pose smoothly resets limbs
      ud.legLGroup.rotation.x *= 0.85;
      ud.legRGroup.rotation.x *= 0.85;
      ud.armLGroup.rotation.x *= 0.85;
      ud.armRGroup.rotation.x *= 0.85;
      ud.torso.position.y = 0.98 + Math.sin(performance.now() * 0.003) * 0.015;
      ud.head.position.y = 1.52 + Math.sin(performance.now() * 0.003) * 0.015;
    }
  }
}
