import * as THREE from 'three';
import { TextureGenerator } from './textures.js';

// Cache reusable shared materials for 60FPS performance
const materials = {
  whiteMarble: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25, metalness: 0.05 }),
  goldMetal: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 }),
  darkVoid: new THREE.MeshBasicMaterial({ color: 0x050508 }),
  redBrick: new THREE.MeshStandardMaterial({ color: 0xa84134, roughness: 0.7 }),
  sandstone: new THREE.MeshStandardMaterial({ color: 0xdfc599, roughness: 0.6 }),
  roofGreen: new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.5 }),
  darkGlass: new THREE.MeshStandardMaterial({ color: 0x1a334d, roughness: 0.1, metalness: 0.9 }),
  towerConcrete: new THREE.MeshStandardMaterial({ color: 0xdde2e6, roughness: 0.4 }),
  asphalt: new THREE.MeshStandardMaterial({ color: 0x24282f, roughness: 0.8 }),
  curbYellow: new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.4 }),
  curbBlack: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x735238, roughness: 0.9 }),
  palmLeaves: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }),
  waterTankBlue: new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.3 }),
  waterTankSilver: new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.3, metalness: 0.6 }),
  rickshawGreen: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.3 }),
  rickshawYellow: new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.1, metalness: 0.95 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8d5b2c, roughness: 0.7 }),
  charpaiRope: new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 }),
  copperDeg: new THREE.MeshStandardMaterial({ color: 0xd87d4a, roughness: 0.25, metalness: 0.85 }),
  mangoOrange: new THREE.MeshStandardMaterial({ color: 0xffa000, roughness: 0.4 }),
  coneOrange: new THREE.MeshStandardMaterial({ color: 0xff5722, roughness: 0.3 }),
  lawnGreen: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.7 }),
  pedestrianSkin: new THREE.MeshStandardMaterial({ color: 0xd2a679, roughness: 0.6 }),
  shalwarWhite: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 }),
  shalwarNavy: new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.6 }),
  shalwarTeal: new THREE.MeshStandardMaterial({ color: 0x00695c, roughness: 0.6 }),
  jodhpurPink: new THREE.MeshStandardMaterial({ color: 0xc87d75, roughness: 0.65 }), // Mohatta Palace pink sandstone
  gizriYellow: new THREE.MeshStandardMaterial({ color: 0xd9be8b, roughness: 0.6 }), // Empress Market / Frere Hall yellow limestone
  hblBlue: new THREE.MeshStandardMaterial({ color: 0x00558f, roughness: 0.25, metalness: 0.4 }), // HBL Plaza facade
  bridgeGreen: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 }), // Shahrah-e-Faisal pedestrian bridge
  camelFur: new THREE.MeshStandardMaterial({ color: 0xb58450, roughness: 0.85 }), // Clifton Sea View decorated camel
  rilliPink: new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.5 }), // Sindhi Rilli patchwork
  rilliCyan: new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.5 }),
  rilliGold: new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.4 }),
  trafficSignGreen: new THREE.MeshStandardMaterial({ color: 0x005a36, roughness: 0.35 }), // Karachi Municipal Green Signboards
  colonialShutterGreen: new THREE.MeshStandardMaterial({ color: 0x1b4d3e, roughness: 0.5 }), // Saddar wooden shutters
  balconyIronBlack: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.85 }), // Wrought iron verandas
  charminarStone: new THREE.MeshStandardMaterial({ color: 0xebd8be, roughness: 0.6 }), // Bahadurabad Charminar stone
  kmcRedStone: new THREE.MeshStandardMaterial({ color: 0xb73a2e, roughness: 0.65 }), // KMC Building red Jodhpur stone
  mcbGlass: new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.1, metalness: 0.85 }), // MCB Tower glazed curtain wall
  tintedGlass: new THREE.MeshStandardMaterial({ color: 0x1a334d, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 }),
  shalwarGrey: new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.6 }),
  woodBench: new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.75 }),
  truckRed: new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 }),
  truckArtTexture: TextureGenerator.createTruckArtTexture(),
  truckTajTexture: TextureGenerator.createTruckTajTexture(),
  ajrakTexture: TextureGenerator.createAjrakTexture(),
};

// Cached textured materials
materials.truckArtMat = new THREE.MeshStandardMaterial({
  map: materials.truckArtTexture,
  roughness: 0.3,
  metalness: 0.1
});
materials.truckTajMat = new THREE.MeshStandardMaterial({
  map: materials.truckTajTexture,
  roughness: 0.2,
  metalness: 0.1,
  side: THREE.DoubleSide
});
materials.ajrakMat = new THREE.MeshStandardMaterial({
  map: materials.ajrakTexture,
  roughness: 0.4
});

export const KarachiModels = {
  materials,

  // 1. Mazar-e-Quaid (Jinnah's Mausoleum) - Tier 5 Colossal Landmark
  createMazarEQuaid() {
    const group = new THREE.Group();
    group.name = "Mazar-e-Quaid";

    // Tier 1 Base Platform (Terraced marble stairs)
    const baseGeo = new THREE.BoxGeometry(22, 1.4, 22);
    const base = new THREE.Mesh(baseGeo, materials.whiteMarble);
    base.position.y = 0.7;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Tier 2 Upper Plinth
    const plinthGeo = new THREE.BoxGeometry(18, 1.2, 18);
    const plinth = new THREE.Mesh(plinthGeo, materials.whiteMarble);
    plinth.position.y = 2.0;
    plinth.castShadow = true;
    group.add(plinth);

    // Cube Mausoleum Main Chamber
    const chamberGeo = new THREE.BoxGeometry(13, 9, 13);
    const chamber = new THREE.Mesh(chamberGeo, materials.whiteMarble);
    chamber.position.y = 7.1;
    chamber.castShadow = true;
    chamber.receiveShadow = true;
    group.add(chamber);

    // 4 Grand Pointed Arches on each side
    const archMat = new THREE.MeshBasicMaterial({ color: 0x111116 });
    const archSides = [
      { pos: [0, 6.2, 6.55], rot: [0, 0, 0] },
      { pos: [0, 6.2, -6.55], rot: [0, Math.PI, 0] },
      { pos: [6.55, 6.2, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-6.55, 6.2, 0], rot: [0, -Math.PI / 2, 0] }
    ];

    archSides.forEach(side => {
      const arch = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 6.5), archMat);
      arch.position.set(...side.pos);
      arch.rotation.set(...side.rot);
      group.add(arch);

      // Gold arch frame rim
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 0.2), materials.goldMetal);
      frame.position.set(side.pos[0], side.pos[1] + 3.3, side.pos[2]);
      frame.rotation.set(...side.rot);
      group.add(frame);
    });

    // Pure White Majestic Hemispherical Dome
    const domeGeo = new THREE.SphereGeometry(6.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, materials.whiteMarble);
    dome.position.y = 11.6;
    dome.castShadow = true;
    group.add(dome);

    // Golden Crescent / Finial on top
    const finialPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.2, 12), materials.goldMetal);
    finialPole.position.y = 18.5;
    group.add(finialPole);

    const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), materials.goldMetal);
    finialBall.position.y = 19.5;
    group.add(finialBall);

    // Surrounding 4 Corner Planters & Manicured Lawn Base
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 26), materials.lawnGreen);
    lawn.position.y = 0.15;
    lawn.receiveShadow = true;
    group.add(lawn);

    const cornerCoords = [
      [10.5, 10.5], [-10.5, 10.5], [10.5, -10.5], [-10.5, -10.5]
    ];
    cornerCoords.forEach(([cx, cz]) => {
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.0, 16), materials.whiteMarble);
      planter.position.set(cx, 0.8, cz);
      group.add(planter);

      const plant = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), materials.palmLeaves);
      plant.position.set(cx, 1.8, cz);
      group.add(plant);
    });

    return group;
  },

  // 2. Empress Market (Saddar Colonial Clock Tower) - Tier 4 Landmark
  createEmpressMarket() {
    const group = new THREE.Group();
    group.name = "Empress-Market";

    // Colonial Red Brick Main Hall
    const hallGeo = new THREE.BoxGeometry(16, 5, 10);
    const hall = new THREE.Mesh(hallGeo, materials.redBrick);
    hall.position.y = 2.5;
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Sloped pitched roof wings
    const roofL = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), materials.roofGreen);
    roofL.position.set(-5, 6.2, 0);
    roofL.rotation.y = Math.PI / 4;
    group.add(roofL);

    const roofR = roofL.clone();
    roofR.position.set(5, 6.2, 0);
    group.add(roofR);

    // Central Tower Base
    const towerBaseGeo = new THREE.BoxGeometry(5.5, 11, 5.5);
    const towerBase = new THREE.Mesh(towerBaseGeo, materials.redBrick);
    towerBase.position.y = 5.5;
    towerBase.castShadow = true;
    group.add(towerBase);

    // Clock Face Chamber
    const clockRoomGeo = new THREE.BoxGeometry(5.8, 4.5, 5.8);
    const clockRoom = new THREE.Mesh(clockRoomGeo, materials.sandstone);
    clockRoom.position.y = 13.25;
    clockRoom.castShadow = true;
    group.add(clockRoom);

    // 4 Functional Clock Dials
    const clockDialGeo = new THREE.CircleGeometry(1.3, 24);
    const clockMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const clockFaces = [
      { pos: [0, 13.25, 2.92], rot: [0, 0, 0] },
      { pos: [0, 13.25, -2.92], rot: [0, Math.PI, 0] },
      { pos: [2.92, 13.25, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-2.92, 13.25, 0], rot: [0, -Math.PI / 2, 0] }
    ];
    clockFaces.forEach(f => {
      const dial = new THREE.Mesh(clockDialGeo, clockMat);
      dial.position.set(...f.pos);
      dial.rotation.set(...f.rot);
      group.add(dial);

      // Clock hands
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.05), materials.curbBlack);
      hand.position.set(f.pos[0], f.pos[1] + 0.2, f.pos[2] + (f.rot[1] === 0 ? 0.04 : -0.04));
      group.add(hand);
    });

    // Tower Steep Pyramid Roof
    const spireGeo = new THREE.ConeGeometry(4.2, 7.5, 4);
    const spire = new THREE.Mesh(spireGeo, materials.roofGreen);
    spire.position.y = 19.25;
    spire.rotation.y = Math.PI / 4;
    spire.castShadow = true;
    group.add(spire);

    // Bazaar Awnings & Market Crates at Base
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 2.5), awningMat);
    awning.position.set(0, 2.2, 5.5);
    awning.rotation.x = 0.2;
    group.add(awning);

    return group;
  },

  // 3. Habib Bank Plaza / I.I. Chundrigar Tower - Tier 5 Skyscraper
  createChundrigarSkyscraper() {
    const group = new THREE.Group();
    group.name = "Chundrigar-Tower";

    // Cylindrical / Multi-faceted Skyscraper Body (24 stories tall)
    const towerGeo = new THREE.CylinderGeometry(5.2, 5.6, 36, 16);
    const tower = new THREE.Mesh(towerGeo, materials.towerConcrete);
    tower.position.y = 18;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Reflective Glass Window Bands
    for (let y = 3; y < 35; y += 2.2) {
      const glassBand = new THREE.Mesh(
        new THREE.CylinderGeometry(5.3, 5.3, 0.9, 16),
        materials.darkGlass
      );
      glassBand.position.y = y;
      group.add(glassBand);
    }

    // Modern Crown / Helipad
    const roofPlaGeo = new THREE.CylinderGeometry(5.8, 5.2, 1.8, 16);
    const roofPlat = new THREE.Mesh(roofPlaGeo, materials.curbBlack);
    roofPlat.position.y = 36.9;
    group.add(roofPlat);

    // Transmission Mast on top
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 8, 8), materials.chrome);
    antenna.position.y = 41.5;
    group.add(antenna);

    // Warning Red Beacon
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    beacon.position.y = 45.6;
    group.add(beacon);

    // Ground entrance canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 4), materials.chrome);
    canopy.position.set(0, 3, 5.5);
    group.add(canopy);

    return group;
  },

  // 4. Commercial Plaza (Karachi Retail Plaza with Shop Sign) - Tier 4
  createCommercialPlaza(signText = "KABABJEES BAKERS", subText = "BURNS ROAD BRANCH") {
    const group = new THREE.Group();
    group.name = "Commercial-Plaza";

    // 4-Story Plaza Body
    const plazaGeo = new THREE.BoxGeometry(11, 14, 9);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xd9cbb5, roughness: 0.6 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 7;
    plaza.castShadow = true;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Windows grid
    const windowMat = materials.darkGlass;
    for (let floor = 4; floor <= 12; floor += 3.2) {
      for (let x = -3.8; x <= 3.8; x += 2.5) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), windowMat);
        win.position.set(x, floor, 4.52);
        group.add(win);
      }
    }

    // Shop Signboard on Ground Floor
    const signTexture = TextureGenerator.createShopSignTexture(signText, subText, '#b71c1c', '#ffffff');
    const signMat = new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.3 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(10.2, 2.2, 0.4), signMat);
    sign.position.set(0, 2.4, 4.7);
    group.add(sign);

    // Rooftop AC units and water tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 12), materials.waterTankBlue);
    tank.position.set(3, 14.9, 2);
    group.add(tank);

    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), materials.towerConcrete);
    acUnit.position.set(-2.5, 14.6, -1.5);
    group.add(acUnit);

    return group;
  },

  // 5. Karachi Residential Bungalow (DHA / PECHS Style) - Tier 3
  createResidentialBungalow() {
    const group = new THREE.Group();
    group.name = "Karachi-Bungalow";

    // Compound Wall
    const wallGeo = new THREE.BoxGeometry(10, 2.0, 10);
    // Main Villa
    const villaGeo = new THREE.BoxGeometry(7.5, 6.5, 7.5);
    const villaMat = new THREE.MeshStandardMaterial({ color: 0xefede6, roughness: 0.5 });
    const villa = new THREE.Mesh(villaGeo, villaMat);
    villa.position.set(0, 3.25, 0);
    villa.castShadow = true;
    villa.receiveShadow = true;
    group.add(villa);

    // Balcony on 2nd floor
    const balconyGeo = new THREE.BoxGeometry(5.5, 0.8, 1.5);
    const balcony = new THREE.Mesh(balconyGeo, materials.whiteMarble);
    balcony.position.set(0, 4.2, 4.2);
    group.add(balcony);

    // Front Gate & Boundary Wall
    const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 0.3), materials.sandstone);
    frontWallL.position.set(-3, 0.9, 4.8);
    group.add(frontWallL);

    const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 0.3), materials.sandstone);
    frontWallR.position.set(3, 0.9, 4.8);
    group.add(frontWallR);

    // Iron gate
    const gate = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.6, 0.1), materials.curbBlack);
    gate.position.set(0, 0.8, 4.8);
    group.add(gate);

    // Black rooftop water tank (iconic Karachi feature)
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.4, 12), materials.curbBlack);
    tank.position.set(2, 7.2, -1.5);
    group.add(tank);

    // Outer AC condenser unit
    const ac = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.5), materials.towerConcrete);
    ac.position.set(-3.85, 4.5, 1);
    group.add(ac);

    return group;
  },

  // 6. Pakistani Truck Art Bedford Truck - Tier 3
  createBedfordTruck() {
    const group = new THREE.Group();
    group.name = "Pakistani-Bedford-Truck";

    // Chassis & Wheels
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.5, 6.8);
    const chassis = new THREE.Mesh(chassisGeo, materials.curbBlack);
    chassis.position.y = 0.8;
    group.add(chassis);

    // 6 Big Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelPositions = [
      [-1.25, 0.6, 2.2], [1.25, 0.6, 2.2],
      [-1.25, 0.6, -1.2], [1.25, 0.6, -1.2],
      [-1.25, 0.6, -2.4], [1.25, 0.6, -2.4]
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, materials.rubber);
      wheel.position.set(...pos);
      wheel.castShadow = true;
      group.add(wheel);

      // Chrome rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.48, 8), materials.chrome);
      rim.rotateZ(Math.PI / 2);
      rim.position.set(...pos);
      group.add(rim);
    });

    // Rounded Classic Bedford Cabin
    const cabGeo = new THREE.BoxGeometry(2.3, 1.8, 2.2);
    const cab = new THREE.Mesh(cabGeo, materials.truckArtMat);
    cab.position.set(0, 1.9, 2.0);
    cab.castShadow = true;
    group.add(cab);

    // Intricate Carved Wooden Crown ("Taj") on Cab Roof!
    const tajGeo = new THREE.PlaneGeometry(2.6, 1.6);
    const taj = new THREE.Mesh(tajGeo, materials.truckTajMat);
    taj.position.set(0, 3.4, 2.4);
    taj.rotation.x = -0.15;
    group.add(taj);

    // Cargo Bed with Vibrant Truck Art Panels
    const cargoGeo = new THREE.BoxGeometry(2.4, 1.9, 4.4);
    const cargo = new THREE.Mesh(cargoGeo, materials.truckArtMat);
    cargo.position.set(0, 2.0, -1.2);
    cargo.castShadow = true;
    group.add(cargo);

    // Top Cargo Sacks / Crates
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xc8963e, roughness: 0.9 });
    for (let z = -2.8; z <= 0.6; z += 1.1) {
      for (let x = -0.7; x <= 0.7; x += 1.4) {
        const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), sackMat);
        sack.position.set(x, 3.2, z);
        group.add(sack);
      }
    }

    // Front Chrome Grille and Big Headlights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.2), materials.chrome);
    grille.position.set(0, 1.4, 3.12);
    group.add(grille);

    const lightGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff59d });
    const lightL = new THREE.Mesh(lightGeo, lightMat);
    lightL.position.set(-0.8, 1.35, 3.12);
    group.add(lightL);
    const lightR = lightL.clone();
    lightR.position.x = 0.8;
    group.add(lightR);

    // Chrome Side Exhaust Chimneys
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), materials.chrome);
    exhaust.position.set(1.22, 2.6, 0.8);
    group.add(exhaust);

    return group;
  },

  // 7. Karachi W-11 Mini-Bus - Tier 3
  createW11MiniBus() {
    const group = new THREE.Group();
    group.name = "W11-MiniBus";

    // Bus Body
    const busGeo = new THREE.BoxGeometry(2.3, 2.2, 6.2);
    // Yellow/Red/Turquoise striped bus body
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      roughness: 0.3
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    bus.position.y = 1.9;
    bus.castShadow = true;
    group.add(bus);

    // Turquoise side stripe
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.5, 6.0), stripeMat);
    stripe.position.y = 1.6;
    group.add(stripe);

    // Passenger Windows
    for (let z = -2.2; z <= 2.2; z += 1.1) {
      const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.65), materials.darkGlass);
      winL.position.set(-1.18, 2.2, z);
      winL.rotation.y = -Math.PI / 2;
      group.add(winL);

      const winR = winL.clone();
      winR.position.x = 1.18;
      winR.rotation.y = Math.PI / 2;
      group.add(winR);
    }

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), materials.darkGlass);
    windshield.position.set(0, 2.2, 3.12);
    group.add(windshield);

    // Rooftop Luggage Carrier with Spare Tires and Bags
    const rackGeo = new THREE.BoxGeometry(2.0, 0.4, 4.5);
    const rack = new THREE.Mesh(rackGeo, materials.chrome);
    rack.position.set(0, 3.15, -0.2);
    group.add(rack);

    const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12), materials.rubber);
    spareTire.position.set(0, 3.45, 0.5);
    group.add(spareTire);

    // 4 Bus Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-1.15, 0.5, 1.8], [1.15, 0.5, 1.8], [-1.15, 0.5, -1.8], [1.15, 0.5, -1.8]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, materials.rubber);
      w.position.set(...p);
      group.add(w);
    });

    return group;
  },

  // 8. Karachi Water Tanker Truck - Tier 3
  createWaterTanker() {
    const group = new THREE.Group();
    group.name = "Water-Tanker";

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 1.8), materials.rickshawGreen);
    cab.position.set(0, 1.8, 2.2);
    group.add(cab);

    // Big Cylindrical Water Tank ("WATER SUPPLY")
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.4, 16);
    tankGeo.rotateX(Math.PI / 2);
    const tank = new THREE.Mesh(tankGeo, materials.waterTankBlue);
    tank.position.set(0, 2.1, -1.1);
    tank.castShadow = true;
    group.add(tank);

    // Tanker Stripes
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.6, 16), materials.waterTankSilver);
    stripe.rotateX(Math.PI / 2);
    stripe.position.set(0, 2.1, -1.1);
    group.add(stripe);

    // 6 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-1.15, 0.55, 2.2], [1.15, 0.55, 2.2], [-1.15, 0.55, -0.6], [1.15, 0.55, -0.6], [-1.15, 0.55, -2.1], [1.15, 0.55, -2.1]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, materials.rubber);
      w.position.set(...p);
      group.add(w);
    });

    return group;
  },

  // 9. Karachi Auto-Rickshaw (3-Wheeler) - Tier 2
  createAutoRickshaw() {
    const group = new THREE.Group();
    group.name = "Auto-Rickshaw";

    // Green Lower Metal Body
    const lowerGeo = new THREE.BoxGeometry(1.3, 0.65, 2.2);
    const lower = new THREE.Mesh(lowerGeo, materials.rickshawGreen);
    lower.position.y = 0.65;
    lower.castShadow = true;
    group.add(lower);

    // Bright Yellow Canopy Hood
    const hoodGeo = new THREE.BoxGeometry(1.3, 1.0, 1.6);
    const hood = new THREE.Mesh(hoodGeo, materials.rickshawYellow);
    hood.position.set(0, 1.45, -0.3);
    hood.castShadow = true;
    group.add(hood);

    // Rear Passenger Seat Opening & Bench
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.6), seatMat);
    seat.position.set(0, 0.85, -0.5);
    group.add(seat);

    // Front Single Wheel Fork & Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(wheelGeo, materials.rubber);
    frontWheel.position.set(0, 0.3, 1.0);
    group.add(frontWheel);

    // Rear Dual Wheels
    const rearWheelL = new THREE.Mesh(wheelGeo, materials.rubber);
    rearWheelL.position.set(-0.68, 0.3, -0.6);
    group.add(rearWheelL);

    const rearWheelR = new THREE.Mesh(wheelGeo, materials.rubber);
    rearWheelR.position.set(0.68, 0.3, -0.6);
    group.add(rearWheelR);

    // Round Front Headlight & Chrome Handlebars
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), materials.chrome);
    headlight.position.set(0, 0.8, 1.12);
    group.add(headlight);

    return group;
  },

  // 10. Quetta Alamgir Chai Dhaba - Tier 2
  createChaiDhaba() {
    const group = new THREE.Group();
    group.name = "Quetta-Chai-Dhaba";

    // Tea Serving Counter
    const counterGeo = new THREE.BoxGeometry(2.4, 1.0, 1.2);
    const counter = new THREE.Mesh(counterGeo, materials.wood);
    counter.position.set(0, 0.5, 0);
    counter.castShadow = true;
    group.add(counter);

    // Big Silver Chai Deg / Samovar
    const samovar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.7, 12), materials.chrome);
    samovar.position.set(-0.6, 1.35, 0);
    group.add(samovar);

    // Tea glasses on counter
    for (let x = 0; x <= 0.6; x += 0.25) {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.16, 8), materials.darkGlass);
      glass.position.set(x, 1.08, 0);
      group.add(glass);
    }

    // Striped Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.6), materials.coneOrange);
    awning.position.set(0, 2.1, 0.2);
    awning.rotation.x = 0.1;
    group.add(awning);

    // 2 Traditional Pakistani Charpai (Woven rope beds)
    const createCharpai = (x, z, rot) => {
      const ch = new THREE.Group();
      // Wooden Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.0), materials.wood);
      frame.position.y = 0.45;
      ch.add(frame);
      // Woven Rope Netting
      const net = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.8), materials.charpaiRope);
      net.position.y = 0.48;
      ch.add(net);
      // 4 Turned Wooden Legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
      [[-0.8, 0.22, 0.4], [0.8, 0.22, 0.4], [-0.8, 0.22, -0.4], [0.8, 0.22, -0.4]].forEach(lp => {
        const leg = new THREE.Mesh(legGeo, materials.wood);
        leg.position.set(...lp);
        ch.add(leg);
      });
      ch.position.set(x, 0, z);
      ch.rotation.y = rot;
      return ch;
    };

    group.add(createCharpai(-1.8, 1.8, 0.3));
    group.add(createCharpai(1.8, 1.8, -0.2));

    const friendlyDecal = this.createFriendlyDecal('chai', '☕ CHAI RECHARGE • کڑک چائے');
    group.add(friendlyDecal);
    group.userData = {
      isFriendly: true,
      friendlyType: 'chai',
      name: "Quetta Chai Dhaba (چائے ڈھابہ)",
      friendlyDecal
    };

    return group;
  },

  // 11. Burns Road Biryani Stall with Giant Copper Degs - Tier 2
  createBurnsRoadBiryaniStall() {
    const group = new THREE.Group();
    group.name = "Burns-Road-Biryani";

    // Wood table
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.2), materials.wood);
    table.position.set(0, 0.42, 0);
    group.add(table);

    // Giant Copper Biryani Deg 1
    const deg1 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7), materials.copperDeg);
    deg1.position.set(-0.55, 1.0, 0);
    group.add(deg1);

    // Copper Deg Lid
    const lid1 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.18, 16), materials.copperDeg);
    lid1.position.set(-0.55, 1.28, 0);
    group.add(lid1);

    // Giant Copper Biryani Deg 2
    const deg2 = deg1.clone();
    deg2.position.x = 0.55;
    group.add(deg2);
    const lid2 = lid1.clone();
    lid2.position.x = 0.55;
    group.add(lid2);

    // Large Red & White Street Umbrella
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), materials.chrome);
    pole.position.set(0, 1.3, -0.6);
    group.add(pole);

    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.7, 12), materials.coneOrange);
    umbrella.position.set(0, 2.6, -0.6);
    group.add(umbrella);

    const friendlyDecal = this.createFriendlyDecal('food', '🍲 FEAST • بریانی دیگ');
    group.add(friendlyDecal);
    group.userData = {
      isFriendly: true,
      friendlyType: 'food',
      name: "Burns Road Biryani",
      friendlyDecal
    };

    return group;
  },

  // 12. Wooden 4-Wheel Fruit Pushcart (Thela) with Mangoes - Tier 1
  createFruitThela() {
    const group = new THREE.Group();
    group.name = "Fruit-Thela";

    // Cart Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.9), materials.wood);
    bed.position.y = 0.6;
    bed.castShadow = true;
    group.add(bed);

    // Red Cloth Covering
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.05, 0.92), materials.redBrick);
    cloth.position.y = 0.68;
    group.add(cloth);

    // 4 Wooden Spoke Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-0.72, 0.3, 0.35], [0.72, 0.3, 0.35], [-0.72, 0.3, -0.35], [0.72, 0.3, -0.35]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, materials.wood);
      w.position.set(...p);
      group.add(w);
    });

    // Piles of Sindhri Golden Mangoes & Oranges
    for (let x = -0.5; x <= 0.5; x += 0.22) {
      for (let z = -0.3; z <= 0.3; z += 0.22) {
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), materials.mangoOrange);
        fruit.position.set(x, 0.76, z);
        group.add(fruit);
      }
    }

    return group;
  },

  // 13. 70cc Motorbike - Tier 1
  createMotorbike() {
    const group = new THREE.Group();
    group.name = "CD70-Motorbike";

    // Frame & Engine
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.6), materials.chrome);
    engine.position.y = 0.45;
    group.add(engine);

    // Red Fuel Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.65, 8), materials.coneOrange);
    tank.rotateX(Math.PI / 2);
    tank.position.set(0, 0.72, 0.1);
    group.add(tank);

    // Black Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.7), materials.curbBlack);
    seat.position.set(0, 0.75, -0.45);
    group.add(seat);

    // Front & Back Thin Spoke Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const fWheel = new THREE.Mesh(wheelGeo, materials.rubber);
    fWheel.position.set(0, 0.32, 0.85);
    group.add(fWheel);

    const rWheel = new THREE.Mesh(wheelGeo, materials.rubber);
    rWheel.position.set(0, 0.32, -0.85);
    group.add(rWheel);

    // Chrome Handlebars
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), materials.chrome);
    handle.position.set(0, 0.95, 0.6);
    group.add(handle);

    return group;
  },

  // 14. Coastal Date/Coconut Palm Tree - Tier 2
  createPalmTree(height = 6.5) {
    const group = new THREE.Group();
    group.name = "Karachi-Palm-Tree";

    // Curved Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, height, 8);
    const trunk = new THREE.Mesh(trunkGeo, materials.palmTrunk);
    trunk.position.y = height / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    // Canopy of Palm Fronds
    const frondCount = 7;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i * Math.PI * 2) / frondCount;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 3.2, 5),
        materials.palmLeaves
      );
      frond.position.set(Math.cos(angle) * 1.2, height + 0.2, Math.sin(angle) * 1.2);
      frond.rotation.set(Math.sin(angle) * 0.9, angle, -Math.cos(angle) * 0.9);
      frond.castShadow = true;
      group.add(frond);
    }

    return group;
  },

  // 15. Karachi Pedestrian (Shalwar Kameez) - Tier 1
  createPedestrian() {
    const group = new THREE.Group();
    group.name = "Pedestrian";

    const clothesColors = [materials.shalwarWhite, materials.shalwarNavy, materials.shalwarTeal, materials.shalwarGrey];
    const clothMat = clothesColors[Math.floor(Math.random() * clothesColors.length)];

    // Body (Kameez tunic)
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.85, 8);
    const body = new THREE.Mesh(bodyGeo, clothMat);
    body.position.y = 0.88;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), materials.pedestrianSkin);
    head.position.y = 1.45;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), materials.blackMat);
    hair.position.y = 1.47;
    group.add(hair);

    // Arms with animation pivots
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.30, 1.25, 0);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.5, 6), clothMat);
    armL.position.y = -0.22;
    armLGroup.add(armL);
    group.add(armLGroup);

    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.30, 1.25, 0);
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.5, 6), clothMat);
    armR.position.y = -0.22;
    armRGroup.add(armR);
    group.add(armRGroup);

    // Legs with animation pivots
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.11, 0.6, 0);
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), clothMat);
    legL.position.y = -0.3;
    legLGroup.add(legL);
    group.add(legLGroup);

    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.11, 0.6, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), clothMat);
    legR.position.y = -0.3;
    legRGroup.add(legR);
    group.add(legRGroup);

    // Radiant Emerald Green Floating Friendly Badge (no floor ring)
    const friendlyDecal = this.createFriendlyDecal('citizen', '💚 FRIEND • INNOCENT CITIZEN');
    group.add(friendlyDecal);

    group.userData = {
      isFriendly: true,
      friendlyType: 'citizen',
      name: "Innocent Citizen",
      friendlyDecal,
      body,
      head,
      armLGroup,
      armRGroup,
      legLGroup,
      legRGroup,
      animCycle: Math.random() * 10,
      walkSpeed: 1.2 + Math.random() * 0.8
    };

    return group;
  },

  // 16. Street Lamp with Dual Karachi municipal arms - Tier 1
  createStreetLamp() {
    const group = new THREE.Group();
    group.name = "Street-Lamp";

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.2, 8), materials.chrome);
    pole.position.y = 2.6;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), materials.chrome);
    arm.position.y = 5.1;
    group.add(arm);

    const lampGeo = new THREE.BoxGeometry(0.3, 0.15, 0.4);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });
    const lampL = new THREE.Mesh(lampGeo, lampMat);
    lampL.position.set(-0.8, 5.0, 0);
    group.add(lampL);

    const lampR = lampL.clone();
    lampR.position.x = 0.8;
    group.add(lampR);

    return group;
  },

  createStreetLight(height = 5.2) {
    return this.createStreetLamp();
  },

  // 17. Traffic Cones / Concrete Barricades - Tier 1
  createTrafficCone() {
    const group = new THREE.Group();
    group.name = "Traffic-Cone";

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), materials.coneOrange);
    base.position.y = 0.025;
    group.add(base);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.65, 8), materials.coneOrange);
    cone.position.y = 0.35;
    cone.castShadow = true;
    group.add(cone);

    const whiteBand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 8), materials.whiteMarble);
    whiteBand.position.y = 0.32;
    group.add(whiteBand);

    return group;
  },

  // Dynamic Comic Target Decal & Floating Billboard Badge (Crystal Clear "What to Devour" Visibility for Kids!)
  createEvilTargetDecal(evilType, label = "DEVOUR TARGET") {
    const group = new THREE.Group();
    group.name = `Target-Decal-${evilType}`;

    const color = 0xff1744; // Bold Universal Danger Crimson for ALL bad guys!

    // 1. Ground Pulsing Hazard Ring
    const ringGeo = new THREE.RingGeometry(1.4, 1.85, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.04;
    group.add(ring);

    // 2. Yellow hazard crosshair markers on ground
    const barGeo = new THREE.PlaneGeometry(0.2, 0.7);
    barGeo.rotateX(-Math.PI / 2);
    const barMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    [
      [0, 1.85, 0],
      [0, -1.85, 0],
      [1.85, 0, Math.PI / 2],
      [-1.85, 0, Math.PI / 2]
    ].forEach(([bx, bz, rot]) => {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(bx, 0.05, bz);
      bar.rotation.y = rot;
      group.add(bar);
    });

    // 3. Floating High-Visibility Billboard Badge (Compact street-level pill)
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(28, 4, 8, 0.92)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 312, 62, 16);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff1744';
    ctx.stroke();

    ctx.fillStyle = '#ff1744';
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.toUpperCase(), 160, 35);

    const bTex = new THREE.CanvasTexture(canvas);
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    badge.scale.set(2.4, 0.55, 1);
    badge.position.set(0, 2.3, 0);
    group.add(badge);

    // 4. Bouncing Overhead Red Chevron Arrow (pointing down right at evil!)
    const arrowGeo = new THREE.ConeGeometry(0.25, 0.5, 4);
    arrowGeo.rotateX(Math.PI);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 2.9, 0);
    group.add(arrow);

    // 5. Skyward Beacon Pillar for final evils
    const beacon = this.createDistrictBeaconPillar(0xff1744);
    beacon.visible = false;
    group.add(beacon);

    group.userData = {
      ring,
      badge,
      arrow,
      beacon,
      color,
      isEvil: true
    };

    return group;
  },

  // Friendly Protector Decal for Innocent Citizens, Food Stalls, Pets
  createFriendlyDecal(type = 'citizen', label = "💚 FRIEND • PROTECT!") {
    const group = new THREE.Group();
    group.name = `Friendly-Decal-${type}`;

    const colorMap = {
      citizen: 0x00e676, // Radiant Emerald Green
      food: 0xffd700,    // Golden Sparkle
      chai: 0xff9100,    // Warm Amber
      pet: 0x00e5ff      // Cyan
    };
    const color = colorMap[type] || 0x00e676;

    // 1. Soft Radiant Ground Protector Ring (hidden - street hero open world without circular rings)
    const ringGeo = new THREE.RingGeometry(0.9, 1.25, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.visible = false;
    ring.position.y = 0.04;
    group.add(ring);

    // 2. Floating High-Visibility Friendly Billboard Badge
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10, 26, 18, 0.9)';
    ctx.beginPath();
    ctx.roundRect(6, 6, 368, 68, 16);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.stroke();

    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = '900 23px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 190, 40);

    const bTex = new THREE.CanvasTexture(canvas);
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    badge.scale.set(2.2, 0.48, 1);
    badge.position.set(0, type === 'food' || type === 'chai' ? 2.4 : 1.9, 0);
    group.add(badge);

    group.userData = { ring, badge, isFriendly: true };
    return group;
  },

  // 12m Skyward Light Beacon for hunting remaining district criminals
  createDistrictBeaconPillar(color = 0xffd700) {
    const group = new THREE.Group();
    group.name = "District-Target-Beacon";

    // Translucent light cylinder reaching into the sky
    const cylGeo = new THREE.CylinderGeometry(0.35, 0.8, 14.0, 16, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.y = 7.0;
    group.add(cyl);

    // Downward target chevron arrow
    const arrowGeo = new THREE.ConeGeometry(0.55, 1.1, 8);
    arrowGeo.rotateX(Math.PI);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.y = 14.6;
    group.add(arrow);

    group.userData = { cyl, arrow, timer: 0 };
    return group;
  },

  // The Terrified Victim Citizen who gets RESCUED and dances with pure happiness!
  createTerrifiedVictimCitizen() {
    const group = new THREE.Group();
    group.name = "Robbery-Victim-Citizen";

    // Shalwar Kameez body
    const vBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.85, 8), materials.shalwarNavy);
    vBody.position.y = 0.88;
    vBody.castShadow = true;
    group.add(vBody);

    const vHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.pedestrianSkin);
    vHead.position.y = 1.48;
    vHead.castShadow = true;
    group.add(vHead);

    // Terrified hands raised in surrender
    const armMat = materials.shalwarNavy;
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), armMat);
    handL.position.set(-0.28, 1.45, 0);
    handL.rotation.z = 0.2;
    group.add(handL);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), armMat);
    handR.position.set(0.28, 1.45, 0);
    handR.rotation.z = -0.2;
    group.add(handR);

    // Dropped glowing smartphone on ground
    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.25), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    phone.position.set(0.2, 0.02, 0.5);
    group.add(phone);

    // Dialogue Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bubbleTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text, isJoy = false) => {
      ctx.clearRect(0, 0, 420, 110);
      ctx.fillStyle = isJoy ? '#00c853' : '#d50000'; // Green when rescued, Red when scared
      ctx.beginPath();
      ctx.roundRect(8, 8, 404, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 210, 46);
      bubbleTex.needsUpdate = true;
    };
    drawBubble('😱 Bhai phone le lo! Goli mat chalana!');

    const bubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex, transparent: true }));
    bubbleSprite.scale.set(4.4, 1.15, 1);
    bubbleSprite.position.set(0, 2.5, 0);
    group.add(bubbleSprite);

    group.userData = {
      isVictim: true,
      isRescued: false,
      vBody,
      handL,
      handR,
      drawBubble,
      bubbleSprite,
      phone,
      cheerTimer: 0,
      danceCycle: 0
    };

    return group;
  },

  // 18. Pakistani Politician with VIP Protocol Briefcase & Speech Bubble - Tier 1 (Fun Parody Target!)
  createPolitician({ name = "VIP Politician", quote = "VIP Protocol do!" } = {}) {
    const group = new THREE.Group();
    group.name = name;
    group.isPolitician = true;
    group.quote = quote;

    const waistcoats = [
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }), // Classic Black
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 }), // Brown
      new THREE.MeshStandardMaterial({ color: 0x0d47a1, roughness: 0.5 }), // Navy
      new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 })  // Red party
    ];
    const coatMat = waistcoats[Math.floor(Math.random() * waistcoats.length)];

    // White Shalwar Kameez body
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.85, 8);
    const body = new THREE.Mesh(bodyGeo, materials.shalwarWhite);
    body.position.y = 0.88;
    body.castShadow = true;
    group.add(body);

    // Politician Waistcoat (Sadri)
    const coatGeo = new THREE.CylinderGeometry(0.25, 0.29, 0.65, 8);
    const coat = new THREE.Mesh(coatGeo, coatMat);
    coat.position.y = 0.95;
    group.add(coat);

    // Politician Muffler / Party Scarf
    const mufflerGeo = new THREE.TorusGeometry(0.22, 0.05, 8, 16);
    const mufflerMat = new THREE.MeshStandardMaterial({ color: 0x00c853 });
    const muffler = new THREE.Mesh(mufflerGeo, mufflerMat);
    muffler.position.y = 1.3;
    muffler.rotation.x = Math.PI / 2;
    group.add(muffler);

    // Head with Politician Cap / Mustache
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), materials.pedestrianSkin);
    head.position.y = 1.48;
    group.add(head);

    // Jinnah / Karakul Cap
    const capGeo = new THREE.CylinderGeometry(0.18, 0.17, 0.14, 8);
    const cap = new THREE.Mesh(capGeo, materials.curbBlack);
    cap.position.y = 1.64;
    group.add(cap);

    // Thick Politician Mustache
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.05), materials.curbBlack);
    stache.position.set(0, 1.44, 0.17);
    group.add(stache);

    // Animated Limbs Groups
    const legL = new THREE.Group();
    const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), materials.shalwarWhite);
    legMeshL.position.y = -0.3;
    legL.add(legMeshL);
    legL.position.set(-0.1, 0.6, 0);
    group.add(legL);

    const legR = new THREE.Group();
    const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), materials.shalwarWhite);
    legMeshR.position.y = -0.3;
    legR.add(legMeshR);
    legR.position.set(0.1, 0.6, 0);
    group.add(legR);

    // Arms
    const armL = new THREE.Group();
    const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), materials.shalwarWhite);
    armMeshL.position.y = -0.25;
    armL.add(armMeshL);
    armL.position.set(-0.3, 1.2, 0);
    group.add(armL);

    const armR = new THREE.Group();
    const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), materials.shalwarWhite);
    armMeshR.position.y = -0.25;
    armR.add(armMeshR);
    armR.position.set(0.3, 1.2, 0);
    group.add(armR);

    // Golden VIP Money Briefcase in Hand
    const caseGeo = new THREE.BoxGeometry(0.32, 0.24, 0.12);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.3 });
    const briefcase = new THREE.Mesh(caseGeo, caseMat);
    briefcase.position.set(0, -0.28, 0.05);
    armR.add(briefcase);

    // Gold handle & lock
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.13), materials.goldMetal);
    lock.position.set(0, -0.15, 0.05);
    armR.add(lock);

    // Speech Bubble Canvas Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bubbleTexture = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 384, 110);
      // White speech pill
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(10, 10, 364, 75, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#d32f2f';
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(192, 85);
      ctx.lineTo(175, 105);
      ctx.lineTo(210, 85);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 192, 48);
      bubbleTexture.needsUpdate = true;
    };
    drawBubble(quote);

    const bubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTexture, transparent: true }));
    bubbleSprite.scale.set(3.8, 1.1, 1);
    bubbleSprite.position.y = 2.4;
    group.add(bubbleSprite);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('politician', '💰 CORRUPT VIP • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      legL, legR, armL, armR,
      bubbleSprite,
      drawBubble,
      runCycle: Math.random() * 10,
      isFleeing: false,
      fleeSpeed: 10.0,
      origQuote: quote
    };

    return group;
  },

  // 19. Black VIP Protocol Police Escort SUV with Flashers - Tier 3
  createVIPProtocolSUV() {
    const group = new THREE.Group();
    group.name = "VIP-Protocol-SUV";

    // Black SUV Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 1.2, 4.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.1, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);

    // Cabin / Windows
    const cabGeo = new THREE.BoxGeometry(2.0, 0.9, 2.8);
    const cab = new THREE.Mesh(cabGeo, materials.darkGlass);
    cab.position.set(0, 1.8, -0.2);
    group.add(cab);

    // Red & Blue Emergency Police Flashers on Roof
    const flasherBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.3), materials.chrome);
    flasherBar.position.set(0, 2.3, -0.2);
    group.add(flasherBar);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.25), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(-0.5, 2.32, -0.2);
    group.add(redLight);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.25), new THREE.MeshBasicMaterial({ color: 0x0088ff }));
    blueLight.position.set(0.5, 2.32, -0.2);
    group.add(blueLight);

    // Bull-bar chrome bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.3), materials.chrome);
    bumper.position.set(0, 0.7, 2.45);
    group.add(bumper);

    // 4 Big Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-1.15, 0.48, 1.4], [1.15, 0.48, 1.4], [-1.15, 0.48, -1.4], [1.15, 0.48, -1.4]].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, materials.rubber);
      w.position.set(...p);
      group.add(w);
    });

    group.userData = { redLight, blueLight, flasherTime: 0 };
    return group;
  },

  // 20. Crinkled Plastic Garbage Bag (Kachray ki theli) - Tier 1
  createTrashBag(color = 0x1565c0) {
    const group = new THREE.Group();
    group.name = "Trash-Bag";

    const bagMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    // Bulging bag base
    const bagGeo = new THREE.DodecahedronGeometry(0.38, 1);
    bagGeo.scale(1, 0.85, 1);
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.y = 0.32;
    bag.castShadow = true;
    group.add(bag);

    // Tied knot top
    const knotGeo = new THREE.ConeGeometry(0.12, 0.18, 6);
    const knot = new THREE.Mesh(knotGeo, bagMat);
    knot.position.y = 0.64;
    group.add(knot);

    return group;
  },

  // 21. Tin Soda Can & Plastic Bottle Debris - Tier 1
  createSodaCan() {
    const group = new THREE.Group();
    group.name = "Soda-Can";

    const canMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f }); // Red Cola can
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8), canMat);
    can.position.y = 0.08;
    can.rotation.z = Math.PI / 2; // Lying on side
    group.add(can);

    return group;
  },

  createWaterBottle() {
    const group = new THREE.Group();
    group.name = "Plastic-Bottle";

    const bottleMat = new THREE.MeshLambertMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.85 });
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 8), bottleMat);
    bottle.position.y = 0.07;
    bottle.rotation.x = Math.PI / 2;
    group.add(bottle);

    // Blue cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), new THREE.MeshBasicMaterial({ color: 0x0288d1 }));
    cap.position.set(0, 0.07, 0.15);
    group.add(cap);

    return group;
  },

  // 22. Street Garbage Dump (Kachra Kundi Heap) - Tier 2
  createKachraDump() {
    const group = new THREE.Group();
    group.name = "Kachra-Dump";

    // Broken concrete bin / dump base
    const binMat = new THREE.MeshLambertMaterial({ color: 0x546e7a });
    const binL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 2.2), binMat);
    binL.position.set(-1.1, 0.4, 0);
    group.add(binL);
    const binR = binL.clone();
    binR.position.x = 1.1;
    group.add(binR);
    const binB = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.2), binMat);
    binB.position.set(0, 0.4, -1.0);
    group.add(binB);

    // Mound of rubbish bags and scrap
    const trashColors = [0x1565c0, 0x212121, 0x43a047, 0xffb300];
    for (let i = 0; i < 6; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = this.createTrashBag(col);
      bag.position.set((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 1.2);
      bag.scale.set(0.9, 0.9, 0.9);
      group.add(bag);
    }

    // Crushed cardboard box
    const boxMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.6), boxMat);
    box.position.set(0.3, 0.25, 0.4);
    box.rotation.y = 0.4;
    group.add(box);

    return group;
  },

  // 23. Desi Stray Dog (Karachi Kutta) - Tier 1
  createStrayDog() {
    const group = new THREE.Group();
    group.name = "Stray-Dog";
    group.isAnimal = true;
    group.animalType = "dog";

    const furMat = new THREE.MeshLambertMaterial({ color: 0xa16226 }); // Desi tan fur

    // Torso Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.65), furMat);
    body.position.y = 0.42;
    body.castShadow = true;
    group.add(body);

    // Head & Snout
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.28), furMat);
    head.position.set(0, 0.62, 0.38);
    group.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.2), furMat);
    snout.position.set(0, 0.56, 0.56);
    group.add(snout);

    // Black nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), materials.curbBlack);
    nose.position.set(0, 0.58, 0.67);
    group.add(nose);

    // Floppy Ears
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), furMat);
    earL.position.set(-0.14, 0.68, 0.36);
    earL.rotation.z = -0.3;
    group.add(earL);

    const earR = earL.clone();
    earR.position.x = 0.14;
    earR.rotation.z = 0.3;
    group.add(earR);

    // 4 Animated Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const legFL = new THREE.Group();
    const l1 = new THREE.Mesh(legGeo, furMat);
    l1.position.y = -0.15;
    legFL.add(l1);
    legFL.position.set(-0.12, 0.3, 0.22);
    group.add(legFL);

    const legFR = new THREE.Group();
    const l2 = new THREE.Mesh(legGeo, furMat);
    l2.position.y = -0.15;
    legFR.add(l2);
    legFR.position.set(0.12, 0.3, 0.22);
    group.add(legFR);

    const legBL = new THREE.Group();
    const l3 = new THREE.Mesh(legGeo, furMat);
    l3.position.y = -0.15;
    legBL.add(l3);
    legBL.position.set(-0.12, 0.3, -0.22);
    group.add(legBL);

    const legBR = new THREE.Group();
    const l4 = new THREE.Mesh(legGeo, furMat);
    l4.position.y = -0.15;
    legBR.add(l4);
    legBR.position.set(0.12, 0.3, -0.22);
    group.add(legBR);

    // Wagging Tail
    const tail = new THREE.Group();
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6), furMat);
    tailMesh.position.y = 0.15;
    tail.add(tailMesh);
    tail.position.set(0, 0.5, -0.32);
    tail.rotation.x = -0.8;
    group.add(tail);

    group.userData = {
      legFL, legFR, legBL, legBR, tail,
      walkCycle: Math.random() * 10,
      barkTimer: 2 + Math.random() * 4,
      moveSpeed: 5.5,
      isFriendly: true,
      isPet: true,
      petType: 'dog',
      name: "Friendly Stray Dog (پیارا کتا)",
      friendlyDecal: this.createFriendlyDecal('pet', '🐕 PET • پیارا دوست')
    };
    group.add(group.userData.friendlyDecal);

    return group;
  },

  // 24. Street Cat (Billi) - Tier 1
  createStreetCat() {
    const group = new THREE.Group();
    group.name = "Street-Cat";
    group.isAnimal = true;
    group.animalType = "cat";

    const catMat = new THREE.MeshLambertMaterial({ color: 0xff9800 }); // Orange tabby

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.45), catMat);
    body.position.y = 0.24;
    group.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.18), catMat);
    head.position.set(0, 0.38, 0.26);
    group.add(head);

    // Pointy Ears
    const earGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
    const earL = new THREE.Mesh(earGeo, catMat);
    earL.position.set(-0.07, 0.49, 0.26);
    group.add(earL);
    const earR = earL.clone();
    earR.position.x = 0.07;
    group.add(earR);

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), catMat);
    tail.position.set(0, 0.35, -0.25);
    tail.rotation.x = 0.6;
    group.add(tail);

    group.userData = {
      walkCycle: Math.random() * 10,
      moveSpeed: 6.5,
      isFriendly: true,
      isPet: true,
      petType: 'cat',
      name: "Friendly Street Cat (پیاری بلی)",
      friendlyDecal: this.createFriendlyDecal('pet', '🐈 PET • پیاری بلی')
    };
    group.add(group.userData.friendlyDecal);
    return group;
  },

  // 25. Sewer Rat (Karachi Chooha) - Tier 1
  createSewerRat() {
    const group = new THREE.Group();
    group.name = "Sewer-Rat";
    group.isAnimal = true;
    group.animalType = "rat";

    const ratMat = new THREE.MeshLambertMaterial({ color: 0x424242 }); // Dark grey

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), ratMat);
    body.position.y = 0.08;
    group.add(body);

    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 6), ratMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.08, 0.15);
    group.add(snout);

    // Pink tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 4), new THREE.MeshBasicMaterial({ color: 0xf48fb1 }));
    tail.rotation.x = -Math.PI / 2;
    tail.position.set(0, 0.06, -0.18);
    group.add(tail);

    group.userData = { walkCycle: Math.random() * 10, moveSpeed: 7.5 };
    return group;
  },

  // 26. Karachi Street Robbery Scene (Decoupled: Robber Target vs Rescued Citizen!)
  createRobberyScene() {
    // 1. The Robber Target (The ONLY entity that gets swallowed by the hole!)
    const robberGroup = new THREE.Group();
    robberGroup.name = "Street-Robber-Target";
    robberGroup.isBadGuy = true;
    robberGroup.evilType = 'robber';

    // Leather jacket body
    const jacketMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const rBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.85, 8), jacketMat);
    rBody.position.y = 0.88;
    robberGroup.add(rBody);

    const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), materials.curbBlack);
    rHead.position.y = 1.48;
    robberGroup.add(rHead);

    // Aimed Arm with Black 9mm Pistol
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.6), jacketMat);
    arm.position.set(0.25, 1.15, 0.35);
    robberGroup.add(arm);

    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.25), materials.curbBlack);
    gun.position.set(0.25, 1.18, 0.72);
    robberGroup.add(gun);

    // Red CD-70 Getaway Bike attached behind robber
    const bike = this.createMotorbike();
    bike.position.set(-1.4, 0, -0.4);
    robberGroup.add(bike);

    // Glowing Neon Target Decal on Asphalt
    const targetDecal = this.createEvilTargetDecal('robber', '🔫 ARMED DAKOO • DEVOUR!');
    robberGroup.add(targetDecal);

    // Robber Threat Speech Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bubbleTexture = new THREE.CanvasTexture(canvas);

    const drawRobberBubble = (text) => {
      ctx.clearRect(0, 0, 400, 110);
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.roundRect(8, 8, 384, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 200, 46);
      bubbleTexture.needsUpdate = true;
    };
    drawRobberBubble('🔫 Mobile nikaal! Purse do!');

    const bubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTexture, transparent: true }));
    bubbleSprite.scale.set(4.0, 1.1, 1);
    bubbleSprite.position.set(0, 2.6, 0.4);
    robberGroup.add(bubbleSprite);

    // 2. The Terrified Victim Citizen (Stands in front, faces robber, gets RESCUED!)
    const victimCitizen = this.createTerrifiedVictimCitizen();
    victimCitizen.position.set(0, 0, 2.2);
    victimCitizen.rotation.y = Math.PI; // Facing robber

    robberGroup.userData = {
      isBadGuy: true,
      evilType: 'robber',
      name: "Street Mobile Snatcher (ڈاکو)",
      speed: 4.8,
      drawBubble: drawRobberBubble,
      bubbleSprite,
      victimCitizen,
      targetDecal
    };

    return {
      robberTarget: robberGroup,
      victimCitizen
    };
  },

  // 26B. Sedan / Taxi Car for Traffic Scenes
  createSedanCar(bodyColor = 0xfbc02d) {
    const group = new THREE.Group();
    group.name = "Sedan-Taxi";

    const carMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.2 });
    // Lower body
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 3.6), carMat);
    lower.position.y = 0.6;
    lower.castShadow = true;
    group.add(lower);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.9), materials.tintedGlass);
    cabin.position.set(0, 1.15, -0.15);
    cabin.castShadow = true;
    group.add(cabin);

    // Taxi Roof Sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
    sign.position.set(0, 1.55, -0.15);
    group.add(sign);

    // 4 Wheels
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12);
    wGeo.rotateZ(Math.PI / 2);
    [[-0.95, 0.32, 1.1], [0.95, 0.32, 1.1], [-0.95, 0.32, -1.1], [0.95, 0.32, -1.1]].forEach(p => {
      const w = new THREE.Mesh(wGeo, materials.rubber);
      w.position.set(...p);
      group.add(w);
    });

    return group;
  },

  // 26C. VIP Protocol Traffic Jam Scene (VIP Prado + Stuck Karachi Vehicles that get freed!)
  createVIPTrafficJamScene() {
    const vipSUV = this.createSpeedingVIPConvoy();
    vipSUV.name = "VIP-Protocol-SUV";
    vipSUV.isBadGuy = true;
    vipSUV.evilType = 'vip';

    const targetDecal = this.createEvilTargetDecal('vip', '🚨 VIP PROTOCOL • DEVOUR!');
    vipSUV.add(targetDecal);

    // Siren Text Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 440, 110);
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.roundRect(8, 8, 424, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 220, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('🚨 HATO! VIP AA RAHA HAI! SARKAR!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.5, 1.15, 1);
    bubble.position.set(0, 3.6, 0);
    vipSUV.add(bubble);

    // Stuck Traffic Vehicles behind & beside that get FREED!
    const stuckRickshaw = this.createAutoRickshaw();
    stuckRickshaw.position.set(-3.2, 0, -3.2);
    stuckRickshaw.name = "Stuck-Rickshaw";
    this.attachTrafficBubble(stuckRickshaw, "🚑 Ambulance phansi hui hai! Rasta do!");

    const stuckMehran = this.createSedanCar(0xfbc02d);
    stuckMehran.position.set(3.2, 0, -3.4);
    stuckMehran.name = "Stuck-Taxi";
    this.attachTrafficBubble(stuckMehran, "🏥 Hospital jana hai! VIP culture murdabad!");

    const stuckBike = this.createMotorbike();
    stuckBike.position.set(0, 0, -5.2);
    stuckBike.name = "Stuck-Bike";
    this.attachTrafficBubble(stuckBike, "⏰ Office late ho gaye! Siren band karo!");

    const stuckVehicles = [stuckRickshaw, stuckMehran, stuckBike];

    vipSUV.userData = {
      isBadGuy: true,
      evilType: 'vip',
      name: "VIP Protocol Prado Convoy",
      speed: 5.6,
      drawBubble,
      bubbleSprite: bubble,
      stuckVehicles,
      targetDecal
    };

    return {
      vipTarget: vipSUV,
      stuckVehicles
    };
  },

  attachTrafficBubble(vehicle, initialText) {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text, isJoy = false) => {
      ctx.clearRect(0, 0, 420, 110);
      ctx.fillStyle = isJoy ? '#00c853' : '#e65100'; // Green when freed, Orange when angry
      ctx.beginPath();
      ctx.roundRect(8, 8, 404, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 210, 46);
      bTex.needsUpdate = true;
    };
    drawBubble(initialText, false);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(4.2, 1.1, 1);
    sprite.position.set(0, 2.6, 0);
    vehicle.add(sprite);

    vehicle.userData = {
      ...vehicle.userData,
      drawTrafficBubble: drawBubble,
      trafficSprite: sprite,
      isFreed: false,
      freedSpeed: 0
    };
  },

  // Karachi Residential Home with Rooftop Tank & Interactive Water Supply Status
  createDryResidentialHome(homeName = "PECHS House #4") {
    const group = new THREE.Group();
    group.name = `Residential-Home-${homeName}`;

    // Villa Body
    const houseGeo = new THREE.BoxGeometry(6.4, 5.2, 6.4);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0xefede6, roughness: 0.5 });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(0, 2.6, 0);
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Front Balcony
    const balconyGeo = new THREE.BoxGeometry(4.4, 0.6, 1.2);
    const balcony = new THREE.Mesh(balconyGeo, materials.sandstone);
    balcony.position.set(0, 3.6, 3.3);
    group.add(balcony);

    // Compound Gate
    const gate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.1), materials.curbBlack);
    gate.position.set(0, 0.7, 3.8);
    group.add(gate);

    // Black Rooftop Water Tank (Iconic Karachi overhead tank)
    const tankGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.35, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.7 });
    const rooftopTank = new THREE.Mesh(tankGeo, tankMat);
    rooftopTank.position.set(1.6, 5.85, -1.2);
    group.add(rooftopTank);

    // Rooftop Tank Lid
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.1, 12), materials.curbBlack);
    lid.position.set(1.6, 6.55, -1.2);
    group.add(lid);

    // Rooftop Water Status Billboard Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);

    const updateWaterBillboard = (isRestored = false) => {
      ctx.clearRect(0, 0, 460, 110);
      ctx.fillStyle = isRestored ? 'rgba(0, 230, 118, 0.95)' : 'rgba(255, 23, 68, 0.92)';
      ctx.beginPath();
      ctx.roundRect(8, 8, 444, 94, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isRestored) {
        ctx.fillText('🚰 WATER RESTORED! 100% 🌊', 230, 38);
        ctx.font = 'bold 20px "Noto Nastaliq Urdu", sans-serif';
        ctx.fillText('نلکے میں پانی بحال ہو گیا!', 230, 76);
      } else {
        ctx.fillText('🚱 NO WATER / 0% DRY TANK!', 230, 38);
        ctx.font = 'bold 20px "Noto Nastaliq Urdu", sans-serif';
        ctx.fillText('پانی بند ہے - لائن کٹ گئی!', 230, 76);
      }
      tex.needsUpdate = true;
    };
    updateWaterBillboard(false);

    const billboard = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    billboard.scale.set(4.6, 1.1, 1);
    billboard.position.set(1.6, 7.8, -1.2);
    group.add(billboard);

    // Distressed Balcony Resident
    const resident = this.createPleadingResident("نلکے میں پانی نہیں! ٹینکر چوری بند کرو!");
    resident.position.set(0, 3.8, 3.3);
    group.add(resident);

    group.userData = {
      isDryHome: true,
      homeName,
      rooftopTank,
      billboard,
      resident,
      isRestored: false,
      updateWaterBillboard
    };

    return group;
  },

  // 26D. Water Tanker Extortion Scene (Tanker Mafia + Thirsty Karachi Residents + Dry Homes!)
  createWaterTankerExtortionScene() {
    const tanker = this.createWaterTankerMafia();
    const targetDecal = this.createEvilTargetDecal('tanker', '💧 TANKER MAFIA • DEVOUR!');
    tanker.add(targetDecal);

    // 2 Street residents with water drums
    const resident1 = this.createPleadingResident("15,000 ka tanker?! Zulm band karo!");
    resident1.position.set(-3.4, 0, 1.8);

    const resident2 = this.createPleadingResident("Pani do! Bache pyase hain!");
    resident2.position.set(3.4, 0, 1.8);

    // 2 Nearby Residential Homes experiencing dry taps
    const homeLeft = this.createDryResidentialHome("Mohalla House #1");
    homeLeft.position.set(-9.5, 0, -2.5);

    const homeRight = this.createDryResidentialHome("Mohalla House #2");
    homeRight.position.set(9.5, 0, -2.5);

    // Illegal Suction Hose (corrugated black hose running from houses into the tanker)
    const hoseGroup = new THREE.Group();
    hoseGroup.name = "Illegal-Suction-Hose";
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const hoseCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9.5, 0.2, 0),
      new THREE.Vector3(-4.5, 0.15, 0.8),
      new THREE.Vector3(0, 0.8, -0.6)
    ]);
    const hoseMesh1 = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve1, 20, 0.12, 8, false), hoseMat);
    hoseGroup.add(hoseMesh1);

    const hoseCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(9.5, 0.2, 0),
      new THREE.Vector3(4.5, 0.15, 0.8),
      new THREE.Vector3(0, 0.8, -0.6)
    ]);
    const hoseMesh2 = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve2, 20, 0.12, 8, false), hoseMat);
    hoseGroup.add(hoseMesh2);

    // Illegal Booster Pump Generator on the road
    const pumpGeo = new THREE.BoxGeometry(0.8, 0.6, 0.6);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0xe65100 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.position.set(-1.6, 0.3, 0.4);
    hoseGroup.add(pump);

    tanker.add(hoseGroup);

    const thirstyResidents = [resident1, resident2];
    const dryHomes = [homeLeft, homeRight];

    tanker.userData.thirstyResidents = thirstyResidents;
    tanker.userData.dryHomes = dryHomes;
    tanker.userData.hoseGroup = hoseGroup;
    tanker.userData.targetDecal = targetDecal;

    return {
      tankerTarget: tanker,
      thirstyResidents,
      dryHomes,
      hoseGroup
    };
  },

  createPleadingResident(initialText) {
    const group = new THREE.Group();
    group.name = "Thirsty-Resident";

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.85, 8), materials.shalwarGrey);
    body.position.y = 0.88;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.pedestrianSkin);
    head.position.y = 1.48;
    group.add(head);

    // Blue water bucket / drum held in front
    const drumGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.6, 12);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x0277bd });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.position.set(0, 0.45, 0.45);
    group.add(drum);

    // Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text, isJoy = false) => {
      ctx.clearRect(0, 0, 420, 110);
      ctx.fillStyle = isJoy ? '#00c853' : '#01579b';
      ctx.beginPath();
      ctx.roundRect(8, 8, 404, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 210, 46);
      bTex.needsUpdate = true;
    };
    drawBubble(initialText, false);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(4.2, 1.1, 1);
    sprite.position.set(0, 2.4, 0);
    group.add(sprite);

    group.userData = {
      isResident: true,
      isWaterReceived: false,
      drawBubble,
      bubbleSprite: sprite,
      drum,
      danceCycle: 0
    };

    return group;
  },

  // 27. Burns Road Bun Kabab Stall (برنس روڈ اسٹوڈنٹ بن کباب) - Iconic Karachi Food Cart
  createBurnsRoadBunKababStall() {
    const group = new THREE.Group();
    group.name = "Bun-Kabab-Stall";
    group.isFoodStall = true;

    // Wooden cart body
    const cart = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.4), materials.woodBench);
    cart.position.y = 0.55;
    cart.castShadow = true;
    group.add(cart);

    // Stainless steel food counter top
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.5), materials.chrome);
    counter.position.y = 1.05;
    group.add(counter);

    // 4 Cart Wheels
    const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
    wGeo.rotateZ(Math.PI / 2);
    [[-1.1, 0.35, 0.65], [1.1, 0.35, 0.65], [-1.1, 0.35, -0.65], [1.1, 0.35, -0.65]].forEach(pos => {
      const w = new THREE.Mesh(wGeo, materials.rubber);
      w.position.set(...pos);
      group.add(w);
    });

    // Big Sizzling Iron Tawa (Griddle)
    const tawaGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 20);
    const tawa = new THREE.Mesh(tawaGeo, materials.curbBlack);
    tawa.position.set(-0.55, 1.14, 0);
    group.add(tawa);

    // Frying Shami patties & egg on Tawa
    const pattyMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 }); // Fried brown shami
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12), pattyMat);
    p1.position.set(-0.65, 1.2, -0.15);
    group.add(p1);

    const p2 = p1.clone();
    p2.position.set(-0.45, 1.2, 0.15);
    group.add(p2);

    const egg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
    egg.position.set(-0.6, 1.2, 0.12);
    group.add(egg);

    // Stack of Toasted Buns
    const bunMat = new THREE.MeshLambertMaterial({ color: 0xe0a96d }); // Golden burger bun
    for (let b = 0; b < 3; b++) {
      const bun = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), bunMat);
      bun.position.set(0.35, 1.16 + b * 0.13, -0.25);
      group.add(bun);
    }

    // Chutney squeezer bottles (Green Mint & Red Imli)
    const greenChutney = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.32, 10), new THREE.MeshLambertMaterial({ color: 0x43a047 }));
    greenChutney.position.set(0.55, 1.25, 0.2);
    group.add(greenChutney);

    const redChutney = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.32, 10), new THREE.MeshLambertMaterial({ color: 0xd32f2f }));
    redChutney.position.set(0.72, 1.25, 0.2);
    group.add(redChutney);

    // 4 Corner Canopy Awning Pillars
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8);
    [[-1.1, 1.85, 0.65], [1.1, 1.85, 0.65], [-1.1, 1.85, -0.65], [1.1, 1.85, -0.65]].forEach(pos => {
      const pole = new THREE.Mesh(poleGeo, materials.woodBench);
      pole.position.set(...pos);
      group.add(pole);
    });

    // Red & Yellow Striped Awning Roof
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.6), materials.truckRed);
    canopy.position.y = 2.65;
    group.add(canopy);

    // Glowing Yellow Hanging Bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
    bulb.position.set(0, 2.45, 0);
    group.add(bulb);

    // Signboard: Burns Road Bun Kabab
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff8f00'; // Saffron orange
    ctx.fillRect(0, 0, 512, 128);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ BURNS ROAD BUN KABAB ★', 256, 44);
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.fillStyle = '#1b1b1b';
    ctx.fillText('کراچی کا مشہور اسٹوڈنٹ بن کباب', 256, 88);

    const signTexture = new THREE.CanvasTexture(canvas);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signTexture }));
    sign.position.set(0, 2.95, 0.81);
    group.add(sign);

    group.userData = {
      isFriendly: true,
      isBunKabab: true,
      hasGivenBoost: false,
      chefQuote: "Karachi ko saaf karo bhai! Ye lo Spicy Chutney Turbo Boost!",
      friendlyDecal: this.createFriendlyDecal('food', '🍔 SPEED BOOST! • بن کباب')
    };
    group.add(group.userData.friendlyDecal);

    return group;
  },

  // 28. Shady Gutka / Chalia Peddler with Red Spit Stains - Civic Evil Tier 1
  createGutkaPeddler() {
    const group = new THREE.Group();
    group.name = "Gutka-Peddler";
    group.isBadGuy = true;

    // Shady character body (hooded shawl)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.9, 8), new THREE.MeshLambertMaterial({ color: 0x4e342e }));
    body.position.y = 0.9;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), materials.pedestrianSkin);
    head.position.y = 1.5;
    group.add(head);

    // Hood / scarf
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
    hood.position.y = 1.55;
    group.add(hood);

    // Wooden crate with Gutka sachets
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), materials.woodBench);
    crate.position.set(0.45, 0.35, 0);
    group.add(crate);

    // Red Paan / Gutka Spit Stains on pavement (Red circles on ground)
    const stainMat = new THREE.MeshBasicMaterial({ color: 0xb71c1c });
    for (let s = 0; s < 4; s++) {
      const stain = new THREE.Mesh(new THREE.CircleGeometry(0.25 + Math.random() * 0.2, 12), stainMat);
      stain.rotateX(-Math.PI / 2);
      stain.position.set((Math.random() - 0.5) * 1.5, 0.03, (Math.random() - 0.5) * 1.5);
      group.add(stain);
    }

    // Dynamic speech bubble
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 384, 110);
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.roundRect(8, 8, 368, 74, 18);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 192, 45);
      bTex.needsUpdate = true;
    };
    drawBubble('🛑 Gutka Mafia Peddler');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(3.4, 0.95, 1);
    bubble.position.set(0, 2.3, 0);
    group.add(bubble);

    const targetDecal = this.createEvilTargetDecal('gutka', '🛑 GUTKA MAFIA • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'gutka',
      name: "Gutka Mafia Peddler",
      drawBubble,
      bubbleSprite: bubble,
      runSpeed: 4.2,
      targetDecal
    };

    return group;
  },

  // 29. Broken Road Pothole & KW&SB Water Pipeline Leak - Civic Evil Tier 1
  createBrokenRoadPatch() {
    const group = new THREE.Group();
    group.name = "Broken-Road-Pothole";
    group.isBadGuy = true;

    // Jagged asphalt crater rim (dark grey broken stone)
    const potholeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const crater = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.8, 16), potholeMat);
    crater.rotateX(-Math.PI / 2);
    crater.position.y = 0.03;
    group.add(crater);

    // Deep muddy brown leaking water puddle in the center
    const waterPuddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 16),
      new THREE.MeshLambertMaterial({ color: 0x5d4037 }) // Murky muddy water
    );
    waterPuddle.rotateX(-Math.PI / 2);
    waterPuddle.position.y = 0.02;
    group.add(waterPuddle);

    // Authentic Karachi Warning: Bamboo stick with red plastic theli tied on top!
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), materials.woodBench);
    stick.position.set(0.6, 0.9, 0.4);
    stick.rotation.z = -0.2;
    group.add(stick);

    const redBag = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), materials.truckRed);
    redBag.position.set(0.42, 1.75, 0.4);
    group.add(redBag);

    // Glowing Hazard Target Decal
    const targetDecal = this.createEvilTargetDecal('pothole', '🕳️ ROAD POTHOLE • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'pothole',
      name: "Road Pothole (کھڈا)",
      targetDecal
    };

    return group;
  },

  // 30. Water Tanker Mafia (واٹر ٹینکر مافیا) - Civic Evil Tier 3
  createWaterTankerMafia() {
    const tanker = this.createWaterTanker();
    tanker.name = "Water-Tanker-Mafia";
    tanker.isBadGuy = true;

    // Big Slogan Banner on side: "WATER TANKER MAFIA • 12,000 RS / TANKER"
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#01579b'; // Deep navy
    ctx.fillRect(0, 0, 512, 120);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffd600';
    ctx.strokeRect(5, 5, 502, 110);
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 30px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WATER TANKER MAFIA', 256, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillText('12,000 RS • پیاسا کراچی', 256, 85);

    const bTex = new THREE.CanvasTexture(canvas);
    const bannerL = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: bTex }));
    bannerL.position.set(-1.23, 2.1, -1.1);
    bannerL.rotation.y = -Math.PI / 2;
    tanker.add(bannerL);

    const bannerR = bannerL.clone();
    bannerR.position.x = 1.23;
    bannerR.rotation.y = Math.PI / 2;
    tanker.add(bannerR);

    // Dynamic Overhead Bubble
    const bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.width = 420;
    bubbleCanvas.height = 110;
    const bctx = bubbleCanvas.getContext('2d');
    const bubbleTex = new THREE.CanvasTexture(bubbleCanvas);

    const drawBubble = (text) => {
      bctx.clearRect(0, 0, 420, 110);
      bctx.fillStyle = '#01579b';
      bctx.beginPath();
      bctx.roundRect(8, 8, 404, 76, 18);
      bctx.fill();
      bctx.lineWidth = 4;
      bctx.strokeStyle = '#ffd600';
      bctx.stroke();
      bctx.fillStyle = '#ffffff';
      bctx.font = 'bold 22px "Outfit", sans-serif';
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillText(text, 210, 46);
      bubbleTex.needsUpdate = true;
    };
    drawBubble('🚰 12,000 RS / TANKER! پیاسا کراچی');

    const bubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex, transparent: true }));
    bubbleSprite.scale.set(4.2, 1.1, 1);
    bubbleSprite.position.set(0, 3.6, 0);
    tanker.add(bubbleSprite);

    tanker.userData = {
      isBadGuy: true,
      evilType: 'tanker',
      name: "Water Tanker Mafia Truck",
      speed: 5.5,
      drawBubble,
      bubbleSprite
    };

    return tanker;
  },

  // 31. Speeding VIP Protocol Escort Convoy - Civic Evil Tier 3
  createSpeedingVIPConvoy() {
    const suv = this.createVIPProtocolSUV();
    suv.name = "VIP-Protocol-Convoy";
    suv.isBadGuy = true;

    // Siren Text Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 420, 110);
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.roundRect(8, 8, 404, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 210, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('🚨 HATO! VIP AA RAHA HAI!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.2, 1.1, 1);
    bubble.position.set(0, 3.4, 0);
    suv.add(bubble);

    suv.userData = {
      isBadGuy: true,
      evilType: 'vip',
      name: "VIP Protocol Speeding SUV",
      speed: 6.2,
      drawBubble,
      bubbleSprite: bubble
    };

    return suv;
  },

  // 32. Sparking utility transformer pole - civic hazard
  createSparkingTransformer() {
    const group = new THREE.Group();
    group.name = "Sparking-Utility-Transformer";
    group.isBadGuy = true;

    // Concrete Utility Pole
    const poleGeo = new THREE.CylinderGeometry(0.24, 0.32, 7.5, 12);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x90a4ae });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.75;
    pole.castShadow = true;
    group.add(pole);

    // Cross Arms at top
    const crossGeo = new THREE.BoxGeometry(2.8, 0.16, 0.22);
    const cross1 = new THREE.Mesh(crossGeo, materials.woodBench);
    cross1.position.set(0, 6.8, 0);
    group.add(cross1);

    const cross2 = new THREE.Mesh(crossGeo, materials.woodBench);
    cross2.position.set(0, 5.8, 0);
    group.add(cross2);

    // Ceramic Insulators
    const insMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.1 });
    [-1.1, 0, 1.1].forEach(x => {
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 8), insMat);
      ins.position.set(x, 7.02, 0);
      group.add(ins);
    });

    // Heavy Metal Transformer Barrel
    const transGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.4, 16);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x2e4a3e, metalness: 0.6, roughness: 0.4 });
    const trans = new THREE.Mesh(transGeo, transMat);
    trans.position.set(0.65, 5.2, 0);
    group.add(trans);

    // Chaotic Web of Tangled Black Kunda Wires (Karachi Electricity Theft Kunda Spiderweb)
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const wireCurves = [
      [[-1.1, 6.9, 0], [0.65, 5.8, 0]],
      [[0, 6.9, 0], [0.65, 5.5, 0.2]],
      [[1.1, 6.9, 0], [0.65, 5.2, -0.2]],
      [[0.65, 4.6, 0], [1.8, 2.5, 1.2]],
      [[0.65, 4.6, 0], [-1.6, 2.8, -1.0]],
      [[0.65, 4.6, 0], [0.2, 1.8, 1.8]],
      [[-1.1, 5.8, 0], [-2.0, 3.2, 0.8]],
      [[1.1, 5.8, 0], [2.2, 3.0, -0.9]],
      [[0.65, 5.0, 0.4], [1.2, 0.5, 1.5]]
    ];

    wireCurves.forEach(([p1, p2]) => {
      const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 - 0.45, (p1[2] + p2[2]) / 2];
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...p1),
        new THREE.Vector3(...mid),
        new THREE.Vector3(...p2)
      );
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.035, 6, false), wireMat);
      group.add(tube);
    });

    // Flickering Spark Orbs at wire junction
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const sparkGroup = new THREE.Group();
    for (let s = 0; s < 4; s++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), sparkMat);
      sp.position.set(0.65 + (Math.random() - 0.5) * 0.4, 5.6 + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
      sparkGroup.add(sp);
    }
    group.add(sparkGroup);

    // Dynamic Speech Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 440, 110);
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.roundRect(8, 8, 424, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 220, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('⚡ Sparking Utility Wires!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.4, 1.1, 1);
    bubble.position.set(0, 7.8, 0);
    group.add(bubble);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('ke', '⚡ EXPOSED WIRES • CLEAR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'ke',
      name: "Sparking Utility Transformer",
      sparkGroup,
      drawBubble,
      bubbleSprite: bubble
    };

    return group;
  },

  // 33. China Cutting Land Grabber Mafia - Civic Evil Tier 2 (Footpath Plot Seller)
  createChinaCuttingMafia() {
    const group = new THREE.Group();
    group.name = "China-Cutting-Mafia";
    group.isBadGuy = true;

    // Shady character with safari shirt and sunglasses
    const charGroup = new THREE.Group();
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xf57c00 }); // Loud orange safari shirt
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.85, 8), shirtMat);
    body.position.y = 0.88;
    charGroup.add(body);

    // Gold Chain
    const chain = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 12), materials.goldMetal);
    chain.position.set(0, 1.25, 0.05);
    chain.rotation.x = Math.PI / 2.3;
    charGroup.add(chain);

    // Head with sunglasses
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.pedestrianSkin);
    head.position.y = 1.48;
    charGroup.add(head);

    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), materials.curbBlack);
    shades.position.set(0, 1.5, 0.16);
    charGroup.add(shades);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
    const legL = new THREE.Group();
    const lm1 = new THREE.Mesh(legGeo, materials.shalwarNavy);
    lm1.position.y = -0.3;
    legL.add(lm1);
    legL.position.set(-0.1, 0.6, 0);
    charGroup.add(legL);

    const legR = new THREE.Group();
    const lm2 = new THREE.Mesh(legGeo, materials.shalwarNavy);
    lm2.position.y = -0.3;
    legR.add(lm2);
    legR.position.set(0.1, 0.6, 0);
    charGroup.add(legR);

    // Arm with rolled Blueprint Document
    const armR = new THREE.Group();
    const am1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 6), shirtMat);
    am1.position.y = -0.24;
    armR.add(am1);
    const blueprint = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), new THREE.MeshBasicMaterial({ color: 0x0288d1 }));
    blueprint.rotation.z = Math.PI / 2;
    blueprint.position.set(0, -0.38, 0.1);
    armR.add(blueprint);
    armR.position.set(0.3, 1.2, 0);
    charGroup.add(armR);

    // Left Arm with Yellow Measuring Tape
    const armL = new THREE.Group();
    const am2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 6), shirtMat);
    am2.position.y = -0.24;
    armL.add(am2);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
    tape.position.set(0, -0.35, 0.08);
    armL.add(tape);
    armL.position.set(-0.3, 1.2, 0);
    charGroup.add(armL);

    group.add(charGroup);

    // Illegal Concrete Plot Boundary Stone on Sidewalk
    const stoneGeo = new THREE.BoxGeometry(0.7, 0.4, 0.5);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5 });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(0.65, 0.2, 0.3);
    group.add(stone);

    // "2-GAZ PLOT" chalk writing on ground
    const chalkGeo = new THREE.PlaneGeometry(1.6, 1.6);
    chalkGeo.rotateX(-Math.PI / 2);
    const chalkCanvas = document.createElement('canvas');
    chalkCanvas.width = 128;
    chalkCanvas.height = 128;
    const cctx = chalkCanvas.getContext('2d');
    cctx.strokeStyle = '#ffd600';
    cctx.lineWidth = 6;
    cctx.strokeRect(4, 4, 120, 120);
    cctx.fillStyle = '#ffd600';
    cctx.font = 'bold 20px sans-serif';
    cctx.textAlign = 'center';
    cctx.fillText('2 GAZ', 64, 55);
    cctx.fillText('PLOT', 64, 85);
    const chalkTex = new THREE.CanvasTexture(chalkCanvas);
    const chalkMesh = new THREE.Mesh(chalkGeo, new THREE.MeshBasicMaterial({ map: chalkTex, transparent: true }));
    chalkMesh.position.set(0.7, 0.03, 0.3);
    group.add(chalkMesh);

    // Dynamic Speech Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 440, 110);
      ctx.fillStyle = '#e65100'; // Deep orange
      ctx.beginPath();
      ctx.roundRect(8, 8, 424, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 220, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('📐 China Cutting: Footpath par plot le lo!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.2, 1.05, 1);
    bubble.position.set(0, 2.5, 0);
    group.add(bubble);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('chinacutting', '📐 CHINA CUTTER • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'chinacutting',
      name: "China Cutting Land Grabber",
      charGroup, legL, legR, armL, armR,
      runSpeed: 4.4,
      drawBubble,
      bubbleSprite: bubble
    };

    return group;
  },

  // 34. Bhatta / Parchi Extortion Mafia - Civic Evil Tier 2 (Bazaar Extortionist)
  createBhattaParchiMafia() {
    const group = new THREE.Group();
    group.name = "Bhatta-Parchi-Mafia";
    group.isBadGuy = true;

    // Muscular gangster
    const charGroup = new THREE.Group();
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 }); // Dark leather vest
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.88, 8), vestMat);
    body.position.y = 0.88;
    charGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), materials.pedestrianSkin);
    head.position.y = 1.48;
    charGroup.add(head);

    // Thick Mustache & Dark Shades
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.05), materials.curbBlack);
    stache.position.set(0, 1.44, 0.17);
    charGroup.add(stache);

    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), materials.curbBlack);
    shades.position.set(0, 1.5, 0.17);
    charGroup.add(shades);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
    const legL = new THREE.Group();
    const lm1 = new THREE.Mesh(legGeo, materials.curbBlack);
    lm1.position.y = -0.3;
    legL.add(lm1);
    legL.position.set(-0.1, 0.6, 0);
    charGroup.add(legL);

    const legR = new THREE.Group();
    const lm2 = new THREE.Mesh(legGeo, materials.curbBlack);
    lm2.position.y = -0.3;
    legR.add(lm2);
    legR.position.set(0.1, 0.6, 0);
    charGroup.add(legR);

    // Arm holding Brown Extortion Envelope & Parchi Chit
    const armR = new THREE.Group();
    const am1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 6), vestMat);
    am1.position.y = -0.24;
    armR.add(am1);

    // Brown envelope labeled "PARCHI"
    const envelope = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.03), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
    envelope.position.set(0, -0.36, 0.08);
    armR.add(envelope);
    armR.position.set(0.32, 1.2, 0);
    charGroup.add(armR);

    const armL = new THREE.Group();
    const am2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 6), vestMat);
    am2.position.y = -0.24;
    armL.add(am2);
    armL.position.set(-0.32, 1.2, 0);
    charGroup.add(armL);

    group.add(charGroup);

    // Dynamic Speech Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 440, 110);
      ctx.fillStyle = '#4a148c'; // Deep purple
      ctx.beginPath();
      ctx.roundRect(8, 8, 424, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 220, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('📜 Bhatta Mafia: 50,000 Parchi pohnch gayi!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.2, 1.05, 1);
    bubble.position.set(0, 2.5, 0);
    group.add(bubble);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('bhatta', '📜 BHATTA MAFIA • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'bhatta',
      name: "Bhatta Parchi Extortion Mafia",
      charGroup, legL, legR, armL, armR,
      runSpeed: 4.5,
      drawBubble,
      bubbleSprite: bubble
    };

    return group;
  },

  // 35. Reckless One-Wheeling Silencer-less Racer - Civic Evil Tier 1 (Street Menace)
  createOneWheelerRacer() {
    const group = new THREE.Group();
    group.name = "One-Wheeling-Racer";
    group.isBadGuy = true;

    // CD-70 Motorbike tilted back in 42-degree WHEELIE angle!
    const bikeGroup = new THREE.Group();
    const bike = this.createMotorbike();
    bikeGroup.add(bike);
    bikeGroup.rotation.x = -Math.PI / 4.2; // Front wheel in air!
    bikeGroup.position.y = 0.35;
    group.add(bikeGroup);

    // Reckless youth rider in neon track suit
    const rider = new THREE.Group();
    const suitMat = new THREE.MeshLambertMaterial({ color: 0x00e676 }); // Neon green track jacket
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.22), suitMat);
    body.position.set(0, 0.65, -0.15);
    rider.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), materials.pedestrianSkin);
    head.position.set(0, 0.98, -0.15);
    rider.add(head);

    // Backward baseball cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 8), new THREE.MeshBasicMaterial({ color: 0xd50000 }));
    cap.position.set(0, 1.06, -0.15);
    rider.add(cap);

    rider.position.set(0, 0.35, 0);
    rider.rotation.x = -Math.PI / 4.5;
    group.add(rider);

    // Removed Silencer Exhaust Smoke Ring
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x757575, transparent: true, opacity: 0.7 });
    const smokeRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12), smokeMat);
    smokeRing.position.set(0.18, 0.15, -0.9);
    group.add(smokeRing);

    // Dynamic Speech Bubble
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    const bTex = new THREE.CanvasTexture(canvas);

    const drawBubble = (text) => {
      ctx.clearRect(0, 0, 440, 110);
      ctx.fillStyle = '#00b0ff'; // Bright cyan
      ctx.beginPath();
      ctx.roundRect(8, 8, 424, 76, 18);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 21px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 220, 46);
      bTex.needsUpdate = true;
    };
    drawBubble('🏍️ One-Wheeling: Silencer nikaal diya!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.2, 1.05, 1);
    bubble.position.set(0, 2.6, 0);
    group.add(bubble);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('onewheeler', '🏍️ RECKLESS RACER • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'onewheeler',
      name: "Reckless One-Wheeling Racer",
      speed: 5.8,
      drawBubble,
      bubbleSprite: bubble
    };

    return group;
  },

  // 36. Saddar Victorian Clock Tower (North-West Corner Landmark)
  createSaddarClockTower() {
    const group = new THREE.Group();
    group.name = "Saddar-Clock-Tower";

    // Sandstone Plinth Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.0, 5.2), materials.sandstone);
    base.position.y = 1.0;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Red Brick Shaft Tower
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(3.8, 12.0, 3.8), materials.redBrick);
    shaft.position.y = 8.0;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    // Stone Cornice Band
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 4.4), materials.sandstone);
    cornice.position.y = 14.3;
    group.add(cornice);

    // Clock Chamber Room
    const chamber = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.6, 4.0), materials.sandstone);
    chamber.position.y = 16.2;
    group.add(chamber);

    // 4 Clock Faces
    const clockCanvas = document.createElement('canvas');
    clockCanvas.width = 128;
    clockCanvas.height = 128;
    const cctx = clockCanvas.getContext('2d');
    cctx.fillStyle = '#ffffff';
    cctx.beginPath();
    cctx.arc(64, 64, 58, 0, Math.PI * 2);
    cctx.fill();
    cctx.lineWidth = 6;
    cctx.strokeStyle = '#111111';
    cctx.stroke();
    // Clock hands
    cctx.beginPath();
    cctx.moveTo(64, 64);
    cctx.lineTo(64, 25);
    cctx.moveTo(64, 64);
    cctx.lineTo(95, 64);
    cctx.stroke();
    const clockTex = new THREE.CanvasTexture(clockCanvas);
    const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });

    const clockPlanes = [
      { pos: [0, 16.2, 2.02], rot: [0, 0, 0] },
      { pos: [0, 16.2, -2.02], rot: [0, Math.PI, 0] },
      { pos: [2.02, 16.2, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-2.02, 16.2, 0], rot: [0, -Math.PI / 2, 0] }
    ];
    clockPlanes.forEach(cp => {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), clockMat);
      face.position.set(...cp.pos);
      face.rotation.set(...cp.rot);
      group.add(face);
    });

    // Green Copper Pointed Cupola Dome
    const domeGeo = new THREE.ConeGeometry(2.6, 4.5, 8);
    const dome = new THREE.Mesh(domeGeo, materials.roofGreen);
    dome.position.y = 20.25;
    dome.castShadow = true;
    group.add(dome);

    // Brass Finial Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), materials.goldMetal);
    spire.position.y = 23.2;
    group.add(spire);

    // Corner Name Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 400;
    bannerCanvas.height = 90;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = '#212121';
    bctx.beginPath();
    bctx.roundRect(6, 6, 388, 78, 16);
    bctx.fill();
    bctx.strokeStyle = '#ffd700';
    bctx.lineWidth = 4;
    bctx.stroke();
    bctx.fillStyle = '#ffd700';
    bctx.font = 'bold 22px "Outfit", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('🏛️ SADDAR CLOCK TOWER', 200, 45);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(4.4, 1.0, 1);
    sprite.position.set(0, 5.0, 3.2);
    group.add(sprite);

    return group;
  },

  // 37. Clifton Marine Lighthouse (South-West Corner Landmark)
  createCliftonLighthouse() {
    const group = new THREE.Group();
    group.name = "Clifton-Lighthouse";

    // Stone Hexagonal Foundation
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 2.2, 8), materials.towerConcrete);
    plinth.position.y = 1.1;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Alternating Red & White Striped Tapered Tower Bands
    const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
    const whiteMat = materials.whiteMarble;
    const bands = [
      { r1: 2.8, r2: 2.5, y: 4.0, h: 3.6, mat: redMat },
      { r1: 2.5, r2: 2.2, y: 7.6, h: 3.6, mat: whiteMat },
      { r1: 2.2, r2: 1.9, y: 11.2, h: 3.6, mat: redMat },
      { r1: 1.9, r2: 1.6, y: 14.8, h: 3.6, mat: whiteMat }
    ];

    bands.forEach(b => {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(b.r2, b.r1, b.h, 16), b.mat);
      seg.position.y = b.y;
      seg.castShadow = true;
      seg.receiveShadow = true;
      group.add(seg);
    });

    // Gallery Observation Platform
    const gallery = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.4, 16), materials.curbBlack);
    gallery.position.y = 16.8;
    group.add(gallery);

    // Railing
    const railing = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xeeeeee, wireframe: true }));
    railing.position.y = 17.2;
    group.add(railing);

    // Brass Lantern Room Housing
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xfff59d, roughness: 0.1, metalness: 0.8, emissive: 0xffd54f, emissiveIntensity: 0.8 });
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.8, 12), glassMat);
    lantern.position.y = 18.0;
    group.add(lantern);

    // Pointed Copper Cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.8, 12), materials.curbBlack);
    cap.position.y = 19.8;
    group.add(cap);

    // Corner Name Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 400;
    bannerCanvas.height = 90;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = '#01579b';
    bctx.beginPath();
    bctx.roundRect(6, 6, 388, 78, 16);
    bctx.fill();
    bctx.strokeStyle = '#00e5ff';
    bctx.lineWidth = 4;
    bctx.stroke();
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 22px "Outfit", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('🌊 CLIFTON LIGHTHOUSE', 200, 45);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(4.4, 1.0, 1);
    sprite.position.set(0, 4.5, 3.2);
    group.add(sprite);

    return group;
  },

  // 38. Chundrigar Billboard Tower (North-East Corner Landmark)
  createChundrigarBillboardTower() {
    const group = new THREE.Group();
    group.name = "Chundrigar-Billboard-Tower";

    // Dual Steel Lattice Pylons
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8, roughness: 0.3 });
    [-4.5, 4.5].forEach(x => {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 15.0, 8), steelMat);
      pylon.position.set(x, 7.5, 0);
      pylon.castShadow = true;
      group.add(pylon);
    });

    // Cross Braces
    const braceMat = new THREE.MeshBasicMaterial({ color: 0x263238, wireframe: true });
    const truss = new THREE.Mesh(new THREE.BoxGeometry(9.0, 14.0, 0.6), braceMat);
    truss.position.set(0, 7.5, 0);
    group.add(truss);

    // Giant Illuminated Billboard Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(11.5, 5.4, 0.5), materials.curbBlack);
    board.position.set(0, 14.2, 0.1);
    group.add(board);

    // Canvas Billboard Graphic
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#004d40'; // Deep green
    ctx.fillRect(0, 0, 512, 240);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(6, 6, 500, 228);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HABIB BANK PLAZA', 256, 75);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Outfit", sans-serif';
    ctx.fillText('CHUNDRIGAR ROAD • FINANCIAL HEART', 256, 130);
    ctx.fillStyle = '#80cbc4';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText('کراچی • CITY OF LIGHTS', 256, 185);

    const bTex = new THREE.CanvasTexture(canvas);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 5.1), new THREE.MeshBasicMaterial({ map: bTex }));
    screen.position.set(0, 14.2, 0.38);
    group.add(screen);

    return group;
  },

  // 39. Do Darya Coastal Pavilion (South-East Corner Landmark)
  createDoDaryaPavilion() {
    const group = new THREE.Group();
    group.name = "Do-Darya-Pavilion";

    // Coastal Timber Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.2, 9.0), materials.woodBench);
    platform.position.y = 0.6;
    platform.receiveShadow = true;
    group.add(platform);

    // 8 Wooden Pergola Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 5.0, 8);
    const pillarMat = materials.wood;
    const coords = [
      [-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8],
      [0, -3.8], [0, 3.8], [-3.8, 0], [3.8, 0]
    ];
    coords.forEach(([px, pz]) => {
      const pil = new THREE.Mesh(pillarGeo, pillarMat);
      pil.position.set(px, 3.7, pz);
      pil.castShadow = true;
      group.add(pil);
    });

    // Double Tiered Pagoda Roof
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2.2, 8), materials.roofGreen);
    roof1.position.y = 7.0;
    group.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.8, 8), materials.roofGreen);
    roof2.position.y = 8.8;
    group.add(roof2);

    // Corner Name Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 400;
    bannerCanvas.height = 90;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = '#004d40';
    bctx.beginPath();
    bctx.roundRect(6, 6, 388, 78, 16);
    bctx.fill();
    bctx.strokeStyle = '#ffd700';
    bctx.lineWidth = 4;
    bctx.stroke();
    bctx.fillStyle = '#ffd700';
    bctx.font = 'bold 22px "Outfit", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('🦐 DO DARYA COASTAL PIER', 200, 45);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(4.4, 1.0, 1);
    sprite.position.set(0, 4.0, 4.5);
    group.add(sprite);

    return group;
  },

  // 40. KMC Hazard Barricade Barrier
  createKMCBarrier() {
    const group = new THREE.Group();
    group.name = "KMC-Barricade";

    const barrierGeo = new THREE.BoxGeometry(3.2, 1.1, 0.6);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    // Yellow and black diagonal stripes
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#212121';
    for (let x = -100; x < 350; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x - 20, 128);
      ctx.lineTo(x - 40, 128);
      ctx.fill();
    }
    const bTex = new THREE.CanvasTexture(canvas);
    const barrier = new THREE.Mesh(barrierGeo, new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.5 }));
    barrier.position.y = 0.55;
    group.add(barrier);

    // Amber Flashing Light
    const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffa000 }));
    strobe.position.set(0, 1.25, 0);
    group.add(strobe);

    return group;
  },

  // 40b. Heavy Iron Manhole Cover (Practically sealing open gutters and sewer pits)
  createHeavyManholeCover() {
    const group = new THREE.Group();
    group.name = "Heavy-Manhole-Cover";

    // Heavy cast-iron outer rim
    const rimGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.12, 28);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.85, metalness: 0.7 });
    const rim = new THREE.Mesh(rimGeo, ironMat);
    rim.position.y = 0.06;
    group.add(rim);

    // Inner embossed heavy iron hatch plate
    const plateGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.15, 28);
    const hatchMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.6, metalness: 0.8 });
    const plate = new THREE.Mesh(plateGeo, hatchMat);
    plate.position.y = 0.08;
    group.add(plate);

    // Four heavy locking bolts
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 });
    for (let b = 0; b < 4; b++) {
      const angle = (b * Math.PI) / 2;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), boltMat);
      bolt.position.set(Math.cos(angle) * 1.15, 0.1, Math.sin(angle) * 1.15);
      group.add(bolt);
    }

    // Safety yellow embossed ring
    const sealGeo = new THREE.RingGeometry(1.26, 1.35, 28);
    sealGeo.rotateX(-Math.PI / 2);
    const sealMat = new THREE.MeshBasicMaterial({ color: 0xffd600, side: THREE.DoubleSide });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.y = 0.16;
    group.add(seal);

    return group;
  },

  // 40c. Police Heavy Steel Wheel Clamp Lock (Immobilizing illegal tankers and transport)
  createPoliceWheelClamp() {
    const group = new THREE.Group();
    group.name = "Police-Wheel-Clamp";

    // Heavy red triangle clamp body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4, metalness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.22), bodyMat);
    body.position.set(0, 0.45, 0);
    group.add(body);

    // High-tensile steel lock arm
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3, metalness: 0.8 });
    const armTop = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 10), armMat);
    armTop.rotation.z = Math.PI / 4;
    armTop.position.set(0.25, 0.75, 0);
    group.add(armTop);

    const armBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 10), armMat);
    armBottom.rotation.z = -Math.PI / 4;
    armBottom.position.set(-0.25, 0.75, 0);
    group.add(armBottom);

    // Brass keylock cylinder
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.26, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 }));
    lock.rotation.x = Math.PI / 2;
    lock.position.set(0, 0.45, 0.12);
    group.add(lock);

    return group;
  },

  // 40d. Tactical High-Visibility Traffic Cones Cluster
  createTrafficConesCluster() {
    const group = new THREE.Group();
    group.name = "Traffic-Cones-Cluster";

    const conePositions = [
      [-0.8, -0.6],
      [0.8, -0.6],
      [0.0, 0.9]
    ];

    conePositions.forEach(([cx, cz]) => {
      const coneSub = new THREE.Group();
      coneSub.position.set(cx, 0, cz);

      // Black rubber base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.55), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
      base.position.y = 0.025;
      coneSub.add(base);

      // Fluo orange cone body
      const coneBody = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 14), new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.4 }));
      coneBody.position.y = 0.4;
      coneSub.add(coneBody);

      // Reflective white safety collar
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.18, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      collar.position.y = 0.42;
      coneSub.add(collar);

      group.add(coneSub);
    });

    return group;
  },

  // 41. Solid Coastal Granite Seawall Segment
  createSeawallSegment(width = 24) {
    const group = new THREE.Group();
    group.name = "Seawall-Segment";

    // Granite block
    const wallGeo = new THREE.BoxGeometry(width, 2.4, 1.6);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.8 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.2;
    wall.receiveShadow = true;
    wall.castShadow = true;
    group.add(wall);

    // Marine Blue Safety Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, metalness: 0.6, roughness: 0.3 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.1), railMat);
    rail.position.set(0, 2.45, 0);
    group.add(rail);

    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
    for (let x = -width / 2 + 2; x <= width / 2 - 2; x += 4) {
      const p = new THREE.Mesh(postGeo, railMat);
      p.position.set(x, 2.05, 0);
      group.add(p);
    }

    return group;
  },

  // 42. Karachi Coastal Concrete Tetrapod Breakwater (Clifton & Manora Sea-breaks)
  createTetrapodBreakwater() {
    const group = new THREE.Group();
    group.name = "Tetrapod-Breakwater";

    const tetraMat = new THREE.MeshStandardMaterial({
      color: 0x78909c, // Weathered marine concrete
      roughness: 0.85
    });

    const createSingleTetra = () => {
      const tg = new THREE.Group();
      const legGeo = new THREE.CylinderGeometry(0.35, 0.6, 2.2, 8);
      // 4 legs radiating in tetrahedral angles
      const angles = [
        [0, 0, 0],
        [Math.PI * 0.6, 0, 0],
        [Math.PI * 0.6, (2 * Math.PI) / 3, 0],
        [Math.PI * 0.6, (4 * Math.PI) / 3, 0]
      ];
      angles.forEach(ang => {
        const leg = new THREE.Mesh(legGeo, tetraMat);
        leg.rotation.set(ang[0], ang[1], ang[2]);
        leg.position.y = 0.6;
        tg.add(leg);
      });
      return tg;
    };

    // Cluster of 3 interlocking tetrapods
    [-1.2, 0, 1.2].forEach((x, idx) => {
      const tetra = createSingleTetra();
      tetra.position.set(x, 0.6, (idx % 2 === 0 ? 0.3 : -0.3));
      tetra.rotation.y = idx * 1.1;
      group.add(tetra);
    });

    return group;
  },

  // 43. Coastal Corner Water Bay (Azure Arabian Sea water inlet with breaking waves, foam, and warning buoy)
  createCoastalWaterBay({ title = "🌊 ARABIAN SEA BAY", subtitle = "MANORA COASTAL WATER" } = {}) {
    const group = new THREE.Group();
    group.name = "Coastal-Water-Bay";

    // 1. Water Inlet Plane with rich ocean shader material
    const waterGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00838f,
      roughness: 0.1,
      metalness: 0.65,
      transparent: true,
      opacity: 0.88
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.05, 0);
    group.add(waterMesh);

    // 2. White Surf Foam Band along the shoreline edge
    const foamGeo = new THREE.RingGeometry(15, 17.5, 32);
    foamGeo.rotateX(-Math.PI / 2);
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(0, 0.07, 0);
    group.add(foam);

    // 3. Floating Marine Channel Navigation Buoy
    const buoyGroup = new THREE.Group();
    buoyGroup.position.set(4, 0.4, 4);

    const buoyHull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.5, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.3 }) // High-vis marine orange
    );
    buoyGroup.add(buoyHull);

    const buoyCage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.7, 1.6, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x212121, wireframe: true })
    );
    buoyCage.position.y = 1.3;
    buoyGroup.add(buoyCage);

    const buoyLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e676 }) // Green navigational strobe
    );
    buoyLight.position.y = 2.2;
    buoyGroup.add(buoyLight);

    group.add(buoyGroup);

    // 4. Granite Boulders & Tetrapods along the inner shore curve
    const rockGeo = new THREE.DodecahedronGeometry(1.2);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.9 });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 0.6;
      const rx = Math.cos(a) * 14 - 2;
      const rz = Math.sin(a) * 14 - 2;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, 0.6, rz);
      rock.scale.set(1.2 + Math.random() * 0.6, 0.8 + Math.random() * 0.5, 1.2 + Math.random() * 0.6);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(rock);
    }

    // 5. Corner Floating Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 440;
    bannerCanvas.height = 100;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = 'rgba(0, 77, 64, 0.9)';
    bctx.beginPath();
    bctx.roundRect(6, 6, 428, 88, 18);
    bctx.fill();
    bctx.strokeStyle = '#00e5ff';
    bctx.lineWidth = 4;
    bctx.stroke();
    bctx.fillStyle = '#00e5ff';
    bctx.font = 'bold 24px "Outfit", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText(title, 220, 36);
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 18px "Outfit", sans-serif';
    bctx.fillText(subtitle, 220, 72);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    sprite.scale.set(5.2, 1.2, 1);
    sprite.position.set(0, 4.8, 0);
    group.add(sprite);

    group.userData = {
      waterMesh,
      foam,
      buoyGroup,
      buoyLight
    };

    return group;
  },

  // ==============================================================
  // 36. BEFORE ➔ AFTER CIVIC CLEANSE TRANSFORMATION MONUMENTS
  // When an evil is cleansed, this beautiful civic upgrade appears!
  // ==============================================================
  createCleanedReplacement(evilType = 'pothole') {
    const group = new THREE.Group();

    // Base glowing green civic aura ring on ground
    const auraGeo = new THREE.RingGeometry(0.8, 1.8, 24);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const auraRing = new THREE.Mesh(auraGeo, auraMat);
    auraRing.position.y = 0.04;
    group.add(auraRing);

    let badgeText = "✅ REPAIRED / بحال شدہ";
    let badgeUrdu = "شہری صفائی و ترقی";

    if (evilType === 'pothole') {
      badgeText = "✅ SMOOTH ROAD REPAIRED";
      badgeUrdu = "سڑک ہموار و پکی بحال";
      // Smooth circular fresh asphalt patch
      const patchGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.06, 24);
      const patchMat = new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.5 });
      const patch = new THREE.Mesh(patchGeo, patchMat);
      patch.position.y = 0.03;
      group.add(patch);

      // Bright yellow reflective road stripe
      const stripeGeo = new THREE.PlaneGeometry(3.2, 0.28);
      stripeGeo.rotateX(-Math.PI / 2);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.07;
      group.add(stripe);

    } else if (evilType === 'trash') {
      badgeText = "🌸 BLOOMING JASMINE PLANTER";
      badgeUrdu = "کچرا ختم - گلشنِ کراچی";
      // Polished cedar wooden planter box
      const boxGeo = new THREE.BoxGeometry(2.0, 0.7, 1.2);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0.35;
      group.add(box);

      // Lush green bush with blossoming flowers
      const bushGeo = new THREE.SphereGeometry(0.8, 10, 8);
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(0, 0.95, 0);
      bush.scale.set(1.4, 0.75, 0.9);
      group.add(bush);

      // Pink & white jasmine flower blooms
      for (let f = 0; f < 8; f++) {
        const flowerGeo = new THREE.DodecahedronGeometry(0.12);
        const flowerMat = new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? 0xff4081 : 0xffffff });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        const angle = (f / 8) * Math.PI * 2;
        flower.position.set(Math.cos(angle) * 0.7, 1.2 + (f % 3) * 0.1, Math.sin(angle) * 0.45);
        group.add(flower);
      }

      // Modern KMC Green Recycling Bin
      const binGeo = new THREE.CylinderGeometry(0.3, 0.26, 0.9, 12);
      const binMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.4 });
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(1.5, 0.45, 0);
      group.add(bin);

    } else if (evilType === 'gutka') {
      badgeText = "🚰 CLEAN DRINKING SABEEL";
      badgeUrdu = "گٹکا ختم - مفت صاف پانی";
      // Chilled water dispenser cooler
      const coolerGeo = new THREE.BoxGeometry(0.8, 1.4, 0.7);
      const coolerMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.3, metalness: 0.4 });
      const cooler = new THREE.Mesh(coolerGeo, coolerMat);
      cooler.position.y = 0.7;
      group.add(cooler);

      // Stainless steel tap & water tray
      const trayGeo = new THREE.BoxGeometry(0.5, 0.1, 0.3);
      const trayMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9 });
      const tray = new THREE.Mesh(trayGeo, trayMat);
      tray.position.set(0, 0.55, 0.42);
      group.add(tray);

      // Green anti-litter bin
      const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x388e3c }));
      bin.position.set(-0.85, 0.4, 0);
      group.add(bin);

    } else if (evilType === 'robber') {
      badgeText = "🛡️ SECURE CIVIC SAFE ZONE";
      badgeUrdu = "ڈاکو گرفتار - پرامن علاقہ";
      // Golden Civic Peace Shield on pavement
      const shieldGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.04, 32);
      const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.3, metalness: 0.3 });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.y = 0.04;
      group.add(shield);

      // Restored bright Victorian heritage street lamp
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 10), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      post.position.set(0, 1.6, 0);
      group.add(post);

      const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
      lamp.position.set(0, 3.2, 0);
      group.add(lamp);

    } else if (evilType === 'vip') {
      badgeText = "🚦 FREE FLOWING CORRIDOR";
      badgeUrdu = "وی آئی پی کلچر ختم - ٹریفک رواں";
      // Green traffic light pillar
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.4, 10), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      pole.position.set(0, 1.7, 0);
      group.add(pole);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.35), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      box.position.set(0, 3.0, 0);
      group.add(box);

      const greenLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00e676 }));
      greenLight.position.set(0, 2.7, 0.2);
      group.add(greenLight);

    } else if (evilType === 'tanker') {
      badgeText = "💧 SABEEL-E-AAB FOUNTAIN";
      badgeUrdu = "ٹینکر مافیا ختم - میٹھا پانی عام";
      // Tiled mosaic fountain basin
      const basinGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.65, 24);
      const basinMat = new THREE.MeshStandardMaterial({ color: 0x00838f, roughness: 0.3 });
      const basin = new THREE.Mesh(basinGeo, basinMat);
      basin.position.y = 0.32;
      group.add(basin);

      // Water surface inside fountain
      const waterSurface = new THREE.Mesh(new THREE.CircleGeometry(1.45, 24), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 }));
      waterSurface.rotateX(-Math.PI / 2);
      waterSurface.position.y = 0.62;
      group.add(waterSurface);

      // Center decorative Islamic arched pillar
      const centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0x00695c }));
      centerPillar.position.set(0, 1.3, 0);
      group.add(centerPillar);

    } else if (evilType === 'ke') {
      badgeText = "☀️ SOLAR CLEAN POWER";
      badgeUrdu = "کنڈہ کلچر ختم - سولر انرجی";
      // Green solar energy utility kiosk
      const kiosk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.9), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.4 }));
      kiosk.position.y = 0.9;
      group.add(kiosk);

      // Angled blue solar panel canopy on top
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.4), new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.2, metalness: 0.8 }));
      solarPanel.position.set(0, 2.1, 0);
      solarPanel.rotation.x = 0.3;
      group.add(solarPanel);

    } else if (evilType === 'chinacutting') {
      badgeText = "🌳 PUBLIC GREEN PROMENADE";
      badgeUrdu = "چائنا کٹنگ ختم - عوامی واک وے";
      // Clean paved footpath segment
      const pave = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.0), new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.6 }));
      pave.position.y = 0.05;
      group.add(pave);

      // Wooden park bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x795548 }));
      bench.position.set(0, 0.3, 0);
      group.add(bench);

    } else if (evilType === 'bhatta') {
      badgeText = "🕊️ AMAN BAZAAR MARKET";
      badgeUrdu = "بھتہ بند - پرامن کراچی مارکیٹ";
      // Festive striped canopy
      const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.6, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.5 }));
      canopy.position.set(0, 2.0, 0);
      group.add(canopy);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 10), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      pole.position.set(0, 1.0, 0);
      group.add(pole);

    } else if (evilType === 'onewheeler') {
      badgeText = "🚸 SAFE TRANSIT ZONE";
      badgeUrdu = "ون ویلنگ بند - محفوظ سڑکیں";
      // Traffic safety signboard
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0xffeb3b }));
      board.position.set(0, 2.2, 0);
      group.add(board);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      pole.position.set(0, 1.1, 0);
      group.add(pole);

    } else {
      // Politician / General
      badgeText = "🏛️ AWAMI WELFARE MONUMENT";
      badgeUrdu = "عوامی پیسہ عوام پر خرچ";
      // Golden treasury chest turning into public park
      const chest = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.8), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 }));
      chest.position.y = 0.45;
      group.add(chest);
    }

    // Floating 3D Billboard Badge: "BEFORE ➔ AFTER: CLEANSED!"
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10, 25, 18, 0.92)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 444, 94, 20);
    ctx.fill();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#00e676';
    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✨ ${badgeText} ✨`, 230, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Noto Nastaliq Urdu", "Outfit", sans-serif';
    ctx.fillText(badgeUrdu, 230, 74);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(4.6, 1.1, 1);
    sprite.position.set(0, 3.6, 0);
    group.add(sprite);

    group.userData = {
      isCleanedMonument: true,
      auraRing,
      sprite,
      createdTime: 0,
      life: 9999
    };

    return group;
  },

  // =========================================================================
  // ICONIC KARACHI LANDMARKS & MONUMENTS
  // =========================================================================

  // 1. Teen Talwar Chowrangi (Clifton Three Swords Roundabout Monument)
  createTeenTalwarChowrangi() {
    const group = new THREE.Group();
    group.name = "Teen Talwar Chowrangi (تین تلوار)";

    // Roundabout outer curb (Yellow and black checkered)
    const curbGeo = new THREE.CylinderGeometry(9.6, 9.8, 0.45, 32);
    const curb = new THREE.Mesh(curbGeo, materials.curbYellow);
    curb.position.y = 0.22;
    group.add(curb);

    // Inner green lawn mound
    const lawnGeo = new THREE.CylinderGeometry(9.2, 9.4, 0.5, 32);
    const lawn = new THREE.Mesh(lawnGeo, materials.lawnGreen);
    lawn.position.y = 0.25;
    lawn.receiveShadow = true;
    group.add(lawn);

    // Central circular fountain pool basin
    const basinGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.6, 24);
    const basin = new THREE.Mesh(basinGeo, materials.whiteMarble);
    basin.position.y = 0.55;
    group.add(basin);

    const waterGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.55, 24);
    const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.1, metalness: 0.8 }));
    water.position.y = 0.6;
    group.add(water);

    // Central stepped octagonal marble pedestal
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.6, 8), materials.whiteMarble);
    step1.position.y = 0.85;
    group.add(step1);

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.6, 8), materials.whiteMarble);
    step2.position.y = 1.45;
    group.add(step2);

    // Three White Marble Swords (تین تلوار) - 120° apart
    const slogans = [
      { text: "UNITY", urdu: "اتحاد" },
      { text: "FAITH", urdu: "یقین محکم" },
      { text: "DISCIPLINE", urdu: "تنظیم" }
    ];

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const swordGroup = new THREE.Group();
      swordGroup.position.set(Math.cos(angle) * 1.5, 1.75, Math.sin(angle) * 1.5);
      swordGroup.rotation.y = -angle + Math.PI / 2;
      swordGroup.rotation.z = -0.05; // Gentle majestic outward curve

      // Golden Hilt & Pommel
      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), materials.goldMetal);
      pommel.position.y = 0.2;
      swordGroup.add(pommel);

      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.2, 12), materials.goldMetal);
      grip.position.y = 0.8;
      swordGroup.add(grip);

      const guard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.5), materials.goldMetal);
      guard.position.y = 1.5;
      swordGroup.add(guard);

      // White Marble Blade (Height 9.5m, tapering to curved tip)
      const bladeGeo = new THREE.BoxGeometry(0.85, 9.5, 0.25);
      const blade = new THREE.Mesh(bladeGeo, materials.whiteMarble);
      blade.position.y = 6.25;
      blade.castShadow = true;
      swordGroup.add(blade);

      // Pointed Tip
      const tipGeo = new THREE.ConeGeometry(0.42, 1.6, 4);
      const tip = new THREE.Mesh(tipGeo, materials.whiteMarble);
      tip.position.y = 11.5;
      tip.rotation.y = Math.PI / 4;
      swordGroup.add(tip);

      // Golden Calligraphy Motto Banner on Blade Face
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 128;
      bannerCanvas.height = 380;
      const bctx = bannerCanvas.getContext('2d');
      bctx.fillStyle = '#ffffff';
      bctx.fillRect(0, 0, 128, 380);
      bctx.fillStyle = '#b78103';
      bctx.font = 'bold 36px "Noto Nastaliq Urdu", "Outfit", sans-serif';
      bctx.textAlign = 'center';
      bctx.fillText(slogans[i].urdu, 64, 140);
      bctx.font = '900 24px "Outfit", sans-serif';
      bctx.fillText(slogans[i].text, 64, 240);

      const bannerTex = new THREE.CanvasTexture(bannerCanvas);
      const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 4.5), new THREE.MeshBasicMaterial({ map: bannerTex }));
      bannerMesh.position.set(0, 6.0, 0.14);
      swordGroup.add(bannerMesh);

      group.add(swordGroup);
    }

    // 4 Spotlights on the lawn aimed at the swords
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => {
      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8), materials.chrome);
      spot.position.set(Math.cos(a) * 6.5, 0.6, Math.sin(a) * 6.5);
      spot.rotation.x = 0.5;
      group.add(spot);
    });

    // 4 Date Palm Trees around the Chowrangi
    [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4].forEach(a => {
      const palm = this.createPalmTree(6.0);
      palm.position.set(Math.cos(a) * 7.5, 0.4, Math.sin(a) * 7.5);
      group.add(palm);
    });

    return group;
  },

  // 2. Shahrah-e-Faisal Overhead Green Steel Pedestrian Bridge (پل) with Authentic Billboards
  createOverheadPedestrianBridge(spanWidth = 24) {
    const group = new THREE.Group();
    group.name = "Overhead Pedestrian Bridge (شاہراہ پل)";

    const halfSpan = spanWidth / 2;

    // Twin Green Steel Towers / Pillars on sidewalks
    [-halfSpan, halfSpan].forEach((px) => {
      const colL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.8, 0.8), materials.bridgeGreen);
      colL.position.set(px, 4.9, -1.8);
      group.add(colL);
      const colR = colL.clone();
      colR.position.z = 1.8;
      group.add(colR);

      // Staircase ramp
      const stairBeam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 9.5), materials.bridgeGreen);
      stairBeam.position.set(px, 4.6, px < 0 ? -5.5 : 5.5);
      stairBeam.rotation.x = px < 0 ? 0.45 : -0.45;
      group.add(stairBeam);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 9.5), materials.chrome);
      rail.position.set(px - 0.75, 5.3, px < 0 ? -5.5 : 5.5);
      rail.rotation.x = px < 0 ? 0.45 : -0.45;
      group.add(rail);
    });

    // Main Span Deck
    const deckGeo = new THREE.BoxGeometry(spanWidth + 2.0, 0.5, 3.6);
    const deck = new THREE.Mesh(deckGeo, materials.bridgeGreen);
    deck.position.set(0, 9.5, 0);
    group.add(deck);

    // Green Steel Cage Handrails
    const cageL = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 2.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x1b5e20, wireframe: true }));
    cageL.position.set(0, 10.8, -1.75);
    group.add(cageL);
    const cageR = cageL.clone();
    cageR.position.z = 1.75;
    group.add(cageR);

    // Side A (Facing -Z): Shan Bombay Biryani Masala
    const canvasShan = document.createElement('canvas');
    canvasShan.width = 1024;
    canvasShan.height = 256;
    const sctx = canvasShan.getContext('2d');
    sctx.fillStyle = '#b71c1c';
    sctx.fillRect(0, 0, 1024, 256);
    sctx.fillStyle = '#ffd54f';
    sctx.fillRect(8, 8, 1008, 12);
    sctx.fillRect(8, 236, 1008, 12);
    sctx.fillStyle = '#ffffff';
    sctx.font = '900 64px "Outfit", sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('SHAN BOMBAY BIRYANI MASALA', 512, 95);
    sctx.fillStyle = '#ffd54f';
    sctx.font = 'bold 52px "Noto Nastaliq Urdu", "Outfit", sans-serif';
    sctx.fillText('شان بمبئی بریانی • اصلی ذائقہ، ہر بار! 🌶️', 512, 195);

    const texShan = new THREE.CanvasTexture(canvasShan);
    const boardMeshNorth = new THREE.Mesh(
      new THREE.PlaneGeometry(spanWidth * 0.85, 3.8),
      new THREE.MeshBasicMaterial({ map: texShan })
    );
    boardMeshNorth.position.set(0, 12.8, -1.85);
    boardMeshNorth.rotation.y = Math.PI;
    group.add(boardMeshNorth);

    // Side B (Facing +Z): Tapal Danedar Tea
    const canvasTapal = document.createElement('canvas');
    canvasTapal.width = 1024;
    canvasTapal.height = 256;
    const tctx = canvasTapal.getContext('2d');
    tctx.fillStyle = '#4a0e17';
    tctx.fillRect(0, 0, 1024, 256);
    tctx.fillStyle = '#ffb300';
    tctx.fillRect(8, 8, 1008, 12);
    tctx.fillRect(8, 236, 1008, 12);
    tctx.fillStyle = '#ffffff';
    tctx.font = '900 64px "Outfit", sans-serif';
    tctx.textAlign = 'center';
    tctx.fillText('TAPAL DANEDAR TEA', 512, 95);
    tctx.fillStyle = '#ffb300';
    tctx.font = 'bold 52px "Noto Nastaliq Urdu", "Outfit", sans-serif';
    tctx.fillText('تپال دانے دار • مزہ ہر گھونٹ میں! ☕', 512, 195);

    const texTapal = new THREE.CanvasTexture(canvasTapal);
    const boardMeshSouth = new THREE.Mesh(
      new THREE.PlaneGeometry(spanWidth * 0.85, 3.8),
      new THREE.MeshBasicMaterial({ map: texTapal })
    );
    boardMeshSouth.position.set(0, 12.8, 1.85);
    group.add(boardMeshSouth);

    // Green Highway Overhead Directional Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 768;
    signCanvas.height = 160;
    const gctx = signCanvas.getContext('2d');
    gctx.fillStyle = '#004d40';
    gctx.fillRect(0, 0, 768, 160);
    gctx.strokeStyle = '#ffffff';
    gctx.lineWidth = 6;
    gctx.strokeRect(6, 6, 756, 148);
    gctx.fillStyle = '#ffffff';
    gctx.font = 'bold 28px "Outfit", sans-serif';
    gctx.textAlign = 'center';
    gctx.fillText('⬅️ CLIFTON (کلفٹن)   ⬆️ SHAHRAH-E-FAISAL (شاہراہِ فیصل)   ➡️ SADDAR (صدر)', 384, 90);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.8), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, 4.8, 1.85);
    group.add(signMesh);

    return group;
  },

  // 3. Mohatta Palace (مہٹہ پیلس - Rajasthani Pink Sandstone Heritage Palace)
  createMohattaPalace() {
    const group = new THREE.Group();
    group.name = "Mohatta Palace (مہٹہ پیلس)";

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 18), materials.sandstone);
    plinth.position.y = 0.6;
    group.add(plinth);

    const palaceGeo = new THREE.BoxGeometry(21, 9.5, 15);
    const palace = new THREE.Mesh(palaceGeo, materials.jodhpurPink);
    palace.position.y = 5.95;
    palace.castShadow = true;
    group.add(palace);

    // Arched windows
    const winGeo = new THREE.BoxGeometry(2.4, 3.2, 0.4);
    [-6.5, 0, 6.5].forEach(wx => {
      const winG = new THREE.Mesh(winGeo, materials.gizriYellow);
      winG.position.set(wx, 4.5, 7.6);
      group.add(winG);
      const win1 = new THREE.Mesh(winGeo, materials.gizriYellow);
      win1.position.set(wx, 8.5, 7.6);
      group.add(win1);
    });

    // 4 Corner Chhatris
    const cornerCoords = [
      [-9.5, -6.5], [9.5, -6.5], [-9.5, 6.5], [9.5, 6.5]
    ];
    cornerCoords.forEach(([cx, cz]) => {
      const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.0, 8), materials.jodhpurPink);
      turret.position.set(cx, 12.5, cz);
      group.add(turret);

      const cDome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), materials.gizriYellow);
      cDome.position.set(cx, 14.5, cz);
      group.add(cDome);

      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8), materials.goldMetal);
      finial.position.set(cx, 16.5, cz);
      group.add(finial);
    });

    // Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const mctx = signCanvas.getContext('2d');
    mctx.fillStyle = '#4a1525';
    mctx.fillRect(0, 0, 512, 128);
    mctx.strokeStyle = '#d9be8b';
    mctx.lineWidth = 6;
    mctx.strokeRect(6, 6, 500, 116);
    mctx.fillStyle = '#ffffff';
    mctx.font = 'bold 32px "Outfit", sans-serif';
    mctx.textAlign = 'center';
    mctx.fillText('MOHATTA PALACE MUSEUM', 256, 54);
    mctx.fillStyle = '#d9be8b';
    mctx.font = 'bold 28px "Noto Nastaliq Urdu", sans-serif';
    mctx.fillText('مہٹہ پیلس میوزیم • کلفٹن کراچی', 256, 96);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.0), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, 6.8, 7.65);
    group.add(signMesh);

    return group;
  },

  // 4. Frere Hall (فریئر ہال - Venetian-Gothic Yellow Gizri Limestone Landmark)
  createFrereHall() {
    const group = new THREE.Group();
    group.name = "Frere Hall (فریئر ہال)";

    const base = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 16), materials.sandstone);
    base.position.y = 0.6;
    group.add(base);

    const bodyGeo = new THREE.BoxGeometry(22, 11, 13);
    const body = new THREE.Mesh(bodyGeo, materials.gizriYellow);
    body.position.y = 6.6;
    body.castShadow = true;
    group.add(body);

    const roofGeo = new THREE.ConeGeometry(9.5, 6.5, 4);
    const roof = new THREE.Mesh(roofGeo, materials.roofGreen);
    roof.position.set(0, 15.3, 0);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    const spireTower = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 7.5, 8), materials.gizriYellow);
    spireTower.position.set(-6.5, 14.5, 0);
    group.add(spireTower);

    const spireCone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 8.5, 8), materials.roofGreen);
    spireCone.position.set(-6.5, 21.5, 0);
    group.add(spireCone);

    [-7, -3.5, 0, 3.5, 7].forEach(lx => {
      const lancet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 0.4), materials.darkGlass);
      lancet.position.set(lx, 6.8, 6.6);
      group.add(lancet);
    });

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const fctx = signCanvas.getContext('2d');
    fctx.fillStyle = '#1b3a27';
    fctx.fillRect(0, 0, 512, 128);
    fctx.strokeStyle = '#e6c875';
    fctx.lineWidth = 6;
    fctx.strokeRect(6, 6, 500, 116);
    fctx.fillStyle = '#ffffff';
    fctx.font = 'bold 34px "Outfit", sans-serif';
    fctx.textAlign = 'center';
    fctx.fillText('FRERE HALL SADEQUAIN GALLERY', 256, 54);
    fctx.fillStyle = '#e6c875';
    fctx.font = 'bold 26px "Noto Nastaliq Urdu", sans-serif';
    fctx.fillText('فریئر ہال و صادقین گیلری • کراچی', 256, 96);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.0), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, 3.4, 6.65);
    group.add(signMesh);

    return group;
  },

  // 5. Habib Bank Plaza (HBL Plaza, I.I. Chundrigar Road Modernist Skyscraper)
  createHabibBankPlaza() {
    const group = new THREE.Group();
    group.name = "Habib Bank Plaza (حبیب بینک پلازہ)";

    const podiumGeo = new THREE.CylinderGeometry(8.5, 9.2, 4.5, 24);
    const podium = new THREE.Mesh(podiumGeo, materials.towerConcrete);
    podium.position.y = 2.25;
    podium.receiveShadow = true;
    group.add(podium);

    const shaftGeo = new THREE.CylinderGeometry(6.4, 6.8, 30, 24);
    const shaft = new THREE.Mesh(shaftGeo, materials.hblBlue);
    shaft.position.y = 19.5;
    shaft.castShadow = true;
    group.add(shaft);

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 28, 0.8), materials.towerConcrete);
      fin.position.set(Math.cos(a) * 6.8, 19.5, Math.sin(a) * 6.8);
      fin.rotation.y = -a;
      group.add(fin);
    }

    const crownGeo = new THREE.CylinderGeometry(8.5, 6.2, 5.0, 24);
    const crown = new THREE.Mesh(crownGeo, materials.towerConcrete);
    crown.position.y = 37.0;
    group.add(crown);

    const roofDeck = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.2, 0.8, 24), materials.darkGlass);
    roofDeck.position.y = 39.8;
    group.add(roofDeck);

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.45, 9.0, 8), materials.chrome);
    spire.position.y = 44.5;
    group.add(spire);

    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 512;
    logoCanvas.height = 160;
    const lctx = logoCanvas.getContext('2d');
    lctx.fillStyle = '#00558f';
    lctx.fillRect(0, 0, 512, 160);
    lctx.strokeStyle = '#00e5ff';
    lctx.lineWidth = 6;
    lctx.strokeRect(6, 6, 500, 148);
    lctx.fillStyle = '#ffffff';
    lctx.font = '900 48px "Outfit", sans-serif';
    lctx.textAlign = 'center';
    lctx.fillText('HBL PLAZA', 256, 68);
    lctx.fillStyle = '#00e5ff';
    lctx.font = 'bold 36px "Noto Nastaliq Urdu", sans-serif';
    lctx.fillText('حبیب بینک پلازہ • چندریگر روڈ', 256, 126);

    const logoTex = new THREE.CanvasTexture(logoCanvas);
    const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 2.4), new THREE.MeshBasicMaterial({ map: logoTex }));
    logoMesh.position.set(0, 6.0, 8.2);
    group.add(logoMesh);

    return group;
  },

  // 6. Clifton Decorated Sea View Camel (سی ویو اونٹ)
  createCliftonDecoratedCamel() {
    const group = new THREE.Group();
    group.name = "Clifton Beach Camel (سی ویو اونٹ)";

    const bodyGeo = new THREE.BoxGeometry(1.8, 1.4, 2.8);
    const body = new THREE.Mesh(bodyGeo, materials.camelFur);
    body.position.y = 2.4;
    group.add(body);

    const humpGeo = new THREE.SphereGeometry(0.85, 12, 12);
    humpGeo.scale(0.8, 1.2, 1.0);
    const hump = new THREE.Mesh(humpGeo, materials.camelFur);
    hump.position.set(0, 3.2, -0.2);
    group.add(hump);

    const neckGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 8);
    const neck = new THREE.Mesh(neckGeo, materials.camelFur);
    neck.position.set(0, 3.2, 1.5);
    neck.rotation.x = 0.55;
    group.add(neck);

    const headGeo = new THREE.BoxGeometry(0.55, 0.65, 1.1);
    const head = new THREE.Mesh(headGeo, materials.camelFur);
    head.position.set(0, 3.9, 2.2);
    group.add(head);

    const legGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.0, 8);
    [
      [-0.6, 1.0, 0.9], [0.6, 1.0, 0.9],
      [-0.6, 1.0, -0.9], [0.6, 1.0, -0.9]
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, materials.camelFur);
      leg.position.set(lx, ly, lz);
      group.add(leg);
    });

    const saddleGeo = new THREE.BoxGeometry(2.0, 0.8, 1.8);
    const saddle = new THREE.Mesh(saddleGeo, materials.rilliPink);
    saddle.position.set(0, 2.8, -0.2);
    group.add(saddle);

    [-1.05, 1.05].forEach(tx => {
      for (let tz = -0.7; tz <= 0.7; tz += 0.45) {
        const pom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.rilliGold);
        pom.position.set(tx, 2.4, tz);
        group.add(pom);
      }
    });

    const decal = this.createFriendlyDecal('pet', '🐪 CLIFTON CAMEL • سی ویو اونٹ');
    decal.position.set(0, 4.8, 0);
    group.add(decal);

    return group;
  },

  // 7. Utility pole with tangled wires and a danger plate
  createUtilityTransformerPole() {
    const group = new THREE.Group();
    group.name = "Utility Transformer Pole";

    [-1.0, 1.0].forEach(px => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.5, 0.4), materials.towerConcrete);
      pole.position.set(px, 4.75, 0);
      group.add(pole);
    });

    const barTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 0.35), materials.curbBlack);
    barTop.position.set(0, 9.0, 0);
    group.add(barTop);

    const barPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 1.8), materials.curbBlack);
    barPlatform.position.set(0, 5.2, 0);
    group.add(barPlatform);

    const transGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 12);
    const trans = new THREE.Mesh(transGeo, materials.roofGreen);
    trans.position.set(0, 6.5, 0);
    group.add(trans);

    const dangerCanvas = document.createElement('canvas');
    dangerCanvas.width = 256;
    dangerCanvas.height = 128;
    const dctx = dangerCanvas.getContext('2d');
    dctx.fillStyle = '#ffd600';
    dctx.fillRect(0, 0, 256, 128);
    dctx.strokeStyle = '#d50000';
    dctx.lineWidth = 6;
    dctx.strokeRect(6, 6, 244, 116);
    dctx.fillStyle = '#d50000';
    dctx.font = '900 28px "Outfit", sans-serif';
    dctx.textAlign = 'center';
    dctx.fillText('⚡ 440 VOLTS ⚡', 128, 48);
    dctx.font = 'bold 32px "Noto Nastaliq Urdu", sans-serif';
    dctx.fillText('خطرہ ۴۴۰ وولٹ', 128, 98);

    const dangerTex = new THREE.CanvasTexture(dangerCanvas);
    const dangerMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: dangerTex }));
    dangerMesh.position.set(0, 4.2, 0.25);
    group.add(dangerMesh);

    for (let i = 0; i < 6; i++) {
      const wireCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.2 + i * 0.4, 9.0, 0.2),
        new THREE.Vector3(Math.sin(i) * 1.5, 7.8 - i * 0.2, 0.8),
        new THREE.Vector3(-0.6 + i * 0.3, 6.5, 0.6)
      );
      const wireGeo = new THREE.TubeGeometry(wireCurve, 8, 0.04, 4, false);
      const wire = new THREE.Mesh(wireGeo, materials.curbBlack);
      group.add(wire);
    }

    return group;
  },

  // 8. Authentic Karachi Municipal Green Road Sign (شاہراہِ فیصل سائن بورڈ)
  createKarachiGreenStreetSign(
    avenueName = "SHAHRAH-E-FAISAL",
    urduName = "شاہراہِ فیصل",
    crossName = "TARIQ ROAD",
    crossUrdu = "طرق روڈ"
  ) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8), materials.curbBlack);
    pole.position.y = 1.9;
    group.add(pole);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 192;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#005a36';
    sctx.fillRect(0, 0, 512, 192);
    sctx.strokeStyle = '#ffffff';
    sctx.lineWidth = 6;
    sctx.strokeRect(6, 6, 500, 180);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 36px "Outfit", sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText(avenueName, 256, 55);
    sctx.font = 'bold 38px "Noto Nastaliq Urdu", sans-serif';
    sctx.fillText(urduName, 256, 108);
    sctx.fillStyle = '#ffd700';
    sctx.font = '600 24px "Outfit", sans-serif';
    sctx.fillText(`CROSS: ${crossName} (${crossUrdu})`, 256, 155);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), signMat);
    signMesh.position.set(0, 3.4, 0);
    group.add(signMesh);

    return group;
  },

  // 9. Bahadurabad Charminar Monument (بہادر آباد چار مینار چورنگی)
  createBahadurabadCharminar() {
    const group = new THREE.Group();
    group.name = "Bahadurabad-Charminar";

    // Roundabout Green Mound
    const moundGeo = new THREE.CylinderGeometry(11, 12, 0.9, 32);
    const mound = new THREE.Mesh(moundGeo, materials.lawnGreen);
    mound.position.y = 0.45;
    mound.receiveShadow = true;
    group.add(mound);

    // Decorative Yellow/Black curb border
    const curbGeo = new THREE.TorusGeometry(11.8, 0.35, 8, 32);
    curbGeo.rotateX(Math.PI / 2);
    const curb = new THREE.Mesh(curbGeo, materials.curbYellow);
    curb.position.y = 0.2;
    group.add(curb);

    // Stepped Marble Plinth
    const plinth1 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.6, 9.0), materials.whiteMarble);
    plinth1.position.y = 1.2;
    group.add(plinth1);

    const plinth2 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.5, 7.5), materials.charminarStone);
    plinth2.position.y = 1.7;
    group.add(plinth2);

    // Central Archways Block
    const centralBlock = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.0, 5.2), materials.charminarStone);
    centralBlock.position.y = 4.45;
    group.add(centralBlock);

    // 4 Grand Arched Openings (North, South, East, West)
    const archMat = new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.9 });
    const archH = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.8, 5.3), archMat);
    archH.position.y = 3.9;
    group.add(archH);
    const archV = new THREE.Mesh(new THREE.BoxGeometry(5.3, 3.8, 3.2), archMat);
    archV.position.y = 3.9;
    group.add(archV);

    // Upper Balcony & Cornice
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.45, 6.2), materials.charminarStone);
    cornice.position.y = 7.15;
    group.add(cornice);

    const parapet = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.7, 5.8), materials.whiteMarble);
    parapet.position.y = 7.6;
    group.add(parapet);

    // Central Dome with Golden Crescent Finial
    const centralDome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), materials.whiteMarble);
    centralDome.position.y = 7.9;
    group.add(centralDome);

    const centralFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 1.2, 8), materials.goldMetal);
    centralFinial.position.y = 9.8;
    group.add(centralFinial);

    // 4 Soaring Corner Minarets (Height ~14m)
    const minaretOffsets = [
      [-2.8, -2.8], [2.8, -2.8],
      [-2.8, 2.8], [2.8, 2.8]
    ];
    minaretOffsets.forEach(([mx, mz]) => {
      // Base Plinth
      const mBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 1.3), materials.whiteMarble);
      mBase.position.set(mx, 1.8, mz);
      group.add(mBase);

      // Fluted Shaft
      const mShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 9.5, 12), materials.charminarStone);
      mShaft.position.set(mx, 7.15, mz);
      group.add(mShaft);

      // Minaret Balcony
      const mBalcony = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.45, 12), materials.whiteMarble);
      mBalcony.position.set(mx, 12.0, mz);
      group.add(mBalcony);

      // Upper Pavilion & Lantern
      const mLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 8), materials.charminarStone);
      mLantern.position.set(mx, 12.75, mz);
      group.add(mLantern);

      // Golden Onion Dome
      const mDome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), materials.goldMetal);
      mDome.position.set(mx, 13.6, mz);
      group.add(mDome);

      // Sharp Spike Finial
      const mSpike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.8, 6), materials.goldMetal);
      mSpike.position.set(mx, 14.3, mz);
      group.add(mSpike);
    });

    // Central Fountain Basin inside plinth
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.15, metalness: 0.6 });
    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 16), basinMat);
    fountainWater.position.y = 1.95;
    group.add(fountainWater);

    // Calligraphy Plaque Canvas
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 128;
    const pctx = plaqueCanvas.getContext('2d');
    pctx.fillStyle = '#004d40';
    pctx.fillRect(0, 0, 512, 128);
    pctx.strokeStyle = '#ffd700';
    pctx.lineWidth = 6;
    pctx.strokeRect(6, 6, 500, 116);
    pctx.fillStyle = '#ffd700';
    pctx.font = 'bold 30px "Outfit", sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('BAHADURABAD CHARMINAR CHOWRANGI', 256, 48);
    pctx.fillStyle = '#ffffff';
    pctx.font = 'bold 36px "Noto Nastaliq Urdu", sans-serif';
    pctx.fillText('چار مینار چورنگی • بہادر آباد کراچی', 256, 98);
    const pTex = new THREE.CanvasTexture(plaqueCanvas);
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: pTex }));
    pMesh.position.set(0, 1.45, 4.55);
    group.add(pMesh);

    return group;
  },

  // 10. KMC Building (Karachi Municipal Corporation, M.A. Jinnah Road)
  createKMCBuilding() {
    const group = new THREE.Group();
    group.name = "KMC-Building-Heritage";

    // Main Central Red Sandstone Hall
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(16.0, 7.5, 9.0), materials.kmcRedStone);
    mainHall.position.y = 3.75;
    mainHall.castShadow = true;
    group.add(mainHall);

    // Base plinth in yellow Gizri limestone
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(17.0, 0.8, 10.0), materials.gizriYellow);
    plinth.position.y = 0.4;
    group.add(plinth);

    // Front Colonial Arcade Portico with stone arches
    const arcade = new THREE.Mesh(new THREE.BoxGeometry(12.0, 4.2, 2.2), materials.gizriYellow);
    arcade.position.set(0, 2.1, 5.2);
    group.add(arcade);

    // Arched portico door openings
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.8 });
    for (let dx = -4; dx <= 4; dx += 2.6) {
      const archDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.4), doorMat);
      archDoor.position.set(dx, 1.6, 6.2);
      group.add(archDoor);
    }

    // Windows on Main Hall
    const winMat = materials.darkGlass;
    for (let wx = -6.5; wx <= 6.5; wx += 2.2) {
      if (Math.abs(wx) < 1.5) continue;
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.2), winMat);
      win.position.set(wx, 5.6, 4.55);
      group.add(win);
    }

    // Two Side Wing Pavilions
    [-9.0, 9.0].forEach(sx => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 8.2, 8.0), materials.kmcRedStone);
      wing.position.set(sx, 4.1, 0);
      group.add(wing);

      // Wing Chhatri (Mughal domed pavilion on roof)
      const chhatriRoof = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), materials.whiteMarble);
      chhatriRoof.position.set(sx, 8.6, 0);
      group.add(chhatriRoof);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 6), materials.goldMetal);
      finial.position.set(sx, 9.7, 0);
      group.add(finial);
    });

    // Central Iconic Clock Tower (Height 24m)
    const towerShaft = new THREE.Mesh(new THREE.BoxGeometry(4.6, 14.0, 4.6), materials.kmcRedStone);
    towerShaft.position.set(0, 14.5, 0);
    group.add(towerShaft);

    // Tower Gizri Stone Trim Bands
    const band1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.6, 5.0), materials.gizriYellow);
    band1.position.set(0, 11.5, 0);
    group.add(band1);
    const band2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.6, 5.0), materials.gizriYellow);
    band2.position.set(0, 17.5, 0);
    group.add(band2);

    // 4 Clock Dials (North, South, East, West)
    const clockCanvas = document.createElement('canvas');
    clockCanvas.width = 128;
    clockCanvas.height = 128;
    const cctx = clockCanvas.getContext('2d');
    cctx.fillStyle = '#ffffff';
    cctx.fillRect(0, 0, 128, 128);
    cctx.beginPath();
    cctx.arc(64, 64, 58, 0, Math.PI * 2);
    cctx.fillStyle = '#f5f5f5';
    cctx.fill();
    cctx.lineWidth = 6;
    cctx.strokeStyle = '#000000';
    cctx.stroke();
    cctx.fillStyle = '#000000';
    cctx.font = 'bold 20px sans-serif';
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    cctx.fillText('12', 64, 22);
    cctx.fillText('3', 108, 64);
    cctx.fillText('6', 64, 108);
    cctx.fillText('9', 20, 64);
    cctx.lineWidth = 4;
    cctx.beginPath();
    cctx.moveTo(64, 64);
    cctx.lineTo(64, 34); // Hour hand at 12
    cctx.moveTo(64, 64);
    cctx.lineTo(88, 64); // Minute hand at 3
    cctx.stroke();

    const clockTex = new THREE.CanvasTexture(clockCanvas);
    const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });

    const clockFront = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), clockMat);
    clockFront.position.set(0, 19.5, 2.35);
    group.add(clockFront);
    const clockBack = clockFront.clone();
    clockBack.rotation.y = Math.PI;
    clockBack.position.set(0, 19.5, -2.35);
    group.add(clockBack);

    // Tower Crown Chhatri Dome
    const towerDome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), materials.whiteMarble);
    towerDome.position.set(0, 22.0, 0);
    group.add(towerDome);

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 2.8, 8), materials.goldMetal);
    spire.position.set(0, 24.5, 0);
    group.add(spire);

    // Grand Entrance Inscription Plaque
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 128;
    const pctx = plaqueCanvas.getContext('2d');
    pctx.fillStyle = '#3e2723';
    pctx.fillRect(0, 0, 512, 128);
    pctx.strokeStyle = '#ffd700';
    pctx.lineWidth = 6;
    pctx.strokeRect(6, 6, 500, 116);
    pctx.fillStyle = '#ffd700';
    pctx.font = 'bold 28px "Outfit", sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('KARACHI MUNICIPAL CORPORATION (KMC)', 256, 46);
    pctx.fillStyle = '#ffffff';
    pctx.font = 'bold 34px "Noto Nastaliq Urdu", sans-serif';
    pctx.fillText('بلدیہ عظمیٰ کراچی • ایم اے جناح روڈ', 256, 96);
    const pTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.4), new THREE.MeshBasicMaterial({ map: pTex }));
    plaque.position.set(0, 4.6, 6.35);
    group.add(plaque);

    return group;
  },

  // 11. Burns Road / Saddar Heritage Colonial Tenement with Street Shop
  createBurnsRoadColonialBuilding(
    shopName = "DILPASAND SWEETS & BAKERS",
    shopUrdu = "دلپسند مٹھائی و نمکو • برنز روڈ",
    bannerColor = '#b71c1c'
  ) {
    const group = new THREE.Group();
    group.name = `Colonial-${shopName.replace(/\s+/g, '-')}`;

    // 3-Story Heritage Building Body (Gizri Yellow Stone)
    const bHeight = 11.5;
    const body = new THREE.Mesh(new THREE.BoxGeometry(10.0, bHeight, 7.5), materials.gizriYellow);
    body.position.y = bHeight / 2;
    body.castShadow = true;
    group.add(body);

    // Decorative Cornice and Rooftop Balustrade
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.45, 8.0), materials.sandstone);
    cornice.position.y = bHeight;
    group.add(cornice);

    const parapet = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.8, 7.7), materials.gizriYellow);
    parapet.position.y = bHeight + 0.4;
    group.add(parapet);

    // Upper Floors (2nd & 3rd Floor) Ornate Green Wooden Shuttered Windows
    for (let floorY of [4.8, 8.2]) {
      for (let wx = -3.4; wx <= 3.4; wx += 2.2) {
        // Window Frame
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.15), materials.colonialShutterGreen);
        win.position.set(wx, floorY, 3.8);
        group.add(win);

        // Arched Window Header
        const archTop = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 12, 1, false, 0, Math.PI), materials.sandstone);
        archTop.rotation.z = Math.PI / 2;
        archTop.rotation.y = Math.PI / 2;
        archTop.position.set(wx, floorY + 0.9, 3.8);
        group.add(archTop);
      }

      // Cantilevered Wrought Iron Balcony
      const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 1.2), materials.sandstone);
      balconyFloor.position.set(0, floorY - 0.9, 4.3);
      group.add(balconyFloor);

      const ironRailing = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.85, 0.08), materials.balconyIronBlack);
      ironRailing.position.set(0, floorY - 0.45, 4.85);
      group.add(ironRailing);

      // Hanging Laundry / Clothesline (Quintessential Saddar atmosphere!)
      const laundryGeo = new THREE.BoxGeometry(1.2, 0.65, 0.04);
      const lMat1 = new THREE.MeshStandardMaterial({ color: 0x03a9f4, roughness: 0.7 });
      const l1 = new THREE.Mesh(laundryGeo, lMat1);
      l1.position.set(-2.0, floorY - 0.35, 4.75);
      group.add(l1);

      const lMat2 = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.7 });
      const l2 = new THREE.Mesh(laundryGeo, lMat2);
      l2.position.set(1.5, floorY - 0.35, 4.75);
      group.add(l2);
    }

    // Ground Floor: Vibrant Backlit Shop Front
    const shopArch = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.2, 0.6), materials.sandstone);
    shopArch.position.set(0, 1.6, 3.6);
    group.add(shopArch);

    // Glowing Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 140;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = bannerColor;
    sctx.fillRect(0, 0, 512, 140);
    sctx.strokeStyle = '#ffd700';
    sctx.lineWidth = 6;
    sctx.strokeRect(6, 6, 500, 128);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 30px "Outfit", sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText(shopName, 256, 48);
    sctx.fillStyle = '#ffd700';
    sctx.font = 'bold 34px "Noto Nastaliq Urdu", sans-serif';
    sctx.fillText(shopUrdu, 256, 102);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 1.8), signMat);
    signMesh.position.set(0, 2.8, 3.95);
    group.add(signMesh);

    // Shop Glass Windows & Open Door
    const shopGlass = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.8, 0.2), materials.darkGlass);
    shopGlass.position.set(0, 0.9, 3.8);
    group.add(shopGlass);

    return group;
  },

  // 12. Tariq Road Fashion & Shopping Plaza
  createTariqRoadFashionPlaza(
    plazaName = "J. JUNAID JAMSHED",
    plazaUrdu = "جے ڈاٹ کرتہ و برانڈ • طارق روڈ"
  ) {
    const group = new THREE.Group();
    group.name = "Tariq-Road-Fashion-Plaza";

    const pHeight = 15.0;
    const body = new THREE.Mesh(new THREE.BoxGeometry(11.0, pHeight, 8.5), materials.towerConcrete);
    body.position.y = pHeight / 2;
    group.add(body);

    // Glazed Tinted Curtain Wall Panels
    const glass = new THREE.Mesh(new THREE.BoxGeometry(9.6, 9.5, 0.3), materials.darkGlass);
    glass.position.set(0, 8.5, 4.35);
    group.add(glass);

    // Modern Geometric Aluminum Fins
    for (let fx = -4.5; fx <= 4.5; fx += 1.8) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 9.5, 0.5), materials.chrome);
      fin.position.set(fx, 8.5, 4.55);
      group.add(fin);
    }

    // Giant Illuminated Fashion Billboard
    const bbCanvas = document.createElement('canvas');
    bbCanvas.width = 512;
    bbCanvas.height = 160;
    const bbCtx = bbCanvas.getContext('2d');
    bbCtx.fillStyle = '#0a192f'; // Deep midnight blue
    bbCtx.fillRect(0, 0, 512, 160);
    bbCtx.strokeStyle = '#00e5ff';
    bbCtx.lineWidth = 6;
    bbCtx.strokeRect(6, 6, 500, 148);
    bbCtx.fillStyle = '#00e5ff';
    bbCtx.font = 'bold 32px "Outfit", sans-serif';
    bbCtx.textAlign = 'center';
    bbCtx.fillText(plazaName, 256, 55);
    bbCtx.fillStyle = '#ffd700';
    bbCtx.font = 'bold 36px "Noto Nastaliq Urdu", sans-serif';
    bbCtx.fillText(plazaUrdu, 256, 115);

    const bbTex = new THREE.CanvasTexture(bbCanvas);
    const bbMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.5), new THREE.MeshBasicMaterial({ map: bbTex }));
    bbMesh.position.set(0, 14.2, 4.4);
    group.add(bbMesh);

    // Ground Floor Entrance Showroom
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 0.4), materials.chrome);
    entrance.position.set(0, 1.6, 4.3);
    group.add(entrance);

    return group;
  },

  // 13. MCB Tower (29-Story Skyscraper - I.I. Chundrigar Road)
  createMCBTower() {
    const group = new THREE.Group();
    group.name = "MCB-Tower-Chundrigar";

    // 1st Tier Podium (height 14m)
    const podium = new THREE.Mesh(new THREE.BoxGeometry(11.0, 14.0, 10.0), materials.towerConcrete);
    podium.position.y = 7.0;
    group.add(podium);

    // Main Tower Glass Shaft (height 36m)
    const mainTower = new THREE.Mesh(new THREE.BoxGeometry(9.0, 36.0, 8.0), materials.mcbGlass);
    mainTower.position.y = 20.0;
    group.add(mainTower);

    // White Vertical Structural Fins
    [-4.6, 4.6].forEach(fx => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.8, 40.0, 8.4), materials.whiteMarble);
      col.position.set(fx, 20.0, 0);
      group.add(col);
    });

    // Crown Floor Setback & Helipad
    const crown = new THREE.Mesh(new THREE.BoxGeometry(7.0, 4.5, 6.5), materials.towerConcrete);
    crown.position.y = 40.25;
    group.add(crown);

    // Soaring Communication Spire (Karachi Skyline landmark)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.35, 10.0, 8), materials.chrome);
    spire.position.y = 47.5;
    group.add(spire);

    // Flashing Red Beacon
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    beacon.position.y = 52.5;
    group.add(beacon);

    // Illuminated MCB Signboard
    const mcbCanvas = document.createElement('canvas');
    mcbCanvas.width = 256;
    mcbCanvas.height = 128;
    const mctx = mcbCanvas.getContext('2d');
    mctx.fillStyle = '#ff6f00'; // MCB Orange
    mctx.fillRect(0, 0, 256, 128);
    mctx.fillStyle = '#ffffff';
    mctx.font = '900 48px "Outfit", sans-serif';
    mctx.textAlign = 'center';
    mctx.fillText('MCB', 128, 62);
    mctx.font = 'bold 24px "Outfit", sans-serif';
    mctx.fillText('TOWER', 128, 102);

    const mcbTex = new THREE.CanvasTexture(mcbCanvas);
    const mcbSign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshBasicMaterial({ map: mcbTex }));
    mcbSign.position.set(0, 40.2, 3.3);
    group.add(mcbSign);

    return group;
  },

  // 14. Sakhi Hasan Water Tanker Hydrant Station (سخی حسن واٹر ہائیڈرینٹ)
  createSakhiHasanWaterHydrant() {
    const group = new THREE.Group();
    group.name = "Sakhi-Hasan-Water-Hydrant";

    // Overhead Steel Pipe Filling Gantry
    const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.6, 0.8), materials.towerConcrete);
    gantryBeam.position.set(0, 6.2, 0);
    group.add(gantryBeam);

    // Twin Gantry Columns
    [-6.5, 6.5].forEach(cx => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.2, 0.8), materials.towerConcrete);
      col.position.set(cx, 3.1, 0);
      group.add(col);
    });

    // 2 Giant Overhead Filling Water Pipes (Downspouts for tankers)
    [-2.5, 2.5].forEach(px => {
      const pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.5, 8), materials.waterTankBlue);
      pipeH.rotation.z = Math.PI / 2;
      pipeH.position.set(px, 5.8, 0.8);
      group.add(pipeH);

      const pipeV = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.6, 8), materials.waterTankBlue);
      pipeV.position.set(px, 4.3, 1.8);
      group.add(pipeV);

      // Water splash stream
      const splashMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.75 });
      const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.8, 6), splashMat);
      stream.position.set(px, 1.4, 1.8);
      group.add(stream);
    });

    // Pump Machinery Control Room
    const pumpHouse = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 4.0), materials.sandstone);
    pumpHouse.position.set(-8.5, 1.6, 0);
    group.add(pumpHouse);

    // Official Hydrant Warning Board
    const hCanvas = document.createElement('canvas');
    hCanvas.width = 512;
    hCanvas.height = 140;
    const hctx = hCanvas.getContext('2d');
    hctx.fillStyle = '#01579b'; // Deep water blue
    hctx.fillRect(0, 0, 512, 140);
    hctx.strokeStyle = '#ffd700';
    hctx.lineWidth = 6;
    hctx.strokeRect(6, 6, 500, 128);
    hctx.fillStyle = '#ffd700';
    hctx.font = 'bold 30px "Outfit", sans-serif';
    hctx.textAlign = 'center';
    hctx.fillText('KMC WATER BOARD • GOVT OF SINDH', 256, 44);
    hctx.fillStyle = '#ffffff';
    hctx.font = 'bold 34px "Noto Nastaliq Urdu", sans-serif';
    hctx.fillText('سخی حسن سرکاری واٹر ہائیڈرینٹ', 256, 96);

    const hTex = new THREE.CanvasTexture(hCanvas);
    const hSign = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.2), new THREE.MeshBasicMaterial({ map: hTex }));
    hSign.position.set(0, 7.5, 0.45);
    group.add(hSign);

    return group;
  },

  // 15. Clifton Sea View Victoria Horse Carriage / Buggy (گھوڑا گاڑی / بگی)
  createCliftonVictoriaBuggy() {
    const group = new THREE.Group();
    group.name = "Clifton-Victoria-Buggy";

    // Carriage Body
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.4, metalness: 0.2 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.6), carriageMat);
    cab.position.set(0, 1.3, 0);
    group.add(cab);

    // Crimson Velvet Cushions
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.2), velvetMat);
    seat.position.set(0, 1.1, 0);
    group.add(seat);

    // 4 Large Spoked Carriage Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-1.1, -0.9], [1.1, -0.9], [-1.1, 0.9], [1.1, 0.9]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, materials.goldMetal);
      wheel.position.set(wx, 0.65, wz);
      group.add(wheel);
    });

    // Canopy with Twinkling LED Fairy Light Strips
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.1, 16, 1, false, 0, Math.PI), materials.goldMetal);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 2.4, 0);
    group.add(canopy);

    // Glowing Fairy Light Spheres
    const fairyColors = [0xffeb3b, 0xe91e63, 0x00e5ff, 0x76ff03];
    for (let i = 0; i < 8; i++) {
      const fairyMat = new THREE.MeshBasicMaterial({ color: fairyColors[i % 4] });
      const fairyLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), fairyMat);
      const angle = (i / 8) * Math.PI;
      fairyLight.position.set(Math.cos(angle) * 1.35, 2.4 + Math.sin(angle) * 0.5, 0.8);
      group.add(fairyLight);
    }

    // Ceremonial Horse in Front
    const horseGroup = new THREE.Group();
    horseGroup.position.set(0, 0, -2.6);

    const horseMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    const horseBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 1.6), horseMat);
    horseBody.position.y = 1.3;
    horseGroup.add(horseBody);

    const horseNeck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.6), horseMat);
    horseNeck.position.set(0, 1.8, -0.7);
    horseNeck.rotation.x = -0.35;
    horseGroup.add(horseNeck);

    const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.7), horseMat);
    horseHead.position.set(0, 2.2, -1.05);
    horseGroup.add(horseHead);

    // Feather Plume on Horse Head
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 8), materials.rilliPink);
    plume.position.set(0, 2.7, -1.0);
    horseGroup.add(plume);

    // 4 Horse Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.9, 8);
    [[-0.3, -0.6], [0.3, -0.6], [-0.3, 0.6], [0.3, 0.6]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, horseMat);
      leg.position.set(lx, 0.45, lz);
      horseGroup.add(leg);
    });

    group.add(horseGroup);

    const friendlyDecal = this.createFriendlyDecal('transport', '🎠 SEA VIEW VICTORIA BUGGY • کلفٹن بگی');
    friendlyDecal.position.y = 3.2;
    group.add(friendlyDecal);

    return group;
  },

  // 16. Classic Karachi Paan Khokha & Betel Nut Kiosk (پان کیبن)
  createRoadsidePaanKhokha() {
    const group = new THREE.Group();
    group.name = "Paan-Khokha-Kiosk";

    // Weathered Wooden Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 1.8), materials.wood);
    cabin.position.y = 1.2;
    group.add(cabin);

    // Corrugated Tin Roof with Overhang
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.2), materials.waterTankSilver);
    roof.position.set(0, 2.45, 0);
    roof.rotation.x = 0.08;
    group.add(roof);

    // Front Serving Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 0.6), materials.wood);
    counter.position.set(0, 0.8, 1.0);
    group.add(counter);

    // Display Jars of Sweet Supari & Betel Leaves
    const jarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.8 });
    for (let jx = -0.7; jx <= 0.7; jx += 0.45) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), jarMat);
      jar.position.set(jx, 1.4, 0.95);
      group.add(jar);
    }

    // Urdu Hand-Painted Khokha Sign
    const kCanvas = document.createElement('canvas');
    kCanvas.width = 256;
    kCanvas.height = 96;
    const kctx = kCanvas.getContext('2d');
    kctx.fillStyle = '#1b5e20'; // Paan Green
    kctx.fillRect(0, 0, 256, 96);
    kctx.strokeStyle = '#ffd700';
    kctx.lineWidth = 4;
    kctx.strokeRect(4, 4, 248, 88);
    kctx.fillStyle = '#ffffff';
    kctx.font = 'bold 22px "Noto Nastaliq Urdu", sans-serif';
    kctx.textAlign = 'center';
    kctx.fillText('عالمگیر پان شاپ و سگریٹ', 128, 52);
    kctx.fillStyle = '#ffd700';
    kctx.font = 'bold 15px "Outfit", sans-serif';
    kctx.fillText('SPECIAL MEETHA PAAN', 128, 80);

    const kTex = new THREE.CanvasTexture(kCanvas);
    const kSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.8), new THREE.MeshBasicMaterial({ map: kTex }));
    kSign.position.set(0, 2.05, 0.95);
    group.add(kSign);

    return group;
  },

  // 45. Arcade Power-Up Crates: Magnet, Nitro Speed, Hero Frenzy & Bonus Time!
  createPowerUpCrate(type = 'mystery') {
    const group = new THREE.Group();
    group.name = `PowerUp-${type}`;
    group.isPowerUp = true;
    group.powerUpType = type;

    const colors = {
      nitro: { main: 0xff3d00, glow: '#ff3d00', icon: '🚀', label: 'CNG NITRO' },
      turbo: { main: 0xff9100, glow: '#ff9100', icon: '⚡', label: 'TURBO' },
      shield: { main: 0x00e5ff, glow: '#00e5ff', icon: '🛡️', label: 'TANKER SHIELD' },
      horn: { main: 0xffd600, glow: '#ffd600', icon: '📢', label: 'KING HORN' },
      biryani: { main: 0x76ff03, glow: '#76ff03', icon: '🍲', label: 'BIRYANI FEAST' },
      jump: { main: 0xd500f9, glow: '#d500f9', icon: '🦘', label: 'SUPER JUMP' },
      mystery: { main: 0xffea00, glow: '#ffea00', icon: '❓', label: 'MYSTERY CRATE' },
      magnet: { main: 0x00e5ff, glow: '#00e5ff', icon: '🧲', label: 'MAGNET' },
      frenzy: { main: 0xff007f, glow: '#ff007f', icon: '🌟', label: 'FRENZY' },
      timer: { main: 0x00e676, glow: '#00e676', icon: '⏱️', label: '+TIME' }
    };
    const cfg = colors[type] || colors.mystery;

    // Glowing Pakistani truck-art style cube crate
    const boxGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const boxMat = new THREE.MeshStandardMaterial({
      color: cfg.main,
      emissive: cfg.main,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.75
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.65;
    box.castShadow = true;
    group.add(box);

    // Neon glowing wireframe edges
    const wireGeo = new THREE.EdgesGeometry(boxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.y = 0.65;
    group.add(wire);

    // Floating 3D Icon Sprite Badge
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = cfg.glow;
    ctx.stroke();
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.icon, 64, 68);

    const iconTex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex, transparent: true }));
    sprite.scale.set(1.5, 1.5, 1);
    sprite.position.y = 1.65;
    group.add(sprite);

    // Pulsing ground target ring
    const ringGeo = new THREE.RingGeometry(0.85, 1.3, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cfg.main,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.04;
    group.add(ring);

    group.userData = {
      box,
      wire,
      sprite,
      ring,
      baseY: 0.65,
      cfg,
      type
    };

    return group;
  },

  // 46. Authentic Karachi Open Gutter / Missing Manhole Hazard (کھلا گٹر)
  createOpenGutterHazard(radius = 1.6) {
    const group = new THREE.Group();
    group.name = 'Open-Gutter-Hazard';
    group.isGutterHazard = true;
    group.hazardRadius = radius;

    // Outer cracked concrete rim around hole
    const rimGeo = new THREE.TorusGeometry(radius * 0.95, 0.22, 10, 24);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x37474f,
      roughness: 0.95,
      metalness: 0.1
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.08;
    group.add(rim);

    // Deep dark void cylinder (underground sewer opening)
    const voidGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.85, 1.2, 24, 1, true);
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x050806,
      side: THREE.BackSide
    });
    const sewerVoid = new THREE.Mesh(voidGeo, voidMat);
    sewerVoid.position.y = -0.55;
    group.add(sewerVoid);

    // Murky toxic green/brown bubbling sewage water surface
    const sewageGeo = new THREE.CircleGeometry(radius * 0.88, 24);
    sewageGeo.rotateX(-Math.PI / 2);
    const sewageMat = new THREE.MeshStandardMaterial({
      color: 0x142217,
      roughness: 0.25,
      metalness: 0.4
    });
    const sewage = new THREE.Mesh(sewageGeo, sewageMat);
    sewage.position.y = -0.22;
    group.add(sewage);

    // Iconic Pakistani Makeshift Warning: Broken wooden branch with red cloth
    const stickGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.6, 6);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(0.3, 0.65, 0.2);
    stick.rotation.z = 0.15;
    stick.rotation.x = -0.1;
    group.add(stick);

    // Red caution rag fluttering on branch
    const ragGeo = new THREE.BoxGeometry(0.32, 0.42, 0.04);
    const ragMat = new THREE.MeshBasicMaterial({ color: 0xd50000 });
    const rag = new THREE.Mesh(ragGeo, ragMat);
    rag.position.set(0.42, 1.35, 0.22);
    rag.rotation.z = -0.2;
    group.add(rag);

    // Floating Caution Billboard Badge
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(213, 0, 0, 0.85)';
    ctx.roundRect ? ctx.roundRect(4, 4, 372, 88, 16) : ctx.rect(4, 4, 372, 88);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ OPEN GUTTER / کھلا گٹر', 190, 42);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('JUMP [SPACE] OR SWERVE!', 190, 74);

    const bTex = new THREE.CanvasTexture(canvas);
    const billboard = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    billboard.scale.set(3.2, 0.85, 1);
    billboard.position.y = 2.2;
    group.add(billboard);

    // Pulsing danger ground ring
    const alertGeo = new THREE.RingGeometry(radius * 1.05, radius * 1.3, 24);
    alertGeo.rotateX(-Math.PI / 2);
    const alertMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const alertRing = new THREE.Mesh(alertGeo, alertMat);
    alertRing.position.y = 0.025;
    group.add(alertRing);

    group.userData = {
      radius,
      sewage,
      rag,
      alertRing,
      billboard
    };

    return group;
  },

  // 47. PECHS Tariq Road Finish Gate Archway (منزل مقصود)
  createPECHSFinishGate() {
    const group = new THREE.Group();
    group.name = 'PECHS-Finish-Gate';
    group.isFinishGate = true;

    // Twin giant arch pillars spanning 18m across boulevard
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      roughness: 0.3,
      metalness: 0.6
    });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 1.2), pillarMat);
    p1.position.set(-8.5, 3.75, 0);
    p1.castShadow = true;
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.5, 1.2), pillarMat);
    p2.position.set(8.5, 3.75, 0);
    p2.castShadow = true;
    group.add(p2);

    // Overhead crossbar bridge
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(19.5, 1.8, 1.4), new THREE.MeshStandardMaterial({
      color: 0x004d40,
      roughness: 0.4
    }));
    crossbar.position.set(0, 7.2, 0);
    group.add(crossbar);

    // Glowing Urdu & English Neon Welcome Banner
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00251a';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 WELCOME TO PECHS TARIQ ROAD 🏁', 512, 85);

    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('پی ای سی ایچ ایس - طارق روڈ (منزل مقصود)', 512, 175);

    ctx.fillStyle = '#ffd700';
    ctx.font = '32px sans-serif';
    ctx.fillText('★ CIVIC MISSION DESTINATION FINISH LINE ★', 512, 225);

    const bannerTex = new THREE.CanvasTexture(canvas);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(18.5, 2.8),
      new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide })
    );
    banner.position.set(0, 7.2, 0.72);
    group.add(banner);

    // Checkpoint laser threshold on road
    const lineGeo = new THREE.PlaneGeometry(18.0, 2.5);
    lineGeo.rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.85
    });
    const laser = new THREE.Mesh(lineGeo, lineMat);
    laser.position.set(0, 0.05, 0);
    group.add(laser);

    // Flashing overhead celebratory spotlights
    for (let i = -7; i <= 7; i += 3.5) {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffeb3b })
      );
      lamp.position.set(i, 8.2, 0.8);
      group.add(lamp);
    }

    return group;
  },

  // 13. Low-hanging street wires (overhead obstacle - slide underneath)
  createHangingWireHazard(width = 6.8) {
    const group = new THREE.Group();
    group.name = "Hanging_Street_Wires";
    group.userData = { isOverheadObstacle: true, obstacleType: 'wire', requiredAction: 'slide' };

    // Street-side utility poles keep the road itself clear of supports.
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, 6.0, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-width / 2, 3.0, 0);
    poleL.castShadow = true;
    group.add(poleL);

    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(width / 2, 3.0, 0);
    poleR.castShadow = true;
    group.add(poleR);

    // Cross arms
    const crossGeo = new THREE.BoxGeometry(width + 0.6, 0.25, 0.25);
    const crossBar = new THREE.Mesh(crossGeo, poleMat);
    crossBar.position.set(0, 5.5, 0);
    group.add(crossBar);

    // Realistic sag between street-side poles, with a second loose service cable.
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.72, metalness: 0.3 });
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width / 2, 2.45, 0),
      new THREE.Vector3(-width / 4, 2.04, 0),
      new THREE.Vector3(0, 1.82, 0),
      new THREE.Vector3(width / 4, 2.04, 0),
      new THREE.Vector3(width / 2, 2.45, 0)
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 24, 0.045, 6, false), wireMat));

    const looseCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width / 2, 2.6, 0.22),
      new THREE.Vector3(-width / 3, 1.95, 0.22),
      new THREE.Vector3(-width / 6, 2.2, 0.22),
      new THREE.Vector3(0, 1.98, 0.22),
      new THREE.Vector3(width / 3, 2.18, 0.22),
      new THREE.Vector3(width / 2, 2.55, 0.22)
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(looseCableCurve, 28, 0.032, 6, false), wireMat));

    const cautionPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.7, 1.35),
      new THREE.MeshStandardMaterial({ color: 0xb33a32, roughness: 0.82 })
    );
    cautionPanel.position.set(-width / 2 + 0.5, 2.55, -0.2);
    group.add(cautionPanel);

    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffc247 });
    [-1.1, 1.2].forEach(x => {
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), sparkMat);
      spark.position.set(x, 1.9, 0.03);
      group.add(spark);
    });

    return group;
  },

  // 14. Unannounced Road Digging & Construction Barrier (Must Jump Over / Switch Lane)
  createRoadDiggingObstacle(width = 3.0) {
    const group = new THREE.Group();
    group.name = "RoadDigging_Obstacle";
    group.userData = { isGroundObstacle: true, obstacleType: 'digging', requiredAction: 'jump' };

    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.84, 0.08, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x161a1e, roughness: 0.98 })
    );
    asphalt.position.y = 0.03;
    group.add(asphalt);

    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x68645c, roughness: 0.98 });
    [
      [-0.78, 0.22, -0.68, 0.45],
      [-0.28, 0.26, 0.24, 0.52],
      [0.42, 0.2, -0.42, 0.38],
      [0.84, 0.25, 0.58, 0.46],
      [0.05, 0.16, 0.72, 0.32]
    ].forEach(([x, y, z, scale]) => {
      const rubble = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), rubbleMat);
      rubble.position.set(x, y, z);
      rubble.rotation.set(0.3, x, 0.2);
      rubble.castShadow = true;
      group.add(rubble);
    });

    const boardMat = new THREE.MeshStandardMaterial({ color: 0xd3c8b3, roughness: 0.86 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, 0.58, 0.1), boardMat);
    board.position.set(0, 1.08, -1.02);
    board.castShadow = true;
    group.add(board);

    const stripeColors = [0xc74d35, 0xe6ddc8, 0xc74d35, 0xe6ddc8, 0xc74d35];
    stripeColors.forEach((color, index) => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(width / stripeColors.length - 0.04, 0.42, 0.025),
        new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
      );
      stripe.position.set(
        -width / 2 + (index + 0.5) * (width / stripeColors.length),
        1.08,
        -0.96
      );
      group.add(stripe);
    });

    const supportMat = new THREE.MeshStandardMaterial({ color: 0x554a3e, roughness: 0.92 });
    [-width * 0.38, width * 0.38].forEach(x => {
      const support = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.12, 0.1), supportMat);
      support.position.set(x, 0.58, -0.95);
      support.rotation.z = x < 0 ? -0.12 : 0.12;
      group.add(support);
    });

    return group;
  },

  // 15. Stalled Qingqi Rickshaw in Lane (Full Lane Blocker - Must Switch Lane)
  createStalledRickshawObstacle() {
    const group = new THREE.Group();
    group.name = "Stalled_Rickshaw_Obstacle";
    group.userData = { isLaneBlocker: true, obstacleType: 'rickshaw', requiredAction: 'dodge' };

    // Detailed 6-seater Karachi Qingqi rickshaw
    const cabinGeo = new THREE.BoxGeometry(2.1, 1.8, 2.6);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.35 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.1, 0);
    cabin.castShadow = true;
    group.add(cabin);

    // Yellow hood top
    const hoodGeo = new THREE.BoxGeometry(2.15, 0.2, 2.65);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 2.05, 0);
    group.add(hood);

    // Hazard blinking rear tail lamps
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.08), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
    tailL.position.set(-0.85, 0.7, 1.32);
    group.add(tailL);

    const tailR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.08), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
    tailR.position.set(0.85, 0.7, 1.32);
    group.add(tailR);

    // Stalled driver model standing beside or behind rickshaw waving hands
    const driverGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.4, 8);
    const driverMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const driver = new THREE.Mesh(driverGeo, driverMat);
    driver.position.set(1.25, 0.7, 0.4);
    driver.castShadow = true;
    group.add(driver);

    // Driver head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd2a679 }));
    head.position.set(1.25, 1.55, 0.4);
    group.add(head);

    return group;
  },

  // 16. Golden Rupee Coin Collectible (Rs 50 Coin with Pakistani Star & Crescent)
  createRupeeCoin(value = 50) {
    const group = new THREE.Group();
    group.name = "RupeeCoin";
    group.userData = { isCoin: true, value, radius: 0.65 };

    // Shiny gold coin cylinder
    const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24);
    coinGeo.rotateX(Math.PI / 2);
    coinGeo.rotateZ(Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#004d40';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rs 50', 64, 75);

    const coinTex = new THREE.CanvasTexture(canvas);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      map: coinTex,
      metalness: 0.85,
      roughness: 0.2
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.position.y = 0.85;
    coinMesh.castShadow = true;
    group.add(coinMesh);

    // Glowing halo ring around coin
    const glowGeo = new THREE.RingGeometry(0.52, 0.62, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.85;
    group.add(glow);

    return group;
  },

  // 17. Overflowing Sewage Spill Water Hazard (Causes Slippery Skidding & Speed Loss)
  createSewageSpillHazard(width = 3.2) {
    const group = new THREE.Group();
    group.name = "Sewage_Spill_Hazard";
    group.userData = { isPuddle: true, obstacleType: 'sewage_puddle', requiredAction: 'jump' };

    const puddleGeo = new THREE.PlaneGeometry(width, 3.8, 8, 8);
    puddleGeo.rotateX(-Math.PI / 2);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x51483b,
      roughness: 0.42,
      metalness: 0.08,
      transparent: true,
      opacity: 0.72
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.position.y = 0.035;
    puddle.receiveShadow = true;
    group.add(puddle);

    // Caution sign at edge
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.75, 8),
      new THREE.MeshStandardMaterial({ color: 0xc65337, roughness: 0.78 })
    );
    cone.position.set(width * 0.42, 0.375, -1.2);
    group.add(cone);

    return group;
  },

  // 18. Karachi 70cc Snatcher Motorbike (Two Bandits on a CD-70 Bike - Dodge or blast with Horn!)
  createSnatcherMotorbike() {
    const group = new THREE.Group();
    group.name = "Snatcher_Motorbike";
    group.userData = { isVehicleObstacle: true, obstacleType: 'snatcher', requiredAction: 'dodge_or_horn' };

    // Motorcycle Chassis / Frame
    const frameGeo = new THREE.BoxGeometry(0.35, 0.45, 1.8);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.55;
    group.add(frame);

    // Fuel Tank - Classic Red CD-70 Tank with gold stripes
    const tankGeo = new THREE.BoxGeometry(0.42, 0.35, 0.65);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.3, metalness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 0.82, 0.15);
    tank.castShadow = true;
    group.add(tank);

    // Wheels (Front & Rear)
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

    const wheelFront = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFront.position.set(0, 0.38, -0.9);
    wheelFront.castShadow = true;
    group.add(wheelFront);

    const wheelRear = new THREE.Mesh(wheelGeo, wheelMat);
    wheelRear.position.set(0, 0.38, 0.85);
    wheelRear.castShadow = true;
    group.add(wheelRear);

    // Handlebars & Headlight
    const handleGeo = new THREE.BoxGeometry(0.85, 0.06, 0.06);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.1 });
    const handle = new THREE.Mesh(handleGeo, chromeMat);
    handle.position.set(0, 1.05, -0.6);
    group.add(handle);

    const lightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 12);
    lightGeo.rotateX(Math.PI / 2);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff59d });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 0.92, -0.95);
    group.add(light);

    // Red Tail Light
    const tailGeo = new THREE.BoxGeometry(0.16, 0.1, 0.05);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.72, 1.15);
    group.add(tail);

    // Silencer / Exhaust pipe
    const silencerGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
    silencerGeo.rotateX(Math.PI / 2);
    const silencer = new THREE.Mesh(silencerGeo, chromeMat);
    silencer.position.set(0.24, 0.3, 0.25);
    group.add(silencer);

    // Driver figure (Black shalwar kameez)
    const driverBodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.85, 8);
    const driverMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.7 });
    const driver = new THREE.Mesh(driverBodyGeo, driverMat);
    driver.position.set(0, 1.15, -0.15);
    driver.rotation.x = 0.25;
    group.add(driver);

    const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8d5524 }));
    driverHead.position.set(0, 1.68, -0.25);
    group.add(driverHead);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x000000 }));
    cap.position.set(0, 1.78, -0.25);
    group.add(cap);

    // Pillion Snatcher Figure (Navy shalwar kameez, looking sideways, holding stolen phone)
    const pillion = new THREE.Mesh(driverBodyGeo, new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.7 }));
    pillion.position.set(0, 1.18, 0.45);
    pillion.rotation.x = -0.1;
    group.add(pillion);

    const pillionHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8d5524 }));
    pillionHead.position.set(0, 1.7, 0.45);
    group.add(pillionHead);

    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.03), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    phone.position.set(0.28, 1.35, 0.4);
    group.add(phone);

    // Floating Urdu Warning Overhead: "چھین کے بھاگ! [SNATCHERS]"
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 70cc SNATCHERS ⚡', 128, 28);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('بلو ہورن مارو [HORN H]', 128, 52);

    const tagTex = new THREE.CanvasTexture(canvas);
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.5),
      new THREE.MeshBasicMaterial({ map: tagTex, side: THREE.DoubleSide })
    );
    tag.position.set(0, 2.25, 0);
    group.add(tag);

    return group;
  },

  createLyariStreetFootball() {
    const group = new THREE.Group();
    group.name = 'Lyari-Street-Football';
    group.userData = { isLaneBlocker: true, obstacleType: 'lyari_football', requiredAction: 'dodge' };

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.64, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xe7dfc9, roughness: 0.76 })
    );
    ball.position.y = 0.68;
    ball.castShadow = true;
    group.add(ball);

    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.82 });
    [
      [-0.28, 0.91, -0.48],
      [0.34, 0.82, -0.48],
      [0.02, 0.44, -0.55],
      [-0.43, 0.6, -0.2],
      [0.42, 0.57, -0.22]
    ].forEach(([x, y, z]) => {
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), panelMaterial);
      patch.position.set(x, y, z);
      patch.scale.set(1, 1, 0.25);
      group.add(patch);
    });
    return group;
  },

  createSaddarMarketHandcart() {
    const group = new THREE.Group();
    group.name = 'Saddar-Market-Handcart';
    group.userData = { isLaneBlocker: true, obstacleType: 'market_cart', requiredAction: 'dodge' };

    const wood = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.88 });
    const crate = new THREE.MeshStandardMaterial({ color: 0x9c6b3f, roughness: 0.9 });
    const cartBed = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 2.0), wood);
    cartBed.position.y = 0.74;
    cartBed.castShadow = true;
    group.add(cartBed);

    [-0.98, 0.98].forEach(x => {
      const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.09, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x292929, roughness: 0.9 })
      );
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(x, 0.4, 0.3);
      wheel.castShadow = true;
      group.add(wheel);
    });

    [-0.5, 0.5].forEach(x => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 8), wood);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(x, 0.82, 1.65);
      group.add(handle);
    });

    [
      [-0.52, 1.22, -0.35],
      [0.52, 1.22, -0.35],
      [0, 1.66, -0.35]
    ].forEach(([x, y, z]) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.82, 0.84), crate);
      box.position.set(x, y, z);
      box.castShadow = true;
      group.add(box);
    });

    const produceMaterials = [0xb33b2e, 0xe4ad22, 0x4f8d43, 0xe87832];
    produceMaterials.forEach((color, index) => {
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 7),
        new THREE.MeshStandardMaterial({ color, roughness: 0.74 })
      );
      fruit.position.set(-0.54 + (index % 3) * 0.5, 1.82, -0.45 + Math.floor(index / 3) * 0.38);
      group.add(fruit);
    });
    return group;
  },

  createSaddarHeritageScaffold(width = 7.5) {
    const group = new THREE.Group();
    group.name = 'Saddar-Heritage-Restoration-Scaffold';
    group.userData = { isOverheadObstacle: true, obstacleType: 'heritage_scaffold', requiredAction: 'slide' };

    const steel = new THREE.MeshStandardMaterial({ color: 0x53616a, metalness: 0.62, roughness: 0.58 });
    const warning = new THREE.MeshStandardMaterial({ color: 0xc65337, roughness: 0.8 });
    [-width / 2, width / 2].forEach(x => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 2.7, 8), steel);
      post.position.set(x, 1.35, 0);
      post.castShadow = true;
      group.add(post);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), warning);
      foot.position.set(x, 0.08, 0);
      group.add(foot);
    });

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.16, 0.16), steel);
    topRail.position.y = 2.65;
    group.add(topRail);

    const lowRail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.38, 0.14), warning);
    lowRail.position.y = 1.62;
    group.add(lowRail);

    [-width / 3, width / 3].forEach(x => {
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.15, 6), steel);
      brace.position.set(x, 1.3, 0);
      brace.rotation.z = x < 0 ? -0.55 : 0.55;
      group.add(brace);
    });

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.48, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xe5d5b3, roughness: 0.86 })
    );
    sign.position.set(0, 2.22, -0.1);
    group.add(sign);
    group.userData.patrolAreaLevel = 3;
    return group;
  },

  // 19. Open Unpaved Gutter Hazard (Deep Manhole / Gutter Void - Must Jump Over!)
  createOpenGutterHazard(width = 1.4) {
    const group = new THREE.Group();
    group.name = "Open_Gutter_Hazard";
    group.userData = { isGroundObstacle: true, obstacleType: 'gutter', requiredAction: 'jump' };

    const concrete = new THREE.MeshStandardMaterial({ color: 0x77746c, roughness: 0.96 });
    const channel = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.82, 0.08, 2.7),
      new THREE.MeshStandardMaterial({ color: 0x171a19, roughness: 0.82 })
    );
    channel.position.y = 0.02;
    group.add(channel);

    [-width * 0.48, width * 0.48].forEach(x => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(width * 0.16, 0.2, 3.0), concrete);
      curb.position.set(x, 0.1, 0);
      curb.castShadow = true;
      group.add(curb);
    });

    const displacedCover = new THREE.Mesh(
      new THREE.CylinderGeometry(width * 0.42, width * 0.42, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x4e5557, metalness: 0.58, roughness: 0.72 })
    );
    displacedCover.rotation.x = Math.PI / 2;
    displacedCover.rotation.z = -0.18;
    displacedCover.position.set(width * 0.78, 0.12, 0.85);
    group.add(displacedCover);

    [-0.48, 0.48].forEach(x => {
      const bollard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.075, 0.68, 8),
        new THREE.MeshStandardMaterial({ color: 0xc74d35, roughness: 0.82 })
      );
      bollard.position.set(x, 0.34, -1.55);
      group.add(bollard);
      const reflectiveBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.07, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xe7dfc9, roughness: 0.48 })
      );
      reflectiveBand.position.set(x, 0.42, -1.55);
      group.add(reflectiveBand);
    });

    return group;
  },

  // ---------------------------------------------------------------------------
  // NASCAR ASPHALT NITRO CHEVRON BOOST PAD
  // ---------------------------------------------------------------------------
  createAsphaltBoostPad(width = 2.4, length = 4.0) {
    const group = new THREE.Group();

    // Dark asphalt pad base
    const baseGeo = new THREE.PlaneGeometry(width, length);
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
      metalness: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.02;
    base.receiveShadow = true;
    group.add(base);

    // Glowing Neon Cyan / Lime Chevrons
    const chevronColor = 0x00e5ff;
    const chevronMat = new THREE.MeshBasicMaterial({
      color: chevronColor,
      transparent: true,
      opacity: 0.95
    });

    [-1.0, 0.0, 1.0].forEach(zOffset => {
      const chevron = new THREE.Group();
      const wingGeo = new THREE.BoxGeometry(0.7, 0.04, 0.22);
      
      const wingL = new THREE.Mesh(wingGeo, chevronMat);
      wingL.position.set(-0.32, 0.035, 0);
      wingL.rotation.y = 0.55;
      chevron.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, chevronMat);
      wingR.position.set(0.32, 0.035, 0);
      wingR.rotation.y = -0.55;
      chevron.add(wingR);

      chevron.position.set(0, 0, zOffset);
      group.add(chevron);
    });

    // Glowing outer edge strips
    const edgeGeo = new THREE.BoxGeometry(0.08, 0.04, length);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x76ff03 });
    const edgeL = new THREE.Mesh(edgeGeo, edgeMat);
    edgeL.position.set(-width * 0.48, 0.03, 0);
    const edgeR = new THREE.Mesh(edgeGeo, edgeMat);
    edgeR.position.set(width * 0.48, 0.03, 0);
    group.add(edgeL);
    group.add(edgeR);

    group.userData = { isBoostPad: true, boostDuration: 3.5 };
    return group;
  },

  // ---------------------------------------------------------------------------
  // HYDRAULIC SPRING TRAMPOLINE LAUNCH PAD (Aerial Leap & Skyline Canopy)
  // ---------------------------------------------------------------------------
  createSpringLaunchPad(width = 2.4, length = 3.6) {
    const group = new THREE.Group();

    // Dark steel platform base
    const baseGeo = new THREE.PlaneGeometry(width, length);
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.7,
      metalness: 0.5
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.02;
    base.receiveShadow = true;
    group.add(base);

    // Glowing Spring Trampoline Ring
    const ringGeo = new THREE.RingGeometry(0.75, 1.05, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x76ff03, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.035;
    group.add(ring);

    // Chrome Spring Coil indicator in center
    const coilGeo = new THREE.TorusGeometry(0.48, 0.08, 8, 20);
    coilGeo.rotateX(Math.PI / 2);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xffd600, metalness: 0.8, roughness: 0.2 });
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.position.y = 0.04;
    group.add(coil);

    // Upward-pointing Neon Chevron
    const arrowGeo = new THREE.ConeGeometry(0.35, 0.6, 3);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 0.045, -0.2);
    group.add(arrow);

    // Pulsing outer edge safety guides
    const edgeGeo = new THREE.BoxGeometry(0.08, 0.04, length);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const edgeL = new THREE.Mesh(edgeGeo, edgeMat);
    edgeL.position.set(-width * 0.48, 0.03, 0);
    const edgeR = new THREE.Mesh(edgeGeo, edgeMat);
    edgeR.position.set(width * 0.48, 0.03, 0);
    group.add(edgeL);
    group.add(edgeR);

    group.userData = { isSpringPad: true, isBoostPad: true };
    return group;
  },

  // ---------------------------------------------------------------------------
  // KARACHI TRAFFIC POLICE HAVALDAR ON CD-70 MOTORCYCLE CHASER
  // ---------------------------------------------------------------------------
  createHavaldarMotorcycle() {
    const group = new THREE.Group();
    group.name = 'Havaldar_CD70_Chaser';

    const bikeBlackMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.35, metalness: 0.5 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.1, metalness: 0.9 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.9 });
    const khakiMat = new THREE.MeshStandardMaterial({ color: 0x8d775f, roughness: 0.7 });
    const capWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
    const vestLimeMat = new THREE.MeshStandardMaterial({ color: 0x76ff03, roughness: 0.3, emissive: 0x225500 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb5825a, roughness: 0.6 });
    const sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

    // 1. CD-70 Bike Chassis & Frame
    const frameGeo = new THREE.BoxGeometry(0.32, 0.45, 1.4);
    const frame = new THREE.Mesh(frameGeo, bikeBlackMat);
    frame.position.set(0, 0.55, 0);
    group.add(frame);

    // Fuel Tank (Red or Classic Black with stripe)
    const tankGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.65, 8);
    tankGeo.rotateX(Math.PI / 2);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.25, metalness: 0.4 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 0.82, -0.15);
    group.add(tank);

    // Engine Block
    const engineGeo = new THREE.BoxGeometry(0.38, 0.32, 0.42);
    const engine = new THREE.Mesh(engineGeo, chromeMat);
    engine.position.set(0, 0.42, 0.05);
    group.add(engine);

    // Exhaust Pipe (Right side)
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.055, 1.1, 8);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.position.set(0.24, 0.28, 0.45);
    group.add(exhaust);

    // Front Fork & Handlebars
    const forkGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8);
    const forkL = new THREE.Mesh(forkGeo, chromeMat);
    forkL.position.set(-0.16, 0.65, -0.65);
    forkL.rotation.x = -0.22;
    group.add(forkL);

    const forkR = forkL.clone();
    forkR.position.x = 0.16;
    group.add(forkR);

    const handleBarGeo = new THREE.BoxGeometry(0.78, 0.045, 0.045);
    const handleBar = new THREE.Mesh(handleBarGeo, chromeMat);
    handleBar.position.set(0, 0.98, -0.58);
    group.add(handleBar);

    // Front Headlight (Round vintage headlight)
    const headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12);
    headlightGeo.rotateX(Math.PI / 2);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(0, 0.88, -0.72);
    group.add(headlight);

    // Wheels (Front & Rear)
    const wheelGeo = new THREE.TorusGeometry(0.34, 0.075, 8, 16);
    const spokeMat = new THREE.MeshBasicMaterial({ color: 0x9e9e9e, wireframe: true });

    const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    frontWheel.position.set(0, 0.34, -0.72);
    const frontSpokes = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 12), spokeMat);
    frontSpokes.rotation.x = Math.PI / 2;
    frontWheel.add(frontSpokes);
    group.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rearWheel.position.set(0, 0.34, 0.62);
    const rearSpokes = frontSpokes.clone();
    rearWheel.add(rearSpokes);
    group.add(rearWheel);

    // Flashing Strobe Police Sirens (Handlebar mounted)
    const sirenGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.14, 8);
    const sirenL = new THREE.Mesh(sirenGeo, sirenBlueMat);
    sirenL.position.set(-0.35, 1.08, -0.56);
    group.add(sirenL);

    const sirenR = new THREE.Mesh(sirenGeo, sirenRedMat);
    sirenR.position.set(0.35, 1.08, -0.56);
    group.add(sirenR);

    // Rear High Strobe Beacon Pole
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 6);
    const pole = new THREE.Mesh(poleGeo, chromeMat);
    pole.position.set(0.22, 0.88, 0.72);
    group.add(pole);

    const rearSiren = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), sirenBlueMat);
    rearSiren.position.set(0.22, 1.24, 0.72);
    group.add(rearSiren);

    // 2. Havaldar Character Model
    // Torso (Khaki shirt with high-vis belt)
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.28);
    const torso = new THREE.Mesh(torsoGeo, khakiMat);
    torso.position.set(0, 1.25, 0.05);
    torso.rotation.x = 0.24; // Leaning slightly forward into riding posture
    group.add(torso);

    // Reflective Crossed Lime Belt (Sindh Traffic Police uniform)
    const beltGeo = new THREE.BoxGeometry(0.50, 0.12, 0.30);
    const belt = new THREE.Mesh(beltGeo, vestLimeMat);
    belt.position.set(0, 1.24, 0.05);
    belt.rotation.x = 0.24;
    group.add(belt);

    // Head & Police Cap
    const headGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 1.66, -0.06);
    group.add(head);

    // Aviator Sunglasses
    const glassesGeo = new THREE.BoxGeometry(0.24, 0.06, 0.08);
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x111116 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 1.66, -0.21);
    group.add(glasses);

    // White Peaked Cap (Karachi Traffic Police Officer)
    const capGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.14, 12);
    const cap = new THREE.Mesh(capGeo, capWhiteMat);
    cap.position.set(0, 1.78, -0.06);
    const visorGeo = new THREE.BoxGeometry(0.24, 0.025, 0.14);
    const visor = new THREE.Mesh(visorGeo, glassesMat);
    visor.position.set(0, -0.05, -0.16);
    cap.add(visor);
    group.add(cap);

    // Arms reaching for handlebars
    const armGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.48, 8);
    const armL = new THREE.Mesh(armGeo, khakiMat);
    armL.position.set(-0.28, 1.22, -0.22);
    armL.rotation.set(0.9, -0.25, -0.2);
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, khakiMat);
    armR.position.set(0.28, 1.22, -0.22);
    armR.rotation.set(0.9, 0.25, 0.2);
    group.add(armR);

    // Legs on footrests
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.52, 8);
    const legL = new THREE.Mesh(legGeo, khakiMat);
    legL.position.set(-0.22, 0.72, 0.12);
    legL.rotation.set(0.65, 0, -0.2);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, khakiMat);
    legR.position.set(0.22, 0.72, 0.12);
    legR.rotation.set(0.65, 0, 0.2);
    group.add(legR);

    group.userData = {
      isHavaldarChaser: true,
      frontWheel,
      rearWheel,
      sirenL,
      sirenR,
      rearSiren,
      exhaustPos: new THREE.Vector3(0.24, 0.28, 0.95)
    };

    return group;
  },

  // ---------------------------------------------------------------------------
  // 3D FLOATING PAKISTAN CITIES TOUR WORD HUNT LETTER
  // ---------------------------------------------------------------------------
  createWordLetter(letter = 'K', cityData = null) {
    const group = new THREE.Group();
    group.name = `WordLetter_${letter}`;

    const themeColor = cityData?.color ? new THREE.Color(cityData.color) : new THREE.Color(0xffd700);
    const haloColor = cityData?.color ? new THREE.Color(cityData.color) : new THREE.Color(0x00e5ff);

    // 1. Outer Rotating Crystal Gem (Maintains iconic collectible silhouette)
    const gemGeo = new THREE.OctahedronGeometry(0.85, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      emissive: themeColor,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.78
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.scale.set(1.1, 1.3, 0.8);
    group.add(gem);

    // 2. Letter Billboard Canvas Texture (High resolution bold letter + city icon emblem)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, 128, 128);

    // City emblem badge stamp at top
    if (cityData?.icon) {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(cityData.icon, 64, 6);
    }

    // Glowing border and letter
    ctx.font = '900 80px Outfit, Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#050b14';
    ctx.strokeText(letter, 64, cityData?.icon ? 74 : 64);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(letter, 64, cityData?.icon ? 74 : 64);

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(0.9, 0.9);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const letterPlate = new THREE.Mesh(planeGeo, planeMat);
    letterPlate.position.set(0, 0, 0.05);
    group.add(letterPlate);

    const backPlate = letterPlate.clone();
    backPlate.position.z = -0.05;
    backPlate.rotation.y = Math.PI;
    group.add(backPlate);

    // Glowing halo ring around letter
    const ringGeo = new THREE.RingGeometry(0.72, 0.85, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: haloColor, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(ringGeo, ringMat);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    group.userData = { isWordLetter: true, letter, gem, halo, cityData };
    return group;
  },

  // ---------------------------------------------------------------------------
  // 🏏 TAPE-BALL CRICKET MASTER BAT POWER-UP PICKUP
  // ---------------------------------------------------------------------------
  createCricketBatPickup() {
    const group = new THREE.Group();
    group.name = 'PowerUp_CricketBat';

    // 1. Blade of the Bat (Carved willow shape)
    const bladeGeo = new THREE.BoxGeometry(0.24, 0.88, 0.1);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.5, metalness: 0.1 });
    const blade = new THREE.Mesh(bladeGeo, woodMat);
    blade.position.set(0, 0.44, 0);
    group.add(blade);

    // Pakistani Green Grip Tape on blade shoulder
    const stickerGeo = new THREE.BoxGeometry(0.245, 0.22, 0.105);
    const stickerMat = new THREE.MeshStandardMaterial({ color: 0x00695c, roughness: 0.3 });
    const sticker = new THREE.Mesh(stickerGeo, stickerMat);
    sticker.position.set(0, 0.68, 0);
    group.add(sticker);

    // 2. Handle
    const handleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 10);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, gripMat);
    handle.position.set(0, 1.08, 0);
    group.add(handle);

    // Rubber Grip Rings
    const ringGeo = new THREE.TorusGeometry(0.048, 0.012, 6, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const r1 = new THREE.Mesh(ringGeo, ringMat);
    r1.rotation.x = Math.PI / 2;
    r1.position.set(0, 0.95, 0);
    handle.add(r1);

    // 3. Orbiting Classic Red Taped Tennis Ball
    const ballGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.4 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0.42, 0.55, 0);

    // White electric tape seam around ball
    const tapeSeam = new THREE.Mesh(new THREE.TorusGeometry(0.122, 0.015, 6, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ball.add(tapeSeam);
    group.add(ball);

    // Aura ring
    const auraGeo = new THREE.RingGeometry(0.65, 0.78, 24);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x76ff03, side: THREE.DoubleSide });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = Math.PI / 2;
    aura.position.y = 0.05;
    group.add(aura);

    group.userData = { isCricketBat: true, ball, aura };
    return group;
  },

  // ---------------------------------------------------------------------------
  // 🛹 QINGQI HOVER-SURFER SKATEBOARD
  // ---------------------------------------------------------------------------
  createHoverboardMesh() {
    const group = new THREE.Group();
    group.name = 'Qingqi_Hoverboard';

    // Deck: Aerodynamic rounded board with truck art colors
    const deckGeo = new THREE.BoxGeometry(0.68, 0.06, 1.7);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.25, metalness: 0.6 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0.12, 0);
    group.add(deck);

    // Center Gold Accent Strip
    const stripGeo = new THREE.BoxGeometry(0.18, 0.065, 1.72);
    const stripMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(0, 0.12, 0);
    group.add(strip);

    // Dual Neon Repulsor Thruster Rings (Front & Back underneath)
    const thrusterGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.1, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    const frontThruster = new THREE.Mesh(thrusterGeo, glowMat);
    frontThruster.position.set(0, 0.04, -0.55);
    group.add(frontThruster);

    const rearThruster = frontThruster.clone();
    rearThruster.position.z = 0.55;
    group.add(rearThruster);

    group.userData = { isHoverboard: true, frontThruster, rearThruster };
    return group;
  },

  // ---------------------------------------------------------------------------
  // NASCAR AERODYNAMIC SLIPSTREAM STREAMLINE RIBBONS
  // ---------------------------------------------------------------------------
  createSlipstreamRibbons(width = 1.6, length = 7.0) {
    const group = new THREE.Group();

    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });

    const ribbonGeo = new THREE.PlaneGeometry(0.18, length);
    ribbonGeo.rotateX(-Math.PI / 2);

    const ribbonL = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonL.position.set(-width * 0.4, 0.65, length * 0.5);
    group.add(ribbonL);

    const ribbonR = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonR.position.set(width * 0.4, 0.65, length * 0.5);
    group.add(ribbonR);

    group.visible = false;
    return group;
  },

  // ---------------------------------------------------------------------------
  // AUTHENTIC WHOLESOME KARACHI STREET SLANGS & TRUCK ART NEON BILLBOARD
  // ---------------------------------------------------------------------------
  createSlangBillboard(phraseIndex = 0) {
    const group = new THREE.Group();
    group.name = "Karachi-Slang-Billboard";

    const slangs = [
      { en: "SCENE ON HAI JANI!", ur: "سین آن ہے جانی", color: "#ff007f", sub: "FULL TENSION FREE" },
      { en: "USTAAD! CHILL KAR!", ur: "استاد! چل کر", color: "#00e5ff", sub: "SPEED KAM, SWAG ZYADA" },
      { en: "FIT FAAT · HERO!", ur: "فٹ فاٹ کراچی ہیرو", color: "#76ff03", sub: "DIL DIL KARACHI" },
      { en: "DEKH MAGAR PYAR SE!", ur: "دیکھ مگر پیار سے", color: "#ffd700", sub: "TRUCK ART SPECIAL" },
      { en: "HORN DO, RASTA LO!", ur: "ہارن دو راستہ لو", color: "#ff6d00", sub: "W-11 RULE OF ROAD" },
      { en: "BIRYANI ZINDABAD!", ur: "بریانی زندہ باد", color: "#ff1744", sub: "BURNS ROAD ORIGINAL" },
      { en: "ROK SAKO TO ROK LO!", ur: "روک سکو تو روک لو", color: "#d500f9", sub: "SUPER FAST EXPRESS" }
    ];

    const slang = slangs[Math.abs(phraseIndex) % slangs.length];

    // Dual steel support posts
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.8, roughness: 0.3 });
    [-2.0, 2.0].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), steelMat);
      pole.position.set(px, 3.75, 0);
      group.add(pole);
    });

    // Board Frame
    const frameGeo = new THREE.BoxGeometry(5.2, 2.4, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 6.2, 0);
    group.add(frame);

    // Glowing Neon Border
    const borderGeo = new THREE.BoxGeometry(5.05, 2.25, 0.32);
    const borderMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(slang.color) });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 6.2, 0);
    group.add(border);

    // Canvas Texture with Neon Billboard Text
    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        if (canvas && typeof canvas.getContext === 'function') {
          canvas.width = 512;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 512, 256);

            // Truck art border pattern
            ctx.strokeStyle = slang.color;
            ctx.lineWidth = 10;
            ctx.strokeRect(12, 12, 488, 232);

            // Header English text
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 36px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(slang.en, 256, 72);

            // Urdu script
            ctx.fillStyle = slang.color;
            ctx.font = 'bold 44px "Noto Nastaliq Urdu", Arial, sans-serif';
            ctx.fillText(slang.ur, 256, 148);

            // Subtitle tag
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`★ ${slang.sub} ★`, 256, 205);

            const tex = new THREE.CanvasTexture(canvas);
            const signGeo = new THREE.PlaneGeometry(4.8, 2.0);
            const signMat = new THREE.MeshBasicMaterial({ map: tex });
            const signFront = new THREE.Mesh(signGeo, signMat);
            signFront.position.set(0, 6.2, 0.18);
            group.add(signFront);

            const signBack = signFront.clone();
            signBack.rotation.y = Math.PI;
            signBack.position.z = -0.18;
            group.add(signBack);
          }
        }
      } catch (e) {}
    }

    group.userData = { isSlangBillboard: true, phrase: slang.en, urdu: slang.ur };
    return group;
  },

  // 🛺 Authentic Pakistani Qingqi / Chingchi Rickshaw Vehicle Mount (for Juggernaut power-up)
  createChingchiVehicleMount() {
    const group = new THREE.Group();
    group.name = "Chingchi-Juggernaut-Mount";

    // Front Motorbike Section
    const bikeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x00c853, metalness: 0.6, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd600, metalness: 0.8, roughness: 0.2 });
    const rubberMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Front Fork & Handlebars
    const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const forkL = new THREE.Mesh(forkGeo, chromeMat);
    forkL.position.set(-0.2, 0.6, -1.2);
    forkL.rotation.x = -0.2;
    group.add(forkL);

    const forkR = forkL.clone();
    forkR.position.x = 0.2;
    group.add(forkR);

    // Handlebar Bar
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), chromeMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, 1.15, -1.1);
    group.add(handleBar);

    // Front Motorcycle Wheel
    const fWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 14);
    fWheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(fWheelGeo, rubberMat);
    frontWheel.position.set(0, 0.32, -1.35);
    group.add(frontWheel);

    // Motorcycle Gas Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.55), greenMat);
    tank.position.set(0, 0.9, -0.75);
    group.add(tank);

    // Bright Headlight
    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12), chromeMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(0, 0.95, -1.25);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    bulb.position.set(0, 0, -0.08);
    light.add(bulb);
    group.add(light);

    // Rear Passenger Carriage Frame
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.5, 1.8), greenMat);
    carriage.position.set(0, 0.5, 0.2);
    group.add(carriage);

    // Passenger Bench Seats
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const seatFront = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.25, 0.4), seatMat);
    seatFront.position.set(0, 0.72, -0.2);
    group.add(seatFront);
    const seatRear = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.25, 0.4), seatMat);
    seatRear.position.set(0, 0.72, 0.7);
    group.add(seatRear);

    // Rear Dual Wheels
    const rearWheelL = new THREE.Mesh(fWheelGeo, rubberMat);
    rearWheelL.position.set(-0.88, 0.32, 0.25);
    group.add(rearWheelL);
    const rearWheelR = new THREE.Mesh(fWheelGeo, rubberMat);
    rearWheelR.position.set(0.88, 0.32, 0.25);
    group.add(rearWheelR);

    // Canopy Support Pillars (Chrome)
    const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8);
    [[-0.75, -0.6], [0.75, -0.6], [-0.75, 1.0], [0.75, 1.0]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(pillarGeo, chromeMat);
      p.position.set(px, 1.3, pz);
      group.add(p);
    });

    // Decorative Truck-Art Curved Canopy Hood
    const canopyHood = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 2.05), goldMat);
    canopyHood.position.set(0, 1.95, 0.2);
    group.add(canopyHood);

    // Canopy Fringe (Chamakpatti)
    const fringe = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 0.18, 2.08),
      new THREE.MeshBasicMaterial({ color: 0xff0055 })
    );
    fringe.position.set(0, 1.88, 0.2);
    group.add(fringe);

    // Subwoofer Box in Rear
    const subBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.4), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    subBox.position.set(0, 0.95, 0.95);
    const cone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    cone1.rotation.x = Math.PI / 2;
    cone1.position.set(-0.25, 0, 0.2);
    subBox.add(cone1);
    const cone2 = cone1.clone();
    cone2.position.x = 0.25;
    subBox.add(cone2);
    group.add(subBox);

    // Neon Underglow Bar
    const underglow = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.05, 1.8),
      new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.85 })
    );
    underglow.position.set(0, 0.08, 0.1);
    group.add(underglow);

    group.userData = {
      isChingchiMount: true,
      frontWheel,
      rearWheelL,
      rearWheelR,
      underglow
    };
    return group;
  },

  // 🕊️ Kemari Coastal Seagull Companion (Flaps overhead, picks up aerial coins/letters)
  createKemariSeagull() {
    const group = new THREE.Group();
    group.name = "Kemari-Seagull";

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });

    // Torso / Body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 6), bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), bodyMat);
    head.position.set(0, 0.08, -0.3);
    group.add(head);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 4), beakMat);
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 0.06, -0.44);
    group.add(beak);

    // Left Wing (with pivot group for flapping)
    const wingPivotL = new THREE.Group();
    wingPivotL.position.set(-0.12, 0.06, -0.05);
    const wingGeom = new THREE.BoxGeometry(0.55, 0.02, 0.18);
    const wingL = new THREE.Mesh(wingGeom, wingMat);
    wingL.position.set(-0.27, 0, 0);
    wingPivotL.add(wingL);
    group.add(wingPivotL);

    // Right Wing
    const wingPivotR = new THREE.Group();
    wingPivotR.position.set(0.12, 0.06, -0.05);
    const wingR = new THREE.Mesh(wingGeom, wingMat);
    wingR.position.set(0.27, 0, 0);
    wingPivotR.add(wingR);
    group.add(wingPivotR);

    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.22), wingMat);
    tail.position.set(0, 0.04, 0.32);
    group.add(tail);

    group.userData = {
      isSeagull: true,
      wingPivotL,
      wingPivotR,
      flapTime: 0
    };
    return group;
  },

  // 🍲 Burns Road Biryani Express Dhaba Checkpoint Gate
  createBiryaniDeliveryGate(gateNumber = 1) {
    const group = new THREE.Group();
    group.name = `Biryani-Checkpoint-Gate-${gateNumber}`;

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.1 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });

    // Left & Right Pillars (spanning 8.4m road)
    const pillarGeo = new THREE.BoxGeometry(0.65, 5.2, 0.65);
    const pillarL = new THREE.Mesh(pillarGeo, goldMat);
    pillarL.position.set(-4.2, 2.6, 0);
    group.add(pillarL);

    const pillarR = new THREE.Mesh(pillarGeo, goldMat);
    pillarR.position.set(4.2, 2.6, 0);
    group.add(pillarR);

    // Overhead Bridge Gantry
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.75, 0.85), redMat);
    lintel.position.set(0, 5.2, 0);
    group.add(lintel);

    // 2 Giant Steaming Biryani Daigs mounted on top of the pillars
    const daigGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.65, 12);
    const daigL = new THREE.Mesh(daigGeo, silverMat);
    daigL.position.set(-4.2, 5.85, 0);
    group.add(daigL);

    const daigR = new THREE.Mesh(daigGeo, silverMat);
    daigR.position.set(4.2, 5.85, 0);
    group.add(daigR);

    // Glowing Sign Banner
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 500, 116);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🍲 BURNS ROAD CHECKPOINT #${gateNumber}`, 256, 48);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
        ctx.fillText('HOT BIRYANI DELIVERY · +18s TIME & STEAM!', 256, 95);

        const tex = new THREE.CanvasTexture(canvas);
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8), new THREE.MeshBasicMaterial({ map: tex }));
        sign.position.set(0, 5.2, 0.45);
        group.add(sign);

        const signBack = sign.clone();
        signBack.rotation.y = Math.PI;
        signBack.position.z = -0.45;
        group.add(signBack);
      }
    } catch (e) {}

    // Ground Checkpoint Ribbon
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(8.0, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x76ff03, transparent: true, opacity: 0.85 })
    );
    ribbon.rotation.x = -Math.PI / 2;
    ribbon.position.set(0, 0.08, 0);
    group.add(ribbon);

    group.userData = {
      isBiryaniGate: true,
      gateNumber,
      isPassed: false
    };
    return group;
  }
};

