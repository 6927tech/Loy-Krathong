import * as THREE from 'three';

/**
 * Character Variations & Color Palettes for Thai Festival Costumes
 */
const COSTUME_PALETTES = [
  // Female Sabai: Lotus Pink & Deep Magenta
  { gender: 'female', shirt: 0xeb6b9d, cloth: 0x942958, skin: 0xf5cfb0, hair: 0x1a120c },
  // Female Sabai: Sky Blue & Indigo
  { gender: 'female', shirt: 0x76b2e8, cloth: 0x1d3f6e, skin: 0xf0c5a2, hair: 0x110b07 },
  // Female Sabai: Royal Cream & Gold
  { gender: 'female', shirt: 0xfff0b8, cloth: 0xb58928, skin: 0xf8d7bd, hair: 0x24180e },
  // Male Mor-Hom: Traditional Indigo & Checkered sash
  { gender: 'male', shirt: 0x224263, cloth: 0x162333, skin: 0xebbe98, hair: 0x1a1109 },
  // Male Thai Silk: Golden Ochre & Dark trousers
  { gender: 'male', shirt: 0xd9a23d, cloth: 0x262118, skin: 0xf2c8a7, hair: 0x0f0b08 },
  // Male Silk: Maroon & Deep Brown
  { gender: 'male', shirt: 0x7a2830, cloth: 0x2e191b, skin: 0xebbe98, hair: 0x150f0b }
];

/**
 * Low-Poly Stylized Thai Costume Character
 * Built with hierarchical pivot points for procedural walking, kneeling, and praying.
 */
export class ThaiCharacter {
  constructor(paletteIndex = null, hasKrathong = false) {
    this.palette = paletteIndex !== null
      ? COSTUME_PALETTES[paletteIndex % COSTUME_PALETTES.length]
      : COSTUME_PALETTES[Math.floor(Math.random() * COSTUME_PALETTES.length)];

    this.hasKrathong = hasKrathong;
    this.group = new THREE.Group();

    // Walk frequency and random stride offset
    this.walkFreq = 6.2 + Math.random() * 1.2;
    this.stridePhase = Math.random() * Math.PI * 2;
    this.baseHeight = 1.65; // Eye height around 1.65m

    this.initMaterials();
    this.buildSkeleton();

    if (this.hasKrathong) {
      this.attachHeldKrathong();
    }
  }

  initMaterials() {
    this.skinMat = new THREE.MeshStandardMaterial({
      color: this.palette.skin,
      roughness: 0.65
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: this.palette.hair,
      roughness: 0.9
    });

    this.shirtMat = new THREE.MeshStandardMaterial({
      color: this.palette.shirt,
      roughness: 0.7
    });

    this.clothMat = new THREE.MeshStandardMaterial({
      color: this.palette.cloth,
      roughness: 0.75
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf5ca38,
      metalness: 0.8,
      roughness: 0.3
    });
  }

  buildSkeleton() {
    // 1. Root Torso Group (Pivots at hip Y = 0.9)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.9;
    this.group.add(this.torsoGroup);

    // Torso Mesh (Chest & Waist)
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.28);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.shirtMat);
    torsoMesh.position.y = 0.29;
    this.torsoGroup.add(torsoMesh);

    // Female Sabai sash / Male waist sash
    if (this.palette.gender === 'female') {
      const sabaiGeo = new THREE.BoxGeometry(0.5, 0.45, 0.3);
      sabaiGeo.rotateZ(0.25);
      const sabaiMesh = new THREE.Mesh(sabaiGeo, this.clothMat);
      sabaiMesh.position.set(0, 0.3, 0);
      this.torsoGroup.add(sabaiMesh);
    } else {
      const sashGeo = new THREE.BoxGeometry(0.52, 0.14, 0.32);
      const sashMesh = new THREE.Mesh(sashGeo, this.goldTrimMat);
      sashMesh.position.set(0, 0.08, 0);
      this.torsoGroup.add(sashMesh);
    }

    // 2. Head Group (Pivots at neck Y = 0.6)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.62, 0);
    this.torsoGroup.add(this.headGroup);

    const headGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.position.y = 0.18;
    this.headGroup.add(headMesh);

    // Hair bun / Topknot
    const hairGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const hairMesh = new THREE.Mesh(hairGeo, this.hairMat);
    hairMesh.position.set(0, 0.32, -0.06);
    this.headGroup.add(hairMesh);

    // 3. Left & Right Arm Groups (Pivots at shoulders)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.31, 0.52, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.55, 6);
    armGeo.translate(0, -0.27, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    this.leftArmGroup.add(leftArmMesh);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.31, 0.52, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rightArmMesh = new THREE.Mesh(armGeo, this.shirtMat);
    this.rightArmGroup.add(rightArmMesh);

    // 4. Left & Right Leg Groups (Pivots at hips)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.15, 0.9, 0);
    this.group.add(this.leftLegGroup);

    const legGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.9, 6);
    legGeo.translate(0, -0.45, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, this.clothMat);
    this.leftLegGroup.add(leftLegMesh);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.15, 0.9, 0);
    this.group.add(this.rightLegGroup);

    const rightLegMesh = new THREE.Mesh(legGeo, this.clothMat);
    this.rightLegGroup.add(rightLegMesh);
  }

  attachHeldKrathong() {
    this.heldKrathongGroup = new THREE.Group();

    // Miniature Krathong
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x2e6b22 });
    const kBase = new THREE.Mesh(baseGeo, leafMat);
    this.heldKrathongGroup.add(kBase);

    // Tiny candle with glowing flame
    const candleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6);
    const candleMat = new THREE.MeshBasicMaterial({ color: 0xffea88 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.y = 0.1;
    this.heldKrathongGroup.add(candle);

    const flameGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.2;
    this.heldKrathongGroup.add(flame);

    // Position in hands in front of chest
    this.heldKrathongGroup.position.set(0, 0.28, 0.38);
    this.torsoGroup.add(this.heldKrathongGroup);

    // Position arms holding krathong forward
    this.leftArmGroup.rotation.x = -0.55;
    this.leftArmGroup.rotation.z = -0.25;
    this.rightArmGroup.rotation.x = -0.55;
    this.rightArmGroup.rotation.z = 0.25;
  }

  removeHeldKrathong() {
    if (this.heldKrathongGroup) {
      this.torsoGroup.remove(this.heldKrathongGroup);
      this.heldKrathongGroup = null;
      this.hasKrathong = false;
      this.leftArmGroup.rotation.set(0, 0, 0);
      this.rightArmGroup.rotation.set(0, 0, 0);
    }
  }

  animateWalk(time, speedRatio = 1.0) {
    const cycle = (time * this.walkFreq + this.stridePhase) * speedRatio;

    // Leg swings (alternating)
    const legAngle = Math.sin(cycle) * 0.48;
    this.leftLegGroup.rotation.x = legAngle;
    this.rightLegGroup.rotation.x = -legAngle;

    // Arm swings (if not holding krathong)
    if (!this.hasKrathong) {
      this.leftArmGroup.rotation.x = -legAngle * 0.85;
      this.rightArmGroup.rotation.x = legAngle * 0.85;
    }

    // Gentle torso bobbing
    this.torsoGroup.position.y = 0.9 + Math.abs(Math.sin(cycle)) * 0.045;
  }

  animateIdle(time) {
    const breathe = Math.sin(time * 2.2 + this.stridePhase) * 0.02;
    this.torsoGroup.position.y = 0.9 + breathe;
    this.leftLegGroup.rotation.x = 0;
    this.rightLegGroup.rotation.x = 0;

    if (!this.hasKrathong) {
      this.leftArmGroup.rotation.x = Math.sin(time * 1.5) * 0.05;
      this.rightArmGroup.rotation.x = -Math.sin(time * 1.5) * 0.05;
    }
  }

  setKneeling(progress) {
    // Progress: 0 (standing) to 1 (kneeling down at water's edge)
    const p = Math.max(0, Math.min(1, progress));
    this.group.position.y = 0.2 - p * 0.45; // Lower whole body down towards water
    this.torsoGroup.position.y = 0.9 - p * 0.35;
    this.torsoGroup.rotation.x = p * 0.4; // Lean forward towards water
    this.leftLegGroup.rotation.x = p * 0.8;
    this.rightLegGroup.rotation.x = p * 0.8;
  }

  setWaiPose(time) {
    // Bring hands together in Wai (พนมมือ) at chest
    this.leftArmGroup.rotation.set(-0.95, 0.45, -0.4);
    this.rightArmGroup.rotation.set(-0.95, -0.45, 0.4);
    // Subtle head bow
    this.headGroup.rotation.x = 0.25 + Math.sin(time * 2.0) * 0.04;
  }
}
