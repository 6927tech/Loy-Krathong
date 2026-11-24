import * as THREE from 'three';

/**
 * Procedural 3D Krathong generator with 2 designs: Small and Medium.
 * Includes candle flame flickers and dynamic floating physics.
 */
export class Krathong {
  constructor(type = 'small', initialPos = new THREE.Vector3(0, 0, 0), isPlayer = false) {
    this.type = type; // 'small' | 'medium'
    this.isPlayer = isPlayer;
    this.group = new THREE.Group();
    this.group.position.copy(initialPos);

    this.baseSpeed = 0.85 + Math.random() * 0.35;
    this.rotationSpeed = (Math.random() - 0.5) * 0.15;
    this.driftX = (Math.random() - 0.5) * 0.1;
    this.seed = Math.random() * 100;

    // Materials
    this.bananaLeafMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e6b22,
      roughness: 0.6,
      metalness: 0.1
    });

    this.bananaTrunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x889c62,
      roughness: 0.8,
      metalness: 0.05
    });

    this.lotusPinkMaterial = new THREE.MeshStandardMaterial({
      color: 0xe65c8a,
      roughness: 0.45,
      metalness: 0.1
    });

    this.lotusWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.4
    });

    this.marigoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      roughness: 0.5,
      metalness: 0.05
    });

    this.candleWaxMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb88,
      roughness: 0.3
    });

    this.incenseMaterial = new THREE.MeshStandardMaterial({
      color: 0x734832,
      roughness: 0.9
    });

    this.incenseGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3300
    });

    this.flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa22
    });

    this.candleLight = null;
    this.flameMesh = null;

    if (this.type === 'medium') {
      this.buildMediumKrathong();
    } else {
      this.buildSmallKrathong();
    }
  }

  buildSmallKrathong() {
    // 1. Banana trunk base disc (หยวกกล้วย)
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.45, 16);
    const baseMesh = new THREE.Mesh(baseGeo, this.bananaTrunkMaterial);
    baseMesh.position.y = 0.22;
    this.group.add(baseMesh);

    // 2. Eight folded banana leaf petals (กลีบใบตอง 8 กลีบ)
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.55, 1.1, 4);
      petalGeo.scale(1.2, 1.0, 0.4);
      const petalMesh = new THREE.Mesh(petalGeo, this.bananaLeafMaterial);
      petalMesh.position.set(
        Math.cos(angle) * 1.55,
        0.55,
        Math.sin(angle) * 1.55
      );
      petalMesh.rotation.y = -angle + Math.PI / 2;
      petalMesh.rotation.z = -0.35;
      this.group.add(petalMesh);
    }

    // 3. Central pink lotus flower (ดอกบัวตูม)
    const flowerGroup = new THREE.Group();
    flowerGroup.position.y = 0.45;
    for (let j = 0; j < 6; j++) {
      const fAngle = (j / 6) * Math.PI * 2;
      const fPetalGeo = new THREE.ConeGeometry(0.35, 0.8, 4);
      fPetalGeo.scale(1.0, 1.2, 0.4);
      const fPetalMesh = new THREE.Mesh(fPetalGeo, this.lotusPinkMaterial);
      fPetalMesh.position.set(
        Math.cos(fAngle) * 0.4,
        0.35,
        Math.sin(fAngle) * 0.4
      );
      fPetalMesh.rotation.y = -fAngle + Math.PI / 2;
      fPetalMesh.rotation.z = -0.2;
      flowerGroup.add(fPetalMesh);
    }
    this.group.add(flowerGroup);

    // 4. Incense sticks (ธูป 3 ดอก)
    for (let k = 0; k < 3; k++) {
      const incGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
      const incMesh = new THREE.Mesh(incGeo, this.incenseMaterial);
      incMesh.position.set(-0.25 + k * 0.12, 0.9, -0.15);
      incMesh.rotation.z = (k - 1) * 0.08;
      this.group.add(incMesh);

      // Glowing tip
      const tipGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const tipMesh = new THREE.Mesh(tipGeo, this.incenseGlowMaterial);
      tipMesh.position.set(incMesh.position.x, 1.5, incMesh.position.z);
      this.group.add(tipMesh);
    }

    // 5. Candle (เทียน 1 เล่ม) + Flickering Flame
    const candleGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.0, 8);
    const candleMesh = new THREE.Mesh(candleGeo, this.candleWaxMaterial);
    candleMesh.position.set(0.18, 0.85, -0.12);
    this.group.add(candleMesh);

    // Flame
    const flameGeo = new THREE.ConeGeometry(0.08, 0.28, 8);
    this.flameMesh = new THREE.Mesh(flameGeo, this.flameMaterial);
    this.flameMesh.position.set(0.18, 1.45, -0.12);
    this.group.add(this.flameMesh);

    // Warm candle PointLight (Only for player's focused krathong to maximize 60 FPS)
    if (this.isPlayer) {
      this.candleLight = new THREE.PointLight(0xff7711, 2.0, 8.0);
      this.candleLight.position.set(0.18, 1.5, -0.12);
      this.group.add(this.candleLight);
    }
  }

  buildMediumKrathong() {
    // 1. Two-tier larger banana trunk base (ฐานหยวกกล้วย 2 ชั้น)
    const baseLowerGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.4, 20);
    const baseLowerMesh = new THREE.Mesh(baseLowerGeo, this.bananaTrunkMaterial);
    baseLowerMesh.position.y = 0.2;
    this.group.add(baseLowerMesh);

    const baseUpperGeo = new THREE.CylinderGeometry(1.9, 2.1, 0.35, 20);
    const baseUpperMesh = new THREE.Mesh(baseUpperGeo, this.bananaTrunkMaterial);
    baseUpperMesh.position.y = 0.52;
    this.group.add(baseUpperMesh);

    // 2. Outer tier petals: 14 petals (กลีบชั้นนอก)
    const outerPetals = 14;
    for (let i = 0; i < outerPetals; i++) {
      const angle = (i / outerPetals) * Math.PI * 2;
      const pGeo = new THREE.ConeGeometry(0.6, 1.25, 4);
      pGeo.scale(1.2, 1.0, 0.35);
      const pMesh = new THREE.Mesh(pGeo, this.bananaLeafMaterial);
      pMesh.position.set(Math.cos(angle) * 2.5, 0.65, Math.sin(angle) * 2.5);
      pMesh.rotation.y = -angle + Math.PI / 2;
      pMesh.rotation.z = -0.45;
      this.group.add(pMesh);
    }

    // 3. Inner tier petals: 12 petals (กลีบชั้นในสลับฟันปลา)
    const innerPetals = 12;
    for (let j = 0; j < innerPetals; j++) {
      const angle = (j / innerPetals) * Math.PI * 2 + Math.PI / innerPetals;
      const pGeo = new THREE.ConeGeometry(0.5, 1.1, 4);
      pGeo.scale(1.1, 1.0, 0.35);
      const pMesh = new THREE.Mesh(pGeo, this.bananaLeafMaterial);
      pMesh.position.set(Math.cos(angle) * 1.9, 0.9, Math.sin(angle) * 1.9);
      pMesh.rotation.y = -angle + Math.PI / 2;
      pMesh.rotation.z = -0.3;
      this.group.add(pMesh);
    }

    // 4. Ring of Marigolds (ดอกดาวเรืองทอง) & White Jasmine
    const marigoldCount = 8;
    for (let m = 0; m < marigoldCount; m++) {
      const mAngle = (m / marigoldCount) * Math.PI * 2;
      const flowerGeo = new THREE.SphereGeometry(0.3, 8, 8);
      flowerGeo.scale(1.0, 0.6, 1.0);
      const flowerMesh = new THREE.Mesh(flowerGeo, this.marigoldMaterial);
      flowerMesh.position.set(Math.cos(mAngle) * 1.2, 0.75, Math.sin(mAngle) * 1.2);
      this.group.add(flowerMesh);
    }

    // 5. Center Blooming Lotus (ดอกบัวหลวงบานตรงกลาง)
    const centerLotus = new THREE.Group();
    centerLotus.position.y = 0.85;
    for (let c = 0; c < 8; c++) {
      const cAngle = (c / 8) * Math.PI * 2;
      const cPetalGeo = new THREE.ConeGeometry(0.4, 0.9, 4);
      cPetalGeo.scale(1.0, 1.1, 0.35);
      const cPetalMesh = new THREE.Mesh(cPetalGeo, this.lotusPinkMaterial);
      cPetalMesh.position.set(Math.cos(cAngle) * 0.45, 0.3, Math.sin(cAngle) * 0.45);
      cPetalMesh.rotation.y = -cAngle + Math.PI / 2;
      cPetalMesh.rotation.z = -0.3;
      centerLotus.add(cPetalMesh);
    }
    this.group.add(centerLotus);

    // 6. Incense Sticks (ธูป 3 ดอก)
    for (let k = 0; k < 3; k++) {
      const incGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6);
      const incMesh = new THREE.Mesh(incGeo, this.incenseMaterial);
      incMesh.position.set(-0.35 + k * 0.16, 1.3, -0.2);
      incMesh.rotation.z = (k - 1) * 0.09;
      this.group.add(incMesh);

      const tipGeo = new THREE.SphereGeometry(0.045, 6, 6);
      const tipMesh = new THREE.Mesh(tipGeo, this.incenseGlowMaterial);
      tipMesh.position.set(incMesh.position.x, 2.05, incMesh.position.z);
      this.group.add(tipMesh);
    }

    // 7. Sacred Candle (เทียนเล่มใหญ่) + Flame
    const candleGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.3, 8);
    const candleMesh = new THREE.Mesh(candleGeo, this.candleWaxMaterial);
    candleMesh.position.set(0.25, 1.2, -0.15);
    this.group.add(candleMesh);

    const flameGeo = new THREE.ConeGeometry(0.12, 0.38, 8);
    this.flameMesh = new THREE.Mesh(flameGeo, this.flameMaterial);
    this.flameMesh.position.set(0.25, 1.95, -0.15);
    this.group.add(this.flameMesh);

    // Stronger warm golden PointLight for medium krathong (Only for player)
    if (this.isPlayer) {
      this.candleLight = new THREE.PointLight(0xff8811, 2.8, 11);
      this.candleLight.position.set(0.25, 2.0, -0.15);
      this.group.add(this.candleLight);
    }
  }

  update(delta, time, riverWater) {
    // 1. Move downstream along the river (-Z direction)
    this.group.position.z -= this.baseSpeed * delta * 2.2;
    this.group.position.x += this.driftX * delta;
    this.group.rotation.y += this.rotationSpeed * delta;

    // 2. Water floating physics: wave height at current position
    const waveY = riverWater ? riverWater.getWaveHeight(this.group.position.x, this.group.position.z, time) : 0;
    this.group.position.y = waveY - 0.08;

    // 3. Tilting according to water slope
    const tiltX = Math.sin(time * 2.0 + this.seed) * 0.04;
    const tiltZ = Math.cos(time * 1.8 + this.seed) * 0.05;
    this.group.rotation.x = tiltX;
    this.group.rotation.z = tiltZ;

    // 4. Candle flame flicker
    if (this.candleLight && this.flameMesh) {
      const flicker = Math.sin(time * 12 + this.seed) * 0.15 + Math.cos(time * 24 + this.seed) * 0.1;
      const baseIntensity = this.type === 'medium' ? 2.8 : 1.8;
      this.candleLight.intensity = Math.max(0.8, baseIntensity + flicker);

      const flameScaleY = 1.0 + flicker * 0.35;
      this.flameMesh.scale.set(1.0, flameScaleY, 1.0);
    }
  }

  isOutOfBounds() {
    // Returns true when drifted far away beyond viewing distance
    return this.group.position.z < -220;
  }
}
