import * as THREE from 'three';

/**
 * KARACHI RUNNER 3D Avatars
 * Authentic 3D humanoid character models representing Karachi residents,
 * inspired by athletic arcade runners (Temple Run & Subway Surfers)
 * featuring traditional Pakistani attire (Mandarin Ban Collar, Kameez Daman,
 * tailored Karachi Waistcoat, Shalwar with gathered pancha, Peshawari Chappals),
 * athletic 90-degree bent-elbow running gait with forward lean, and solid physics.
 */

export const AVATAR_PROFILES = [
  {
    id: 'tariq',
    name: 'Tariq - Street Hero',
    tag: 'Neighborhood Vigilante',
    icon: '👕',
    perk: '+10% Movement Speed',
    outfit: 'Deep Green Kurta with Ban Collar, Charcoal Waistcoat & Peshawari Chappals',
    colors: {
      kameez: 0x1b5e20, // Deep Pakistani Green Kurta
      shalwar: 0xf5f5f5, // Crisp White Shalwar
      waistcoat: 0x212121, // Charcoal Black Karachi Waistcoat
      skin: 0xc88d5e, // Warm Olive South Asian skin tone
      hair: 0x151515, // Raven Black styled hair
      shoes: 0x3e2723, // Classic Dark Leather Peshawari Chappal
      collar: 0x144a19, // Stiff Ban Collar
      accent: 0xffd700  // Gold buttons
    }
  },
  {
    id: 'ayesha',
    name: 'Ayesha - Civic Crusader',
    tag: 'University Student & Activist',
    icon: '🌸',
    perk: '+15% Cleansing Reach',
    outfit: 'Ajrak Scarf, Turquoise Kurti Daman, Denim Jeans & Street Sneakers',
    colors: {
      kameez: 0x00838f, // Vibrant Turquoise Teal Kurti
      shalwar: 0x1565c0, // Denim Blue Fitted Trousers
      ajrak: 0xb71c1c, // Crimson Red Sindhi Ajrak Scarf
      skin: 0xdf9d72, // Warm glowing skin tone
      hair: 0x111111,
      shoes: 0xffffff, // Crisp White Street Sneakers
      collar: 0x00695c,
      accent: 0xffd54f
    }
  },
  {
    id: 'farooq',
    name: 'Inspector Farooq',
    tag: 'Traffic Police Officer',
    icon: '👮‍♂️',
    perk: 'Siren Whistle Stuns Evils',
    outfit: 'Karachi Traffic Police Crisp White Uniform, Peaked Cap & Golden Insignia',
    colors: {
      kameez: 0xffffff, // Crisp White Police Uniform Shirt
      shalwar: 0x0d47a1, // Navy Blue Uniform Trousers with side stripe
      vest: 0xeeff41, // Fluorescent Safety Harness / Vest
      skin: 0xba7d50, // Sun-weathered olive skin tone
      hair: 0x1a1a1a,
      shoes: 0x111111, // Polished Black Leather Police Boots
      collar: 0xe0e0e0,
      accent: 0xffd700  // Police Gold Badge & Buttons
    }
  },
  {
    id: 'bilal',
    name: 'Bilal - Edhi Volunteer',
    tag: 'Emergency Rescue Paramedic',
    icon: '🚑',
    perk: 'Double XP on Rescues',
    outfit: 'Edhi Rescue White Kurta Suit with Paramedic Green Vest & Badges',
    colors: {
      kameez: 0xf8f9fa, // Clean White Rescue Kurta
      shalwar: 0xf8f9fa, // Clean White Shalwar
      vest: 0x2e7d32, // Edhi Green Rescue Paramedic Vest
      skin: 0xc28555,
      hair: 0x1e1e1e,
      shoes: 0x424242, // Durable rescue boots
      collar: 0xeeeeee,
      accent: 0xffffff  // White Crescent/Star & Rescue Cross
    }
  },
  {
    id: 'zain',
    name: 'Zain - Eco Cadet',
    tag: 'School Climate Crusader',
    icon: '🎒',
    perk: 'Bonus Points on Trash Sorting',
    outfit: 'Karachi School Uniform Blazer, Fluttering Green Cape & Crest',
    colors: {
      kameez: 0x1b5e20, // Forest Green School Blazer
      shalwar: 0x455a64, // Slate Grey School Trousers
      cape: 0x00e676, // Bright Fluttering Eco Cape
      skin: 0xdfa075,
      hair: 0x211c18,
      shoes: 0x1a1a1a, // Black School Oxfords
      collar: 0xffffff, // White shirt collar with school tie
      accent: 0xffd700
    }
  },
  {
    id: 'biryani_rider',
    name: 'Chacha Biryani - Fast Delivery',
    tag: 'Speedy Food Rider',
    icon: '🛵',
    perk: 'Biryani Super Boost + Magnet',
    outfit: 'Reflective Delivery Jacket, Safety Helmet & Steaming Hot Biryani Backpack',
    colors: {
      kameez: 0xff6d00, // Vibrant Orange Delivery Jacket
      shalwar: 0x263238, // Dark Cargo Trousers
      vest: 0xffd600, // High-Vis Reflective Vest
      skin: 0xc88d5e,
      hair: 0x111111,
      shoes: 0xd84315, // High-traction delivery sneakers
      collar: 0x212121,
      accent: 0xffffff
    }
  },
  {
    id: 'captain_karachi',
    name: 'Captain Karachi - Super Kid',
    tag: 'Cosmic Superhero',
    icon: '⚡',
    perk: 'Super Flying Boosts & Electric Cape',
    outfit: 'Red & Gold Super Suit with Electric Blue Flying Cape & Lightning Emblem',
    colors: {
      kameez: 0xd50000, // Vibrant Hero Red Suit
      shalwar: 0xffc107, // Hero Gold Tights
      cape: 0x2979ff, // Electric Blue Hero Cape
      skin: 0xd89568,
      hair: 0x151515,
      shoes: 0xd50000, // Crimson Super Boots
      collar: 0xffc107,
      accent: 0xffeb3b
    }
  },
  {
    id: 'chai_wala',
    name: 'Ustad Chai Wala',
    tag: 'Burns Road Chai Legend',
    icon: '🫖',
    perk: 'Instant 2x Heart Restores & Kettle',
    outfit: 'Mustard Kurta, White Shalwar, Crimson Apron & Metallic Chai Kettle',
    colors: {
      kameez: 0xfbc02d, // Classic Mustard Kurta
      shalwar: 0xffffff, // White Pleated Shalwar
      vest: 0xb71c1c, // Crimson Red Chai Apron
      skin: 0xba7d50,
      hair: 0x1f1f1f,
      shoes: 0x4e342e, // Leather Peshawari Chappal
      collar: 0xf57f17,
      accent: 0xffffff
    }
  }
];

export class AvatarBuilder {
  /**
   * Build a 3D procedural humanoid character model authentic to Karachi
   * with athletic proportions, traditional Pakistani attire, and bent-elbow running kinematics.
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
    const goldMat = new THREE.MeshLambertMaterial({ color: colors.accent || 0xffd700 });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // ==========================================
    // 1. TORSO & ATTIRE (Athletic V-Taper + Kurta)
    // ==========================================
    // Upper torso (Chest & Shoulders with athletic taper)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.52, 10);
    const torso = new THREE.Mesh(torsoGeo, kameezMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    group.add(torso);

    // Abdomen / Lower Kurta base
    const lowerTorsoGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.26, 10);
    const lowerTorso = new THREE.Mesh(lowerTorsoGeo, kameezMat);
    lowerTorso.position.y = 0.74;
    lowerTorso.castShadow = true;
    group.add(lowerTorso);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.14, 10);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.34;
    group.add(neck);

    // Mandarin "Ban" Collar (بین کالر) - Hallmark of Pakistani Kurta
    const collarMat = new THREE.MeshLambertMaterial({ color: colors.collar || colors.kameez });
    const collarGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.07, 12, 1, true);
    const banCollar = new THREE.Mesh(collarGeo, collarMat);
    banCollar.position.y = 1.33;
    group.add(banCollar);

    // Front Placket (پٹی) with button studs running down the chest
    const placketMat = new THREE.MeshLambertMaterial({ color: colors.collar || colors.kameez });
    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.02), placketMat);
    placket.position.set(0, 1.10, 0.215);
    group.add(placket);

    // Metallic Buttons on Placket
    for (let b = 0; b < 3; b++) {
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), goldMat);
      button.position.set(0, 1.20 - b * 0.08, 0.228);
      group.add(button);
    }

    // Kameez Daman (دامن) Flaps: Hanging below waist over hips with side slits (chaak)
    // Front Daman Flap
    const damanGeo = new THREE.BoxGeometry(0.38, 0.30, 0.02);
    const damanFront = new THREE.Mesh(damanGeo, kameezMat);
    damanFront.position.set(0, 0.62, 0.13);
    damanFront.rotation.x = 0.08;
    group.add(damanFront);

    // Back Daman Flap
    const damanBack = new THREE.Mesh(damanGeo, kameezMat);
    damanBack.position.set(0, 0.62, -0.13);
    damanBack.rotation.x = -0.08;
    group.add(damanBack);

    // Waistcoat / Vest overlay
    if (colors.waistcoat) {
      // Authentic Karachi Waistcoat: V-neck cut, dark fabric, breast welt pocket
      const vestGeo = new THREE.CylinderGeometry(0.255, 0.25, 0.50, 10);
      const vestMat = new THREE.MeshLambertMaterial({ color: colors.waistcoat });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.y = 1.06;
      group.add(vest);

      // Left breast welt pocket with pocket square (handkerchief tip)
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.015), new THREE.MeshLambertMaterial({ color: 0x111111 }));
      pocket.position.set(-0.11, 1.14, 0.24);
      group.add(pocket);

      const pocketSquare = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.01), whiteMat);
      pocketSquare.position.set(-0.11, 1.155, 0.245);
      pocketSquare.rotation.z = 0.15;
      group.add(pocketSquare);

      // Waistcoat front buttons
      for (let vb = 0; vb < 4; vb++) {
        const vestBtn = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), goldMat);
        vestBtn.position.set(0, 1.22 - vb * 0.09, 0.255);
        group.add(vestBtn);
      }
    } else if (colors.vest) {
      const vestGeo = new THREE.CylinderGeometry(0.255, 0.25, 0.52, 10);
      const vestMat = new THREE.MeshLambertMaterial({ color: colors.vest });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.y = 1.05;
      group.add(vest);

      if (avatarId === 'bilal') {
        // Edhi Paramedic Crescent & Cross Emblem on Chest
        const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12, Math.PI * 1.5), whiteMat);
        crescent.position.set(-0.10, 1.15, 0.255);
        group.add(crescent);

        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, 0.01), whiteMat);
        crossH.position.set(0.10, 1.15, 0.255);
        group.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.06, 0.01), whiteMat);
        crossV.position.set(0.10, 1.15, 0.255);
        group.add(crossV);
      }
    }

    // Ajrak Scarf draped around shoulders for Ayesha (Authentic Sindhi Ajrak print geometry)
    if (colors.ajrak) {
      const ajrakMat = new THREE.MeshLambertMaterial({ color: colors.ajrak });
      const ajrakLoop = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.065, 8, 16), ajrakMat);
      ajrakLoop.rotation.x = Math.PI / 2;
      ajrakLoop.position.y = 1.30;
      group.add(ajrakLoop);

      // Trailing drape hanging down front chest
      const drape = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.03), ajrakMat);
      drape.position.set(0.14, 1.05, 0.22);
      drape.rotation.z = -0.12;
      group.add(drape);
    }

    // Hero Cape for Zain / Captain Karachi
    let capeMesh = null;
    if (colors.cape) {
      const capeGeo = new THREE.PlaneGeometry(0.44, 0.85, 4, 4);
      const capeMat = new THREE.MeshLambertMaterial({ color: colors.cape, side: THREE.DoubleSide });
      capeMesh = new THREE.Mesh(capeGeo, capeMat);
      capeMesh.position.set(0, 1.02, -0.25);
      capeMesh.rotation.x = 0.18;
      group.add(capeMesh);
    }

    // ==========================================
    // 2. HEAD, SCULPTED FACE & KARACHI STYLING
    // ==========================================
    const headGeo = new THREE.SphereGeometry(0.17, 14, 14);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.51;
    head.castShadow = true;
    group.add(head);

    // Sculpted Jaw / Chin definition
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.12), skinMat);
    jaw.position.set(0, 1.41, 0.06);
    group.add(jaw);

    // Expressive Almond Eyes (White Sclera + Dark Iris)
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Left Eye
    const eyeLWhite = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeWhiteMat);
    eyeLWhite.scale.set(1.2, 0.7, 0.5);
    eyeLWhite.position.set(-0.062, 1.52, 0.155);
    group.add(eyeLWhite);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), pupilMat);
    eyeL.position.set(-0.062, 1.52, 0.168);
    group.add(eyeL);

    // Right Eye
    const eyeRWhite = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeWhiteMat);
    eyeRWhite.scale.set(1.2, 0.7, 0.5);
    eyeRWhite.position.set(0.062, 1.52, 0.155);
    group.add(eyeRWhite);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), pupilMat);
    eyeR.position.set(0.062, 1.52, 0.168);
    group.add(eyeR);

    // Confident Athletic Eyebrows
    const browMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const browL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 0.02), browMat);
    browL.rotation.z = 0.12;
    browL.position.set(-0.062, 1.555, 0.165);
    group.add(browL);

    const browR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 0.02), browMat);
    browR.rotation.z = -0.12;
    browR.position.set(0.062, 1.555, 0.165);
    group.add(browR);

    // Subtle Nose Bridge
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.06, 6), skinMat);
    nose.position.set(0, 1.485, 0.175);
    group.add(nose);

    // Authentic Groomed Pakistani Mustache for Tariq & Inspector Farooq
    if (avatarId === 'tariq' || avatarId === 'farooq' || avatarId === 'chai_wala') {
      const stacheMat = new THREE.MeshLambertMaterial({ color: 0x151515 });
      const stache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.028, 0.035), stacheMat);
      stache.position.set(0, 1.442, 0.178);
      group.add(stache);
    }

    // Hairstyles & Character Headgear
    if (avatarId === 'farooq') {
      // Traffic Police Peaked Cap with Golden Karachi Emblem
      const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.11, 14), whiteMat);
      capCrown.position.y = 1.64;
      group.add(capCrown);

      const capVisor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x050505 }));
      capVisor.rotation.x = 0.24;
      capVisor.position.set(0, 1.60, 0.09);
      group.add(capVisor);

      const capBadge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), goldMat);
      capBadge.position.set(0, 1.65, 0.185);
      group.add(capBadge);
    } else if (avatarId === 'biryani_rider') {
      // High-Visibility Delivery Helmet + Tinted Visor
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.205, 14, 14), new THREE.MeshLambertMaterial({ color: 0xffd600 }));
      helmet.position.y = 1.54;
      group.add(helmet);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.075, 0.12), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
      visor.position.set(0, 1.53, 0.145);
      group.add(visor);

      // Steaming Hot Biryani Delivery Backpack
      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.32), new THREE.MeshLambertMaterial({ color: 0xff6d00 }));
      backpack.position.set(0, 1.05, -0.32);
      group.add(backpack);

      const boxLid = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 0.34), new THREE.MeshLambertMaterial({ color: 0xffd600 }));
      boxLid.position.set(0, 1.28, -0.32);
      group.add(boxLid);
    } else if (avatarId === 'captain_karachi') {
      // Superhero Mask & Styled Pompadour Hair
      const hairGeo = new THREE.SphereGeometry(0.185, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 1.53;
      group.add(hair);

      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.06, 0.05), goldMat);
      mask.position.set(0, 1.535, 0.165);
      group.add(mask);

      // Hero Lightning Chest Crest
      const emblem = new THREE.Mesh(new THREE.TetrahedronGeometry(0.10), goldMat);
      emblem.position.set(0, 1.15, 0.23);
      group.add(emblem);
    } else {
      // Styled Karachi Pompadour / Textured Fade Hair
      const hairGeo = new THREE.SphereGeometry(0.185, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.60);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.535, -0.01);
      group.add(hair);

      // Front hair pompadour volume
      const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), hairMat);
      quiff.scale.set(1.4, 0.9, 1.1);
      quiff.position.set(0, 1.63, 0.08);
      group.add(quiff);

      if (avatarId === 'ayesha') {
        // High Athletic Ponytail
        const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.035, 0.34, 8), hairMat);
        ponytail.rotation.x = 0.65;
        ponytail.position.set(0, 1.54, -0.22);
        group.add(ponytail);

        const hairTie = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.018, 6, 12), new THREE.MeshLambertMaterial({ color: 0x00e5ff }));
        hairTie.position.set(0, 1.58, -0.16);
        group.add(hairTie);
      }
    }

    // ==========================================
    // 3. ATHLETIC RUNNING LIMBS (Temple Run Bent-Elbow Kinematics)
    // ==========================================
    // Left Arm Pivot Group (At Shoulder)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.33, 1.28, 0);

    // Upper Arm (Swings from shoulder)
    const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.28, 8), kameezMat);
    upperArmL.position.set(0, -0.13, 0.02);
    upperArmL.rotation.x = -0.20; // Natural athletic forward pre-angle
    armLGroup.add(upperArmL);

    // Rolled-up Kurta Sleeve Cuff at elbow
    const cuffGeo = new THREE.TorusGeometry(0.062, 0.02, 6, 12);
    const cuffL = new THREE.Mesh(cuffGeo, kameezMat);
    cuffL.rotation.x = Math.PI / 2;
    cuffL.position.set(0, -0.26, 0.05);
    armLGroup.add(cuffL);

    // Forearm (Bent forward at ~80° elbow angle like Temple Run runners)
    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.26, 8), skinMat);
    forearmL.position.set(0, -0.36, 0.14);
    forearmL.rotation.x = 0.78;
    armLGroup.add(forearmL);

    // Runner Smartwatch on left wrist
    const watch = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 6, 12), new THREE.MeshLambertMaterial({ color: 0x00e5ff }));
    watch.position.set(0, -0.44, 0.22);
    armLGroup.add(watch);

    // Left Athletic Clenched Runner Fist
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.085), skinMat);
    handL.position.set(0, -0.48, 0.25);
    armLGroup.add(handL);
    group.add(armLGroup);

    // Right Arm Pivot Group (At Shoulder)
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.33, 1.28, 0);

    // Upper Arm
    const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.28, 8), kameezMat);
    upperArmR.position.set(0, -0.13, 0.02);
    upperArmR.rotation.x = -0.20;
    armRGroup.add(upperArmR);

    // Rolled Sleeve Cuff
    const cuffR = new THREE.Mesh(cuffGeo, kameezMat);
    cuffR.rotation.x = Math.PI / 2;
    cuffR.position.set(0, -0.26, 0.05);
    armRGroup.add(cuffR);

    // Forearm
    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.26, 8), skinMat);
    forearmR.position.set(0, -0.36, 0.14);
    forearmR.rotation.x = 0.78;
    armRGroup.add(forearmR);

    // Right Athletic Clenched Runner Fist
    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.085), skinMat);
    handR.position.set(0, -0.48, 0.25);
    armRGroup.add(handR);

    // Metallic Chai Kettle for Ustad Chai Wala
    if (avatarId === 'chai_wala') {
      const kettle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.16, 8),
        new THREE.MeshLambertMaterial({ color: 0x90a4ae })
      );
      kettle.position.set(0, -0.58, 0.32);
      armRGroup.add(kettle);

      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.1, 6),
        new THREE.MeshLambertMaterial({ color: 0x78909c })
      );
      spout.rotation.x = -0.6;
      spout.position.set(0, -0.54, 0.42);
      armRGroup.add(spout);
    }
    group.add(armRGroup);

    // ==========================================
    // 4. SHALWAR & FOOTWEAR (Peshawari Chappal / Sneakers)
    // ==========================================
    const isPeshawari = (avatarId === 'tariq' || avatarId === 'chai_wala' || avatarId === 'bilal');

    // Helper to build authentic Peshawari Chappal (thick tyre sole + leather cross-vamp)
    const createPeshawariChappal = () => {
      const chappalGroup = new THREE.Group();
      // Thick dark tyre-tread sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.28), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
      sole.position.set(0, -0.63, 0.04);
      chappalGroup.add(sole);

      // Rich leather upper vamp (crossed pointed toe strap)
      const vamp = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.16), shoeMat);
      vamp.position.set(0, -0.59, 0.09);
      chappalGroup.add(vamp);

      // Ankle buckle heel strap
      const heelStrap = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.04, 0.03), shoeMat);
      heelStrap.position.set(0, -0.59, -0.06);
      chappalGroup.add(heelStrap);

      // Buckle detail
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.01), goldMat);
      buckle.position.set(0.065, -0.59, -0.05);
      chappalGroup.add(buckle);

      return chappalGroup;
    };

    // Helper to build Athletic Running Sneaker
    const createRunningSneaker = () => {
      const sneakerGroup = new THREE.Group();
      // White foam shock-absorption midsole
      const midsole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.045, 0.27), whiteMat);
      midsole.position.set(0, -0.63, 0.04);
      sneakerGroup.add(midsole);

      // Colored runner shoe upper
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.24), shoeMat);
      upper.position.set(0, -0.58, 0.04);
      sneakerGroup.add(upper);

      return sneakerGroup;
    };

    // Left Leg Pivot Group (At Hip)
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.13, 0.65, 0);

    // Shalwar Thigh Volume (Pleated loose fabric)
    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.35, 8), shalwarMat);
    thighL.position.y = -0.16;
    legLGroup.add(thighL);

    // Shalwar Ankle Cuff / Pancha (پانچہ)
    const calfL = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.072, 0.35, 8), shalwarMat);
    calfL.position.y = -0.45;
    legLGroup.add(calfL);

    // Footwear
    const shoeL = isPeshawari ? createPeshawariChappal() : createRunningSneaker();
    legLGroup.add(shoeL);
    group.add(legLGroup);

    // Right Leg Pivot Group (At Hip)
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.13, 0.65, 0);

    // Shalwar Thigh Volume
    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.35, 8), shalwarMat);
    thighR.position.y = -0.16;
    legRGroup.add(thighR);

    // Shalwar Ankle Cuff / Pancha
    const calfR = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.072, 0.35, 8), shalwarMat);
    calfR.position.y = -0.45;
    legRGroup.add(calfR);

    // Footwear
    const shoeR = isPeshawari ? createPeshawariChappal() : createRunningSneaker();
    legRGroup.add(shoeR);
    group.add(legRGroup);

    // Dummy aura group for backward compatibility
    const aura = new THREE.Group();
    aura.visible = false;
    group.add(aura);

    // ==========================================
    // 5. OVERHEAD FLOATING NAME BANNER
    // ==========================================
    let nameSprite = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(10, 16, 28, 0.85)';
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(4, 4, 248, 56, 12);
        } else {
          ctx.rect(4, 4, 248, 56);
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00e5ff';
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(4, 4, 248, 56, 12);
        } else {
          ctx.rect(4, 4, 248, 56);
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${profile.icon} ${profile.name.split(' - ')[0]}`, 128, 38);

        const nameTex = new THREE.CanvasTexture(canvas);
        const nameMat = new THREE.SpriteMaterial({ map: nameTex, transparent: true });
        nameSprite = new THREE.Sprite(nameMat);
        nameSprite.position.set(0, 2.15, 0);
        nameSprite.scale.set(1.4, 0.35, 1);
        group.add(nameSprite);
        if (isPlayer) {
          nameSprite.visible = false;
        }
      }
    }

    group.userData = {
      avatarId,
      profile,
      torso,
      lowerTorso,
      head,
      eyeL,
      eyeR,
      armLGroup,
      armRGroup,
      legLGroup,
      legRGroup,
      damanFront,
      damanBack,
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
   * Trigger Gutter / Manhole death animation: flailing limbs upward while dropping into void
   */
  static triggerGutterFall(group) {
    if (!group || !group.userData) return;
    group.userData.deathType = 'gutter';
    group.userData.deathTimer = 2.5;
  }

  /**
   * Trigger Vehicle / Wall crash death animation: backward arched ragdoll / knockback
   */
  static triggerBackwardRagdoll(group) {
    if (!group || !group.userData) return;
    group.userData.deathType = 'ragdoll';
    group.userData.deathTimer = 2.5;
  }

  /**
   * Trigger Chaser Capture death animation: tripping flat forward onto asphalt
   */
  static triggerTripAndFall(group) {
    if (!group || !group.userData) return;
    group.userData.deathType = 'trip';
    group.userData.deathTimer = 2.5;
  }

  /**
   * Reset death animation and restore character pose
   */
  static resetDeathAnimation(group) {
    if (!group || !group.userData) return;
    const ud = group.userData;
    ud.deathType = null;
    ud.deathTimer = 0;
    if (ud.torso) ud.torso.rotation.set(0, 0, 0);
    if (ud.lowerTorso) ud.lowerTorso.rotation.set(0, 0, 0);
    if (ud.head) ud.head.rotation.set(0, 0, 0);
    if (ud.armLGroup) ud.armLGroup.rotation.set(0, 0, 0);
    if (ud.armRGroup) ud.armRGroup.rotation.set(0, 0, 0);
    if (ud.legLGroup) ud.legLGroup.rotation.set(0, 0, 0);
    if (ud.legRGroup) ud.legRGroup.rotation.set(0, 0, 0);
    if (ud.damanFront) ud.damanFront.rotation.x = 0.08;
    if (ud.damanBack) ud.damanBack.rotation.x = -0.08;
    group.rotation.set(0, group.rotation.y, 0);
    group.scale.set(1, 1, 1);
  }

  /**
   * Update character walk/run, idle, and stunt animations every frame
   */
  static updateAnimation(group, isMoving, dt, speedMult = 1.0, isJumping = false) {
    if (!group || !group.userData) return;
    const ud = group.userData;

    // Hazard-Specific Death Animation States (Preserved 100% for test compatibility)
    if (ud.deathType === 'gutter') {
      // 1. Gutter Void Fall: arms flail straight up, head looks up in panic, legs kick
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, -2.8, dt * 14.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, -2.7, dt * 14.0);
      ud.armLGroup.rotation.z = THREE.MathUtils.lerp(ud.armLGroup.rotation.z, -0.65, dt * 10.0);
      ud.armRGroup.rotation.z = THREE.MathUtils.lerp(ud.armRGroup.rotation.z, 0.65, dt * 10.0);
      ud.legLGroup.rotation.x = Math.sin(Date.now() * 0.035) * 0.7;
      ud.legRGroup.rotation.x = -Math.sin(Date.now() * 0.035) * 0.7;
      ud.head.rotation.x = THREE.MathUtils.lerp(ud.head.rotation.x, -0.65, dt * 12.0);
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, 0.25, dt * 10.0);
      return;
    }

    if (ud.deathType === 'ragdoll') {
      // 2. Vehicle/Wall Crash: Backward arched ragdoll, limbs knocked wide
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, -1.25, dt * 14.0);
      ud.head.rotation.x = THREE.MathUtils.lerp(ud.head.rotation.x, -0.85, dt * 14.0);
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, 1.4, dt * 12.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, 1.35, dt * 12.0);
      ud.armLGroup.rotation.z = THREE.MathUtils.lerp(ud.armLGroup.rotation.z, -1.1, dt * 10.0);
      ud.armRGroup.rotation.z = THREE.MathUtils.lerp(ud.armRGroup.rotation.z, 1.1, dt * 10.0);
      ud.legLGroup.rotation.x = THREE.MathUtils.lerp(ud.legLGroup.rotation.x, -1.15, dt * 12.0);
      ud.legRGroup.rotation.x = THREE.MathUtils.lerp(ud.legRGroup.rotation.x, -0.95, dt * 12.0);
      return;
    }

    if (ud.deathType === 'trip') {
      // 3. Chaser Capture: Trip forward flat onto asphalt, hands bracing pavement
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, 1.48, dt * 14.0);
      ud.torso.position.y = THREE.MathUtils.lerp(ud.torso.position.y, 0.22, dt * 14.0);
      ud.head.rotation.x = THREE.MathUtils.lerp(ud.head.rotation.x, 0.45, dt * 12.0);
      ud.head.position.y = THREE.MathUtils.lerp(ud.head.position.y, 0.28, dt * 14.0);
      ud.armLGroup.rotation.x = THREE.MathUtils.lerp(ud.armLGroup.rotation.x, -1.55, dt * 14.0);
      ud.armRGroup.rotation.x = THREE.MathUtils.lerp(ud.armRGroup.rotation.x, -1.55, dt * 14.0);
      ud.legLGroup.rotation.x = THREE.MathUtils.lerp(ud.legLGroup.rotation.x, 0, dt * 10.0);
      ud.legRGroup.rotation.x = THREE.MathUtils.lerp(ud.legRGroup.rotation.x, 0, dt * 10.0);
      return;
    }

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
      ud.animCycle += dt * 12.0 * speedMult;
      const stride = Math.sin(ud.animCycle);

      // Swing legs with energetic knee drive
      ud.legLGroup.rotation.x = stride * 0.76;
      ud.legRGroup.rotation.x = -stride * 0.76;

      // Temple Run Bent-Elbow Arm Pumping in energetic counter-phase
      ud.armLGroup.rotation.x = -stride * 0.72;
      ud.armRGroup.rotation.x = stride * 0.72;

      // Temple Run Dynamic Forward Torso Lean (14° to 20° forward lean based on sprint pace)
      const forwardLean = speedMult > 1.2 ? 0.22 : 0.14;
      ud.torso.rotation.x = THREE.MathUtils.lerp(ud.torso.rotation.x, forwardLean, dt * 8.0);
      if (ud.lowerTorso) {
        ud.lowerTorso.rotation.x = THREE.MathUtils.lerp(ud.lowerTorso.rotation.x, forwardLean * 0.6, dt * 8.0);
      }

      // Dynamic Kameez Daman flutter in the rushing wind
      if (ud.damanFront) {
        ud.damanFront.rotation.x = 0.14 + Math.sin(ud.animCycle) * 0.12;
      }
      if (ud.damanBack) {
        ud.damanBack.rotation.x = -0.22 + Math.cos(ud.animCycle) * 0.14;
      }

      // Dynamic vertical footstep bounce
      const bounce = Math.abs(Math.cos(ud.animCycle)) * 0.055;
      ud.torso.position.y = 1.05 + bounce;
      ud.head.position.y = 1.51 + bounce;

      // Cape / Scarf aerodynamic flutter
      if (ud.capeMesh) {
        ud.capeMesh.rotation.x = 0.42 + Math.sin(ud.animCycle * 1.8) * 0.25;
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
      if (ud.lowerTorso) ud.lowerTorso.rotation.x = THREE.MathUtils.lerp(ud.lowerTorso.rotation.x, 0, dt * 6.0);
      if (ud.damanFront) ud.damanFront.rotation.x = THREE.MathUtils.lerp(ud.damanFront.rotation.x, 0.08, dt * 6.0);
      if (ud.damanBack) ud.damanBack.rotation.x = THREE.MathUtils.lerp(ud.damanBack.rotation.x, -0.08, dt * 6.0);

      // Natural breathing chest expansion
      ud.torso.position.y = 1.05 + Math.sin(t * 2.8) * 0.016;
      ud.head.position.y = 1.51 + Math.sin(t * 2.8) * 0.016;

      // Vigilant street hero head turn: scanning left and right
      ud.head.rotation.y = Math.sin(t * 0.9) * 0.22;

      // Subtle weight shift on feet
      ud.torso.rotation.z = Math.sin(t * 1.4) * 0.02;
    }
  }
}
