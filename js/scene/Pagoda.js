import * as THREE from 'three';

/**
 * White & Gold Thai Temple Complex (วัดทุ่งเศรษฐี / พระมหาเจดีย์แก้วริมน้ำ)
 * Inspired by the authentic twilight festival photo:
 * - Central multi-tiered white pavilion with tall golden stupa spire
 * - Left and right flanking white stupas (เจดีย์บริวารสีขาวขลิบทอง)
 * - Grand illuminated water staircase leading down into the river
 * - Stone riprap shoreline and silhouetted tropical trees
 */
export class GoldenPagoda {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // High quality architectural materials
    this.whitePlasterMat = new THREE.MeshStandardMaterial({
      color: 0xf6f8fc,
      roughness: 0.4,
      metalness: 0.05
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd23d,
      metalness: 0.5,
      roughness: 0.22,
      emissive: 0x885500,
      emissiveIntensity: 0.7
    });

    this.roofCyanGoldMat = new THREE.MeshStandardMaterial({
      color: 0x245582,
      roughness: 0.35,
      metalness: 0.3
    });

    this.interiorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffd977
    });

    this.blueInteriorGlowMat = new THREE.MeshBasicMaterial({
      color: 0x66a6ff
    });

    this.stoneRiprapMat = new THREE.MeshStandardMaterial({
      color: 0x3d4756,
      roughness: 0.95
    });

    this.treeLeafMat = new THREE.MeshStandardMaterial({
      color: 0x183b22,
      roughness: 0.85
    });

    this.treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x362719,
      roughness: 0.9
    });

    this.buildIslandShore();
    this.buildCentralGrandTemple();
    this.buildFlankingStupas();
    this.buildIlluminatedStairs();
    this.buildRiversideTrees();

    // Position directly across the water
    this.group.position.set(-20, 0, -115);
    this.scene.add(this.group);
  }

  buildIslandShore() {
    // 1. Natural stone riprap island embankment
    const shoreGeo = new THREE.CylinderGeometry(85, 95, 3.8, 36);
    shoreGeo.scale(1.4, 1.0, 0.75);
    const shoreMesh = new THREE.Mesh(shoreGeo, this.stoneRiprapMat);
    shoreMesh.position.set(0, 1.8, 0);
    this.group.add(shoreMesh);

    // Green grassy lawn atop the island terrace
    const lawnGeo = new THREE.CylinderGeometry(83, 83, 0.4, 36);
    lawnGeo.scale(1.4, 1.0, 0.75);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x224928, roughness: 0.9 });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.position.set(0, 3.8, 0);
    this.group.add(lawnMesh);
  }

  buildCentralGrandTemple() {
    const temple = new THREE.Group();
    let currentY = 3.9;

    // 1. Multi-tiered White Stepped Base
    const baseTiers = [
      { rTop: 24, rBot: 26, h: 2.0 },
      { rTop: 20, rBot: 23, h: 1.8 },
      { rTop: 16, rBot: 19, h: 1.6 }
    ];

    for (const bt of baseTiers) {
      const geo = new THREE.CylinderGeometry(bt.rTop, bt.rBot, bt.h, 16);
      const mesh = new THREE.Mesh(geo, this.whitePlasterMat);
      mesh.position.y = currentY + bt.h / 2;
      temple.add(mesh);

      // Gold trim band on each terrace edge
      const trimGeo = new THREE.TorusGeometry(bt.rTop + 0.1, 0.22, 6, 16);
      trimGeo.rotateX(Math.PI / 2);
      const trimMesh = new THREE.Mesh(trimGeo, this.goldTrimMat);
      trimMesh.position.y = currentY + bt.h;
      temple.add(trimMesh);

      currentY += bt.h;
    }

    // 2. Colonnaded Mandapa Hall (โถงวิหารแปดเหลี่ยม)
    const hallH = 7.5;
    const hallGeo = new THREE.CylinderGeometry(13, 14, hallH, 16);
    const hallMesh = new THREE.Mesh(hallGeo, this.whitePlasterMat);
    hallMesh.position.y = currentY + hallH / 2;
    temple.add(hallMesh);

    // Luminous arched windows with blue/golden interior radiance
    for (let w = 0; w < 8; w++) {
      const wAngle = (w / 8) * Math.PI * 2;
      const winGeo = new THREE.BoxGeometry(2.2, 4.2, 0.4);
      const winMat = (w % 2 === 0) ? this.interiorGlowMat : this.blueInteriorGlowMat;
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(
        Math.cos(wAngle) * 13.5,
        currentY + hallH * 0.5,
        Math.sin(wAngle) * 13.5
      );
      winMesh.rotation.y = -wAngle + Math.PI / 2;
      temple.add(winMesh);
    }
    currentY += hallH;

    // 3. Lower Tiered Thai Temple Roof (หลังคาซ้อน 2 ชั้น)
    const roofTiers = [
      { rBot: 16.5, rTop: 11, h: 2.8 },
      { rBot: 12.5, rTop: 7.5, h: 2.6 }
    ];
    for (const rt of roofTiers) {
      const rGeo = new THREE.CylinderGeometry(rt.rTop, rt.rBot, rt.h, 16);
      const rMesh = new THREE.Mesh(rGeo, this.roofCyanGoldMat);
      rMesh.position.y = currentY + rt.h / 2;
      temple.add(rMesh);

      const rTrimGeo = new THREE.TorusGeometry(rt.rBot + 0.2, 0.35, 6, 16);
      rTrimGeo.rotateX(Math.PI / 2);
      const rTrim = new THREE.Mesh(rTrimGeo, this.goldTrimMat);
      rTrim.position.y = currentY;
      temple.add(rTrim);

      currentY += rt.h;
    }

    // 4. White Drum Chamber
    const drumGeo = new THREE.CylinderGeometry(6.2, 7.2, 3.5, 16);
    const drumMesh = new THREE.Mesh(drumGeo, this.whitePlasterMat);
    drumMesh.position.y = currentY + 1.75;
    temple.add(drumMesh);
    currentY += 3.5;

    // 5. Grand Golden Bell Stupa (องค์ระฆังทองคำ)
    const bellGeo = new THREE.CylinderGeometry(4.2, 6.0, 7.5, 24);
    const bellMesh = new THREE.Mesh(bellGeo, this.goldTrimMat);
    bellMesh.position.y = currentY + 3.75;
    temple.add(bellMesh);
    currentY += 7.5;

    // 6. Nine-Tier Golden Spire (ปล้องไฉน 9 ชั้น)
    const spireRingCount = 9;
    let sRadius = 3.6;
    const ringH = 1.0;
    for (let i = 0; i < spireRingCount; i++) {
      const rTop = sRadius * 0.88;
      const ringGeo = new THREE.CylinderGeometry(rTop, sRadius, ringH, 16);
      const ringMesh = new THREE.Mesh(ringGeo, this.goldTrimMat);
      ringMesh.position.y = currentY + ringH / 2;
      temple.add(ringMesh);

      currentY += ringH;
      sRadius = rTop;
    }

    // 7. Tall Golden Needle Pinnacle (ปลียอด & ลูกแก้วมงกุฎ)
    const pinnacleGeo = new THREE.ConeGeometry(0.9, 12, 16);
    const pinnacleMesh = new THREE.Mesh(pinnacleGeo, this.goldTrimMat);
    pinnacleMesh.position.y = currentY + 6.0;
    temple.add(pinnacleMesh);
    currentY += 12;

    const jewelGeo = new THREE.SphereGeometry(0.85, 12, 12);
    const jewelMesh = new THREE.Mesh(jewelGeo, this.goldTrimMat);
    jewelMesh.position.y = currentY + 0.6;
    temple.add(jewelMesh);

    // Warm golden temple floodlight
    const templeFlood = new THREE.PointLight(0xffbe33, 4.8, 120);
    templeFlood.position.set(0, 18, 16);
    temple.add(templeFlood);

    this.group.add(temple);
  }

  buildFlankingStupas() {
    // Satellite White Chedis on Left (X: -42) and Right (X: +42)
    const chediOffsets = [-42, 42];

    for (const cx of chediOffsets) {
      const chedi = new THREE.Group();
      chedi.position.set(cx, 3.9, -2);
      let chediY = 0;

      // White cubic base with niches
      const baseGeo = new THREE.BoxGeometry(9.0, 5.5, 9.0);
      const baseMesh = new THREE.Mesh(baseGeo, this.whitePlasterMat);
      baseMesh.position.y = chediY + 2.75;
      chedi.add(baseMesh);
      chediY += 5.5;

      // Arched lantern niche
      const nicheGeo = new THREE.BoxGeometry(2.5, 3.2, 0.4);
      const nicheMesh = new THREE.Mesh(nicheGeo, this.interiorGlowMat);
      nicheMesh.position.set(0, chediY - 2.5, 4.6);
      chedi.add(nicheMesh);

      // White stepped cornices
      const corniceGeo = new THREE.BoxGeometry(9.8, 0.8, 9.8);
      const corniceMesh = new THREE.Mesh(corniceGeo, this.whitePlasterMat);
      corniceMesh.position.y = chediY + 0.4;
      chedi.add(corniceMesh);
      chediY += 0.8;

      // White bell dome
      const bellGeo = new THREE.CylinderGeometry(2.6, 4.2, 6.0, 16);
      const bellMesh = new THREE.Mesh(bellGeo, this.whitePlasterMat);
      bellMesh.position.y = chediY + 3.0;
      chedi.add(bellMesh);
      chediY += 6.0;

      // Golden spire
      const spireGeo = new THREE.ConeGeometry(0.7, 9.5, 16);
      const spireMesh = new THREE.Mesh(spireGeo, this.goldTrimMat);
      spireMesh.position.y = chediY + 4.75;
      chedi.add(spireMesh);

      this.group.add(chedi);
    }
  }

  buildIlluminatedStairs() {
    // Grand Central Staircase leading from temple terrace (Y: 3.9) into water (Y: 0.1)
    const stairGroup = new THREE.Group();
    const stepCount = 14;
    const stepWidth = 10;
    const stepRise = 0.3;
    const stepTread = 1.35;

    for (let s = 0; s < stepCount; s++) {
      const stepY = 3.9 - s * stepRise;
      const stepZ = 12 + s * stepTread;

      const stepGeo = new THREE.BoxGeometry(stepWidth, 0.35, stepTread);
      const stepMesh = new THREE.Mesh(stepGeo, this.whitePlasterMat);
      stepMesh.position.set(0, stepY, stepZ);
      stairGroup.add(stepMesh);
    }

    // Glowing balustrade light strips on left and right borders of stairs
    for (const lx of [-5.2, 5.2]) {
      const railGeo = new THREE.BoxGeometry(0.4, 0.6, stepCount * stepTread);
      const railMesh = new THREE.Mesh(railGeo, this.whitePlasterMat);
      railMesh.position.set(lx, 2.3, 12 + (stepCount * stepTread) / 2);
      railMesh.rotation.x = 0.22;
      stairGroup.add(railMesh);

      // Golden illuminated strip
      const stripGeo = new THREE.BoxGeometry(0.2, 0.15, stepCount * stepTread);
      const stripMesh = new THREE.Mesh(stripGeo, this.interiorGlowMat);
      stripMesh.position.set(lx, 2.7, 12 + (stepCount * stepTread) / 2);
      stripMesh.rotation.x = 0.22;
      stairGroup.add(stripMesh);
    }

    // Stairway base water glow
    const stairLight = new THREE.PointLight(0xffbe44, 3.5, 30);
    stairLight.position.set(0, 1.2, 12 + stepCount * stepTread);
    stairGroup.add(stairLight);

    this.group.add(stairGroup);
  }

  buildRiversideTrees() {
    // Lush tropical foliage along the shoreline flanking the temple
    const treeCoords = [
      [-65, -8], [-55, 6], [-75, 4],
      [55, 4], [65, -6], [75, 5]
    ];

    for (const [tx, tz] of treeCoords) {
      const tree = new THREE.Group();
      tree.position.set(tx, 3.8, tz);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 5.5, 6);
      const trunkMesh = new THREE.Mesh(trunkGeo, this.treeTrunkMat);
      trunkMesh.position.y = 2.75;
      tree.add(trunkMesh);

      // Foliage crowns (stacked organic spheres)
      const foliageTiers = [
        { r: 4.5, y: 6.2 },
        { r: 3.8, y: 8.5 },
        { r: 2.6, y: 10.5 }
      ];
      for (const ft of foliageTiers) {
        const fGeo = new THREE.SphereGeometry(ft.r, 8, 8);
        fGeo.scale(1.2, 0.75, 1.1);
        const fMesh = new THREE.Mesh(fGeo, this.treeLeafMat);
        fMesh.position.y = ft.y;
        tree.add(fMesh);
      }

      this.group.add(tree);
    }
  }
}
