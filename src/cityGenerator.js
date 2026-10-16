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
    this.mapSize = 240; // 240m x 240m map
  }

  generateCity() {
    this.createGround();
    this.createRoadNetwork();
    this.populateZones();
    return {
      edibleObjects: this.edibleObjects,
      politicians: this.politicians,
      animals: this.animals,
      robberies: this.robberies,
      badGuys: this.badGuys,
      foodStalls: this.foodStalls,
      buildings: this.buildings
    };
  }

  createGround() {
    // Ground plane (Earth / Sandy foundation of coastal Karachi)
    const groundGeo = new THREE.PlaneGeometry(this.mapSize + 60, this.mapSize + 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0xbdb39a // Warm Karachi sand/dust tone
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoadNetwork() {
    // High-definition crisp asphalt texture with storm sewer grates and yellow/white lane stripes
    const roadTexture = TextureGenerator.createCrispRoadTexture();
    const roadMat = new THREE.MeshLambertMaterial({
      map: roadTexture
    });

    const roadWidth = 14;
    const roadGrid = [-70, 0, 70]; // Main 3x3 arterial avenues

    // North-South Avenues
    roadGrid.forEach(x => {
      const roadGeo = new THREE.PlaneGeometry(roadWidth, this.mapSize);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(x, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);

      // Sidewalk curbs
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, this.mapSize), KarachiModels.materials.sandstone);
      curbL.position.set(x - roadWidth / 2 - 0.7, 0.12, 0);
      this.scene.add(curbL);

      const curbR = curbL.clone();
      curbR.position.x = x + roadWidth / 2 + 0.7;
      this.scene.add(curbR);
    });

    // East-West Boulevards
    roadGrid.forEach(z => {
      const roadGeo = new THREE.PlaneGeometry(this.mapSize, roadWidth);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0.02, z);
      road.rotation.y = Math.PI / 2;
      road.receiveShadow = true;
      this.scene.add(road);

      const curbT = new THREE.Mesh(new THREE.BoxGeometry(this.mapSize, 0.25, 1.4), KarachiModels.materials.sandstone);
      curbT.position.set(0, 0.12, z - roadWidth / 2 - 0.7);
      this.scene.add(curbT);

      const curbB = curbT.clone();
      curbB.position.z = z + roadWidth / 2 + 0.7;
      this.scene.add(curbB);
    });

    // Sea View Coastline Strip (South border z = 100 to 120)
    const seaGeo = new THREE.PlaneGeometry(this.mapSize + 60, 50);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshLambertMaterial({
      color: 0x007799
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, -0.2, 115);
    this.scene.add(sea);
  }

  registerEdible(mesh, tier, points, name, radius, {
    isPolitician = false,
    isAnimal = false,
    isRobbery = false,
    isRubbish = false,
    isBadGuy = false,
    evilType = null,
    isFoodStall = false,
    isBuilding = false
  } = {}) {
    this.scene.add(mesh);
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
      isBadGuy: isBadGuy || isPolitician || isRobbery || isRubbish || (evilType !== null),
      evilType: evilType || (isPolitician ? 'politician' : isRobbery ? 'robber' : isRubbish ? 'trash' : null),
      isFoodStall,
      isBuilding
    };
    this.edibleObjects.push(item);
    if (isPolitician) this.politicians.push(item);
    if (isAnimal) this.animals.push(item);
    if (isRobbery) this.robberies.push(item);
    if (item.isBadGuy) this.badGuys.push(item);
    if (isFoodStall) this.foodStalls.push(item);
    if (isBuilding) this.buildings.push(item);
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

    // 6 Sewer rats scurrying around trash
    for (let i = 0; i < 6; i++) {
      const rat = KarachiModels.createSewerRat();
      rat.position.set(-3 + Math.random() * 6, 0, -2.5 - Math.random() * 6);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true });
    }

    // 2 Barking Desi Stray Dogs
    const dog1 = KarachiModels.createStrayDog();
    dog1.position.set(-4.5, 0, -5.5);
    this.registerEdible(dog1, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });

    const dog2 = KarachiModels.createStrayDog();
    dog2.position.set(4.5, 0, -5.5);
    this.registerEdible(dog2, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });

    // 2 Street Cats roaming curbs
    const cat1 = KarachiModels.createStreetCat();
    cat1.position.set(-5, 0, -2.5);
    this.registerEdible(cat1, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true });

    // Traffic Cones & Fruit Cart
    for (let x = -3; x <= 3; x += 1.5) {
      const cone = KarachiModels.createTrafficCone();
      cone.position.set(x, 0, -1.8);
      this.registerEdible(cone, 1, 20, "Traffic Cone", 0.6);
    }
    const thela1 = KarachiModels.createFruitThela();
    thela1.position.set(-6, 0, 1.5);
    this.registerEdible(thela1, 1, 50, "Mango Thela", 1.2);

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
      this.registerEdible(bk, 2, 250, `Burns Road Bun Kabab #${idx + 2}`, 2.2, { isFoodStall: true });

      const dh = KarachiModels.createChaiDhaba();
      dh.position.set(spot[0] + 5, 0, spot[1]);
      this.registerEdible(dh, 2, 200, `Quetta Chai Dhaba #${idx + 2}`, 2.2, { isFoodStall: true });
    });

    // =============================================================
    // 8. RUBBISH, GARBAGE BAGS & KACHRA DUMPS (150+ Rubbish items!)
    // =============================================================
    for (let i = 0; i < 20; i++) {
      const dump = KarachiModels.createKachraDump();
      const dx = (Math.random() - 0.5) * 180;
      const dz = (Math.random() - 0.5) * 180;
      dump.position.set(dx, 0, dz);
      dump.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dump, 1, 100, "Kachra Kundi Heap", 1.8, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 100; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      const bx = (Math.random() - 0.5) * 190;
      const bz = (Math.random() - 0.5) * 190;
      bag.position.set(bx, 0, bz);
      this.registerEdible(bag, 1, 25, "Trash Bag", 0.5, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    for (let i = 0; i < 80; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      const ix = (Math.random() - 0.5) * 190;
      const iz = (Math.random() - 0.5) * 190;
      item.position.set(ix, 0, iz);
      this.registerEdible(item, 1, 15, "Street Debris", 0.35, { isRubbish: true, isBadGuy: true, evilType: 'trash' });
    }

    // =============================================================
    // 9. ANIMALS (Stray Dogs, Cats, Sewer Rats)
    // =============================================================
    for (let i = 0; i < 25; i++) {
      const dog = KarachiModels.createStrayDog();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      dog.position.set(x, 0, z);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });
    }

    for (let i = 0; i < 20; i++) {
      const cat = KarachiModels.createStreetCat();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      cat.position.set(x, 0, z);
      cat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(cat, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true });
    }

    for (let i = 0; i < 35; i++) {
      const rat = KarachiModels.createSewerRat();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      rat.position.set(x, 0, z);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true });
    }

    // =============================================================
    // 10. LANDMARKS & BIGGER DISTRICT OBJECTS (Safely Positioned in Background!)
    // =============================================================
    // Mazar-e-Quaid: Positioned in the northern backdrop at z = -85 so it never hides the start hole!
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, -85);
    this.registerEdible(mazar, 5, 3000, "Mazar-e-Quaid", 14.0, { isBuilding: true });

    // Empress Market in the northwestern district
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-55, 0, -55);
    this.registerEdible(empress, 4, 1500, "Empress Market Saddar", 10.0, { isBuilding: true });

    // Chundrigar Skyscrapers in the northeastern district
    const towerCoords = [[55, -55], [75, -55], [55, -75], [75, -75]];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2200, `Chundrigar Tower #${idx + 1}`, 7.5, { isBuilding: true });
    });

    // Commercial Plazas on outer avenue corners
    const plazas = [
      { pos: [55, -20], name: "Habib Bank Plaza", sign: "HABIB BANK PLAZA", sub: "HEAD OFFICE KARACHI" },
      { pos: [55, 25], name: "Kababjees Commercial", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [-55, -20], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-55, 25], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5, { isBuilding: true });
    });

    // Clifton Villas in southeast residential quadrant
    for (let bx = 32; bx <= 64; bx += 16) {
      for (let bz = 32; bz <= 64; bz += 16) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 380, "Clifton Villa", 5.0, { isBuilding: true });
      }
    }

    // 12 Truck-Art Bedford Trucks & 8 W-11 Mini-Buses
    const truckPositions = [
      [-65, 0, -10], [-65, 0, 20], [5, 0, -65], [5, 0, 65],
      [65, 0, 15], [65, 0, -25], [-20, 0, 65], [30, 0, 65],
      [-45, 0, 0], [45, 0, 0], [0, 0, 50], [0, 0, -50]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(...tp);
      truck.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(truck, 3, 260, `Truck-Art Bedford #${idx + 1}`, 3.5);
    });

    const busPositions = [
      [-75, 0, -45], [-75, 0, 40], [75, 0, -40], [75, 0, 45],
      [-40, 0, -75], [40, 0, 75], [-15, 0, 75], [15, 0, -75]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(...bp);
      bus.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(bus, 3, 210, `W-11 Mini-Bus #${idx + 1}`, 3.4);
    });

    // 40 Auto-Rickshaws
    for (let i = 0; i < 40; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const rx = (Math.random() - 0.5) * 190;
      const rz = (Math.random() - 0.5) * 190;
      rickshaw.position.set(rx, 0, rz);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8);
    }

    // 50 CD-70 Bikes
    for (let i = 0; i < 50; i++) {
      const bike = KarachiModels.createMotorbike();
      const bx = (Math.random() - 0.5) * 190;
      const bz = (Math.random() - 0.5) * 190;
      bike.position.set(bx, 0, bz);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1);
    }

    // 40 Pedestrians
    for (let i = 0; i < 40; i++) {
      const ped = KarachiModels.createPedestrian();
      const px = (Math.random() - 0.5) * 190;
      const pz = (Math.random() - 0.5) * 190;
      ped.position.set(px, 0, pz);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 30, "Citizen", 0.65);
    }

    // Street Lamps
    [-63, -3, 3, 63].forEach(rx => {
      for (let rz = -90; rz <= 90; rz += 22) {
        const lamp = KarachiModels.createStreetLamp();
        lamp.position.set(rx, 0, rz);
        this.registerEdible(lamp, 1, 35, "Street Lamp", 0.9);
      }
    });

    // Palms along Sea View
    for (let px = -90; px <= 90; px += 7) {
      const palm = KarachiModels.createPalmTree(7 + Math.random() * 2);
      palm.position.set(px, 0, 95 + (Math.random() - 0.5) * 6);
      this.registerEdible(palm, 2, 70, "Sea View Palm", 1.8);
    }
  }
}
