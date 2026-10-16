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

    const whiteBand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.14, 8), materials.whiteMarble);
    whiteBand.position.y = 0.32;
    group.add(whiteBand);

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
  }
};

