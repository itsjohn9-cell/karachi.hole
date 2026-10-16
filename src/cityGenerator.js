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
    this.obstacles = [];
    this.beacons = [];
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
      this.obstacles.push({ position: mesh.position, radius: 2.2, mesh });
    }
    if (isBuilding) {
      this.buildings.push(item);
      this.obstacles.push({ position: mesh.position, radius: Math.max(2.4, (radius || 3.0) * 0.75), mesh });
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
    const beaconGroup = new THREE.Group();
    beaconGroup.name = 'WaypointBeacon';

    const diamondGeo = new THREE.OctahedronGeometry(0.48, 0);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: false });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 3.6;
    beaconGroup.add(diamond);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 64, 68);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.position.y = 4.8;
    sprite.scale.set(1.4, 1.4, 1);
    beaconGroup.add(sprite);

    mesh.add(beaconGroup);
    mesh.userData.beacon = beaconGroup;
    this.beacons.push({ diamond, sprite, group: beaconGroup });
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
      v.position.set(posX + localPos.x, 0, posZ + localPos.z);
      v.rotation.y = rotY;
      this.scene.add(v);
      this.interactiveTraffic.push(v);
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
        if (obj.mesh && obj.mesh.parent) {
          obj.mesh.parent.remove(obj.mesh);
        }
        const idx = this.edibleObjects.indexOf(obj);
        if (idx !== -1) this.edibleObjects.splice(idx, 1);
        const bgIdx = this.badGuys.indexOf(obj);
        if (bgIdx !== -1) this.badGuys.splice(bgIdx, 1);
      });
    }
    this.currentDistrictEvils = [];

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

    if (districtLevel === 1) {
      // =========================================================
      // DISTRICT 1: TARIQ ROAD & PECHS (Level 1)
      // Focus: Street Snatchers, Water Tanker Mafia & Dry Homes, Potholes & Trash
      // Immediate 5-25m proximity for clear, dramatic visibility!
      // =========================================================
      this.addWaterTankerScene(16.0, -14.0);
      this.addRobberyScene(6.5, -8.0);
      this.addRobberyScene(-10.5, 9.5);

      const gutkaSpots = [[-6.0, -6.5], [12.0, 6.0], [-12.0, -12.0]];
      gutkaSpots.forEach(([gx, gz], idx) => {
        const gutka = KarachiModels.createGutkaPeddler();
        gutka.position.set(gx, 0, gz);
        this.registerEdible(gutka, 1, 400, `Gutka Peddler #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'gutka', isDistrictEvil: true });
        this.addWaypointBeacon(gutka, '🛑');
      });

      const potholeSpots = [[-3.5, -4.5], [3.5, -4.5], [7.5, -14.0]];
      potholeSpots.forEach(([px, pz], idx) => {
        const pot = KarachiModels.createBrokenRoadPatch();
        pot.position.set(px, 0, pz);
        this.registerEdible(pot, 1, 80, `Road Pothole #${idx + 1}`, 1.4, { isBadGuy: true, evilType: 'pothole', isDistrictEvil: true });
        this.addWaypointBeacon(pot, '🕳️');
      });

      const trashSpots = [[-5, -2], [5, -2], [-2, 4], [3, 5]];
      trashSpots.forEach(([tx, tz], idx) => {
        const bag = KarachiModels.createTrashBag(trashColors[idx % trashColors.length]);
        bag.position.set(tx, 0, tz);
        this.registerEdible(bag, 1, 25, "Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash', isDistrictEvil: true });
        this.addWaypointBeacon(bag, '🧹');
      });

      [[-2.5, 2], [1.5, -3]].forEach(([rx, rz], idx) => {
        const rat = KarachiModels.createSewerRat();
        rat.position.set(rx, 0, rz);
        rat.rotation.y = Math.random() * Math.PI * 2;
        this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true, isBadGuy: true, evilType: 'trash', isDistrictEvil: true });
      });
    } else if (districtLevel === 2) {
      // =========================================================
      // DISTRICT 2: SADDAR & EMPRESS MARKET (Level 2)
      // Focus: VIP Traffic Jams (freed traffic!), Bhatta Mafias & Racers
      // =========================================================
      this.addVIPTrafficJamScene(-8.0, -14.0, Math.PI / 2);
      this.addVIPTrafficJamScene(14.0, 12.0, 0);

      this.addRobberyScene(15.0, -15.0);
      this.addRobberyScene(-16.0, -6.0);

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

      [[-6, 12], [6, 12], [-12, -8], [12, -8]].forEach(([tx, tz], idx) => {
        const bag = KarachiModels.createTrashBag(trashColors[idx % trashColors.length]);
        bag.position.set(tx, 0, tz);
        this.registerEdible(bag, 1, 25, "Market Debris", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash', isDistrictEvil: true });
        this.addWaypointBeacon(bag, '🗑️');
      });
    } else if (districtLevel === 3) {
      // =========================================================
      // DISTRICT 3: WATER PUMP & GULSHAN-E-IQBAL (Level 3)
      // Focus: Water Tanker Mafias (freshwater geysers!), K-Electric Kundas, China Cutters
      // =========================================================
      this.addWaterTankerScene(8.0, -16.0);
      this.addWaterTankerScene(-18.0, 14.0);
      this.addWaterTankerScene(22.0, -20.0);

      [[-8.5, 4.5], [16.0, 6.0], [-20.0, -18.0]].forEach(([kx, kz], idx) => {
        const ke = KarachiModels.createKElectricTransformer();
        ke.position.set(kx, 0, kz);
        this.registerEdible(ke, 2, 750, `K-Electric Kunda #${idx + 1}`, 2.5, { isBadGuy: true, evilType: 'ke', isDistrictEvil: true });
      });

      [[8.5, 4.5], [-14.0, 24.0]].forEach(([cx, cz], idx) => {
        const china = KarachiModels.createChinaCuttingMafia();
        china.position.set(cx, 0, cz);
        this.registerEdible(china, 1, 650, `China Cutting Mafia #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'chinacutting', isDistrictEvil: true });
      });

      this.addVIPTrafficJamScene(0, -28.0, Math.PI / 2);
      this.addVIPTrafficJamScene(-24.0, 0, 0);

      this.addRobberyScene(-10.0, -25.0);
      this.addRobberyScene(20.0, 20.0);
    } else if (districtLevel === 4) {
      // =========================================================
      // DISTRICT 4: CLIFTON & SEA VIEW COAST (Level 4)
      // Focus: Corrupt VIP Politicians with offshore briefcases, Coastal Land Grabbers
      // =========================================================
      const polQuotes = [
        "London flats mere nahi hain!",
        "Mujhe kyun nikala?!",
        "Offshore account freeze mat karo!",
        "VIP Protocol squad alert!"
      ];
      [[0, -12.0], [-14.0, -25.0], [14.0, 30.0], [-25.0, 35.0]].forEach(([px, pz], idx) => {
        const pol = KarachiModels.createPolitician({ name: `Senator #${idx + 1}`, quote: polQuotes[idx % polQuotes.length] });
        pol.position.set(px, 0, pz);
        this.registerEdible(pol, 1, 600, `VIP Politician #${idx + 1}`, 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician', isDistrictEvil: true });
      });

      this.addVIPTrafficJamScene(0, 35.0, 0);
      this.addVIPTrafficJamScene(-30.0, -20.0, Math.PI / 2);

      this.addWaterTankerScene(-22.0, 42.0);
      this.addWaterTankerScene(25.0, 45.0);

      [[-15.0, 55.0], [15.0, 55.0], [0, 60.0]].forEach(([cx, cz], idx) => {
        const china = KarachiModels.createChinaCuttingMafia();
        china.position.set(cx, 0, cz);
        this.registerEdible(china, 1, 650, `Beachfront Encroacher #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'chinacutting', isDistrictEvil: true });
      });

      [[28.0, 10.0], [-28.0, 10.0]].forEach(([kx, kz], idx) => {
        const ke = KarachiModels.createKElectricTransformer();
        ke.position.set(kx, 0, kz);
        this.registerEdible(ke, 2, 750, `High-Tension Kunda #${idx + 1}`, 2.5, { isBadGuy: true, evilType: 'ke', isDistrictEvil: true });
      });
    } else {
      // =========================================================
      // DISTRICT 5: MAZAR-E-QUAID MEGA METROPOLIS (Level 5)
      // Master Cleanse: Final showdown against corruption
      // =========================================================
      const polQuotes = [
        "Dollar sasta ho jayega!",
        "Tabdeeli aa chuki hai!",
        "Security escort kahan hai?!",
        "Swiss account ka password bhool gaya!",
        "Ghabrana nahi hai bilkul!",
        "Parliament session late hai!"
      ];
      [[0, -30.0], [-20.0, -45.0], [20.0, -45.0], [-35.0, -20.0], [35.0, -20.0], [0, -60.0]].forEach(([px, pz], idx) => {
        const pol = KarachiModels.createPolitician({ name: `Federal VIP #${idx + 1}`, quote: polQuotes[idx % polQuotes.length] });
        pol.position.set(px, 0, pz);
        this.registerEdible(pol, 1, 600, `Federal VIP #${idx + 1}`, 1.2, { isPolitician: true, isBadGuy: true, evilType: 'politician', isDistrictEvil: true });
      });

      this.addVIPTrafficJamScene(0, -18.0, 0);
      this.addVIPTrafficJamScene(-25.0, -35.0, Math.PI / 2);
      this.addVIPTrafficJamScene(25.0, -35.0, -Math.PI / 2);

      this.addWaterTankerScene(-15.0, -50.0);
      this.addWaterTankerScene(15.0, -50.0);
      this.addWaterTankerScene(0, 15.0);

      [[-10.0, -25.0], [10.0, -25.0], [0, -40.0]].forEach(([bx, bz], idx) => {
        const bhatta = KarachiModels.createBhattaParchiMafia();
        bhatta.position.set(bx, 0, bz);
        this.registerEdible(bhatta, 1, 700, `Bhatta Don #${idx + 1}`, 1.5, { isBadGuy: true, evilType: 'bhatta', isDistrictEvil: true });
      });

      this.addRobberyScene(-20.0, -15.0);
      this.addRobberyScene(20.0, -15.0);
      this.addRobberyScene(0, -5.0);
    }

    this.currentDistrictEvils = this.badGuys.filter(b => b.isDistrictEvil);
    return {
      districtEvils: this.currentDistrictEvils,
      interactiveVictims: this.interactiveVictims,
      interactiveTraffic: this.interactiveTraffic,
      interactiveResidents: this.interactiveResidents
    };
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

    // Populate Initial District 1 Curated Evils
    this.populateDistrict(1);

    // =============================================================
    // 11. ICONIC KARACHI LANDMARKS & URBAN MONUMENTS
    // =============================================================
    // AUTHENTIC KARACHI LANDMARKS & HISTORIC MONUMENTS
    // =============================================================

    // 1. Teen Talwar Chowrangi (Three Swords Monument, Clifton) - North Boulevard Roundabout (z = -32)
    const teenTalwar = KarachiModels.createTeenTalwarChowrangi();
    teenTalwar.position.set(0, 0, -32);
    this.registerEdible(teenTalwar, 4, 1500, "Teen Talwar Monument", 9.5, { isBuilding: true, isBadGuy: false });

    // 2. Bahadurabad Charminar Chowrangi (Four Minarets Monument) - South Boulevard Roundabout (z = 52)
    const charminar = KarachiModels.createBahadurabadCharminar();
    charminar.position.set(0, 0, 52);
    this.registerEdible(charminar, 4, 1600, "Bahadurabad Charminar", 10.0, { isBuilding: true, isBadGuy: false });

    // 3. Shahrah-e-Faisal Overhead Green Steel Pedestrian Bridge (with Shan Biryani & Tapal Danedar Billboards) at z = 22
    const pedBridge = KarachiModels.createOverheadPedestrianBridge(24);
    pedBridge.position.set(0, 0, 22);
    this.scene.add(pedBridge);

    // 4. Mazar-e-Quaid (Jinnah's Mausoleum) - Northern Avenue Axis at z = -84
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, -84);
    this.registerEdible(mazar, 5, 3500, "Mazar-e-Quaid Mausoleum", 14.0, { isBuilding: true, isBadGuy: false });

    // 5. Empress Market Saddar - Victorian Anglo-Mughal Clock Tower (x: -48, z: -48)
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-48, 0, -48);
    this.registerEdible(empress, 4, 2000, "Empress Market Saddar", 10.5, { isBuilding: true, isBadGuy: false });

    // 6. KMC Building (Karachi Municipal Corporation, M.A. Jinnah Road) at (x: -74, z: -48)
    const kmc = KarachiModels.createKMCBuilding();
    kmc.position.set(-74, 0, -48);
    this.registerEdible(kmc, 5, 2600, "KMC Heritage Building", 11.5, { isBuilding: true, isBadGuy: false });

    // 7. Habib Bank Plaza (HBL Plaza, I.I. Chundrigar Road) - Modernist Skyscraper at (x: 48, z: -48)
    const hbl = KarachiModels.createHabibBankPlaza();
    hbl.position.set(48, 0, -48);
    this.registerEdible(hbl, 5, 2800, "Habib Bank Plaza (HBL)", 9.0, { isBuilding: true, isBadGuy: false });

    // 8. MCB Tower (29-Story Skyscraper - I.I. Chundrigar Road) at (x: 74, z: -48)
    const mcb = KarachiModels.createMCBTower();
    mcb.position.set(74, 0, -48);
    this.registerEdible(mcb, 5, 3000, "MCB Tower Chundrigar", 9.5, { isBuilding: true, isBadGuy: false });

    // 9. Mohatta Palace Museum - Rajasthani Pink Sandstone Heritage Palace (x: 48, z: 15)
    const mohatta = KarachiModels.createMohattaPalace();
    mohatta.position.set(48, 0, 15);
    this.registerEdible(mohatta, 4, 1800, "Mohatta Palace Museum", 11.0, { isBuilding: true, isBadGuy: false });

    // 10. Frere Hall Sadequain Gallery - Venetian-Gothic Yellow Gizri Limestone (x: -48, z: 15)
    const frere = KarachiModels.createFrereHall();
    frere.position.set(-48, 0, 15);
    this.registerEdible(frere, 4, 1800, "Frere Hall Gardens", 11.0, { isBuilding: true, isBadGuy: false });

    // 11. Sakhi Hasan Water Hydrant Station (Water Tanker filling gantry in Gulshan quadrant) at (x: -48, z: 48)
    const hydrant = KarachiModels.createSakhiHasanWaterHydrant();
    hydrant.position.set(-48, 0, 48);
    this.registerEdible(hydrant, 4, 1500, "Sakhi Hasan Water Hydrant", 8.5, { isBuilding: true, isBadGuy: false });

    // 12. Burns Road Food Street Colonial Heritage Tenements (lining west side of central avenue)
    const burnsRoadShops = [
      { pos: [-26, -18], name: "Dilpasand Sweets", ur: "Famous Traditional Sweets & Bakery", col: "#b71c1c" },
      { pos: [-26, 6], name: "Karachi Haleem Centre", ur: "Traditional Haleem Centre • Saddar", col: "#004d40" },
      { pos: [-26, -34], name: "Student Biryani", ur: "Legendary Biryani • Burns Road", col: "#d84315" },
      { pos: [-48, -18], name: "Rehmat-e-Shereen", ur: "Premium Sweets & Bakers", col: "#4a148c" }
    ];
    burnsRoadShops.forEach(s => {
      const bldg = KarachiModels.createBurnsRoadColonialBuilding(s.name, s.ur, s.col);
      bldg.position.set(s.pos[0], 0, s.pos[1]);
      bldg.rotation.y = Math.PI / 2;
      this.registerEdible(bldg, 4, 1100, `Burns Road: ${s.name}`, 7.0, { isBuilding: true, isBadGuy: false });
    });

    // 13. Tariq Road & PECHS Fashion Plazas (lining east side of central avenue)
    const tariqRoadPlazas = [
      { pos: [26, -18], name: "J. JUNAID JAMSHED", ur: "Fashion & Lifestyle Store" },
      { pos: [26, 6], name: "KURTA CORNER", ur: "Traditional Apparel Plaza" },
      { pos: [26, -34], name: "KHAADI LAWN", ur: "Karachi Fashion Mall" }
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

    // 15. Classic Roadside Paan Khokhas on Street Corners
    [
      [-8.8, 0, -2],
      [8.8, 0, 18],
      [-8.8, 0, 38],
      [8.8, 0, 48]
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

    // 17. K-Electric Poles with Wire Nests & 440V Danger Plates
    [[-8.5, -14], [8.5, -14], [-8.5, 34], [8.5, 34]].forEach(([kx, kz]) => {
      const kePole = KarachiModels.createKElectricTransformerPole();
      kePole.position.set(kx, 0, kz);
      this.scene.add(kePole);
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
    });

    // 19. Commercial Plazas and Clifton Bungalows
    const plazas = [
      { pos: [48, -20], name: "Kababjees Highway", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [48, 48], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" },
      { pos: [-48, -20], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-48, 72], name: "Agha's Supermarket", sign: "AGHA'S SUPERMARKET", sub: "CLIFTON KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5, { isBuilding: true, isBadGuy: false });
    });

    // Clifton Residential Bungalows in southeast residential quadrant
    for (let bx = 36; bx <= 76; bx += 18) {
      for (let bz = 36; bz <= 76; bz += 18) {
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

    // 18 Friendly Desi Stray Dogs (Karachi Street Puppies - Protect & Pet!)
    for (let i = 0; i < 18; i++) {
      const dog = KarachiModels.createStrayDog();
      const dx = (Math.random() - 0.5) * 175;
      const dz = (Math.random() - 0.5) * 175;
      dog.position.set(dx, 0, dz);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 30, "Friendly Stray Dog", 0.7, { isPet: true, isBadGuy: false });
    }

    // 16 Friendly Street Cats (Billi - Protect & Pet!)
    for (let i = 0; i < 16; i++) {
      const cat = KarachiModels.createStreetCat();
      const cx = (Math.random() - 0.5) * 175;
      const cz = (Math.random() - 0.5) * 175;
      cat.position.set(cx, 0, cz);
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
}
