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

    const clothesColors = [materials.shalwarWhite, materials.shalwarNavy, materials.shalwarTeal];
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

    // Legs (Shalwar trousers)
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), clothMat);
    legL.position.set(-0.1, 0.3, 0);
    group.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.1;
    group.add(legR);

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

    whiteBand.position.y = 0.32;
    group.add(whiteBand);

    return group;
  },

  // Dynamic Neon Target Decal & Floating Billboard Badge (Crystal Clear "What to Devour" Visibility!)
  createEvilTargetDecal(evilType, label = "DEVOUR TARGET") {
    const group = new THREE.Group();
    group.name = `Target-Decal-${evilType}`;

    const colorMap = {
      robber: 0xff1744,      // Neon Crimson
      vip: 0xff1744,         // Police Red/Blue
      politician: 0xffd700,  // Gold
      tanker: 0x00e5ff,      // Cyan
      gutka: 0xe040fb,       // Magenta
      ke: 0xffea00,          // Electric Yellow
      pothole: 0xff9100,     // Hazard Orange
      chinacutting: 0xff6d00,// Orange
      bhatta: 0x76ff03,      // Lime
      onewheeler: 0x00e5ff   // Cyan
    };
    const color = colorMap[evilType] || 0xff1744;

    // 1. Ground Pulsing Ring
    const ringGeo = new THREE.RingGeometry(1.3, 1.7, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.04;
    group.add(ring);

    // 2. Crosshair chevrons on ground
    const barGeo = new THREE.PlaneGeometry(0.18, 0.7);
    barGeo.rotateX(-Math.PI / 2);
    const barMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    [
      [0, 1.7, 0],
      [0, -1.7, 0],
      [1.7, 0, Math.PI / 2],
      [-1.7, 0, Math.PI / 2]
    ].forEach(([bx, bz, rot]) => {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(bx, 0.05, bz);
      bar.rotation.y = rot;
      group.add(bar);
    });

    // 3. Floating High-Visibility Billboard Badge
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(17, 17, 17, 0.94)';
    ctx.beginPath();
    ctx.roundRect(6, 6, 388, 84, 18);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.stroke();

    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 200, 48);

    const bTex = new THREE.CanvasTexture(canvas);
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    badge.scale.set(4.4, 1.05, 1);
    badge.position.set(0, 3.8, 0);
    group.add(badge);

    group.userData = {
      ring,
      badge,
      color,
      timer: 0
    };

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

    const bagMat = new THREE.MeshLambertMaterial({ color, roughness: 0.6 });
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
      moveSpeed: 5.5
    };

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

    group.userData = { walkCycle: Math.random() * 10, moveSpeed: 6.5 };
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

  // 26D. Water Tanker Extortion Scene (Tanker Mafia + Thirsty Karachi Residents!)
  createWaterTankerExtortionScene() {
    const tanker = this.createWaterTankerMafia();
    const targetDecal = this.createEvilTargetDecal('tanker', '💧 TANKER MAFIA • DEVOUR!');
    tanker.add(targetDecal);

    // 2 Thirsty Residents with water drums
    const resident1 = this.createPleadingResident("15,000 ka tanker?! Zulm band karo!");
    resident1.position.set(-3.4, 0, 1.2);

    const resident2 = this.createPleadingResident("Pani do! Bache pyase hain!");
    resident2.position.set(3.4, 0, 1.2);

    const thirstyResidents = [resident1, resident2];
    tanker.userData.thirstyResidents = thirstyResidents;
    tanker.userData.targetDecal = targetDecal;

    return {
      tankerTarget: tanker,
      thirstyResidents
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
      isBunKabab: true,
      hasGivenBoost: false,
      chefQuote: "Karachi ko saaf karo bhai! Ye lo Spicy Chutney Turbo Boost!"
    };

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

  // 32. K-Electric Sparking Kunda Transformer Pole - Civic Evil Tier 2 (14h Load Shedding!)
  createKElectricTransformer() {
    const group = new THREE.Group();
    group.name = "KE-Sparking-Kunda";
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
    drawBubble('⚡ K-Electric Kunda: 14h Load Shedding!');

    const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
    bubble.scale.set(4.4, 1.1, 1);
    bubble.position.set(0, 7.8, 0);
    group.add(bubble);

    // Glowing Neon Target Decal & Billboard
    const targetDecal = this.createEvilTargetDecal('ke', '⚡ K-ELECTRIC KUNDA • DEVOUR!');
    group.add(targetDecal);

    group.userData = {
      isBadGuy: true,
      evilType: 'ke',
      name: "K-Electric Sparking Kunda",
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
  }
};




