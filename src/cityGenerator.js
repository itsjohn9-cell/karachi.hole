import * as THREE from 'three';
import { KarachiModels } from './karachiModels.js';
import { TextureGenerator } from './textures.js';

export class CityGenerator {
  constructor(scene) {
    this.scene = scene;
    this.edibleObjects = [];
    this.staticDecorations = [];
    this.mapSize = 240; // 240m x 240m map
  }

  generateCity() {
    this.createGround();
    this.createRoadNetwork();
    this.populateZones();
    return this.edibleObjects;
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
      color: 0x007799, // Arabian Sea teal
      roughness: 0.2,
      metalness: 0.4
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, -0.2, 115);
    this.scene.add(sea);
  }

  // Register an interactive edible object with tier, points, suction radius
  registerEdible(mesh, tier, points, name, radius) {
    this.scene.add(mesh);
    this.edibleObjects.push({
      mesh,
      tier,
      points,
      name,
      radius,
      origY: mesh.position.y,
      state: 'idle', // 'idle', 'sucking', 'swallowed'
      suctionProgress: 0,
      scaleX: mesh.scale.x,
      scaleY: mesh.scale.y,
      scaleZ: mesh.scale.z
    });
  }

  populateZones() {
    // -------------------------------------------------------------
    // ZONE 1: Central Memorial Park - Mazar-e-Quaid (Center: 0, 0)
    // -------------------------------------------------------------
    const mazar = KarachiModels.createMazarEQuaid();
    mazar.position.set(0, 0, 0);
    this.registerEdible(mazar, 5, 2500, "Mazar-e-Quaid", 14.0);

    // Surrounding Park Palms & Gardens
    const parkTreeCoords = [
      [-22, -22], [22, -22], [-22, 22], [22, 22],
      [-28, 0], [28, 0], [0, -28], [0, 28],
      [-18, -12], [18, -12], [-18, 12], [18, 12]
    ];
    parkTreeCoords.forEach(([px, pz]) => {
      const palm = KarachiModels.createPalmTree(6 + Math.random() * 2);
      palm.position.set(px, 0, pz);
      this.registerEdible(palm, 2, 60, "Date Palm", 1.8);

      // Pedestrians walking in the park
      if (Math.random() > 0.4) {
        const ped = KarachiModels.createPedestrian();
        ped.position.set(px + (Math.random() - 0.5) * 4, 0, pz + (Math.random() - 0.5) * 4);
        this.registerEdible(ped, 1, 25, "Citizen", 0.6);
      }
    });

    // -------------------------------------------------------------
    // ZONE 2: Saddar & Empress Market (North-West: x: -40, z: -40)
    // -------------------------------------------------------------
    const empress = KarachiModels.createEmpressMarket();
    empress.position.set(-38, 0, -38);
    this.registerEdible(empress, 4, 1200, "Empress Market Saddar", 10.0);

    // Saddar Bazaar Street Vendors, Fruit Carts, and Rickshaws
    for (let i = 0; i < 8; i++) {
      const thela = KarachiModels.createFruitThela();
      const tx = -55 + Math.random() * 32;
      const tz = -55 + Math.random() * 32;
      thela.position.set(tx, 0, tz);
      thela.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(thela, 1, 45, "Sindhri Mango Thela", 1.2);
    }

    for (let i = 0; i < 7; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      rickshaw.position.set(-60 + Math.random() * 45, 0, -30 + Math.random() * 45);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Auto-Rickshaw", 1.8);
    }

    // -------------------------------------------------------------
    // ZONE 3: I.I. Chundrigar Financial District (North-East: x: 40, z: -40)
    // -------------------------------------------------------------
    const towerCoords = [
      [36, -38], [55, -35], [38, -55], [58, -58]
    ];
    towerCoords.forEach(([tx, tz], idx) => {
      const tower = KarachiModels.createChundrigarSkyscraper();
      tower.position.set(tx, 0, tz);
      this.registerEdible(tower, 5, 2000, `Chundrigar High-Rise #${idx + 1}`, 7.5);
    });

    // Commercial Plazas in Chundrigar & Saddar
    const plazas = [
      { pos: [38, -18], name: "Habib Metro Plaza", sign: "HABIB BANK PLAZA", sub: "HEAD OFFICE KARACHI" },
      { pos: [58, -18], name: "Kababjees Commercial", sign: "KABABJEES HIGHWAY", sub: "EXPRESS DINING" },
      { pos: [-38, -18], name: "Saddar Electronics Hub", sign: "JAHANGIR AUTOS", sub: "CHUNDRIGAR ROAD" },
      { pos: [-18, -38], name: "Burns Road Super Mart", sign: "BURNS ROAD SUPER MART", sub: "AUTHENTIC KARACHI" }
    ];
    plazas.forEach(p => {
      const plaza = KarachiModels.createCommercialPlaza(p.sign, p.sub);
      plaza.position.set(p.pos[0], 0, p.pos[1]);
      this.registerEdible(plaza, 4, 850, p.name, 6.5);
    });

    // Karachi Water Supply Tankers (Essential Karachi iconic sight!)
    for (let i = 0; i < 6; i++) {
      const tanker = KarachiModels.createWaterTanker();
      tanker.position.set(25 + Math.random() * 45, 0, -25 + (Math.random() - 0.5) * 50);
      tanker.rotation.y = (Math.random() > 0.5 ? 0 : Math.PI / 2);
      this.registerEdible(tanker, 3, 220, "Karachi Water Tanker", 3.2);
    }

    // -------------------------------------------------------------
    // ZONE 4: Burns Road Food Street & Chai Dhabas (South-West: x: -40, z: 40)
    // -------------------------------------------------------------
    for (let i = 0; i < 5; i++) {
      const dhaba = KarachiModels.createChaiDhaba();
      dhaba.position.set(-50 + i * 9, 0, 32 + (i % 2) * 8);
      dhaba.rotation.y = (Math.random() - 0.5) * 0.4;
      this.registerEdible(dhaba, 2, 110, "Quetta Alamgir Chai", 2.2);
    }

    for (let i = 0; i < 5; i++) {
      const biryani = KarachiModels.createBurnsRoadBiryaniStall();
      biryani.position.set(-55 + i * 9, 0, 48 + (i % 2) * 6);
      biryani.rotation.y = (Math.random() - 0.5) * 0.5;
      this.registerEdible(biryani, 2, 95, "Burns Road Biryani Deg", 1.9);
    }

    // -------------------------------------------------------------
    // ZONE 5: Clifton & DHA Residential Bungalows (South-East: x: 40, z: 40)
    // -------------------------------------------------------------
    for (let bx = 28; bx <= 62; bx += 17) {
      for (let bz = 28; bz <= 62; bz += 17) {
        const bungalow = KarachiModels.createResidentialBungalow();
        bungalow.position.set(bx, 0, bz);
        this.registerEdible(bungalow, 3, 350, "Clifton Bungalow", 5.0);
      }
    }

    // -------------------------------------------------------------
    // ICONIC PAKISTANI BEDFORD TRUCKS (Cruising around avenues)
    // -------------------------------------------------------------
    const truckPositions = [
      [-65, 0, -10], [-65, 0, 20], [5, 0, -65], [5, 0, 65],
      [65, 0, 15], [65, 0, -25], [-20, 0, 65], [30, 0, 65]
    ];
    truckPositions.forEach((tp, idx) => {
      const truck = KarachiModels.createBedfordTruck();
      truck.position.set(...tp);
      truck.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
      this.registerEdible(truck, 3, 250, `Truck-Art Bedford #${idx + 1}`, 3.5);
    });

    // -------------------------------------------------------------
    // KARACHI W-11 MINI-BUSES
    // -------------------------------------------------------------
    const busPositions = [
      [-75, 0, -45], [-75, 0, 40], [75, 0, -40], [75, 0, 45],
      [-40, 0, -75], [40, 0, 75]
    ];
    busPositions.forEach((bp, idx) => {
      const bus = KarachiModels.createW11MiniBus();
      bus.position.set(...bp);
      bus.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.registerEdible(bus, 3, 200, `W-11 Mini-Bus #${idx + 1}`, 3.4);
    });

    // -------------------------------------------------------------
    // AUTO-RICKSHAWS & MOTORBIKES ACROSS ALL ROADS
    // -------------------------------------------------------------
    for (let i = 0; i < 22; i++) {
      const rickshaw = KarachiModels.createAutoRickshaw();
      const rx = (Math.random() - 0.5) * 160;
      const rz = (Math.random() - 0.5) * 160;
      rickshaw.position.set(rx, 0, rz);
      rickshaw.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(rickshaw, 2, 90, "Karachi Rickshaw", 1.8);
    }

    for (let i = 0; i < 28; i++) {
      const bike = KarachiModels.createMotorbike();
      const bx = (Math.random() - 0.5) * 170;
      const bz = (Math.random() - 0.5) * 170;
      bike.position.set(bx, 0, bz);
      bike.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(bike, 1, 35, "CD-70 Motorbike", 1.1);
    }

    // -------------------------------------------------------------
    // STREET PROPS: TRAFFIC CONES, PEDESTRIANS, STREET LAMPS
    // -------------------------------------------------------------
    for (let i = 0; i < 35; i++) {
      const cone = KarachiModels.createTrafficCone();
      const cx = (Math.random() - 0.5) * 170;
      const cz = (Math.random() - 0.5) * 170;
      cone.position.set(cx, 0, cz);
      this.registerEdible(cone, 1, 20, "Traffic Cone", 0.6);
    }

    for (let i = 0; i < 45; i++) {
      const ped = KarachiModels.createPedestrian();
      const px = (Math.random() - 0.5) * 180;
      const pz = (Math.random() - 0.5) * 180;
      ped.position.set(px, 0, pz);
      ped.rotation.y = Math.random() * Math.PI * 2;
      this.registerEdible(ped, 1, 25, "Pedestrian", 0.6);
    }

    // Street Lamps along roads
    [-63, -3, 3, 63].forEach(rx => {
      for (let rz = -80; rz <= 80; rz += 25) {
        const lamp = KarachiModels.createStreetLamp();
        lamp.position.set(rx, 0, rz);
        this.registerEdible(lamp, 1, 35, "Karachi Street Lamp", 0.9);
      }
    });

    // Sea View Palm Trees along Southern Coast
    for (let px = -90; px <= 90; px += 10) {
      const palm = KarachiModels.createPalmTree(7 + Math.random() * 2);
      palm.position.set(px, 0, 95 + (Math.random() - 0.5) * 6);
      this.registerEdible(palm, 2, 60, "Sea View Coconut Palm", 1.8);
    }
  }
}
