import * as THREE from 'three';
import { KarachiModels } from './karachiModels.js';
import { TextureGenerator } from './textures.js';

export class CityGenerator {
  constructor(scene) {
    this.scene = scene;
    this.edibleObjects = [];
    this.politicians = [];
    this.animals = [];
    this.robberies = [];
    this.badGuys = [];
    this.foodStalls = [];
    this.buildings = [];
    this.citizens = [];
    this.coastalBays = [];
    this.interactiveVictims = [];
    this.interactiveTraffic = [];
    this.interactiveResidents = [];
    this.mapSize = 320; // Expanded Karachi Metropolis Map
  }

  generateCity() {
    this.createGround();
    this.createRoadNetwork();
    this.createPerimeterBoundaries();
    this.createDistantCitySkyline();
    this.populateZones();
    return {
      edibleObjects: this.edibleObjects,
      politicians: this.politicians,
      animals: this.animals,
      robberies: this.robberies,
      badGuys: this.badGuys,
      foodStalls: this.foodStalls,
      buildings: this.buildings,
      citizens: this.citizens,
      coastalBays: this.coastalBays,
      interactiveVictims: this.interactiveVictims,
      interactiveTraffic: this.interactiveTraffic,
      interactiveResidents: this.interactiveResidents
    };
  }

  createGround() {
    // 1. Expansive Vast Ground Foundation (1600m x 1600m) - eliminates empty voids/cut-offs!
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0xbdb39a // Warm coastal Karachi sand/dust earth tone
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Active Playable District Plaza Base (208m x 208m, centered at x: 0, z: 0)
    // Dark urban pavement underneath roads and blocks so the devour area is crisp and rich
    const plazaGeo = new THREE.PlaneGeometry(208, 208);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshLambertMaterial({
      color: 0x242830 // Deep urban asphalt tone
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = -0.01;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // 3. Clifton Sea View Beach Strip (208m x 22m golden wet sand meeting the ocean waves)
    const beachGeo = new THREE.PlaneGeometry(208, 22);
    beachGeo.rotateX(-Math.PI / 2);
    const beachMat = new THREE.MeshLambertMaterial({
      color: 0xd7c29e // Warm wet golden beach sand
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.position.set(0, 0.01, 94);
    beach.receiveShadow = true;
    this.scene.add(beach);

    // 4. Vast Arabian Sea Water Plane (1600m x 800m south of the Clifton seawall at z = 98)
    const seaGeo = new THREE.PlaneGeometry(1600, 800, 32, 32);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x006688,
      roughness: 0.15,
      metalness: 0.55
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, -0.32, 500); // Extends south from z = 100 to z = 900
    this.scene.add(sea);
    this.seaMesh = sea;
  }

  createRoadNetwork() {
    // High-definition crisp asphalt texture with storm sewer grates and yellow/white lane stripes
    const roadTexture = TextureGenerator.createCrispRoadTexture();
    const roadMat = new THREE.MeshLambertMaterial({
      map: roadTexture
    });

    const roadWidth = 14;
    // 5x5 Arterial Avenue and Boulevard Network across 200m district
    const roadGrid = [-96, -48, 0, 48, 96];
    const districtLength = 200; // Roads span cleanly from -100 to +100 inside perimeter boundaries

    // North-South Avenues
    roadGrid.forEach(x => {
      const roadGeo = new THREE.PlaneGeometry(roadWidth, districtLength);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(x, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);

      // Sidewalk curbs
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, districtLength), KarachiModels.materials.sandstone);
      curbL.position.set(x - roadWidth / 2 - 0.7, 0.12, 0);
      this.scene.add(curbL);

      const curbR = curbL.clone();
      curbR.position.x = x + roadWidth / 2 + 0.7;
      this.scene.add(curbR);
    });

    // East-West Boulevards
    roadGrid.forEach(z => {
      const roadGeo = new THREE.PlaneGeometry(districtLength, roadWidth);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.02, z);
      road.rotation.y = Math.PI / 2;
      road.receiveShadow = true;
      this.scene.add(road);

      const curbT = new THREE.Mesh(new THREE.BoxGeometry(districtLength, 0.25, 1.4), KarachiModels.materials.sandstone);
      curbT.position.set(0, 0.12, z - roadWidth / 2 - 0.7);
      this.scene.add(curbT);

      const curbB = curbT.clone();
      curbB.position.z = z + roadWidth / 2 + 0.7;
      this.scene.add(curbB);
    });
  }

  createPerimeterBoundaries() {
    // =============================================================
    // 1. FOUR ICONIC CORNER ANCHORS WITH AUTHENTIC COASTAL WATER BAYS
    // =============================================================
    // --- North-West Corner: Saddar Victorian Clock Tower ---
    const saddarClock = KarachiModels.createSaddarClockTower();
    saddarClock.position.set(-96, 0, -96);
    this.registerEdible(saddarClock, 5, 2500, "Saddar Clock Tower", 8.0, { isBuilding: true, isBadGuy: false });

    // --- North-East Corner: Chundrigar Illuminated Billboard Tower ---
    const chundrigarBB = KarachiModels.createChundrigarBillboardTower();
    chundrigarBB.position.set(96, 0, -96);
    this.registerEdible(chundrigarBB, 5, 2500, "Chundrigar Billboard Tower", 8.0, { isBuilding: true, isBadGuy: false });

    // --- South-West Corner: Manora Point Coastal Water Bay & Lighthouse ---
    // Genuine coastal water bay with turquoise Arabian Sea water inlet, foam, rocks & navigation buoy
    const swBay = KarachiModels.createCoastalWaterBay({
      title: "🌊 MANORA COASTAL BAY",
      subtitle: "ARABIAN SEA NAVAL POINT"
    });
    swBay.position.set(-96, 0, 96);
    this.scene.add(swBay);

    const lighthouse = KarachiModels.createCliftonLighthouse();
    lighthouse.position.set(-94, 0, 94);
    this.registerEdible(lighthouse, 5, 2500, "Manora Point Lighthouse", 8.0, { isBuilding: true, isBadGuy: false });

    const swTetra1 = KarachiModels.createTetrapodBreakwater();
    swTetra1.position.set(-84, 0, 98);
    this.scene.add(swTetra1);

    const swTetra2 = KarachiModels.createTetrapodBreakwater();
    swTetra2.position.set(-98, 0, 84);
    this.scene.add(swTetra2);

    // --- South-East Corner: Do Darya Arabian Sea Waterfront Pier ---
    // Genuine coastal dining bay over the ocean with water inlet, buoy, and breakwaters
    const seBay = KarachiModels.createCoastalWaterBay({
      title: "🌊 DO DARYA WATERFRONT",
      subtitle: "ARABIAN SEA DINING PIER"
    });
    seBay.position.set(96, 0, 96);
    this.scene.add(seBay);
    this.coastalBays = [swBay, seBay];

    const doDarya = KarachiModels.createDoDaryaPavilion();
    doDarya.position.set(94, 0, 94);
    this.registerEdible(doDarya, 5, 2500, "Do Darya Coastal Pavilion", 8.0, { isBuilding: true, isBadGuy: false });

    const seTetra1 = KarachiModels.createTetrapodBreakwater();
    seTetra1.position.set(84, 0, 98);
    this.scene.add(seTetra1);

    const seTetra2 = KarachiModels.createTetrapodBreakwater();
    seTetra2.position.set(98, 0, 84);
    this.scene.add(seTetra2);

    // =============================================================
    // 2. SOUTH BOUNDARY: Clifton Seawall overlooking Arabian Sea (z = 100)
    // =============================================================
    for (let x = -80; x <= 80; x += 23.5) {
      const seawall = KarachiModels.createSeawallSegment(24);
      seawall.position.set(x, 0, 100);
      this.scene.add(seawall);
    }

    // Coastal breakwater tetrapods scattered along the ocean edge
    for (let x = -75; x <= 75; x += 28) {
      const tetra = KarachiModels.createTetrapodBreakwater();
      tetra.position.set(x + 5, 0, 102);
      this.scene.add(tetra);
    }

    // =============================================================
    // 3. NORTH BOUNDARY: Marble Balustrade Wall & Bab-e-Karachi Arch (z = -100)
    // =============================================================
    for (let x = -85; x <= 85; x += 15) {
      if (Math.abs(x) < 8) {
        // Grand Central Portal Arch at x = 0 ("BAB-E-KARACHI")
        const gateGroup = new THREE.Group();
        gateGroup.position.set(0, 0, -100);

        // Twin Marble Pylons
        const pylonL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 2.4), KarachiModels.materials.whiteMarble);
        pylonL.position.set(-5.5, 3.75, 0);
        gateGroup.add(pylonL);
        const pylonR = pylonL.clone();
        pylonR.position.x = 5.5;
        gateGroup.add(pylonR);

        // Arch lintel beam
        const archTop = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.8, 2.6), KarachiModels.materials.whiteMarble);
        archTop.position.set(0, 7.5, 0);
        gateGroup.add(archTop);

        // Signboard canvas
        const archCanvas = document.createElement('canvas');
        archCanvas.width = 512;
        archCanvas.height = 128;
        const actx = archCanvas.getContext('2d');
        actx.fillStyle = '#004d40';
        actx.fillRect(0, 0, 512, 128);
        actx.lineWidth = 6;
        actx.strokeStyle = '#ffd700';
        actx.strokeRect(6, 6, 500, 116);
        actx.fillStyle = '#ffd700';
        actx.font = 'bold 36px "Outfit", sans-serif';
        actx.textAlign = 'center';
        actx.fillText('★ BAB-E-KARACHI ★', 256, 52);
        actx.fillStyle = '#ffffff';
        actx.font = 'bold 24px "Outfit", sans-serif';
        actx.fillText('NORTHERN CITY PORTAL', 256, 95);
        const archTex = new THREE.CanvasTexture(archCanvas);
        const signPlane = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 1.6), new THREE.MeshBasicMaterial({ map: archTex }));
        signPlane.position.set(0, 7.5, 1.35);
        gateGroup.add(signPlane);

        this.scene.add(gateGroup);
      } else {
        // Balustrade Wall Segment
        const wallGeo = new THREE.BoxGeometry(14.0, 2.2, 1.2);
        const wall = new THREE.Mesh(wallGeo, KarachiModels.materials.whiteMarble);
        wall.position.set(x, 1.1, -100);
        wall.receiveShadow = true;
        this.scene.add(wall);

        // Decorative Marble Pillars
        const col = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.6), KarachiModels.materials.sandstone);
        col.position.set(x + 7.0, 1.4, -100);
        this.scene.add(col);
      }
    }

    // =============================================================
    // 4. EAST BOUNDARY: KMC Concrete Hazard Barriers with flashing amber strobes (x = 100)
    // =============================================================
    for (let z = -90; z <= 90; z += 3.5) {
      const barrier = KarachiModels.createKMCBarrier();
      barrier.position.set(100, 0, z);
      barrier.rotation.y = Math.PI / 2;
      this.scene.add(barrier);
    }

    // =============================================================
    // 5. WEST BOUNDARY: Saddar Colonial Heritage Red-Brick Wall (x = -100)
    // =============================================================
    for (let z = -88; z <= 88; z += 12) {
      const wallGeo = new THREE.BoxGeometry(1.2, 2.4, 11.0);
      const wall = new THREE.Mesh(wallGeo, KarachiModels.materials.redBrick);
      wall.position.set(-100, 1.2, z);
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Iron pillar
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 8), KarachiModels.materials.curbBlack);
      pil.position.set(-100, 1.6, z + 5.5);
      this.scene.add(pil);
    }
  }

  createDistantCitySkyline() {
    // 1. Distant Urban Silhouette Buildings outside North, East, and West boundaries (radius 115m to 220m)
    const facadeMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x8d7b68 }), // Warm sandstone
      new THREE.MeshLambertMaterial({ color: 0x546e7a }), // Modern slate
      new THREE.MeshLambertMaterial({ color: 0x795548 }), // Weathered red brick
      new THREE.MeshLambertMaterial({ color: 0xa1887f }), // Karachi dust concrete
      new THREE.MeshLambertMaterial({ color: 0x37474f })  // Tinted glass
    ];

    const buildingCount = 75;
    for (let i = 0; i < buildingCount; i++) {
      // Angle around perimeter, avoiding pure south which is the open Arabian Sea
      const angle = (i / buildingCount) * Math.PI * 2;
      
      // If facing south (angle roughly between 0.32*PI and 0.68*PI), skip skyscrapers to keep coastal sea horizon open
      const isSouthSea = angle > Math.PI * 0.32 && angle < Math.PI * 0.68;
      if (isSouthSea) continue;

      const dist = 118 + (Math.sin(i * 13) * 0.5 + 0.5) * 85;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;

      const w = 14 + ((i * 7) % 16);
      const d = 14 + ((i * 11) % 16);
      const h = 28 + ((i * 17) % 75); // Heights up to 100m in distant backdrop!

      const mat = facadeMaterials[i % facadeMaterials.length];
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      bMesh.position.set(bx, h / 2, bz);
      this.scene.add(bMesh);

      // Rooftop antenna / beacon on taller buildings
      if (h > 50) {
        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.35, 14, 6),
          new THREE.MeshBasicMaterial({ color: 0xe53935 })
        );
        antenna.position.set(bx, h + 7, bz);
        this.scene.add(antenna);
      }
    }

    // 2. Distant Arabian Sea Cargo Vessels / Container Ships on the South Horizon (z = 200 to 450)
    const shipConfigs = [
      { x: -180, z: 220, rot: 0.15, scale: 1.6 },
      { x: -70, z: 280, rot: -0.2, scale: 2.0 },
      { x: 55, z: 240, rot: 0.1, scale: 1.5 },
      { x: 170, z: 310, rot: -0.3, scale: 1.8 },
      { x: 0, z: 360, rot: 0.05, scale: 2.2 }
    ];

    shipConfigs.forEach(sc => {
      const ship = this.createDistantCargoShip();
      ship.position.set(sc.x, 0, sc.z);
      ship.rotation.y = sc.rot;
      ship.scale.setScalar(sc.scale);
      this.scene.add(ship);
    });
  }

  createDistantCargoShip() {
    const group = new THREE.Group();
    // Hull
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x1a237e }); // Deep ocean blue
    const hull = new THREE.Mesh(new THREE.BoxGeometry(32, 4.5, 7.5), hullMat);
    hull.position.y = 1.0;
    group.add(hull);

    // Deck Superstructure / Bridge
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6.5), bridgeMat);
    bridge.position.set(-11, 5.0, 0);
    group.add(bridge);

    // Funnel
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 8), new THREE.MeshLambertMaterial({ color: 0xd32f2f }));
    funnel.position.set(-11, 9.5, 0);
    group.add(funnel);

    // Stacked Containers (Multi-color Karachi Port Trust style)
    const containerColors = [0xd32f2f, 0x1976d2, 0x388e3c, 0xfbc02d];
    for (let cx = -5; cx <= 12; cx += 5.5) {
      for (let cy = 0; cy < 2; cy++) {
        const cMat = new THREE.MeshLambertMaterial({ color: containerColors[(Math.abs(cx) + cy * 2) % 4] });
        const cBox = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 5.8), cMat);
        cBox.position.set(cx, 4.3 + cy * 2.3, 0);
        group.add(cBox);
      }
    }

    return group;
  }

  registerEdible(mesh, tier, points, name, radius, {
    isPolitician = false,
    isAnimal = false,
    isRobbery = false,
    isRubbish = false,
    isBadGuy = false,
    evilType = null,
    isFoodStall = false,
    isBuilding = false,
    isCitizen = false,
    isTransport = false
  } = {}) {
    this.scene.add(mesh);
    const calculatedIsBadGuy = Boolean(isBadGuy || isPolitician || isRobbery || isRubbish || (evilType !== null));
    const calculatedEvilType = evilType || (isPolitician ? 'politician' : isRobbery ? 'robber' : isRubbish ? 'trash' : null);

    const item = {
      mesh,
      tier,
      points,
      name,
      radius,
      origY: mesh.position.y,
      state: 'idle',
      suctionProgress: 0,
      scaleX: mesh.scale.x,
      scaleY: mesh.scale.y,
      scaleZ: mesh.scale.z,
      isPolitician,
      isAnimal,
      isRobbery,
      isRubbish,
      isBadGuy: calculatedIsBadGuy,
      evilType: calculatedEvilType,
      isFoodStall,
      isBuilding,
      isCitizen,
      isTransport
    };
    this.edibleObjects.push(item);
    if (isPolitician) this.politicians.push(item);
    if (isAnimal) this.animals.push(item);
    if (isRobbery) this.robberies.push(item);
    if (item.isBadGuy) this.badGuys.push(item);
    if (isFoodStall) this.foodStalls.push(item);
    if (isBuilding) this.buildings.push(item);
    if (isCitizen) this.citizens.push(item);
    return item;
  }

  // Interactive Robbery Scene with Decoupled Target vs Rescued Citizen
  addRobberyScene(posX, posZ) {
    const { robberTarget, victimCitizen } = KarachiModels.createRobberyScene();
    robberTarget.position.set(posX, 0, posZ);
    victimCitizen.position.set(posX, 0, posZ + 2.2);
    this.scene.add(victimCitizen);
    this.interactiveVictims.push(victimCitizen);
    this.registerEdible(robberTarget, 1, 850, "Mobile Snatcher (ڈاکو)", 2.0, { isRobbery: true, isBadGuy: true, evilType: 'robber' });
  }

  // Interactive VIP Protocol Traffic Jam Scene with Stuck Commuters that get freed!
  addVIPTrafficJamScene(posX, posZ, rotY = 0) {
    const { vipTarget, stuckVehicles } = KarachiModels.createVIPTrafficJamScene();
    vipTarget.position.set(posX, 0, posZ);
    vipTarget.rotation.y = rotY;
    stuckVehicles.forEach(v => {
      const localPos = v.position.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      v.position.set(posX + localPos.x, 0, posZ + localPos.z);
      v.rotation.y = rotY;
      this.scene.add(v);
      this.interactiveTraffic.push(v);
    });
    this.registerEdible(vipTarget, 3, 1600, "VIP Protocol Prado Convoy", 4.2, { isBadGuy: true, evilType: 'vip' });
  }

  // Interactive Water Tanker Extortion Scene with Thirsty Karachi Residents!
  addWaterTankerScene(posX, posZ) {
    const { tankerTarget, thirstyResidents } = KarachiModels.createWaterTankerExtortionScene();
    tankerTarget.position.set(posX, 0, posZ);
    thirstyResidents.forEach(r => {
      const rx = posX + r.position.x;
      const rz = posZ + r.position.z;
      r.position.set(rx, 0, rz);
      this.scene.add(r);
      this.interactiveResidents.push(r);
    });
    this.registerEdible(tankerTarget, 3, 1400, "Water Tanker Mafia Truck", 3.8, { isBadGuy: true, evilType: 'tanker' });
  }

  populateZones() {
    const trashColors = [0x1565c0, 0x212121, 0x43a047, 0xe53935];

    // =============================================================
    // 0. IMMEDIATE PLAYER SPAWN CROSSROADS (Centered around x: 0, z: 0)
    // 100% Unobstructed view: Mazar-e-Quaid is in the far northern backdrop!
    // Immediate feast of Bun Kabab stall, Chai Dhaba, Potholes, Gutka, Robbers, Politicians, Tankers & Trash!
    // =============================================================
    // Burns Road Bun Kabab Stall right by the starting crossroads
    const bunKabab1 = KarachiModels.createBurnsRoadBunKababStall();
    bunKabab1.position.set(5.5, 0, 3.5);
    this.registerEdible(bunKabab1, 2, 250, "Burns Road Bun Kabab", 2.2, { isFoodStall: true });

    // Quetta Alamgir Chai Dhaba on the opposite curb
    const dhaba1 = KarachiModels.createChaiDhaba();
    dhaba1.position.set(-5.5, 0, 3.5);
    this.registerEdible(dhaba1, 2, 200, "Quetta Alamgir Chai", 2.2, { isFoodStall: true });

    // 2 Broken Road Potholes with leaking water right in front of start
    const pothole1 = KarachiModels.createBrokenRoadPatch();
    pothole1.position.set(-3.2, 0, -4.5);
    this.registerEdible(pothole1, 1, 80, "Road Pothole (کھڈا)", 1.4, { isBadGuy: true, evilType: 'pothole' });

    const pothole2 = KarachiModels.createBrokenRoadPatch();
    pothole2.position.set(3.2, 0, -4.5);
    this.registerEdible(pothole2, 1, 80, "Road Pothole (کھڈا)", 1.4, { isBadGuy: true, evilType: 'pothole' });

    // Shady Gutka / Chalia peddler with red spit stains
    const gutka1 = KarachiModels.createGutkaPeddler();
    gutka1.position.set(-6.0, 0, -6.5);
    this.registerEdible(gutka1, 1, 400, "Gutka Mafia Peddler", 1.5, { isBadGuy: true, evilType: 'gutka' });

    // Street Robbery Scene right near start (Armed Mugger vs Terrified Rescuable Citizen)
    this.addRobberyScene(6.5, -8.0);

    // 3 Fleeing VIP Politicians right down the road with briefcases
    const startPoliticians = [
      { pos: [0, -10.0], name: "Senator Mukhtar", quote: "Mujhe kyun nikala?!" },
      { pos: [-4, -12.0], name: "VIP Chaudhry", quote: "VIP Protocol kidhar hai?!" },
      { pos: [4, -12.0], name: "MNA Jamali", quote: "Tabdeeli aa gayi hai!" }
    ];
    startPoliticians.forEach(sp => {
      const pol = KarachiModels.createPolitician({ name: sp.name, quote: sp.quote });
      pol.position.set(sp.pos[0], 0, sp.pos[1]);
      this.registerEdible(pol, 1, 600, sp.name, 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });
    });

    // Speeding VIP Protocol SUV Traffic Jam Scene (Blocks innocent traffic that get freed!)
    this.addVIPTrafficJamScene(-8, -14, Math.PI / 2);

    // Water Tanker Mafia Truck Extortion Scene (Thirsty citizens begging for water!)
    this.addWaterTankerScene(8, -16);

    // K-Electric Sparking Kunda Transformer Pole right near spawn
    const ke1 = KarachiModels.createKElectricTransformer();
    ke1.position.set(-8.5, 0, 4.5);
    this.registerEdible(ke1, 2, 750, "K-Electric Kunda (14h Load Shedding)", 2.5, { isBadGuy: true, evilType: 'ke' });

    // China Cutting Land Grabber carving illegal footpath plot
    const china1 = KarachiModels.createChinaCuttingMafia();
    china1.position.set(8.5, 0, 4.5);
    this.registerEdible(china1, 1, 650, "China Cutting Land Grabber", 1.5, { isBadGuy: true, evilType: 'chinacutting' });

    // Bhatta / Parchi Extortion Mafia Thug
    const bhatta1 = KarachiModels.createBhattaParchiMafia();
    bhatta1.position.set(-8.5, 0, -4.5);
    this.registerEdible(bhatta1, 1, 700, "Bhatta Parchi Mafia", 1.5, { isBadGuy: true, evilType: 'bhatta' });

    // Reckless One-Wheeling Silencer-less Racer
    const racer1 = KarachiModels.createOneWheelerRacer();
    racer1.position.set(0, 0, 8.5);
    this.registerEdible(racer1, 1, 500, "Reckless One-Wheeler", 1.8, { isBadGuy: true, evilType: 'onewheeler' });

    // 15 Plastic trash bags scattered right around the hole
    for (let i = 0; i < 15; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      bag.position.set(-5 + Math.random() * 10, 0, -1.5 - Math.random() * 8);
      this.registerEdible(bag, 1, 25, "Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // 12 Soda cans & water bottles
    for (let i = 0; i < 8; i++) {
      const can = KarachiModels.createSodaCan();
      can.position.set(-4 + Math.random() * 8, 0, -1.0 - Math.random() * 7);
      this.registerEdible(can, 1, 15, "Soda Can", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }
    for (let i = 0; i < 8; i++) {
      const bottle = KarachiModels.createWaterBottle();
      bottle.position.set(-4 + Math.random() * 8, 0, -2.0 - Math.random() * 7);
      this.registerEdible(bottle, 1, 15, "Water Bottle", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // 6 Sewer rats scurrying around trash (Cleaned up as pests)
    for (let i = 0; i < 6; i++) {
      const rat = KarachiModels.createSewerRat();
      rat.position.set(-3 + Math.random() * 6, 0, -2.5 - Math.random() * 6);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true, isBadGuy: true, evilType: 'trash' });
    }

    // 2 Barking Desi Stray Dogs (Innocent street friends)
    const dog1 = KarachiModels.createStrayDog();
    dog1.position.set(-4.5, 0, -5.5);
    this.registerEdible(dog1, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true, isBadGuy: false });

    const dog2 = KarachiModels.createStrayDog();
    dog2.position.set(4.5, 0, -5.5);
    this.registerEdible(dog2, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true, isBadGuy: false });

    // 2 Street Cats roaming curbs (Innocent)
    const cat1 = KarachiModels.createStreetCat();
    cat1.position.set(-5, 0, -2.5);
    this.registerEdible(cat1, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true, isBadGuy: false });

    // Plastic Traffic Cones
    for (let x = -3; x <= 3; x += 1.5) {
      const cone = KarachiModels.createTrafficCone();
      cone.position.set(x, 0, -1.8);
      this.registerEdible(cone, 1, 20, "Traffic Cone", 0.6, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }
    const thela1 = KarachiModels.createFruitThela();
    thela1.position.set(-6, 0, 1.5);
    this.registerEdible(thela1, 1, 50, "Mango Thela", 1.2, { isFoodStall: true, isBadGuy: false });

    // =============================================================
    // 1. WATER TANKER MAFIA TRUCKS (10 Trucks Across City!)
    // =============================================================
    // 1. WATER TANKER MAFIA SCENES (Extortion Trucks + Thirsty Residents!)
    // =============================================================
    const tankerSpots = [
      [-30, -35], [35, -35], [-45, -60], [45, -60],
      [-25, 25], [30, 25], [-45, 50], [45, 50], [0, 45], [0, -45]
    ];
    tankerSpots.forEach((spot, idx) => {
      if (idx < 6) {
        this.addWaterTankerScene(spot[0], spot[1]);
      } else {
        const tanker = KarachiModels.createWaterTankerMafia();
        tanker.position.set(spot[0], 0, spot[1]);
        tanker.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
        const decal = KarachiModels.createEvilTargetDecal('tanker', '💧 TANKER MAFIA • DEVOUR!');
        tanker.add(decal);
        this.registerEdible(tanker, 3, 900, `Water Tanker Mafia #${idx + 2}`, 3.4, { isBadGuy: true, evilType: 'tanker' });
      }
    });

    // =============================================================
    // 2. SPEEDING VIP PROTOCOL ESCORTS & TRAFFIC JAMS (VIPs + Stuck Traffic!)
    // =============================================================
    const vipSpots = [
      [-20, -25], [20, -25], [-35, -45], [35, -45],
      [-20, 35], [20, 35], [-35, 60], [35, 60], [10, 65], [-10, -65]
    ];
    vipSpots.forEach((spot, idx) => {
      if (idx < 6) {
        this.addVIPTrafficJamScene(spot[0], spot[1], idx % 2 === 0 ? 0 : Math.PI / 2);
      } else {
        const vip = KarachiModels.createSpeedingVIPConvoy();
        vip.position.set(spot[0], 0, spot[1]);
        vip.rotation.y = idx % 2 === 0 ? Math.PI : 0;
        const decal = KarachiModels.createEvilTargetDecal('vip', '🚨 VIP PROTOCOL • DEVOUR!');
        vip.add(decal);
        this.registerEdible(vip, 3, 850, `VIP Protocol Escort #${idx + 2}`, 3.2, { isBadGuy: true, evilType: 'vip' });
      }
    });

    // =============================================================
    // 3. SHADY GUTKA / MAWA PEDDLERS (12 Peddlers with Red Spit Stains!)
    // =============================================================
    const gutkaSpots = [
      [-25, -15], [25, -15], [-40, -30], [40, -30],
      [-25, 15], [25, 15], [-40, 40], [40, 40],
      [-15, 55], [15, 55], [-55, 15], [55, 15]
    ];
    gutkaSpots.forEach((spot, idx) => {
      const gutka = KarachiModels.createGutkaPeddler();
      gutka.position.set(spot[0], 0, spot[1]);
      this.registerEdible(gutka, 1, 400, `Gutka Peddler #${idx + 2}`, 1.5, { isBadGuy: true, evilType: 'gutka' });
    });

    // =============================================================
    // 4. BROKEN ROADS & POTHOLES (16 Pothole / Leak Patches!)
    // =============================================================
    const potholeSpots = [
      [-15, -20], [15, -20], [-30, -40], [30, -40],
      [-15, 20], [15, 20], [-30, 40], [30, 40],
      [0, -30], [0, 30], [-50, -10], [50, -10],
      [-50, 20], [50, 20], [-10, -50], [10, 50]
    ];
    potholeSpots.forEach((spot, idx) => {
      const pot = KarachiModels.createBrokenRoadPatch();
      pot.position.set(spot[0], 0, spot[1]);
      this.registerEdible(pot, 1, 80, `Broken Road #${idx + 3}`, 1.4, { isBadGuy: true, evilType: 'pothole' });
    });

    // =============================================================
    // 5. KARACHI STREET ROBBERY SCENES (10 Interactive Mugging Scenes!)
    // =============================================================
    const robberySpots = [
      [-35, -20], [-45, -45], [30, -25], [45, -45],
      [-30, 30], [-55, 50], [25, 30], [50, 45],
      [-15, -55], [15, 55]
    ];
    robberySpots.forEach(spot => {
      this.addRobberyScene(spot[0], spot[1]);
    });

    // =============================================================
    // 6. VIP PAKISTANI POLITICIANS ACROSS THE CITY (18 Politicians)
    // =============================================================
    const politicalQuotes = [
      "Khata hai toh lagata bhi hai!",
      "London flats mere nahi hain!",
      "Bijli ka bill maaf karo!",
      "Ghabrana nahi hai bilkul!",
      "Main nahi janta yeh kaun hai!",
      "VIP Protocol squad alert!",
      "Kaun hain yeh log?!",
      "Parliament session late hai!",
      "Dollar sasta ho jayega!",
      "Mera briefcase kidhar gaya?!",
      "Security escort kahan hai?!",
      "K-IV project ka budget kidhar gaya?!"
    ];

    const politicianSpots = [
      [-30, -30], [-25, -45], [-50, -25], [25, -25], [45, -30],
      [30, -50], [-35, 25], [-45, 45], [-20, 35], [25, 25],
      [45, 35], [30, 50], [0, 25], [15, 60], [-15, 60],
      [-40, -60], [40, -60], [0, -60]
    ];

    politicianSpots.forEach((spot, idx) => {
      const q = politicalQuotes[idx % politicalQuotes.length];
      const pName = `Politician #${idx + 1}`;
      const pol = KarachiModels.createPolitician({ name: pName, quote: q });
      pol.position.set(spot[0], 0, spot[1]);
      this.registerEdible(pol, 1, 600, pName, 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });
    });

    // =============================================================
    // 7. BURNS ROAD BUN KABAB STALLS & CHAI DHABAS ACROSS CITY (8 Each!)
    // =============================================================
    const foodSpots = [
      [-45, -15], [45, -15], [-45, 15], [45, 15],
      [-25, -50], [25, -50], [-25, 50], [25, 50]
    ];
    foodSpots.forEach((spot, idx) => {
      const bk = KarachiModels.createBurnsRoadBunKababStall();
      bk.position.set(spot[0], 0, spot[1]);
      this.registerEdible(bk, 2, 250, `Burns Road Bun Kabab #${idx + 2}`, 2.2, { isFoodStall: true, isBadGuy: false });

      const dh = KarachiModels.createChaiDhaba();
      dh.position.set(spot[0] + 5, 0, spot[1]);
      this.registerEdible(dh, 2, 200, `Quetta Chai Dhaba #${idx + 2}`, 2.2, { isFoodStall: true, isBadGuy: false });
    });

    // =============================================================
    // 7b. K-ELECTRIC SPARKING KUNDA TRANSFORMERS (12 Poles Across City!)
    // =============================================================
    const keSpots = [
      [-20, -50], [20, -50], [-50, -35], [50, -35],
      [-20, 50], [20, 50], [-50, 35], [50, 35],
      [-65, 0], [65, 0], [0, -35], [0, 35]
    ];
    keSpots.forEach((spot, idx) => {
      const ke = KarachiModels.createKElectricTransformer();
      ke.position.set(spot[0], 0, spot[1]);
      this.registerEdible(ke, 2, 750, `K-Electric Kunda #${idx + 2}`, 2.5, { isBadGuy: true, evilType: 'ke' });
    });

    // =============================================================
    // 7c. CHINA CUTTING LAND GRABBER MAFIA (12 Syndicates on Footpaths!)
    // =============================================================
    const chinaSpots = [
      [-35, -15], [35, -15], [-45, 20], [45, 20],
      [-15, -40], [15, -40], [-15, 40], [15, 40],
      [-60, -25], [60, -25], [-25, -60], [25, 60]
    ];
    chinaSpots.forEach((spot, idx) => {
      const china = KarachiModels.createChinaCuttingMafia();
      china.position.set(spot[0], 0, spot[1]);
      this.registerEdible(china, 1, 650, `China Cutting Mafia #${idx + 2}`, 1.5, { isBadGuy: true, evilType: 'chinacutting' });
    });

    // =============================================================
    // 7d. BHATTA / PARCHI EXTORTION MAFIA (10 Gangsters in Markets!)
    // =============================================================
    const bhattaSpots = [
      [-40, -10], [40, -10], [-30, 20], [30, 20],
      [-25, -35], [25, -35], [-25, 45], [25, 45],
      [10, -25], [-10, 25]
    ];
    bhattaSpots.forEach((spot, idx) => {
      const bhatta = KarachiModels.createBhattaParchiMafia();
      bhatta.position.set(spot[0], 0, spot[1]);
      this.registerEdible(bhatta, 1, 700, `Bhatta Mafia #${idx + 2}`, 1.5, { isBadGuy: true, evilType: 'bhatta' });
    });

    // =============================================================
    // 7e. RECKLESS ONE-WHEELING RACERS (12 Racers Zooming Streets!)
    // =============================================================
    const racerSpots = [
      [-10, -25], [10, -25], [-35, -55], [35, -55],
      [-10, 35], [10, 35], [-35, 55], [35, 55],
      [-5, 60], [5, -60], [-55, 10], [55, -10]
    ];
    racerSpots.forEach((spot, idx) => {
      const racer = KarachiModels.createOneWheelerRacer();
      racer.position.set(spot[0], 0, spot[1]);
      this.registerEdible(racer, 1, 500, `One-Wheeler Racer #${idx + 2}`, 1.8, { isBadGuy: true, evilType: 'onewheeler' });
    });

    // =============================================================
    // 8. FOUR DEDICATED CORNER ACTION CLUSTERS (NW, NE, SW, SE)
    // Ensures every single corner is bursting with bad guys, civic evils, and rewards!
    // =============================================================
    // --- NW Corner: Saddar Clock Tower Plaza (around x: -88, z: -88) ---
    const nwGutka = KarachiModels.createGutkaPeddler();
    nwGutka.position.set(-86, 0, -86);
    this.registerEdible(nwGutka, 1, 400, "Saddar Gutka Peddler", 1.5, { isBadGuy: true, evilType: 'gutka' });

    this.addWaterTankerScene(-88, -82);
    this.addRobberyScene(-82, -88);

    const nwRacer = KarachiModels.createOneWheelerRacer();
    nwRacer.position.set(-84, 0, -84);
    this.registerEdible(nwRacer, 1, 500, "Saddar One-Wheeler Racer", 1.8, { isBadGuy: true, evilType: 'onewheeler' });

    const nwPot1 = KarachiModels.createBrokenRoadPatch();
    nwPot1.position.set(-87, 0, -85);
    this.registerEdible(nwPot1, 1, 80, "Saddar Broken Pipeline Khadda", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 14; i++) {
      const bag = KarachiModels.createTrashBag(trashColors[i % trashColors.length]);
      bag.position.set(-90 + Math.random() * 10, 0, -90 + Math.random() * 10);
      this.registerEdible(bag, 1, 25, "Saddar Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- NE Corner: Chundrigar Billboard Plaza (around x: 88, z: -88) ---
    const nePol1 = KarachiModels.createPolitician({ name: "Senator Farooq", quote: "Offshore bank account freeze na karo!" });
    nePol1.position.set(86, 0, -86);
    this.registerEdible(nePol1, 1, 650, "Senator Farooq", 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });

    const neBhatta = KarachiModels.createBhattaParchiMafia();
    neBhatta.position.set(84, 0, -88);
    this.registerEdible(neBhatta, 1, 700, "Chundrigar Bhatta Gangster", 1.5, { isBadGuy: true, evilType: 'bhatta' });

    this.addVIPTrafficJamScene(82, -84, -Math.PI / 2);

    const neKe = KarachiModels.createKElectricTransformer();
    neKe.position.set(88, 0, -82);
    this.registerEdible(neKe, 2, 750, "Chundrigar Sparking Kunda", 2.5, { isBadGuy: true, evilType: 'ke' });

    const nePot1 = KarachiModels.createBrokenRoadPatch();
    nePot1.position.set(85, 0, -89);
    this.registerEdible(nePot1, 1, 80, "Chundrigar Pothole", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 14; i++) {
      const can = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      can.position.set(82 + Math.random() * 10, 0, -90 + Math.random() * 10);
      this.registerEdible(can, 1, 15, "Corporate Cans Debris", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- SW Corner: Manora Coastal Water Bay (around x: -88, z: 88) ---
    const swChina = KarachiModels.createChinaCuttingMafia();
    swChina.position.set(-86, 0, 86);
    this.registerEdible(swChina, 1, 650, "Manora Beach Land Grabber", 1.5, { isBadGuy: true, evilType: 'chinacutting' });

    this.addRobberyScene(-88, 82);
    this.addWaterTankerScene(-82, 88);

    const swPot = KarachiModels.createBrokenRoadPatch();
    swPot.position.set(-85, 0, 84);
    this.registerEdible(swPot, 1, 80, "Beach Causeway Pothole", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 14; i++) {
      const bag = KarachiModels.createTrashBag(trashColors[i % trashColors.length]);
      bag.position.set(-90 + Math.random() * 10, 0, 82 + Math.random() * 10);
      this.registerEdible(bag, 1, 25, "Coastal Plastic Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- SE Corner: Do Darya Arabian Sea Waterfront Pier (around x: 88, z: 88) ---
    this.addVIPTrafficJamScene(88, 82, Math.PI);

    const sePol = KarachiModels.createPolitician({ name: "Advisor Khurshid", quote: "Do Darya ka fish dinner shandaar hai!" });
    sePol.position.set(84, 0, 86);
    this.registerEdible(sePol, 1, 650, "Advisor Khurshid", 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });

    const seBhatta = KarachiModels.createBhattaParchiMafia();
    seBhatta.position.set(82, 0, 88);
    this.registerEdible(seBhatta, 1, 700, "Do Darya Parchi Collector", 1.5, { isBadGuy: true, evilType: 'bhatta' });

    const seDump = KarachiModels.createKachraDump();
    seDump.position.set(86, 0, 84);
    this.registerEdible(seDump, 1, 100, "Do Darya Kachra Kundi", 1.8, { isRubbish: true, isBadGuy: true, evilType: 'trash' });

    for (let i = 0; i < 14; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      item.position.set(82 + Math.random() * 10, 0, 82 + Math.random() * 10);
      this.registerEdible(item, 1, 15, "Do Darya Seaside Litter", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 9. GENERAL RUBBISH, GARBAGE BAGS & KACHRA DUMPS (Strictly within [-88, 88])
    // =============================================================
    for (let i = 0; i < 24; i++) {
      const dump = KarachiModels.createKachraDump();
      const dx = (Math.random() - 0.5) * 175;
      const dz = (Math.random() - 0.5) * 175;
      dump.position.set(dx, 0, dz);
      dump.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dump, 1, 100, "Kachra Kundi Heap", 1.8, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 110; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      const bx = (Math.random() - 0.5) * 176;
      const bz = (Math.random() - 0.5) * 176;
      bag.position.set(bx, 0, bz);
      this.registerEdible(bag, 1, 25, "Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 90; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      const ix = (Math.random() - 0.5) * 176;
      const iz = (Math.random() - 0.5) * 176;
      item.position.set(ix, 0, iz);
      this.registerEdible(item, 1, 15, "Street Debris", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 10. ANIMALS (Stray Dogs, Cats, Sewer Rats within [-88, 88])
    // =============================================================
    for (let i = 0; i < 28; i++) {
      const dog = KarachiModels.createStrayDog();
      const x = (Math.random() - 0.5) * 175;
      const z = (Math.random() - 0.5) * 175;
      dog.position.set(x, 0, z);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true, isBadGuy: false });
    }

    for (let i = 0; i < 24; i++) {
      const cat = KarachiModels.createStreetCat();
      const x = (Math.random() - 0.5) * 175;
      const z = (Math.random() - 0.5) * 175;
      cat.position.set(x, 0, z);
      cat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(cat, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true, isBadGuy: false });
    }

    for (let i = 0; i < 40; i++) {
      const rat = KarachiModels.createSewerRat();
      const x = (Math.random() - 0.5) * 175;
      const z = (Math.random() - 0.5) * 175;
      rat.position.set(x, 0, z);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 11. LANDMARKS & BIGGER DISTRICT OBJECTS (Safely Positioned in Background!)
    // =============================================================
    // Mazar-e-Quaid: Northern backdrop at z = -115 right behind Bab-e-Karachi gate
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, -115);
    this.registerEdible(mazar, 5, 3000, "Mazar-e-Quaid", 14.0, { isBuilding: true, isBadGuy: false });

    // Empress Market in northwestern district
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-48, 0, -48);
    this.registerEdible(empress, 4, 1500, "Empress Market Saddar", 10.0, { isBuilding: true, isBadGuy: false });

    // Chundrigar Skyscrapers in northeastern district
    const towerCoords = [[48, -48], [72, -48], [48, -72], [72, -72]];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2200, `Chundrigar Tower #${idx + 1}`, 7.5, { isBuilding: true, isBadGuy: false });
    });

    // Commercial Plazas on outer avenue blocks
    const plazas = [
      { pos: [48, -20], name: "Habib Bank Plaza", sign: "HABIB BANK PLAZA", sub: "HEAD OFFICE KARACHI" },
      { pos: [48, 48], name: "Kababjees Commercial", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [-48, -20], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-48, 48], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5, { isBuilding: true, isBadGuy: false });
    });

    // Clifton Villas in southeast residential quadrant
    for (let bx = 32; bx <= 76; bx += 15) {
      for (let bz = 32; bz <= 76; bz += 15) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 380, "Clifton Villa", 5.0, { isBuilding: true, isBadGuy: false });
      }
    }

    // 14 Truck-Art Bedford Trucks & 10 W-11 Mini-Buses (Karachi Transport Heritage)
    const truckPositions = [
      [-75, 0, -20], [-75, 0, 30], [0, 0, -75], [0, 0, 75],
      [75, 0, 20], [75, 0, -30], [-25, 0, 75], [35, 0, 75],
      [-48, 0, 0], [48, 0, 0], [0, 0, 48], [0, 0, -48],
      [-75, 0, 60], [75, 0, 60]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(...tp);
      truck.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(truck, 3, 260, `Truck-Art Bedford #${idx + 1}`, 3.5, { isTransport: true, isBadGuy: false });
    });

    const busPositions = [
      [-90, 0, -48], [-90, 0, 48], [90, 0, -48], [90, 0, 48],
      [-48, 0, -90], [48, 0, 90], [-20, 0, 90], [20, 0, -90],
      [-48, 0, 48], [48, 0, -48]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(...bp);
      bus.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(bus, 3, 210, `W-11 Mini-Bus #${idx + 1}`, 3.4, { isTransport: true, isBadGuy: false });
    });

    // 45 Auto-Rickshaws
    for (let i = 0; i < 45; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const rx = (Math.random() - 0.5) * 175;
      const rz = (Math.random() - 0.5) * 175;
      rickshaw.position.set(rx, 0, rz);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8, { isTransport: true, isBadGuy: false });
    }

    // 55 CD-70 Bikes
    for (let i = 0; i < 55; i++) {
      const bike = KarachiModels.createMotorbike();
      const bx = (Math.random() - 0.5) * 175;
      const bz = (Math.random() - 0.5) * 175;
      bike.position.set(bx, 0, bz);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1, { isTransport: true, isBadGuy: false });
    }

    // 45 Pedestrians (Innocent Karachi Citizens)
    for (let i = 0; i < 45; i++) {
      const ped = KarachiModels.createPedestrian();
      const px = (Math.random() - 0.5) * 175;
      const pz = (Math.random() - 0.5) * 175;
      ped.position.set(px, 0, pz);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 30, "Citizen", 0.65, { isCitizen: true, isBadGuy: false });
    }

    // Street Lamps along North-South Avenues
    [-90, -42, 42, 90].forEach(rx => {
      for (let rz = -88; rz <= 88; rz += 22) {
        const lamp = KarachiModels.createStreetLamp();
        lamp.position.set(rx, 0, rz);
        this.registerEdible(lamp, 1, 35, "Street Lamp", 0.9, { isBadGuy: false });
      }
    });

    // Coastal Coconut Palm Trees along Clifton Beach Promenade (z = 91, meeting the sea)
    for (let px = -85; px <= 85; px += 7.5) {
      const palm = KarachiModels.createPalmTree(7.5 + Math.random() * 2);
      palm.position.set(px, 0, 91);
      this.registerEdible(palm, 2, 70, "Clifton Seawall Palm", 1.8, { isBadGuy: false });
    }
  }
}
