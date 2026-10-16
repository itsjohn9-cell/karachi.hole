import * as THREE from 'three';
import { KarachiModels } from './karachiModels.js';
import { TextureGenerator } from './textures.js';

export class CityGenerator {
  constructor(scene) {
    this.scene = scene;
    this.edibleObjects = [];
    this.politicians = [];
    this.mapSize = 240; // 240m x 240m map
  }

  generateCity() {
    this.createGround();
    this.createRoadNetwork();
    this.populateZones();
    return {
      edibleObjects: this.edibleObjects,
      politicians: this.politicians
    };
  }

  createGround() {
    // Ground plane (Earth / Sandy foundation of coastal Karachi)
    const groundGeo = new THREE.PlaneGeometry(this.mapSize + 40, this.mapSize + 40);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xc4b79b, // Warm Karachi sand / dust coastal tone
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoadNetwork() {
    const roadTexture = TextureGenerator.createRoadTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.7
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
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, this.mapSize), KarachiModels.materials.sandstone);
      curbL.position.set(x - roadWidth / 2 - 0.6, 0.12, 0);
      this.scene.add(curbL);

      const curbR = curbL.clone();
      curbR.position.x = x + roadWidth / 2 + 0.6;
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

      const curbT = new THREE.Mesh(new THREE.BoxGeometry(this.mapSize, 0.25, 1.2), KarachiModels.materials.sandstone);
      curbT.position.set(0, 0.12, z - roadWidth / 2 - 0.6);
      this.scene.add(curbT);

      const curbB = curbT.clone();
      curbB.position.z = z + roadWidth / 2 + 0.6;
      this.scene.add(curbB);
    });

    // Sea View Coastline Strip (South border z = 100 to 120)
    const seaGeo = new THREE.PlaneGeometry(this.mapSize + 40, 45);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x007799,
      roughness: 0.2,
      metalness: 0.4
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, -0.2, 115);
    this.scene.add(sea);
  }

  registerEdible(mesh, tier, points, name, radius, isPolitician = false) {
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
      isPolitician
    };
    this.edibleObjects.push(item);
    if (isPolitician) {
      this.politicians.push(item);
    }
    return item;
  }

  populateZones() {
    // =============================================================
    // 0. IMMEDIATE PLAYER SPAWN FEAST (Around x: 0, z: -15)
    // Instant gratification for kids: cones, mangoes, politicians, bikes!
    // =============================================================
    const startFeastCones = [
      [-3, -12], [-1.5, -12], [0, -12], [1.5, -12], [3, -12],
      [-2, -18], [0, -18], [2, -18], [-4, -15], [4, -15]
    ];
    startFeastCones.forEach(([cx, cz]) => {
      const cone = KarachiModels.createTrafficCone();
      cone.position.set(cx, 0, cz);
      this.registerEdible(cone, 1, 25, "Traffic Cone", 0.65);
    });

    // 4 Sindhri Mango Carts right near spawn
    [[-6, -14], [6, -14], [-5, -20], [5, -20]].forEach(([fx, fz]) => {
      const thela = KarachiModels.createFruitThela();
      thela.position.set(fx, 0, fz);
      thela.rotation.y = Math.random() * Math.PI;
      this.registerEdible(thela, 1, 50, "Mango Thela", 1.2);
    });

    // 5 CD-70 Motorbikes lined up right next to spawn
    for (let bx = -4; bx <= 4; bx += 2) {
      const bike = KarachiModels.createMotorbike();
      bike.position.set(bx, 0, -8);
      this.registerEdible(bike, 1, 40, "CD-70 Motorbike", 1.1);
    }

    // 3 Hilarious VIP Politicians right at start with funny quotes!
    const startPoliticians = [
      { pos: [0, -22], name: "Senator Mukhtar", quote: "Mujhe kyun nikala?!" },
      { pos: [-4, -24], name: "VIP Chaudhry", quote: "VIP Protocol kidhar hai?!" },
      { pos: [4, -24], name: "MNA Jamali", quote: "Tabdeeli aa gayi hai!" }
    ];
    startPoliticians.forEach(sp => {
      const pol = KarachiModels.createPolitician({ name: sp.name, quote: sp.quote });
      pol.position.set(sp.pos[0], 0, sp.pos[1]);
      this.registerEdible(pol, 1, 350, sp.name, 1.2, true);
    });

    // 2 Parked Auto-Rickshaws ready to eat
    const rick1 = KarachiModels.createAutoRickshaw();
    rick1.position.set(-6, 0, -10);
    this.registerEdible(rick1, 2, 90, "Auto-Rickshaw", 1.8);
    const rick2 = KarachiModels.createAutoRickshaw();
    rick2.position.set(6, 0, -10);
    this.registerEdible(rick2, 2, 90, "Auto-Rickshaw", 1.8);

    // =============================================================
    // 1. VIP PAKISTANI POLITICIANS ACROSS THE CITY (15 More Politicians!)
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
      this.registerEdible(pol, 1, 400, pName, 1.2, true);

      // Give some politicians a black VIP Police Escort SUV nearby!
      if (idx % 3 === 0) {
        const suv = KarachiModels.createVIPProtocolSUV();
        suv.position.set(spot[0] + 5, 0, spot[1]);
        this.registerEdible(suv, 3, 280, "VIP Protocol SUV", 3.2);
      }
    });

    // =============================================================
    // 2. ZONE 1: Central Memorial Park - Mazar-e-Quaid
    // =============================================================
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, 0);
    this.registerEdible(mazar, 5, 3000, "Mazar-e-Quaid", 14.0);

    // Lush Palm Grove & Walking Citizens around Mazar
    const parkCoords = [
      [-22, -22], [22, -22], [-22, 22], [22, 22],
      [-28, 0], [28, 0], [0, -28], [0, 28],
      [-18, -12], [18, -12], [-18, 12], [18, 12],
      [-12, -22], [12, -22], [-12, 22], [12, 22]
    ];
    parkCoords.forEach(([px, pz]) => {
      const palm = KarachiModels.createPalmTree(6 + Math.random() * 2);
      palm.position.set(px, 0, pz);
      this.registerEdible(palm, 2, 70, "Date Palm", 1.8);

      // Crowds of Citizens in the park
      for (let c = 0; c < 2; c++) {
        const ped = KarachiModels.createPedestrian();
        ped.position.set(px + (Math.random() - 0.5) * 5, 0, pz + (Math.random() - 0.5) * 5);
        this.registerEdible(ped, 1, 30, "Citizen", 0.65);
      }
    });

    // =============================================================
    // 3. ZONE 2: Saddar & Empress Market Bazaar (Ultra Dense Bazaar!)
    // =============================================================
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-38, 0, -38);
    this.registerEdible(empress, 4, 1500, "Empress Market Saddar", 10.0);

    // 20 Fruit Carts around Empress Market Bazaar
    for (let i = 0; i < 20; i++) {
      const thela = KarachiModels.createFruitThela();
      thela.position.set(-60 + Math.random() * 45, 0, -60 + Math.random() * 45);
      thela.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(thela, 1, 50, "Sindhri Mango Thela", 1.2);
    }

    // 25 Parked Rickshaws in Saddar
    for (let i = 0; i < 25; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      rickshaw.position.set(-65 + Math.random() * 50, 0, -35 + Math.random() * 50);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8);
    }

    // =============================================================
    // 4. ZONE 3: I.I. Chundrigar Financial District
    // =============================================================
    const towerCoords = [[36, -38], [55, -35], [38, -55], [58, -58]];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2200, `Chundrigar Tower #${idx + 1}`, 7.5);
    });

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

    // 10 Karachi Water Supply Tankers
    for (let i = 0; i < 10; i++) {
      const tanker = KarachiModels.createWaterTanker();
      tanker.position.set(20 + Math.random() * 50, 0, -20 + (Math.random() - 0.5) * 55);
      tanker.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(tanker, 3, 230, "Water Tanker Truck", 3.2);
    }

    // =============================================================
    // 5. ZONE 4: Burns Road Food Street & Chai Dhabas
    // =============================================================
    for (let i = 0; i < 10; i++) {
      const dhaba = KarachiModels.createChaiDhaba();
      dhaba.position.set(-60 + i * 8, 0, 32 + (i % 2) * 8);
      this.registerEdible(dhaba, 2, 120, "Quetta Alamgir Chai", 2.2);
    }

    for (let i = 0; i < 10; i++) {
      const biryani = KarachiModels.createBurnsRoadBiryaniStall();
      biryani.position.set(-65 + i * 8, 0, 48 + (i % 2) * 7);
      this.registerEdible(biryani, 2, 100, "Burns Road Biryani Deg", 1.9);
    }

    // =============================================================
    // 6. ZONE 5: Clifton & DHA Residential Villas
    // =============================================================
    for (let bx = 26; bx <= 64; bx += 18) {
      for (let bz = 26; bz <= 64; bz += 18) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 380, "Clifton Villa", 5.0);
      }
    }

    // =============================================================
    // 7. PAKISTANI TRUCK ART BEDFORD TRUCKS (14 Trucks)
    // =============================================================
    const truckPositions = [
      [-65, 0, -10], [-65, 0, 20], [5, 0, -65], [5, 0, 65],
      [65, 0, 15], [65, 0, -25], [-20, 0, 65], [30, 0, 65],
      [-45, 0, 0], [45, 0, 0], [0, 0, 50], [0, 0, -50],
      [-55, 0, -55], [55, 0, 55]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(...tp);
      truck.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(truck, 3, 260, `Truck-Art Bedford #${idx + 1}`, 3.5);
    });

    // 10 Karachi W-11 Mini-Buses
    const busPositions = [
      [-75, 0, -45], [-75, 0, 40], [75, 0, -40], [75, 0, 45],
      [-40, 0, -75], [40, 0, 75], [-15, 0, 75], [15, 0, -75],
      [-75, 0, 0], [75, 0, 0]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(...bp);
      bus.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(bus, 3, 210, `W-11 Mini-Bus #${idx + 1}`, 3.4);
    });

    // =============================================================
    // 8. MASSIVE DENSITY OF STREET OBJECTS EVERYWHERE (400+ More Items!)
    // =============================================================
    // 60 More Rickshaws
    for (let i = 0; i < 60; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const rx = (Math.random() - 0.5) * 190;
      const rz = (Math.random() - 0.5) * 190;
      rickshaw.position.set(rx, 0, rz);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8);
    }

    // 90 CD-70 Motorbikes
    for (let i = 0; i < 90; i++) {
      const bike = KarachiModels.createMotorbike();
      const bx = (Math.random() - 0.5) * 190;
      const bz = (Math.random() - 0.5) * 190;
      bike.position.set(bx, 0, bz);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1);
    }

    // 80 Traffic Cones in clusters along roads
    for (let i = 0; i < 80; i++) {
      const cone = KarachiModels.createTrafficCone();
      const cx = (Math.random() - 0.5) * 190;
      const cz = (Math.random() - 0.5) * 190;
      cone.position.set(cx, 0, cz);
      this.registerEdible(cone, 1, 20, "Traffic Cone", 0.65);
    }

    // 90 Walking Citizens
    for (let i = 0; i < 90; i++) {
      const ped = KarachiModels.createPedestrian();
      const px = (Math.random() - 0.5) * 190;
      const pz = (Math.random() - 0.5) * 190;
      ped.position.set(px, 0, pz);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 30, "Citizen", 0.65);
    }

    // Street Lamps along roads
    [-63, -3, 3, 63].forEach(rx => {
      for (let rz = -90; rz <= 90; rz += 18) {
        const lamp = KarachiModels.createStreetLamp();
        lamp.position.set(rx, 0, rz);
        this.registerEdible(lamp, 1, 35, "Street Lamp", 0.9);
      }
    });

    // 40 Sea View Coastline Palms
    for (let px = -95; px <= 95; px += 5) {
      const palm = KarachiModels.createPalmTree(7 + Math.random() * 2);
      palm.position.set(px, 0, 95 + (Math.random() - 0.5) * 6);
      this.registerEdible(palm, 2, 70, "Sea View Palm", 1.8);
    }
  }
}
