import * as THREE from 'three';

/**
 * Traditional Thai Wooden Rowing Boat (เรือพายไม้โบราณ)
 * Features:
 * - Handcrafted wooden canoe hull
 * - Perimeter candle lights lining the boat's rim
 * - Boatman with straw hat (งอบ) and oar
 * - Thai ladies holding a decorative krathong
 * - Gentle water floating physics
 */
export class TraditionalBoat {
  constructor(scene, initialPos = new THREE.Vector3(6.5, 0.2, -18.0)) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(initialPos);
    this.group.rotation.y = -Math.PI * 0.18; // Angled gracefully across river

    // Materials
    this.woodHullMat = new THREE.MeshStandardMaterial({
      color: 0x542c16,
      roughness: 0.75,
      metalness: 0.05
    });

    this.woodTrimMat = new THREE.MeshStandardMaterial({
      color: 0x802422, // Thai reddish painted rim
      roughness: 0.65
    });

    this.candleLightMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22
    });

    this.strawHatMat = new THREE.MeshStandardMaterial({
      color: 0xd9b777,
      roughness: 0.9
    });

    this.morHomMat = new THREE.MeshStandardMaterial({
      color: 0x1b3554,
      roughness: 0.8
    });

    this.thaiSabaiPinkMat = new THREE.MeshStandardMaterial({
      color: 0xf07aa8,
      roughness: 0.6
    });

    this.thaiSabaiWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf5f6fa,
      roughness: 0.5
    });

    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xf2c8a7,
      roughness: 0.65
    });

    this.buildBoatHull();
    this.buildRimCandles();
    this.buildBoatPassengers();

    this.scene.add(this.group);
  }

  buildBoatHull() {
    // Slender pointed wooden canoe hull
    const hullLength = 12.0;
    const hullWidth = 2.4;
    const hullDepth = 0.9;

    const hullGroup = new THREE.Group();

    // Bottom keel
    const keelGeo = new THREE.BoxGeometry(hullWidth, 0.25, hullLength);
    const keelMesh = new THREE.Mesh(keelGeo, this.woodHullMat);
    hullGroup.add(keelMesh);

    // Side planks
    const sideGeo = new THREE.BoxGeometry(0.18, hullDepth, hullLength);
    const leftSide = new THREE.Mesh(sideGeo, this.woodTrimMat);
    leftSide.position.set(-hullWidth / 2, hullDepth / 2, 0);
    leftSide.rotation.z = -0.15;
    hullGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, this.woodTrimMat);
    rightSide.position.set(hullWidth / 2, hullDepth / 2, 0);
    rightSide.rotation.z = 0.15;
    hullGroup.add(rightSide);

    // Tapered bow and stern cones
    const bowGeo = new THREE.ConeGeometry(hullWidth * 0.55, 3.2, 4);
    bowGeo.rotateX(-Math.PI / 2);
    const bowMesh = new THREE.Mesh(bowGeo, this.woodHullMat);
    bowMesh.position.set(0, hullDepth * 0.35, hullLength / 2 + 1.2);
    hullGroup.add(bowMesh);

    const sternMesh = new THREE.Mesh(bowGeo, this.woodHullMat);
    sternMesh.rotation.y = Math.PI;
    sternMesh.position.set(0, hullDepth * 0.35, -hullLength / 2 - 1.2);
    hullGroup.add(sternMesh);

    this.group.add(hullGroup);
  }

  buildRimCandles() {
    // 10 tiny candles lining the rim of the boat
    const candleCoords = [
      [-1.15, -4.5], [-1.2, -2.5], [-1.2, 0], [-1.2, 2.5], [-1.15, 4.5],
      [1.15, -4.5], [1.2, -2.5], [1.2, 0], [1.2, 2.5], [1.15, 4.5]
    ];

    for (const [cx, cz] of candleCoords) {
      const cGroup = new THREE.Group();
      cGroup.position.set(cx, 0.9, cz);

      // Clay base
      const bGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 6);
      const bMesh = new THREE.Mesh(bGeo, this.woodHullMat);
      cGroup.add(bMesh);

      // Glowing flame
      const fGeo = new THREE.SphereGeometry(0.045, 6, 6);
      const fMesh = new THREE.Mesh(fGeo, this.candleLightMat);
      fMesh.position.y = 0.08;
      cGroup.add(fMesh);

      this.group.add(cGroup);
    }
  }

  buildBoatPassengers() {
    // 1. Boatman at the stern (Z: -4.0)
    const boatman = new THREE.Group();
    boatman.position.set(0, 0.25, -4.2);

    // Body in Mor-Hom
    const bTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), this.morHomMat);
    bTorso.position.y = 0.55;
    boatman.add(bTorso);

    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), this.skinMat);
    bHead.position.y = 1.0;
    boatman.add(bHead);

    // Farmer's Straw Hat (งอบใบราน)
    const hatGeo = new THREE.ConeGeometry(0.55, 0.32, 12);
    const hatMesh = new THREE.Mesh(hatGeo, this.strawHatMat);
    hatMesh.position.y = 1.2;
    boatman.add(hatMesh);

    // Wooden Oar (ไม้พาย) dipping into water
    const oarGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 6);
    oarGeo.rotateX(0.45);
    oarGeo.rotateZ(0.35);
    const oarMesh = new THREE.Mesh(oarGeo, this.woodHullMat);
    oarMesh.position.set(0.9, 0.4, 0.5);
    boatman.add(oarMesh);

    this.group.add(boatman);

    // 2. Thai Ladies in middle holding Krathong (Z: 0.5 to 2.0)
    const lady1 = new THREE.Group();
    lady1.position.set(-0.35, 0.25, 0.8);
    const lTorso1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), this.thaiSabaiPinkMat);
    lTorso1.position.y = 0.5;
    lady1.add(lTorso1);
    const lHead1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), this.skinMat);
    lHead1.position.y = 0.9;
    lady1.add(lHead1);
    this.group.add(lady1);

    const lady2 = new THREE.Group();
    lady2.position.set(0.35, 0.25, 1.4);
    const lTorso2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.24), this.thaiSabaiWhiteMat);
    lTorso2.position.y = 0.5;
    lady2.add(lTorso2);
    const lHead2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), this.skinMat);
    lHead2.position.y = 0.9;
    lady2.add(lHead2);
    this.group.add(lady2);

    // Beautiful glowing krathong held between them
    const boatKrathong = new THREE.Group();
    boatKrathong.position.set(0, 0.75, 1.1);

    const kBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.12, 10), new THREE.MeshBasicMaterial({ color: 0x2e6b22 }));
    boatKrathong.add(kBase);

    const kFlame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), this.candleLightMat);
    kFlame.position.y = 0.25;
    boatKrathong.add(kFlame);

    this.group.add(boatKrathong);
  }

  update(delta, time, riverWater) {
    // Gentle bobbing on water
    const waveY = riverWater ? riverWater.getWaveHeight(this.group.position.x, this.group.position.z, time) : 0;
    this.group.position.y = 0.18 + waveY;

    // Gentle swaying
    this.group.rotation.z = Math.sin(time * 1.4) * 0.025;
    this.group.rotation.x = Math.cos(time * 1.1) * 0.015;
  }
}
