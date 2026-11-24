import * as THREE from 'three';

/**
 * Waterfront Pier & Boardwalk (ท่าน้ำและสะพานไม้ริมน้ำ)
 * The embarkation dock on the player's side of the river, with wooden boardwalk,
 * railings, steps leading into the water, glowing lantern posts, and Thai architectural accents.
 */
export class WaterfrontPier {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Wood & Stone Materials
    this.deckWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a3d28,
      roughness: 0.8,
      metalness: 0.05
    });

    this.plankWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x472f1c,
      roughness: 0.85,
      metalness: 0.05
    });

    this.pillarWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e1e12,
      roughness: 0.9,
      metalness: 0.05
    });

    this.railingGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a017,
      metalness: 0.6,
      roughness: 0.35
    });

    this.lanternPaperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa33
    });

    this.stoneBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x22262d,
      roughness: 0.95
    });

    this.lotusPotMaterial = new THREE.MeshStandardMaterial({
      color: 0x824424,
      roughness: 0.8
    });

    this.plantLeafMaterial = new THREE.MeshStandardMaterial({
      color: 0x276620,
      roughness: 0.6
    });

    this.buildBoardwalk();
    this.buildPierJetty();
    this.buildDecorations();

    this.scene.add(this.group);
  }

  buildBoardwalk() {
    // 1. Long promenade deck along riverbank (X: -65 to +65, Z: 6.5 to 16, Y: 1.8)
    const deckWidth = 130;
    const deckDepth = 10;
    const deckGeo = new THREE.BoxGeometry(deckWidth, 0.45, deckDepth);
    const deckMesh = new THREE.Mesh(deckGeo, this.deckWoodMaterial);
    deckMesh.position.set(0, 1.8, 11);
    deckMesh.receiveShadow = true;
    this.group.add(deckMesh);

    // Stone foundation embankment beneath the boardwalk
    const foundGeo = new THREE.BoxGeometry(deckWidth, 2.8, deckDepth);
    const foundMesh = new THREE.Mesh(foundGeo, this.stoneBaseMaterial);
    foundMesh.position.set(0, 0.2, 11);
    foundMesh.receiveShadow = true;
    this.group.add(foundMesh);

    // Plank grooves / decorative floor slats
    const slatCount = 38;
    for (let i = 0; i < slatCount; i++) {
      const sx = -60 + i * 3.2;
      const slatGeo = new THREE.BoxGeometry(0.12, 0.48, deckDepth - 0.2);
      const slatMesh = new THREE.Mesh(slatGeo, this.plankWoodMaterial);
      slatMesh.position.set(sx, 1.82, 11);
      this.group.add(slatMesh);
    }

    // Waterfront railing along the boardwalk (with opening at X: -4 to +4 for pier)
    this.buildRailing(-62, -5.5, 6.2);
    this.buildRailing(5.5, 62, 6.2);

    // Back wall / temple grounds partition
    const backWallGeo = new THREE.BoxGeometry(deckWidth, 3.2, 0.8);
    const backWallMesh = new THREE.Mesh(backWallGeo, this.stoneBaseMaterial);
    backWallMesh.position.set(0, 3.2, 16.4);
    this.group.add(backWallMesh);

    // Walkway lantern posts along boardwalk
    const lanternPositions = [-50, -32, -15, 15, 32, 50];
    for (const lx of lanternPositions) {
      this.createLampPost(lx, 1.8, 6.4);
    }
  }

  buildPierJetty() {
    // 2. Pierhead jetty extending out towards the water (X: -4.5 to +4.5, Z: 6.5 to -3.5, Y: 1.7)
    const pierLength = 10.5;
    const pierWidth = 8.5;
    const pierDeckGeo = new THREE.BoxGeometry(pierWidth, 0.4, pierLength);
    const pierDeck = new THREE.Mesh(pierDeckGeo, this.deckWoodMaterial);
    pierDeck.position.set(0, 1.7, 1.0);
    pierDeck.receiveShadow = true;
    this.group.add(pierDeck);

    // Support stilts/pilings plunging into river
    const pilingsCoords = [
      [-3.8, 4.5], [3.8, 4.5],
      [-3.8, 0.5], [3.8, 0.5],
      [-3.8, -3.5], [3.8, -3.5]
    ];
    for (const [px, pz] of pilingsCoords) {
      const pilingGeo = new THREE.CylinderGeometry(0.32, 0.38, 4.5, 8);
      const pilingMesh = new THREE.Mesh(pilingGeo, this.pillarWoodMaterial);
      pilingMesh.position.set(px, 0.2, pz);
      this.group.add(pilingMesh);
    }

    // Side railings along the pier (left & right sides)
    this.buildSideRailing(-4.1, 6.0, -3.5);
    this.buildSideRailing(4.1, 6.0, -3.5);

    // Steps leading down directly to the water level at pier tip (Z: -3.5 to -6.5)
    const stepCount = 4;
    for (let s = 0; s < stepCount; s++) {
      const stepWidth = 6.8;
      const stepH = 0.35;
      const stepD = 0.85;
      const stepGeo = new THREE.BoxGeometry(stepWidth, stepH, stepD);
      const stepMesh = new THREE.Mesh(stepGeo, this.plankWoodMaterial);
      stepMesh.position.set(
        0,
        1.45 - s * 0.38, // descending to water level ~0.1
        -4.0 - s * 0.8
      );
      stepMesh.receiveShadow = true;
      this.group.add(stepMesh);
    }

    // Mooring posts at end of pier with brass rings
    for (const mx of [-3.8, 3.8]) {
      const postGeo = new THREE.CylinderGeometry(0.28, 0.35, 1.8, 8);
      const postMesh = new THREE.Mesh(postGeo, this.pillarWoodMaterial);
      postMesh.position.set(mx, 2.2, -3.8);
      this.group.add(postMesh);

      // Brass ring
      const ringGeo = new THREE.TorusGeometry(0.2, 0.04, 6, 12);
      const ringMesh = new THREE.Mesh(ringGeo, this.railingGoldMaterial);
      ringMesh.position.set(mx, 2.4, -3.8);
      ringMesh.rotation.y = Math.PI / 2;
      this.group.add(ringMesh);
    }

    // Glowing lanterns at the two corners of the pierhead
    this.createLampPost(-3.9, 1.7, -3.4);
    this.createLampPost(3.9, 1.7, -3.4);
  }

  buildRailing(xStart, xEnd, zPos) {
    const length = xEnd - xStart;
    const postInterval = 4.0;
    const count = Math.floor(length / postInterval);

    // Top rail
    const railGeo = new THREE.BoxGeometry(length, 0.12, 0.14);
    const railMesh = new THREE.Mesh(railGeo, this.deckWoodMaterial);
    railMesh.position.set(xStart + length / 2, 2.7, zPos);
    this.group.add(railMesh);

    // Bottom rail
    const botRailMesh = new THREE.Mesh(railGeo, this.deckWoodMaterial);
    botRailMesh.position.set(xStart + length / 2, 2.1, zPos);
    this.group.add(botRailMesh);

    // Baluster posts
    for (let i = 0; i <= count; i++) {
      const px = xStart + (i / count) * length;
      const postGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.1, 6);
      const postMesh = new THREE.Mesh(postGeo, this.pillarWoodMaterial);
      postMesh.position.set(px, 2.4, zPos);
      this.group.add(postMesh);
    }
  }

  buildSideRailing(xPos, zStart, zEnd) {
    const length = Math.abs(zStart - zEnd);
    const midZ = (zStart + zEnd) / 2;

    const railGeo = new THREE.BoxGeometry(0.14, 0.12, length);
    const railMesh = new THREE.Mesh(railGeo, this.deckWoodMaterial);
    railMesh.position.set(xPos, 2.6, midZ);
    this.group.add(railMesh);

    const botRail = new THREE.Mesh(railGeo, this.deckWoodMaterial);
    botRail.position.set(xPos, 2.05, midZ);
    this.group.add(botRail);

    // Posts
    for (let z = zEnd; z <= zStart; z += 2.5) {
      const postGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.05, 6);
      const postMesh = new THREE.Mesh(postGeo, this.pillarWoodMaterial);
      postMesh.position.set(xPos, 2.35, z);
      this.group.add(postMesh);
    }
  }

  createLampPost(x, baseY, z) {
    const postH = 3.6;
    const postGeo = new THREE.CylinderGeometry(0.12, 0.18, postH, 8);
    const postMesh = new THREE.Mesh(postGeo, this.pillarWoodMaterial);
    postMesh.position.set(x, baseY + postH / 2, z);
    this.group.add(postMesh);

    // Hanging arm
    const armGeo = new THREE.BoxGeometry(0.6, 0.08, 0.08);
    const armMesh = new THREE.Mesh(armGeo, this.pillarWoodMaterial);
    armMesh.position.set(x, baseY + postH - 0.2, z);
    this.group.add(armMesh);

    // Paper lantern body (Self-illuminating)
    const lanternGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.75, 8);
    const lanternMesh = new THREE.Mesh(lanternGeo, this.lanternPaperMaterial);
    lanternMesh.position.set(x, baseY + postH - 0.7, z);
    this.group.add(lanternMesh);
  }

  buildDecorations() {
    // Lotus planters along the back wall
    const potPositions = [-40, -22, 22, 40];
    for (const px of potPositions) {
      // Earthenware pot
      const potGeo = new THREE.CylinderGeometry(0.9, 0.65, 0.9, 12);
      const potMesh = new THREE.Mesh(potGeo, this.lotusPotMaterial);
      potMesh.position.set(px, 2.45, 15.2);
      this.group.add(potMesh);

      // Lotus leaves inside pot
      for (let l = 0; l < 4; l++) {
        const lAngle = (l / 4) * Math.PI * 2;
        const leafGeo = new THREE.CircleGeometry(0.45, 8);
        leafGeo.rotateX(-Math.PI / 2);
        const leafMesh = new THREE.Mesh(leafGeo, this.plantLeafMaterial);
        leafMesh.position.set(
          px + Math.cos(lAngle) * 0.4,
          2.95,
          15.2 + Math.sin(lAngle) * 0.4
        );
        this.group.add(leafMesh);
      }
    }
  }
}
