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
    this.mapSize = 240; // 240m x 240m map
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
      citizens: this.citizens
    };
  }

  createGround() {
    // 1. Expansive Vast Ground Foundation (1200m x 1200m) - eliminates empty voids/cut-offs!
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0xbdb39a // Warm coastal Karachi sand/dust earth tone
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Active Playable District Plaza Base (148m x 148m, centered at x: 0, z: 0)
    // Dark urban pavement underneath roads and blocks so the devour area is crisp and rich
    const plazaGeo = new THREE.PlaneGeometry(148, 148);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshLambertMaterial({
      color: 0x242830 // Deep urban asphalt tone
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = -0.01;
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // 3. Vast Arabian Sea Water Plane (1200m x 600m south of the Clifton seawall at z = 74)
    const seaGeo = new THREE.PlaneGeometry(1200, 600);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x006688,
      roughness: 0.15,
      metalness: 0.55
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, -0.35, 374); // Extends from z = 74 to z = 674 seamlessly into horizon fog!
    this.scene.add(sea);
  }

  createRoadNetwork() {
    // High-definition crisp asphalt texture with storm sewer grates and yellow/white lane stripes
    const roadTexture = TextureGenerator.createCrispRoadTexture();
    const roadMat = new THREE.MeshLambertMaterial({
      map: roadTexture
    });

    const roadWidth = 14;
    const roadGrid = [-70, 0, 70]; // Main 3x3 arterial avenues forming the district grid and outer loop
    const districtLength = 144; // Roads span cleanly from -72 to +72 inside the perimeter boundaries

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
    // 1. FOUR ICONIC CORNER ANCHORS (NW, NE, SW, SE)
    // =============================================================
    // North-West Corner: Saddar Victorian Clock Tower
    const saddarClock = KarachiModels.createSaddarClockTower();
    saddarClock.position.set(-70, 0, -70);
    this.registerEdible(saddarClock, 5, 2500, "Saddar Clock Tower", 8.0, { isBuilding: true, isBadGuy: false });

    // North-East Corner: Chundrigar Illuminated Billboard Tower
    const chundrigarBB = KarachiModels.createChundrigarBillboardTower();
    chundrigarBB.position.set(70, 0, -70);
    this.registerEdible(chundrigarBB, 5, 2500, "Chundrigar Billboard Tower", 8.0, { isBuilding: true, isBadGuy: false });

    // South-West Corner: Clifton Marine Lighthouse
    const lighthouse = KarachiModels.createCliftonLighthouse();
    lighthouse.position.set(-70, 0, 70);
    this.registerEdible(lighthouse, 5, 2500, "Clifton Marine Lighthouse", 8.0, { isBuilding: true, isBadGuy: false });

    // South-East Corner: Do Darya Coastal Pavilion Pier
    const doDarya = KarachiModels.createDoDaryaPavilion();
    doDarya.position.set(70, 0, 70);
    this.registerEdible(doDarya, 5, 2500, "Do Darya Coastal Pavilion", 8.0, { isBuilding: true, isBadGuy: false });

    // =============================================================
    // 2. SOUTH BOUNDARY: Clifton Seawall overlooking Arabian Sea (z = 74)
    // =============================================================
    for (let x = -58; x <= 58; x += 23.5) {
      const seawall = KarachiModels.createSeawallSegment(24);
      seawall.position.set(x, 0, 74);
      this.scene.add(seawall);
    }

    // =============================================================
    // 3. NORTH BOUNDARY: Marble Balustrade Wall & Bab-e-Karachi Arch (z = -74)
    // =============================================================
    for (let x = -60; x <= 60; x += 15) {
      if (Math.abs(x) < 8) {
        // Grand Central Portal Arch at x = 0 ("BAB-E-KARACHI")
        const gateGroup = new THREE.Group();
        gateGroup.position.set(0, 0, -74);

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
        wall.position.set(x, 1.1, -74);
        wall.receiveShadow = true;
        this.scene.add(wall);

        // Decorative Marble Pillars
        const col = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.6), KarachiModels.materials.sandstone);
        col.position.set(x + 7.0, 1.4, -74);
        this.scene.add(col);
      }
    }

    // =============================================================
    // 4. EAST BOUNDARY: KMC Concrete Hazard Barriers with flashing amber strobes (x = 74)
    // =============================================================
    for (let z = -62; z <= 62; z += 3.5) {
      const barrier = KarachiModels.createKMCBarrier();
      barrier.position.set(74, 0, z);
      barrier.rotation.y = Math.PI / 2;
      this.scene.add(barrier);
    }

    // =============================================================
    // 5. WEST BOUNDARY: Saddar Colonial Heritage Red-Brick Wall (x = -74)
    // =============================================================
    for (let z = -60; z <= 60; z += 12) {
      const wallGeo = new THREE.BoxGeometry(1.2, 2.4, 11.0);
      const wall = new THREE.Mesh(wallGeo, KarachiModels.materials.redBrick);
      wall.position.set(-74, 1.2, z);
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Iron pillar
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.2, 8), KarachiModels.materials.curbBlack);
      pil.position.set(-74, 1.6, z + 5.5);
      this.scene.add(pil);
    }
  }

  createDistantCitySkyline() {
    // 1. Distant Urban Silhouette Buildings outside North, East, and West boundaries (radius 85m to 160m)
    const facadeMaterials = [
      new THREE.MeshLambertMaterial({ color: 0x8d7b68 }), // Warm sandstone
      new THREE.MeshLambertMaterial({ color: 0x546e7a }), // Modern slate
      new THREE.MeshLambertMaterial({ color: 0x795548 }), // Weathered red brick
      new THREE.MeshLambertMaterial({ color: 0xa1887f }), // Karachi dust concrete
      new THREE.MeshLambertMaterial({ color: 0x37474f })  // Tinted glass
    ];

    const buildingCount = 65;
    for (let i = 0; i < buildingCount; i++) {
      // Angle around perimeter, avoiding pure south which is the open Arabian Sea
      const angle = (i / buildingCount) * Math.PI * 2;
      
      // If facing south (angle roughly between 0.32*PI and 0.68*PI), skip skyscrapers to keep coastal sea horizon open
      const isSouthSea = angle > Math.PI * 0.32 && angle < Math.PI * 0.68;
      if (isSouthSea) continue;

      const dist = 90 + (Math.sin(i * 13) * 0.5 + 0.5) * 65;
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;

      const w = 12 + ((i * 7) % 14);
      const d = 12 + ((i * 11) % 14);
      const h = 25 + ((i * 17) % 65); // Heights up to 90m in distant backdrop!

      const mat = facadeMaterials[i % facadeMaterials.length];
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      bMesh.position.set(bx, h / 2, bz);
      this.scene.add(bMesh);

      // Rooftop antenna / beacon on taller buildings
      if (h > 45) {
        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.35, 12, 6),
          new THREE.MeshBasicMaterial({ color: 0xe53935 })
        );
        antenna.position.set(bx, h + 6, bz);
        this.scene.add(antenna);
      }
    }

    // 2. Distant Arabian Sea Cargo Vessels / Container Ships on the South Horizon (z = 150 to 280)
    const shipConfigs = [
      { x: -140, z: 160, rot: 0.15, scale: 1.4 },
      { x: -50, z: 210, rot: -0.2, scale: 1.8 },
      { x: 45, z: 175, rot: 0.1, scale: 1.3 },
      { x: 130, z: 230, rot: -0.3, scale: 1.6 },
      { x: 0, z: 270, rot: 0.05, scale: 2.0 }
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

    // Street Robbery Scene right near start
    const rob1 = KarachiModels.createRobberyScene();
    rob1.position.set(6.5, 0, -8.0);
    this.registerEdible(rob1, 1, 750, "Mobile Snatcher Scene (ڈاکو)", 2.4, { isRobbery: true, isBadGuy: true, evilType: 'robber' });

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

    // Speeding VIP Protocol SUV
    const vip1 = KarachiModels.createSpeedingVIPConvoy();
    vip1.position.set(-8, 0, -14);
    this.registerEdible(vip1, 3, 850, "VIP Protocol Escort", 3.2, { isBadGuy: true, evilType: 'vip' });

    // Water Tanker Mafia Truck
    const tanker1 = KarachiModels.createWaterTankerMafia();
    tanker1.position.set(8, 0, -16);
    this.registerEdible(tanker1, 3, 900, "Water Tanker Mafia", 3.4, { isBadGuy: true, evilType: 'tanker' });

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
    const tankerSpots = [
      [-30, -35], [35, -35], [-45, -60], [45, -60],
      [-25, 25], [30, 25], [-45, 50], [45, 50], [0, 45], [0, -45]
    ];
    tankerSpots.forEach((spot, idx) => {
      const tanker = KarachiModels.createWaterTankerMafia();
      tanker.position.set(spot[0], 0, spot[1]);
      tanker.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(tanker, 3, 900, `Water Tanker Mafia #${idx + 2}`, 3.4, { isBadGuy: true, evilType: 'tanker' });
    });

    // =============================================================
    // 2. SPEEDING VIP PROTOCOL ESCORTS (10 Convoys Across City!)
    // =============================================================
    const vipSpots = [
      [-20, -25], [20, -25], [-35, -45], [35, -45],
      [-20, 35], [20, 35], [-35, 60], [35, 60], [10, 65], [-10, -65]
    ];
    vipSpots.forEach((spot, idx) => {
      const vip = KarachiModels.createSpeedingVIPConvoy();
      vip.position.set(spot[0], 0, spot[1]);
      vip.rotation.y = idx % 2 === 0 ? Math.PI : 0;
      this.registerEdible(vip, 3, 850, `VIP Protocol Escort #${idx + 2}`, 3.2, { isBadGuy: true, evilType: 'vip' });
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
    // 5. KARACHI STREET ROBBERY SCENES (10 Robbery Scenes!)
    // =============================================================
    const robberySpots = [
      [-35, -20], [-45, -45], [30, -25], [45, -45],
      [-30, 30], [-55, 50], [25, 30], [50, 45],
      [-15, -55], [15, 55]
    ];
    robberySpots.forEach((spot, idx) => {
      const robScene = KarachiModels.createRobberyScene();
      robScene.position.set(spot[0], 0, spot[1]);
      robScene.rotation.y = (Math.random() - 0.5) * 0.8;
      this.registerEdible(robScene, 1, 750, `Mobile Snatcher #${idx + 2}`, 2.4, { isRobbery: true, isBadGuy: true, evilType: 'robber' });
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
    // --- NW Corner: Saddar Clock Tower Plaza (around x: -65, z: -65) ---
    const nwGutka = KarachiModels.createGutkaPeddler();
    nwGutka.position.set(-62, 0, -62);
    this.registerEdible(nwGutka, 1, 400, "Saddar Gutka Peddler", 1.5, { isBadGuy: true, evilType: 'gutka' });

    const nwTanker = KarachiModels.createWaterTankerMafia();
    nwTanker.position.set(-65, 0, -58);
    this.registerEdible(nwTanker, 3, 900, "Saddar Water Tanker Mafia", 3.4, { isBadGuy: true, evilType: 'tanker' });

    const nwRob = KarachiModels.createRobberyScene();
    nwRob.position.set(-58, 0, -64);
    this.registerEdible(nwRob, 1, 750, "Saddar Mobile Snatcher", 2.4, { isRobbery: true, isBadGuy: true, evilType: 'robber' });

    const nwRacer = KarachiModels.createOneWheelerRacer();
    nwRacer.position.set(-60, 0, -60);
    this.registerEdible(nwRacer, 1, 500, "Saddar One-Wheeler Racer", 1.8, { isBadGuy: true, evilType: 'onewheeler' });

    const nwPot1 = KarachiModels.createBrokenRoadPatch();
    nwPot1.position.set(-64, 0, -62);
    this.registerEdible(nwPot1, 1, 80, "Saddar Broken Pipeline Khadda", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 12; i++) {
      const bag = KarachiModels.createTrashBag(trashColors[i % trashColors.length]);
      bag.position.set(-66 + Math.random() * 8, 0, -66 + Math.random() * 8);
      this.registerEdible(bag, 1, 25, "Saddar Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- NE Corner: Chundrigar Billboard Plaza (around x: 65, z: -65) ---
    const nePol1 = KarachiModels.createPolitician({ name: "Senator Farooq", quote: "Offshore bank account freeze na karo!" });
    nePol1.position.set(62, 0, -62);
    this.registerEdible(nePol1, 1, 650, "Senator Farooq", 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });

    const neBhatta = KarachiModels.createBhattaParchiMafia();
    neBhatta.position.set(60, 0, -64);
    this.registerEdible(neBhatta, 1, 700, "Chundrigar Bhatta Gangster", 1.5, { isBadGuy: true, evilType: 'bhatta' });

    const neVip = KarachiModels.createSpeedingVIPConvoy();
    neVip.position.set(58, 0, -60);
    this.registerEdible(neVip, 3, 850, "Chundrigar VIP Escort", 3.2, { isBadGuy: true, evilType: 'vip' });

    const neKe = KarachiModels.createKElectricTransformer();
    neKe.position.set(64, 0, -58);
    this.registerEdible(neKe, 2, 750, "Chundrigar Sparking Kunda", 2.5, { isBadGuy: true, evilType: 'ke' });

    const nePot1 = KarachiModels.createBrokenRoadPatch();
    nePot1.position.set(62, 0, -65);
    this.registerEdible(nePot1, 1, 80, "Chundrigar Pothole", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 12; i++) {
      const can = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      can.position.set(58 + Math.random() * 8, 0, -66 + Math.random() * 8);
      this.registerEdible(can, 1, 15, "Corporate Cans Debris", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- SW Corner: Clifton Lighthouse Coastal Plaza (around x: -65, z: 65) ---
    const swChina = KarachiModels.createChinaCuttingMafia();
    swChina.position.set(-62, 0, 62);
    this.registerEdible(swChina, 1, 650, "Clifton Land Grabber", 1.5, { isBadGuy: true, evilType: 'chinacutting' });

    const swRob = KarachiModels.createRobberyScene();
    swRob.position.set(-64, 0, 58);
    this.registerEdible(swRob, 1, 750, "Sea View Snatcher", 2.4, { isRobbery: true, isBadGuy: true, evilType: 'robber' });

    const swTanker = KarachiModels.createWaterTankerMafia();
    swTanker.position.set(-58, 0, 64);
    this.registerEdible(swTanker, 3, 900, "Coastal Water Tanker", 3.4, { isBadGuy: true, evilType: 'tanker' });

    const swPot = KarachiModels.createBrokenRoadPatch();
    swPot.position.set(-60, 0, 60);
    this.registerEdible(swPot, 1, 80, "Seawall Pothole", 1.4, { isBadGuy: true, evilType: 'pothole' });

    for (let i = 0; i < 12; i++) {
      const bag = KarachiModels.createTrashBag(trashColors[i % trashColors.length]);
      bag.position.set(-66 + Math.random() * 8, 0, 58 + Math.random() * 8);
      this.registerEdible(bag, 1, 25, "Coastal Plastic Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // --- SE Corner: Do Darya Pavilion Coastal Plaza (around x: 65, z: 65) ---
    const seVip = KarachiModels.createSpeedingVIPConvoy();
    seVip.position.set(65, 0, 58);
    this.registerEdible(seVip, 3, 850, "Do Darya VIP Protocol", 3.2, { isBadGuy: true, evilType: 'vip' });

    const sePol = KarachiModels.createPolitician({ name: "Advisor Khurshid", quote: "Do Darya ka fish dinner shandaar hai!" });
    sePol.position.set(60, 0, 62);
    this.registerEdible(sePol, 1, 650, "Advisor Khurshid", 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician' });

    const seBhatta = KarachiModels.createBhattaParchiMafia();
    seBhatta.position.set(58, 0, 64);
    this.registerEdible(seBhatta, 1, 700, "Do Darya Parchi Collector", 1.5, { isBadGuy: true, evilType: 'bhatta' });

    const seDump = KarachiModels.createKachraDump();
    seDump.position.set(62, 0, 60);
    this.registerEdible(seDump, 1, 100, "Do Darya Kachra Kundi", 1.8, { isRubbish: true, isBadGuy: true, evilType: 'trash' });

    for (let i = 0; i < 12; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      item.position.set(58 + Math.random() * 8, 0, 58 + Math.random() * 8);
      this.registerEdible(item, 1, 15, "Do Darya Litter", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 9. GENERAL RUBBISH, GARBAGE BAGS & KACHRA DUMPS (Strictly within [-62, 62])
    // =============================================================
    for (let i = 0; i < 16; i++) {
      const dump = KarachiModels.createKachraDump();
      const dx = (Math.random() - 0.5) * 120;
      const dz = (Math.random() - 0.5) * 120;
      dump.position.set(dx, 0, dz);
      dump.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dump, 1, 100, "Kachra Kundi Heap", 1.8, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 90; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      const bx = (Math.random() - 0.5) * 122;
      const bz = (Math.random() - 0.5) * 122;
      bag.position.set(bx, 0, bz);
      this.registerEdible(bag, 1, 25, "Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 70; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      const ix = (Math.random() - 0.5) * 122;
      const iz = (Math.random() - 0.5) * 122;
      item.position.set(ix, 0, iz);
      this.registerEdible(item, 1, 15, "Street Debris", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 10. ANIMALS (Stray Dogs, Cats, Sewer Rats within [-62, 62])
    // =============================================================
    for (let i = 0; i < 22; i++) {
      const dog = KarachiModels.createStrayDog();
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      dog.position.set(x, 0, z);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true, isBadGuy: false });
    }

    for (let i = 0; i < 18; i++) {
      const cat = KarachiModels.createStreetCat();
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      cat.position.set(x, 0, z);
      cat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(cat, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true, isBadGuy: false });
    }

    for (let i = 0; i < 30; i++) {
      const rat = KarachiModels.createSewerRat();
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      rat.position.set(x, 0, z);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 11. LANDMARKS & BIGGER DISTRICT OBJECTS (Safely Positioned in Background!)
    // =============================================================
    // Mazar-e-Quaid: Positioned in northern backdrop at z = -85 right behind Bab-e-Karachi gate
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, -85);
    this.registerEdible(mazar, 5, 3000, "Mazar-e-Quaid", 14.0, { isBuilding: true, isBadGuy: false });

    // Empress Market in northwestern district
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-52, 0, -52);
    this.registerEdible(empress, 4, 1500, "Empress Market Saddar", 10.0, { isBuilding: true, isBadGuy: false });

    // Chundrigar Skyscrapers in northeastern district
    const towerCoords = [[52, -52], [66, -52], [52, -66]];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2200, `Chundrigar Tower #${idx + 1}`, 7.5, { isBuilding: true, isBadGuy: false });
    });

    // Commercial Plazas on outer avenue blocks
    const plazas = [
      { pos: [52, -20], name: "Habib Bank Plaza", sign: "HABIB BANK PLAZA", sub: "HEAD OFFICE KARACHI" },
      { pos: [52, 25], name: "Kababjees Commercial", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [-52, -20], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-52, 25], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5, { isBuilding: true, isBadGuy: false });
    });

    // Clifton Villas in southeast residential quadrant
    for (let bx = 30; bx <= 54; bx += 14) {
      for (let bz = 30; bz <= 54; bz += 14) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 380, "Clifton Villa", 5.0, { isBuilding: true, isBadGuy: false });
      }
    }

    // 12 Truck-Art Bedford Trucks & 8 W-11 Mini-Buses (Karachi Transport Heritage)
    const truckPositions = [
      [-65, 0, -10], [-65, 0, 20], [0, 0, -65], [0, 0, 65],
      [65, 0, 15], [65, 0, -25], [-20, 0, 65], [30, 0, 65],
      [-45, 0, 0], [45, 0, 0], [0, 0, 45], [0, 0, -45]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(...tp);
      truck.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(truck, 3, 260, `Truck-Art Bedford #${idx + 1}`, 3.5, { isTransport: true, isBadGuy: false });
    });

    const busPositions = [
      [-68, 0, -40], [-68, 0, 35], [68, 0, -35], [68, 0, 40],
      [-35, 0, -68], [35, 0, 68], [-15, 0, 68], [15, 0, -68]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(...bp);
      bus.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(bus, 3, 210, `W-11 Mini-Bus #${idx + 1}`, 3.4, { isTransport: true, isBadGuy: false });
    });

    // 35 Auto-Rickshaws
    for (let i = 0; i < 35; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const rx = (Math.random() - 0.5) * 120;
      const rz = (Math.random() - 0.5) * 120;
      rickshaw.position.set(rx, 0, rz);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8, { isTransport: true, isBadGuy: false });
    }

    // 45 CD-70 Bikes
    for (let i = 0; i < 45; i++) {
      const bike = KarachiModels.createMotorbike();
      const bx = (Math.random() - 0.5) * 120;
      const bz = (Math.random() - 0.5) * 120;
      bike.position.set(bx, 0, bz);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1, { isTransport: true, isBadGuy: false });
    }

    // 35 Pedestrians (Innocent Karachi Citizens)
    for (let i = 0; i < 35; i++) {
      const ped = KarachiModels.createPedestrian();
      const px = (Math.random() - 0.5) * 120;
      const pz = (Math.random() - 0.5) * 120;
      ped.position.set(px, 0, pz);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 30, "Citizen", 0.65, { isCitizen: true, isBadGuy: false });
    }

    // Street Lamps along North-South Avenues
    [-63, -3, 3, 63].forEach(rx => {
      for (let rz = -65; rz <= 65; rz += 22) {
        const lamp = KarachiModels.createStreetLamp();
        lamp.position.set(rx, 0, rz);
        this.registerEdible(lamp, 1, 35, "Street Lamp", 0.9, { isBadGuy: false });
      }
    });

    // Coastal Palm Trees along Clifton Seawall Promenade (z = 70.5, right before the seawall at z = 74)
    for (let px = -65; px <= 65; px += 7.5) {
      const palm = KarachiModels.createPalmTree(7.5 + Math.random() * 2);
      palm.position.set(px, 0, 70.5);
      this.registerEdible(palm, 2, 70, "Clifton Seawall Palm", 1.8, { isBadGuy: false });
    }
  }
}
