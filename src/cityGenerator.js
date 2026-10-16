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
      robberies: this.robberies
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

  registerEdible(mesh, tier, points, name, radius, { isPolitician = false, isAnimal = false, isRobbery = false, isRubbish = false } = {}) {
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
      isRubbish
    };
    this.edibleObjects.push(item);
    if (isPolitician) this.politicians.push(item);
    if (isAnimal) this.animals.push(item);
    if (isRobbery) this.robberies.push(item);
    return item;
  }

  populateZones() {
    // =============================================================
    // 0. IMMEDIATE PLAYER SPAWN FEAST (Around x: 0, z: -15)
    // Rich feast of rubbish, soda cans, rats, stray dogs, robbers, politicians!
    // =============================================================
    // 15 Plastic trash bags scattered right around the hole
    const trashColors = [0x1565c0, 0x212121, 0x43a047, 0xe53935];
    for (let i = 0; i < 15; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      bag.position.set(-5 + Math.random() * 10, 0, -12 - Math.random() * 12);
      this.registerEdible(bag, 1, 15, "Trash Bag", 0.5, { isRubbish: true });
    }

    // 12 Soda cans & water bottles on road
    for (let i = 0; i < 8; i++) {
      const can = KarachiModels.createSodaCan();
      can.position.set(-4 + Math.random() * 8, 0, -10 - Math.random() * 10);
      this.registerEdible(can, 1, 10, "Soda Can", 0.35, { isRubbish: true });
    }
    for (let i = 0; i < 8; i++) {
      const bottle = KarachiModels.createWaterBottle();
      bottle.position.set(-4 + Math.random() * 8, 0, -11 - Math.random() * 10);
      this.registerEdible(bottle, 1, 10, "Water Bottle", 0.35, { isRubbish: true });
    }

    // 6 Sewer rats scurrying around the trash at spawn!
    for (let i = 0; i < 6; i++) {
      const rat = KarachiModels.createSewerRat();
      rat.position.set(-3 + Math.random() * 6, 0, -13 - Math.random() * 8);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true });
    }

    // 2 Barking Desi Stray Dogs right near start!
    const dog1 = KarachiModels.createStrayDog();
    dog1.position.set(-5, 0, -18);
    this.registerEdible(dog1, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });

    const dog2 = KarachiModels.createStrayDog();
    dog2.position.set(5, 0, -18);
    this.registerEdible(dog2, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });

    // 2 Street Cats roaming curbs
    const cat1 = KarachiModels.createStreetCat();
    cat1.position.set(-6, 0, -12);
    this.registerEdible(cat1, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true });

    // 1 Full Street Robbery Scene right near start (at x: 8, z: -20)!
    const rob1 = KarachiModels.createRobberyScene();
    rob1.position.set(7.5, 0, -22);
    this.registerEdible(rob1, 1, 750, "Mobile Snatcher Scene (ڈاکو)", 2.4, { isRobbery: true });

    // 3 Hilarious VIP Politicians right at start with briefcases and funny quotes!
    const startPoliticians = [
      { pos: [0, -24], name: "Senator Mukhtar", quote: "Mujhe kyun nikala?!" },
      { pos: [-4, -26], name: "VIP Chaudhry", quote: "VIP Protocol kidhar hai?!" },
      { pos: [4, -26], name: "MNA Jamali", quote: "Tabdeeli aa gayi hai!" }
    ];
    startPoliticians.forEach(sp => {
      const pol = KarachiModels.createPolitician({ name: sp.name, quote: sp.quote });
      pol.position.set(sp.pos[0], 0, sp.pos[1]);
      this.registerEdible(pol, 1, 350, sp.name, 1.2, { isPolitician: true });
    });

    // Cones, mango carts & motorbikes at start
    for (let x = -3; x <= 3; x += 1.5) {
      const cone = KarachiModels.createTrafficCone();
      cone.position.set(x, 0, -10);
      this.registerEdible(cone, 1, 20, "Traffic Cone", 0.6);
    }
    const thela1 = KarachiModels.createFruitThela();
    thela1.position.set(-6, 0, -16);
    this.registerEdible(thela1, 1, 50, "Mango Thela", 1.2);

    // =============================================================
    // 1. KARACHI STREET ROBBERY SCENES ACROSS THE CITY (8 Robbery Scenes!)
    // =============================================================
    const robberySpots = [
      [-35, -20], [-45, -45], [30, -25], [45, -45],
      [-30, 30], [-55, 50], [25, 30], [50, 45]
    ];
    robberySpots.forEach((spot, idx) => {
      const robScene = KarachiModels.createRobberyScene();
      robScene.position.set(spot[0], 0, spot[1]);
      robScene.rotation.y = (Math.random() - 0.5) * 0.8;
      this.registerEdible(robScene, 1, 750, `Mobile Snatcher #${idx + 2}`, 2.4, { isRobbery: true });
    });

    // =============================================================
    // 2. VIP PAKISTANI POLITICIANS ACROSS THE CITY (15 Politicians)
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
      "Save the money bag!"
    ];

    const politicianSpots = [
      [-30, -30], [-25, -45], [-50, -25], [25, -25], [45, -30],
      [30, -50], [-35, 25], [-45, 45], [-20, 35], [25, 25],
      [45, 35], [30, 50], [0, 25], [15, 60], [-15, 60]
    ];

    politicianSpots.forEach((spot, idx) => {
      const q = politicalQuotes[idx % politicalQuotes.length];
      const pName = `Politician #${idx + 1}`;
      const pol = KarachiModels.createPolitician({ name: pName, quote: q });
      pol.position.set(spot[0], 0, spot[1]);
      this.registerEdible(pol, 1, 350, pName, 1.2, { isPolitician: true });

      if (idx % 3 === 0) {
        const suv = KarachiModels.createVIPProtocolSUV();
        suv.position.set(spot[0] + 5, 0, spot[1]);
        this.registerEdible(suv, 3, 280, "VIP Protocol SUV", 3.2);
      }
    });

    // =============================================================
    // 3. RUBBISH, GARBAGE BAGS & KACHRA DUMPS (150+ Rubbish items!)
    // =============================================================
    // 20 Big Garbage Dumps (Kachra Kundi heaps) along road corners
    for (let i = 0; i < 20; i++) {
      const dump = KarachiModels.createKachraDump();
      const dx = (Math.random() - 0.5) * 180;
      const dz = (Math.random() - 0.5) * 180;
      dump.position.set(dx, 0, dz);
      dump.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dump, 1, 85, "Kachra Kundi Heap", 1.8, { isRubbish: true });
    }

    // 100 Trash bags along sidewalks and curbs
    for (let i = 0; i < 100; i++) {
      const col = trashColors[i % trashColors.length];
      const bag = KarachiModels.createTrashBag(col);
      const bx = (Math.random() - 0.5) * 190;
      const bz = (Math.random() - 0.5) * 190;
      bag.position.set(bx, 0, bz);
      this.registerEdible(bag, 1, 15, "Trash Bag", 0.5, { isRubbish: true });
    }

    // 80 Soda Cans & Plastic Bottles
    for (let i = 0; i < 80; i++) {
      const item = Math.random() > 0.5 ? KarachiModels.createSodaCan() : KarachiModels.createWaterBottle();
      const ix = (Math.random() - 0.5) * 190;
      const iz = (Math.random() - 0.5) * 190;
      item.position.set(ix, 0, iz);
      this.registerEdible(item, 1, 10, "Street Debris", 0.35, { isRubbish: true });
    }

    // =============================================================
    // 4. KARACHI ANIMALS: STRAY DOGS, CATS, AND SEWER RATS (70+ Animals)
    // =============================================================
    // 25 Stray Dogs (Kuttay)
    for (let i = 0; i < 25; i++) {
      const dog = KarachiModels.createStrayDog();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      dog.position.set(x, 0, z);
      dog.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(dog, 1, 45, "Stray Dog (کتا)", 0.8, { isAnimal: true });
    }

    // 20 Street Cats (Billiyan)
    for (let i = 0; i < 20; i++) {
      const cat = KarachiModels.createStreetCat();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      cat.position.set(x, 0, z);
      cat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(cat, 1, 35, "Street Cat (بلی)", 0.6, { isAnimal: true });
    }

    // 35 Sewer Rats (Choohay) scurrying in groups
    for (let i = 0; i < 35; i++) {
      const rat = KarachiModels.createSewerRat();
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      rat.position.set(x, 0, z);
      rat.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rat, 1, 20, "Sewer Rat (چوہا)", 0.45, { isAnimal: true });
    }

    // =============================================================
    // 5. LANDMARKS & BIGGER DISTRICT OBJECTS
    // =============================================================
    // Mazar-e-Quaid
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, 0);
    this.registerEdible(mazar, 5, 3000, "Mazar-e-Quaid", 14.0);

    // Empress Market
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-38, 0, -38);
    this.registerEdible(empress, 4, 1500, "Empress Market Saddar", 10.0);

    // Chundrigar Skyscrapers
    const towerCoords = [[36, -38], [55, -35], [38, -55], [58, -58]];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2200, `Chundrigar Tower #${idx + 1}`, 7.5);
    });

    // Commercial Plazas
    const plazas = [
      { pos: [38, -18], name: "Habib Bank Plaza", sign: "HABIB BANK PLAZA", sub: "HEAD OFFICE KARACHI" },
      { pos: [58, -18], name: "Kababjees Commercial", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [-38, -18], name: "Jahangir Autos", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-18, -38], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 900, p.name, 6.5);
    });

    // 8 Water Tankers
    for (let i = 0; i < 8; i++) {
      const tanker = KarachiModels.createWaterTanker();
      tanker.position.set(20 + Math.random() * 50, 0, -20 + (Math.random() - 0.5) * 55);
      tanker.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(tanker, 3, 230, "Water Tanker Truck", 3.2);
    }

    // Chai Dhabas & Biryani Stalls
    for (let i = 0; i < 8; i++) {
      const dhaba = KarachiModels.createChaiDhaba();
      dhaba.position.set(-60 + i * 8, 0, 32 + (i % 2) * 8);
      this.registerEdible(dhaba, 2, 120, "Quetta Alamgir Chai", 2.2);
    }
    for (let i = 0; i < 8; i++) {
      const biryani = KarachiModels.createBurnsRoadBiryaniStall();
      biryani.position.set(-65 + i * 8, 0, 48 + (i % 2) * 7);
      this.registerEdible(biryani, 2, 100, "Burns Road Biryani Deg", 1.9);
    }

    // Clifton Villas
    for (let bx = 26; bx <= 64; bx += 18) {
      for (let bz = 26; bz <= 64; bz += 18) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 380, "Clifton Villa", 5.0);
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
