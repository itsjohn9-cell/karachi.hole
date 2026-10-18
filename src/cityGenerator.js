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
    this.keyCitizens = [];
    this.coastalBays = [];
    this.interactiveVictims = [];
    this.interactiveTraffic = [];
    this.interactiveResidents = [];
    this.obstacles = [];
    this.beacons = [];
    this.staticMeshes = [];
    this.mapSize = 320; // Expanded Karachi Metropolis Map
  }

  generateCity() {
    this.createGround();
    this.createRoadNetwork();
    this.createPerimeterBoundaries();
    this.createDistantCitySkyline();
    this.populateZones();
    this.spawnKeyCitizens();
    return {
      edibleObjects: this.edibleObjects,
      politicians: this.politicians,
      animals: this.animals,
      robberies: this.robberies,
      badGuys: this.badGuys,
      foodStalls: this.foodStalls,
      buildings: this.buildings,
      citizens: this.citizens,
      keyCitizens: this.keyCitizens,
      coastalBays: this.coastalBays,
      interactiveVictims: this.interactiveVictims,
      interactiveTraffic: this.interactiveTraffic,
      interactiveResidents: this.interactiveResidents,
      obstacles: this.obstacles,
      currentDistrictEvils: this.currentDistrictEvils || []
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
    this.groundMat = groundMat;
    this.ground = ground;
    this.plazaMat = plazaMat;
    this.plaza = plaza;
    this.beach = beach;
  }

  applyCityTheme(districtLevel = 1) {
    if (!this.groundMat || !this.plazaMat) return;
    if (districtLevel <= 3) {
      // Karachi (DHA, Lyari, Saddar): Coastal warmth, Arabian Sea
      this.groundMat.color.setHex(0xbdb39a);
      this.plazaMat.color.setHex(0x242830);
      if (this.beach) this.beach.visible = true;
      if (this.seaMesh) this.seaMesh.visible = true;
      if (this.scene.fog) this.scene.fog.color.setHex(0xd0d8e0);
    } else if (districtLevel === 4) {
      // Lahore (Androon & Canal Bank): Lush Punjab green grass, warm evening sky
      this.groundMat.color.setHex(0x2e7d32);
      this.plazaMat.color.setHex(0x37474f);
      if (this.beach) this.beach.visible = false;
      if (this.seaMesh) this.seaMesh.visible = false;
      if (this.scene.fog) this.scene.fog.color.setHex(0xffcc80);
    } else if (districtLevel === 5) {
      // Islamabad (F-Sectors & Margalla): Emerald mountain green, clean dark asphalt
      this.groundMat.color.setHex(0x1b5e20);
      this.plazaMat.color.setHex(0x212121);
      if (this.beach) this.beach.visible = false;
      if (this.seaMesh) this.seaMesh.visible = false;
      if (this.scene.fog) this.scene.fog.color.setHex(0xb2dfdb);
    } else {
      // Quetta (Liaquat Bazaar & Hanna Valley): Rugged mountain sandstone valley
      this.groundMat.color.setHex(0xa1887f);
      this.plazaMat.color.setHex(0x3e2723);
      if (this.beach) this.beach.visible = false;
      if (this.seaMesh) this.seaMesh.visible = false;
      if (this.scene.fog) this.scene.fog.color.setHex(0x90caf9);
    }
  }

  createRoadNetwork() {
    // High-definition crisp asphalt texture with sharp lane markings
    const roadTexture = TextureGenerator.createCrispRoadTexture();
    const roadMat = new THREE.MeshLambertMaterial({
      map: roadTexture,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const roadWidth = 14;
    // 5x5 Arterial Avenue and Boulevard Network across 200m district
    const roadGrid = [-96, -48, 0, 48, 96];
    const districtLength = 200; // Roads span cleanly from -100 to +100 inside perimeter boundaries
    const blockCenters = [-72, -24, 24, 72]; // Center of blocks between avenues
    const blockLength = 34; // 48 - roadWidth (14) = 34m clean block span

    // 1. Continuous North-South Avenues (Elevation y = 0.02)
    roadGrid.forEach(x => {
      const roadGeo = new THREE.PlaneGeometry(roadWidth, districtLength);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(x, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // 2. Segmented East-West Boulevards (Between Avenues - Zero Z-fighting overlap!)
    roadGrid.forEach(z => {
      blockCenters.forEach(bx => {
        const segGeo = new THREE.PlaneGeometry(blockLength, roadWidth);
        segGeo.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(segGeo, roadMat);
        road.position.set(bx, 0.02, z);
        road.rotation.y = Math.PI / 2;
        road.receiveShadow = true;
        this.scene.add(road);
      });
    });

    // 3. Iconic Pakistani Yellow & Black Hazard Striped Curbs (Need for Speed / GTA style)
    const curbCanvas = document.createElement('canvas');
    curbCanvas.width = 64;
    curbCanvas.height = 32;
    const cctx = curbCanvas.getContext('2d');
    cctx.fillStyle = '#111111';
    cctx.fillRect(0, 0, 64, 32);
    cctx.fillStyle = '#ffca28'; // Vibrant Karachi curb hazard yellow
    cctx.fillRect(0, 0, 32, 32);
    const curbTex = new THREE.CanvasTexture(curbCanvas);
    curbTex.wrapS = THREE.RepeatWrapping;
    curbTex.wrapT = THREE.RepeatWrapping;
    curbTex.repeat.set(6, 1);
    const curbMat = new THREE.MeshStandardMaterial({ map: curbTex, roughness: 0.6 });

    // North-South curbs along block boundaries
    roadGrid.forEach(x => {
      blockCenters.forEach(bz => {
        const curbL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, blockLength), curbMat);
        curbL.position.set(x - roadWidth / 2 - 0.6, 0.12, bz);
        this.scene.add(curbL);

        const curbR = curbL.clone();
        curbR.position.x = x + roadWidth / 2 + 0.6;
        this.scene.add(curbR);
      });
    });

    // East-West curbs along block boundaries
    roadGrid.forEach(z => {
      blockCenters.forEach(bx => {
        const curbT = new THREE.Mesh(new THREE.BoxGeometry(blockLength, 0.24, 1.2), curbMat);
        curbT.position.set(bx, 0.12, z - roadWidth / 2 - 0.6);
        this.scene.add(curbT);

        const curbB = curbT.clone();
        curbB.position.z = z + roadWidth / 2 + 0.6;
        this.scene.add(curbB);
      });
    });

    // 4. Elevated 16 City Block Pedestrian Platforms (Paved Sidewalk level)
    const blockPlazaMat = new THREE.MeshLambertMaterial({ color: 0x333842, roughness: 0.85 });
    blockCenters.forEach(bx => {
      blockCenters.forEach(bz => {
        const plazaGeo = new THREE.PlaneGeometry(blockLength - 0.2, blockLength - 0.2);
        plazaGeo.rotateX(-Math.PI / 2);
        const bPlaza = new THREE.Mesh(plazaGeo, blockPlazaMat);
        bPlaza.position.set(bx, 0.028, bz);
        bPlaza.receiveShadow = true;
        this.scene.add(bPlaza);
      });
    });

    // 5. White Pedestrian Zebra Crossings at Major Intersections
    const zebraCanvas = document.createElement('canvas');
    zebraCanvas.width = 128;
    zebraCanvas.height = 64;
    const zctx = zebraCanvas.getContext('2d');
    zctx.fillStyle = '#22262e';
    zctx.fillRect(0, 0, 128, 64);
    zctx.fillStyle = '#f8fafc';
    for (let x = 6; x < 128; x += 18) {
      zctx.fillRect(x, 4, 10, 56);
    }
    const zebraTex = new THREE.CanvasTexture(zebraCanvas);
    zebraTex.wrapS = THREE.RepeatWrapping;
    zebraTex.wrapT = THREE.RepeatWrapping;
    const zebraMat = new THREE.MeshBasicMaterial({ map: zebraTex, transparent: true, opacity: 0.92 });

    roadGrid.forEach(rx => {
      roadGrid.forEach(rz => {
        // North Crosswalk
        const cwN = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 2.2), zebraMat);
        cwN.rotateX(-Math.PI / 2);
        cwN.position.set(rx, 0.024, rz - 8.2);
        this.scene.add(cwN);

        // South Crosswalk
        const cwS = cwN.clone();
        cwS.position.z = rz + 8.2;
        this.scene.add(cwS);

        // West Crosswalk
        const cwW = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 12.0), zebraMat);
        cwW.rotateX(-Math.PI / 2);
        cwW.position.set(rx - 8.2, 0.024, rz);
        this.scene.add(cwW);

        // East Crosswalk
        const cwE = cwW.clone();
        cwE.position.x = rx + 8.2;
        this.scene.add(cwE);
      });
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
    isDistrictEvil = false,
    isFoodStall = false,
    isBuilding = false,
    isCitizen = false,
    isPet = false,
    isTransport = false
  } = {}) {
    this.scene.add(mesh);
    const calculatedIsBadGuy = Boolean(!isCitizen && !isPet && !isFoodStall && !isBuilding && !isTransport && (isBadGuy || isPolitician || isRobbery || isRubbish || (evilType !== null)));
    const calculatedEvilType = calculatedIsBadGuy ? (evilType || (isPolitician ? 'politician' : isRobbery ? 'robber' : isRubbish ? 'trash' : null)) : null;

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
      isDistrictEvil: Boolean(isDistrictEvil || calculatedIsBadGuy),
      isFoodStall,
      isBuilding,
      isCitizen,
      isPet,
      isTransport
    };
    this.edibleObjects.push(item);
    if (isPolitician) this.politicians.push(item);
    if (isAnimal) this.animals.push(item);
    if (isRobbery) this.robberies.push(item);
    if (item.isBadGuy) this.badGuys.push(item);
    if (isFoodStall) {
      this.foodStalls.push(item);
      let obsData = { position: mesh.position, radius: 2.2, mesh };
      try {
        mesh.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(mesh);
        if (isFinite(bbox.min.x) && bbox.max.x > bbox.min.x) {
          obsData = {
            isBox: true,
            minX: bbox.min.x,
            maxX: bbox.max.x,
            minZ: bbox.min.z,
            maxZ: bbox.max.z,
            cx: (bbox.min.x + bbox.max.x) / 2,
            cz: (bbox.min.z + bbox.max.z) / 2,
            position: mesh.position,
            mesh
          };
        }
      } catch (e) {}
      this.obstacles.push(obsData);
    }
    if (isTransport || (item.isBadGuy && (item.evilType === 'tanker' || item.evilType === 'vip'))) {
      if (!this.transportVehicles) this.transportVehicles = [];
      this.transportVehicles.push(item);
      let obsData = { position: mesh.position, radius: Math.max(1.4, (radius || 1.8) * 0.9), mesh, item };
      try {
        mesh.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(mesh);
        if (isFinite(bbox.min.x) && bbox.max.x > bbox.min.x) {
          const hw = Math.max(0.6, (bbox.max.x - bbox.min.x) / 2);
          const hd = Math.max(0.6, (bbox.max.z - bbox.min.z) / 2);
          obsData = {
            isBox: true,
            minX: bbox.min.x,
            maxX: bbox.max.x,
            minZ: bbox.min.z,
            maxZ: bbox.max.z,
            cx: (bbox.min.x + bbox.max.x) / 2,
            cz: (bbox.min.z + bbox.max.z) / 2,
            halfW: hw,
            halfD: hd,
            position: mesh.position,
            mesh,
            item
          };
        }
      } catch (e) {}
      this.obstacles.push(obsData);
    }
    if (isBuilding) {
      this.buildings.push(item);
      let obsData = { position: mesh.position, radius: Math.max(3.5, (radius || 4.5) * 0.85), mesh, item };
      try {
        mesh.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(mesh);
        if (isFinite(bbox.min.x) && bbox.max.x > bbox.min.x && (bbox.max.x - bbox.min.x) >= 2.0) {
          const hw = (bbox.max.x - bbox.min.x) / 2;
          const hd = (bbox.max.z - bbox.min.z) / 2;
          obsData = {
            isBox: true,
            minX: bbox.min.x,
            maxX: bbox.max.x,
            minZ: bbox.min.z,
            maxZ: bbox.max.z,
            cx: (bbox.min.x + bbox.max.x) / 2,
            cz: (bbox.min.z + bbox.max.z) / 2,
            halfW: hw,
            halfD: hd,
            position: mesh.position,
            mesh,
            item
          };
        }
      } catch (e) {}
      if (!obsData.isBox) {
        const halfR = Math.max(3.5, (radius || 4.5) * 0.85);
        obsData = {
          isBox: true,
          minX: mesh.position.x - halfR,
          maxX: mesh.position.x + halfR,
          minZ: mesh.position.z - halfR,
          maxZ: mesh.position.z + halfR,
          cx: mesh.position.x,
          cz: mesh.position.z,
          halfW: halfR,
          halfD: halfR,
          position: mesh.position,
          mesh,
          item
        };
      }
      this.obstacles.push(obsData);
    }
    if (isCitizen) this.citizens.push(item);
    if (isPet) {
      if (!this.pets) this.pets = [];
      this.pets.push(item);
    }
    return item;
  }

  // 3D Glowing Waypoint Beacon attached overhead to mission targets
  addWaypointBeacon(mesh, icon = '🎯') {
    if (!mesh) return null;
    // If target already carries a rich target decal, skip duplicate overhead badge
    if (mesh.userData && mesh.userData.targetDecal) return null;

    const beaconGroup = new THREE.Group();
    beaconGroup.name = 'WaypointBeacon';

    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.beginPath();
    ctx.arc(48, 48, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 48, 52);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.position.y = 2.4;
    sprite.scale.set(0.9, 0.9, 1);
    beaconGroup.add(sprite);

    mesh.add(beaconGroup);
    mesh.userData.beacon = beaconGroup;
    this.beacons.push({ sprite, group: beaconGroup });
    return beaconGroup;
  }

  // Interactive Robbery Scene with Decoupled Target vs Rescued Citizen
  addRobberyScene(posX, posZ) {
    const { robberTarget, victimCitizen } = KarachiModels.createRobberyScene();
    robberTarget.position.set(posX, 0, posZ);
    victimCitizen.position.set(posX, 0, posZ + 2.2);
    this.scene.add(victimCitizen);
    this.interactiveVictims.push(victimCitizen);
    this.registerEdible(robberTarget, 1, 850, "Mobile Snatcher (ڈاکو)", 2.0, { isRobbery: true, isBadGuy: true, evilType: 'robber', isDistrictEvil: true });
    this.addWaypointBeacon(robberTarget, '📱');
  }

  // Interactive VIP Protocol Traffic Jam Scene with Stuck Commuters that get freed!
  addVIPTrafficJamScene(posX, posZ, rotY = 0) {
    const { vipTarget, stuckVehicles } = KarachiModels.createVIPTrafficJamScene();
    vipTarget.position.set(posX, 0, posZ);
    vipTarget.rotation.y = rotY;
    stuckVehicles.forEach(v => {
      const localPos = v.position.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      const vx = posX + localPos.x;
      const vz = posZ + localPos.z;
      v.position.set(vx, 0, vz);
      v.rotation.y = rotY;
      this.scene.add(v);
      this.interactiveTraffic.push(v);
      this.obstacles.push({
        position: { x: vx, y: 0, z: vz },
        radius: 2.2,
        mesh: v,
        isDynamic: true
      });
    });
    // Set to tier 1 so player can immediately interact and free the blocked ambulance!
    this.registerEdible(vipTarget, 1, 1600, "VIP Protocol Prado Convoy", 3.2, { isBadGuy: true, evilType: 'vip', isDistrictEvil: true });
    this.addWaypointBeacon(vipTarget, '🚑');
  }

  // Interactive Water Tanker Extortion Scene with Thirsty Karachi Residents & Dry Homes!
  addWaterTankerScene(posX, posZ) {
    const { tankerTarget, thirstyResidents, dryHomes, hoseGroup } = KarachiModels.createWaterTankerExtortionScene();
    tankerTarget.position.set(posX, 0, posZ);
    thirstyResidents.forEach(r => {
      const rx = posX + r.position.x;
      const rz = posZ + r.position.z;
      r.position.set(rx, 0, rz);
      this.scene.add(r);
      this.interactiveResidents.push(r);
    });

    if (dryHomes) {
      this.interactiveHomes = this.interactiveHomes || [];
      dryHomes.forEach(h => {
        const hx = posX + h.position.x;
        const hz = posZ + h.position.z;
        h.position.set(hx, 0, hz);
        this.scene.add(h);
        this.interactiveHomes.push(h);
        this.obstacles.push({
          isBox: true,
          minX: hx - 3.4,
          maxX: hx + 3.4,
          minZ: hz - 4.2,
          maxZ: hz + 4.2,
          cx: hx,
          cz: hz,
          mesh: h,
          isDynamic: true
        });
      });
    }

    // Set to tier 1 so player can immediately interact and restore water!
    this.registerEdible(tankerTarget, 1, 1400, "Water Tanker Mafia Truck", 3.0, { isBadGuy: true, evilType: 'tanker', isDistrictEvil: true });
    this.addWaypointBeacon(tankerTarget, '🚰');
  }

  // Curated District Level Generator
  populateDistrict(districtLevel = 1) {
    // 1. Purge previous dynamic district evils from scene and tracking arrays
    if (this.currentDistrictEvils) {
      this.currentDistrictEvils.forEach(obj => {
        if (obj && obj.mesh) {
          if (obj.mesh.parent) obj.mesh.parent.remove(obj.mesh);
          this.scene.remove(obj.mesh);
        }
        const idx = this.edibleObjects.indexOf(obj);
        if (idx !== -1) this.edibleObjects.splice(idx, 1);
      });
    }
    // Purge all old district evil references from badGuys array
    this.badGuys = (this.badGuys || []).filter(b => !b.isDistrictEvil);
    this.currentDistrictEvils = [];

    // Purge dynamic scene obstacles from previous district
    if (this.obstacles) {
      this.obstacles = this.obstacles.filter(obs => !obs.isDynamic);
    }

    // Clear previous interactive victims, traffic, homes, and residents if any
    if (this.interactiveVictims) {
      this.interactiveVictims.forEach(v => {
        if (v.parent) v.parent.remove(v);
      });
      this.interactiveVictims = [];
    }
    if (this.interactiveTraffic) {
      this.interactiveTraffic.forEach(v => {
        if (v.parent) v.parent.remove(v);
      });
      this.interactiveTraffic = [];
    }
    if (this.interactiveResidents) {
      this.interactiveResidents.forEach(v => {
        if (v.parent) v.parent.remove(v);
      });
      this.interactiveResidents = [];
    }
    if (this.interactiveHomes) {
      this.interactiveHomes.forEach(h => {
        if (h.parent) h.parent.remove(h);
      });
      this.interactiveHomes = [];
    }

    const trashColors = [0x1565c0, 0x212121, 0x43a047, 0xe53935];

    this.applyCityTheme(districtLevel);

    if (districtLevel === 1) {
      // =========================================================
      // DISTRICT 1: KARACHI - DHA & CLIFTON SEA VIEW (Level 1)
      // Rapid-Testing Streamlined Forward Corridor:
      // 1. Pothole #1 at 7m ahead
      // 2. Pothole #2 at 14m ahead (slight right)
      // 3. Mobile Snatcher at 21m ahead (slight left)
      // 4. Water Tanker Mafia at 29m ahead
      // =========================================================

      // Target 1: Pothole #1 (7m North of spawn)
      const pot1 = KarachiModels.createBrokenRoadPatch();
      pot1.position.set(0.0, 0, -7.0);
      this.registerEdible(pot1, 1, 80, "Road Pothole #1", 1.5, { isBadGuy: true, evilType: 'pothole', isDistrictEvil: true });
      this.addWaypointBeacon(pot1, '🕳️');

      // Target 2: Pothole #2 (14m North of spawn, right lane)
      const pot2 = KarachiModels.createBrokenRoadPatch();
      pot2.position.set(2.5, 0, -14.0);
      this.registerEdible(pot2, 1, 80, "Road Pothole #2", 1.5, { isBadGuy: true, evilType: 'pothole', isDistrictEvil: true });
      this.addWaypointBeacon(pot2, '🕳️');

      // Target 3: Mobile Snatcher (21m North of spawn, left lane)
      this.addRobberyScene(-2.5, -21.0);

      // Target 4: Water Tanker Mafia (29m North of spawn, center avenue)
      this.addWaterTankerScene(0.0, -29.0);
    } else if (districtLevel === 2) {
      // =========================================================
      // DISTRICT 2: KARACHI - LYARI (Level 2)
      // Focus: Bhatta Extortionists, Potholes, 70cc Racers, Snatchers
      // =========================================================
      const bhattaSpots = [[-8.5, -4.5], [8.5, 4.5], [-14.0, 18.0]];
      bhattaSpots.forEach(([bx, bz], idx) => {
        const bhatta = KarachiModels.createBhattaParchiMafia();
        bhatta.position.set(bx, 0, bz);
        this.registerEdible(bhatta, 1, 700, `Bhatta Mafia #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'bhatta', isDistrictEvil: true });
        this.addWaypointBeacon(bhatta, '📜');
      });

      const racerSpots = [[0, 8.5], [-18.0, 0], [18.0, -10.0]];
      racerSpots.forEach(([rx, rz], idx) => {
        const racer = KarachiModels.createOneWheelerRacer();
        racer.position.set(rx, 0, rz);
        this.registerEdible(racer, 1, 500, `Reckless Racer #${idx + 1}`, 1.8, { isBadGuy: true, evilType: 'onewheeler', isDistrictEvil: true });
        this.addWaypointBeacon(racer, '🏍️');
      });

      [[-10.0, -15.0], [12.0, 15.0]].forEach(([px, pz]) => {
        const pot = KarachiModels.createBrokenRoadPatch();
        pot.position.set(px, 0, pz);
        this.registerEdible(pot, 1, 80, "Lyari Pothole", 1.5, { isBadGuy: true, evilType: 'pothole', isDistrictEvil: true });
        this.addWaypointBeacon(pot, '🕳️');
      });

      this.addRobberyScene(15.0, -15.0);
      this.addRobberyScene(-16.0, -6.0);
    } else if (districtLevel === 3) {
      // =========================================================
      // DISTRICT 3: KARACHI - SADDAR & BURNS ROAD (Level 3)
      // Focus: VIP Traffic Jams blocking Ambulance, Empress Snatchers, Market Debris
      // =========================================================
      this.addVIPTrafficJamScene(-8.0, -14.0, Math.PI / 2);
      this.addVIPTrafficJamScene(14.0, 12.0, 0);

      this.addRobberyScene(16.0, -18.0);
      this.addRobberyScene(-12.0, 20.0);

      [[-6, 12], [6, 12], [-12, -8], [12, -8]].forEach(([tx, tz], idx) => {
        const bag = KarachiModels.createTrashBag(trashColors[idx % trashColors.length]);
        bag.position.set(tx, 0, tz);
        this.registerEdible(bag, 1, 25, "Burns Road Market Debris", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash', isDistrictEvil: true });
        this.addWaypointBeacon(bag, '🗑️');
      });
    } else if (districtLevel === 4) {
      // =========================================================
      // DISTRICT 4: LAHORE - ANDROON & CANAL BANK (Level 4)
      // Focus: Chemical Dor Peddlers, Smog Belching Trucks, VIP Motorcades
      // =========================================================
      [[-15.0, 25.0], [15.0, -25.0], [0, 40.0]].forEach(([cx, cz], idx) => {
        const dor = KarachiModels.createChinaCuttingMafia();
        dor.position.set(cx, 0, cz);
        this.registerEdible(dor, 1, 750, `Chemical Dor Peddler #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'chinacutting', isDistrictEvil: true });
        this.addWaypointBeacon(dor, '🪁');
      });

      this.addWaterTankerScene(-20.0, 30.0);
      this.addWaterTankerScene(20.0, -30.0);

      this.addVIPTrafficJamScene(0, -25.0, Math.PI / 2);
      this.addVIPTrafficJamScene(-22.0, 0, 0);
    } else if (districtLevel === 5) {
      // =========================================================
      // DISTRICT 5: ISLAMABAD - F-SECTORS & MARGALLA (Level 5)
      // Focus: Midnight Supercar Racers, Margalla Timber Poachers, Corrupt VIPs
      // =========================================================
      const racerSpots = [[-18.0, -15.0], [18.0, 15.0], [0, 45.0]];
      racerSpots.forEach(([rx, rz], idx) => {
        const racer = KarachiModels.createOneWheelerRacer();
        racer.position.set(rx, 0, rz);
        this.registerEdible(racer, 1, 800, `Midnight Racer #${idx + 1}`, 1.8, { isBadGuy: true, evilType: 'onewheeler', isDistrictEvil: true });
        this.addWaypointBeacon(racer, '🏎️');
      });

      [[-22.0, -35.0], [22.0, -35.0], [0, -50.0]].forEach(([tx, tz], idx) => {
        const poacher = KarachiModels.createChinaCuttingMafia();
        poacher.position.set(tx, 0, tz);
        this.registerEdible(poacher, 1, 850, `Margalla Timber Poacher #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'chinacutting', isDistrictEvil: true });
        this.addWaypointBeacon(poacher, '🌲');
      });

      const polQuotes = ["Constitutional immunity hai!", "File check mat karo!", "Diplomatic lane clear karo!"];
      [[-10.0, 20.0], [10.0, 20.0], [0, -20.0]].forEach(([px, pz], idx) => {
        const pol = KarachiModels.createPolitician({ name: `Bureaucrat VIP #${idx + 1}`, quote: polQuotes[idx % polQuotes.length] });
        pol.position.set(px, 0, pz);
        this.registerEdible(pol, 1, 900, `Corrupt Bureaucrat #${idx + 1}`, 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician', isDistrictEvil: true });
        this.addWaypointBeacon(pol, '💼');
      });
    } else {
      // =========================================================
      // DISTRICT 6: QUETTA - LIAQUAT BAZAAR & HANNA VALLEY (Level 6)
      // Focus: Groundwater Boring Cartels, Bazaar Extortionists, Sparking Transformers
      // =========================================================
      this.addWaterTankerScene(-18.0, -35.0);
      this.addWaterTankerScene(18.0, -35.0);
      this.addWaterTankerScene(0, 30.0);

      [[-14.0, -10.0], [14.0, -10.0], [-20.0, 20.0], [20.0, 20.0]].forEach(([bx, bz], idx) => {
        const bhatta = KarachiModels.createBhattaParchiMafia();
        bhatta.position.set(bx, 0, bz);
        this.registerEdible(bhatta, 1, 950, `Bazaar Extortionist #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'bhatta', isDistrictEvil: true });
        this.addWaypointBeacon(bhatta, '💰');
      });

      [[-10.0, 10.0], [10.0, 10.0], [0, -45.0]].forEach(([kx, kz], idx) => {
        const ke = KarachiModels.createKElectricTransformer();
        ke.position.set(kx, 0, kz);
        this.registerEdible(ke, 2, 850, `Sparking Transformer #${idx + 1}`, 2.5, { isBadGuy: true, evilType: 'ke', isDistrictEvil: true });
        this.addWaypointBeacon(ke, '⚡');
      });
    }

    this.currentDistrictEvils = this.badGuys.filter(b => b.isDistrictEvil && b.state !== 'swallowed');
    return {
      districtEvils: this.currentDistrictEvils,
      interactiveVictims: this.interactiveVictims,
      interactiveTraffic: this.interactiveTraffic,
      interactiveResidents: this.interactiveResidents
    };
  }

  // Finds a guaranteed open street/sidewalk coordinate that never overlaps buildings or other props
  findSafeSpawnPoint(minClearance = 2.5) {
    const roadCoords = [-96, -48, 0, 48, 96];
    for (let attempt = 0; attempt < 40; attempt++) {
      // Pick along road curb/sidewalk to leave central running corridor wide open
      const onNS = Math.random() > 0.5;
      const roadLine = roadCoords[Math.floor(Math.random() * roadCoords.length)];
      const side = Math.random() > 0.5 ? 1 : -1;
      const laneOffset = side * (4.8 + Math.random() * 2.6);
      const alongPos = (Math.random() - 0.5) * 176.0;

      const x = onNS ? (roadLine + laneOffset) : alongPos;
      const z = onNS ? alongPos : (roadLine + laneOffset);

      // Avoid immediate player spawn crossroads (0,0)
      if (Math.hypot(x, z) < 9.0) continue;

      // Check against all registered solid obstacles (buildings & stalls)
      let blocked = false;
      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (!obs) continue;
        if (obs.isBox) {
          if (
            x >= obs.minX - minClearance &&
            x <= obs.maxX + minClearance &&
            z >= obs.minZ - minClearance &&
            z <= obs.maxZ + minClearance
          ) {
            blocked = true;
            break;
          }
        } else if (obs.position) {
          const dist = Math.hypot(x - obs.position.x, z - obs.position.z);
          if (dist < (obs.radius || 2.5) + minClearance) {
            blocked = true;
            break;
          }
        }
      }

      if (!blocked) return { x, z };
    }
    return { x: -48, z: (Math.random() - 0.5) * 150 };
  }

  populateZones() {
    const trashColors = [0x1565c0, 0x212121, 0x43a047, 0xe53935];

    // =============================================================
    // 0. IMMEDIATE PLAYER SPAWN CROSSROADS (Centered around x: 0, z: 0)
    // 100% Unobstructed view: Mazar-e-Quaid is in the far northern backdrop!
    // Immediate feast of Bun Kabab stall, Chai Dhaba, Potholes, Gutka, Robbers, Politicians, Tankers & Trash!
    // =============================================================
    // Burns Road Bun Kabab Stall safely placed on east sidewalk curb
    const bunKabab1 = KarachiModels.createBurnsRoadBunKababStall();
    bunKabab1.position.set(8.5, 0, -6.0);
    this.registerEdible(bunKabab1, 2, 250, "Burns Road Bun Kabab", 2.2, { isFoodStall: true });

    // Quetta Alamgir Chai Dhaba safely placed on west sidewalk curb
    const dhaba1 = KarachiModels.createChaiDhaba();
    dhaba1.position.set(-8.5, 0, -6.0);
    this.registerEdible(dhaba1, 2, 200, "Quetta Alamgir Chai", 2.2, { isFoodStall: true });

    // Populate Initial District 1 Curated Evils
    this.populateDistrict(1);

    // =============================================================
    // 11. ICONIC KARACHI LANDMARKS & URBAN MONUMENTS (GTA / NFS SIDES-OF-STREET LAYOUT)
    // 100% of buildings, plazas, and shops are positioned inside the 16 city blocks on the sides of streets!
    // Roads and intersections are 100% clear of obstruction!
    // =============================================================

    // 1. Teen Talwar Chowrangi - Clifton Island Park (Block [24, -24])
    const teenTalwar = KarachiModels.createTeenTalwarChowrangi();
    teenTalwar.position.set(24, 0, -24);
    this.registerEdible(teenTalwar, 4, 1500, "Teen Talwar Monument", 9.5, { isBuilding: true, isBadGuy: false });

    // 2. Bahadurabad Charminar - Pedestrian Roundabout Plaza (Block [24, 24])
    const charminar = KarachiModels.createBahadurabadCharminar();
    charminar.position.set(24, 0, 24);
    this.registerEdible(charminar, 4, 1600, "Bahadurabad Charminar", 10.0, { isBuilding: true, isBadGuy: false });

    // 3. Shahrah-e-Faisal Overhead Green Steel Pedestrian Bridge (with Shan Biryani & Tapal Danedar Billboards) at z = 48
    const pedBridge = KarachiModels.createOverheadPedestrianBridge(26);
    pedBridge.position.set(0, 0, 48);
    this.scene.add(pedBridge);
    this.obstacles.push({ position: { x: -12.5, y: 0, z: 48 }, radius: 1.4 });
    this.obstacles.push({ position: { x: 12.5, y: 0, z: 48 }, radius: 1.4 });

    // 4. Mazar-e-Quaid (Jinnah's Mausoleum) - Jinnah Memorial Park (Block [24, -72])
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(24, 0, -72);
    this.registerEdible(mazar, 5, 3500, "Mazar-e-Quaid Mausoleum", 14.0, { isBuilding: true, isBadGuy: false });

    // 5. Empress Market Saddar - Victorian Anglo-Mughal Clock Tower (Block [-72, -72])
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-72, 0, -72);
    this.registerEdible(empress, 4, 2000, "Empress Market Saddar", 10.5, { isBuilding: true, isBadGuy: false });

    // 6. KMC Building (Karachi Municipal Corporation, M.A. Jinnah Road) in Municipal Block (Block [-24, -72])
    const kmc = KarachiModels.createKMCBuilding();
    kmc.position.set(-24, 0, -72);
    this.registerEdible(kmc, 5, 2600, "KMC Heritage Building", 11.5, { isBuilding: true, isBadGuy: false });

    // 7. Habib Bank Plaza (HBL Plaza, I.I. Chundrigar Road) - Modernist Skyscraper (Block [72, -72])
    const hbl = KarachiModels.createHabibBankPlaza();
    hbl.position.set(65, 0, -72);
    this.registerEdible(hbl, 5, 2800, "Habib Bank Plaza (HBL)", 9.0, { isBuilding: true, isBadGuy: false });

    // 8. MCB Tower (29-Story Skyscraper - I.I. Chundrigar Road) in Financial Block (Block [72, -72])
    const mcb = KarachiModels.createMCBTower();
    mcb.position.set(78, 0, -68);
    this.registerEdible(mcb, 5, 3000, "MCB Tower Chundrigar", 9.5, { isBuilding: true, isBadGuy: false });

    // 9. Mohatta Palace Museum - Rajasthani Pink Sandstone Heritage Palace (Block [72, 24])
    const mohatta = KarachiModels.createMohattaPalace();
    mohatta.position.set(72, 0, 24);
    this.registerEdible(mohatta, 4, 1800, "Mohatta Palace Museum", 11.0, { isBuilding: true, isBadGuy: false });

    // 10. Frere Hall Sadequain Gallery - Venetian-Gothic Yellow Gizri Limestone (Block [-72, 24])
    const frere = KarachiModels.createFrereHall();
    frere.position.set(-72, 0, 24);
    this.registerEdible(frere, 4, 1800, "Frere Hall Gardens", 11.0, { isBuilding: true, isBadGuy: false });

    // 11. Sakhi Hasan Water Hydrant Station (Water Logistics Center) (Block [-24, 24])
    const hydrant = KarachiModels.createSakhiHasanWaterHydrant();
    hydrant.position.set(-28, 0, 24);
    this.registerEdible(hydrant, 4, 1500, "Sakhi Hasan Water Hydrant", 8.5, { isBuilding: true, isBadGuy: false });

    // 12. Burns Road Food Street Colonial Heritage Tenements (lining sidewalk frontage of Block [-24, -24] and [-24, 24])
    const burnsRoadShops = [
      { pos: [-18, -32], name: "Dilpasand Sweets", ur: "Famous Traditional Sweets & Bakery", col: "#b71c1c" },
      { pos: [-18, 18], name: "Karachi Haleem Centre", ur: "Traditional Haleem Centre • Saddar", col: "#004d40" },
      { pos: [-18, -18], name: "Student Biryani", ur: "Legendary Biryani • Burns Road", col: "#d84315" },
      { pos: [-72, -14], name: "Rehmat-e-Shereen", ur: "Premium Sweets & Bakers", col: "#4a148c" }
    ];
    burnsRoadShops.forEach(s => {
      const bldg = KarachiModels.createBurnsRoadColonialBuilding(s.name, s.ur, s.col);
      bldg.position.set(s.pos[0], 0, s.pos[1]);
      bldg.rotation.y = Math.PI / 2;
      this.registerEdible(bldg, 4, 1100, `Burns Road: ${s.name}`, 7.0, { isBuilding: true, isBadGuy: false });
    });

    // 13. Tariq Road & PECHS Fashion Plazas (lining sidewalk frontage of Block [24, -24] and [24, 24])
    const tariqRoadPlazas = [
      { pos: [18, -32], name: "J. JUNAID JAMSHED", ur: "Fashion & Lifestyle Store" },
      { pos: [18, 18], name: "KURTA CORNER", ur: "Traditional Apparel Plaza" },
      { pos: [18, -18], name: "KHAADI LAWN", ur: "Karachi Fashion Mall" }
    ];
    tariqRoadPlazas.forEach(p => {
      const plaza = KarachiModels.createTariqRoadFashionPlaza(p.name, p.ur);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      plaza.rotation.y = -Math.PI / 2;
      this.registerEdible(plaza, 4, 1200, `Tariq Road: ${p.name}`, 7.5, { isBuilding: true, isBadGuy: false });
    });

    // 14. Clifton Sea View Victoria Horse Buggy (at southern coast)
    const victoria = KarachiModels.createCliftonVictoriaBuggy();
    victoria.position.set(16, 0, 92);
    this.registerEdible(victoria, 3, 240, "Sea View Victoria Buggy", 2.8, { isTransport: true, isBadGuy: false });

    // 15. Classic Roadside Paan Khokhas on Street Corners (safely on sidewalks)
    [
      [-8.8, 0, -3],
      [8.8, 0, 17],
      [-8.8, 0, 37],
      [8.8, 0, -37]
    ].forEach((pos, idx) => {
      const khokha = KarachiModels.createRoadsidePaanKhokha();
      khokha.position.set(pos[0], pos[1], pos[2]);
      khokha.rotation.y = idx % 2 === 0 ? 0.4 : -0.4;
      this.registerEdible(khokha, 2, 90, `Paan Kiosk #${idx + 1}`, 1.6, { isFoodStall: true, isBadGuy: false });
    });

    // 16. Clifton Sea View Decorated Camels strolling along wet beach sand (z = 94)
    [[-35, 94], [0, 94], [35, 94]].forEach(([cx, cz], idx) => {
      const camel = KarachiModels.createCliftonDecoratedCamel();
      camel.position.set(cx, 0, cz);
      camel.rotation.y = idx % 2 === 0 ? 0.35 : -0.35;
      this.registerEdible(camel, 2, 85, `Sea View Beach Camel #${idx + 1}`, 1.8, { isPet: true, isBadGuy: false });
    });

    // 17. K-Electric Poles with Wire Nests & 440V Danger Plates (on sidewalks)
    [[-8.5, -15], [8.5, -15], [-8.5, 35], [8.5, 35]].forEach(([kx, kz]) => {
      const kePole = KarachiModels.createKElectricTransformerPole();
      kePole.position.set(kx, 0, kz);
      this.scene.add(kePole);
      this.obstacles.push({ position: { x: kx, y: 0, z: kz }, radius: 1.2 });
    });

    // 18. Karachi Municipal Green Directional Signboards on Street Corners
    [
      { pos: [7.8, 7.8], ave: "SHAHRAH-E-FAISAL", ur: "MAIN EXPRESSWAY", cr: "TARIQ ROAD", cru: "COMMERCIAL HUB" },
      { pos: [-7.8, 7.8], ave: "BURNS ROAD", ur: "FOOD STREET", cr: "SADDAR BAZAAR", cru: "HERITAGE BAZAAR" },
      { pos: [7.8, -7.8], ave: "I.I. CHUNDRIGAR", ur: "FINANCIAL STREET", cr: "HBL PLAZA", cru: "BANKING QUARTER" },
      { pos: [-7.8, -7.8], ave: "CLIFTON ROAD", ur: "COASTAL AVENUE", cr: "TEEN TALWAR", cru: "MONUMENT ROUNDABOUT" }
    ].forEach(s => {
      const sign = KarachiModels.createKarachiGreenStreetSign(s.ave, s.ur, s.cr, s.cru);
      sign.position.set(s.pos[0], 0, s.pos[1]);
      this.scene.add(sign);
      this.obstacles.push({ position: { x: s.pos[0], y: 0, z: s.pos[1] }, radius: 1.0 });
    });

    // 19. Commercial Plazas and Clifton Bungalows (Inside City Blocks)
    const plazas = [
      { pos: [72, 0, -24], name: "Kababjees Highway", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [72, 0, 72], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" },
      { pos: [-72, 0, -24], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-72, 0, 72], name: "Agha's Supermarket", sign: "AGHA'S SUPERMARKET", sub: "CLIFTON KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[2]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5, { isBuilding: true, isBadGuy: false });
    });

    // Clifton Residential Bungalows in residential quadrant blocks
    const villas = [
      [-26, 0, 68], [-22, 0, 78],
      [22, 0, 68], [28, 0, 78]
    ];
    villas.forEach((v, idx) => {
      const bungalow = KarachiModels.createResidentialBungalow();
      bungalow.position.set(v[0], 0, v[2]);
      this.registerEdible(bungalow, 3, 380, `Clifton Villa #${idx + 1}`, 5.0, { isBuilding: true, isBadGuy: false });
    });

    // 14 Truck-Art Bedford Trucks & 10 W-11 Mini-Buses (Parked Curbside parallel to lanes)
    const truckPositions = [
      [-5.2, 0, -38, 0], [5.2, 0, -56, 0], [-5.2, 0, 38, Math.PI], [5.2, 0, 56, Math.PI],
      [-42.8, 0, -22, 0], [-53.2, 0, 22, Math.PI], [42.8, 0, -22, 0], [53.2, 0, 22, Math.PI],
      [-22, 0, -5.2, Math.PI / 2], [22, 0, 5.2, -Math.PI / 2], [-68, 0, -5.2, Math.PI / 2], [68, 0, 5.2, -Math.PI / 2],
      [-75, 0, 56, 0], [75, 0, 56, Math.PI]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(tp[0], tp[1], tp[2]);
      truck.rotation.y = tp[3];
      this.registerEdible(truck, 3, 260, `Truck-Art Bedford #${idx + 1}`, 3.5, { isTransport: true, isBadGuy: false });
    });

    const busPositions = [
      [-90, 0, -42.8, 0], [-90, 0, 53.2, Math.PI], [90, 0, -42.8, 0], [90, 0, 53.2, Math.PI],
      [-42.8, 0, -90, 0], [42.8, 0, 90, Math.PI], [-22, 0, 90, Math.PI], [22, 0, -90, 0],
      [-42.8, 0, 42.8, 0], [42.8, 0, -42.8, 0]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(bp[0], bp[1], bp[2]);
      bus.rotation.y = bp[3];
      this.registerEdible(bus, 3, 210, `W-11 Mini-Bus #${idx + 1}`, 3.4, { isTransport: true, isBadGuy: false });
    });

    // 45 Auto-Rickshaws
    for (let i = 0; i < 45; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const pos = this.findSafeSpawnPoint(2.2);
      rickshaw.position.set(pos.x, 0, pos.z);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8, { isTransport: true, isBadGuy: false });
    }

    // 55 CD-70 Bikes
    for (let i = 0; i < 55; i++) {
      const bike = KarachiModels.createMotorbike();
      const pos = this.findSafeSpawnPoint(1.8);
      bike.position.set(pos.x, 0, pos.z);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1, { isTransport: true, isBadGuy: false });
    }

    // 45 Pedestrians (Innocent Karachi Citizens)
    for (let i = 0; i < 45; i++) {
      const ped = KarachiModels.createPedestrian();
      const pos = this.findSafeSpawnPoint(1.5);
      ped.position.set(pos.x, 0, pos.z);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 30, "Citizen", 0.65, { isCitizen: true, isBadGuy: false });
    }

    // 18 Friendly Desi Stray Dogs (Karachi Street Puppies - Protect & Pet!)
    for (let i = 0; i < 18; i++) {
      const dog = KarachiModels.createStrayDog();
      const pos = this.findSafeSpawnPoint(1.5);
      dog.position.set(pos.x, 0, pos.z);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 30, "Friendly Stray Dog", 0.7, { isPet: true, isBadGuy: false });
    }

    // 16 Friendly Street Cats (Billi - Protect & Pet!)
    for (let i = 0; i < 16; i++) {
      const cat = KarachiModels.createStreetCat();
      const pos = this.findSafeSpawnPoint(1.5);
      cat.position.set(pos.x, 0, pos.z);
      cat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(cat, 1, 30, "Friendly Street Cat", 0.6, { isPet: true, isBadGuy: false });
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

  /**
   * Spawn Key Authentic Karachi Story Citizens with Interactive Dialogue Beacons
   */
  spawnKeyCitizens() {
    this.keyCitizens = [];

    const citizensData = [
      {
        id: 'uncle_shamim',
        name: 'Uncle Shamim',
        role: 'Burns Road Chai Wala',
        pos: [-22, 0, -18],
        badgeLabel: '☕ UNCLE SHAMIM • TALK [E]',
      },
      {
        id: 'baji_fatima',
        name: 'Baji Fatima',
        role: 'Community Educator',
        pos: [22, 0, -18],
        badgeLabel: '📚 BAJI FATIMA • TALK [E]',
      },
      {
        id: 'ustad_kareem',
        name: 'Ustad Kareem',
        role: 'Veteran Rickshaw Pilot',
        pos: [-6, 0, 10],
        badgeLabel: '🛺 USTAD KAREEM • TALK [E]',
      },
      {
        id: 'inspector_farooq',
        name: 'Inspector Farooq',
        role: 'Honest Traffic Warden',
        pos: [8, 0, -2],
        badgeLabel: '👮 INSPECTOR FAROOQ • TALK [E]',
      },
      {
        id: 'dr_alvi',
        name: 'Dr. Alvi',
        role: 'Civil Hospital Paramedic',
        pos: [30, 0, 30],
        badgeLabel: '🩺 DR. ALVI • TALK [E]',
      }
    ];

    citizensData.forEach(c => {
      const npc = KarachiModels.createPedestrian();
      npc.name = `Citizen_${c.id}`;
      npc.position.set(c.pos[0], c.pos[1], c.pos[2]);

      // Remove default pedestrian decal and create custom prominent talk decal
      if (npc.userData && npc.userData.friendlyDecal) {
        npc.remove(npc.userData.friendlyDecal);
      }

      const customDecal = KarachiModels.createFriendlyDecal('citizen', c.badgeLabel);
      npc.add(customDecal);

      npc.userData = {
        isKeyCitizen: true,
        citizenId: c.id,
        name: c.name,
        role: c.role,
        friendlyDecal: customDecal,
        talkCooldown: 0
      };

      this.scene.add(npc);
      this.keyCitizens.push(npc);
    });
  }
}
