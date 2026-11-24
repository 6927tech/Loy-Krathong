import * as THREE from 'three';

/**
 * Floating Lotus Leaf Pads, Lotus Blooms, and Earthenware Clay Oil Lamps (ผางประทีป)
 * Creates the magical foreground seen in traditional Loy Krathong twilight photography.
 */
export class LotusPadsSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Materials
    this.padMaterial = new THREE.MeshStandardMaterial({
      color: 0x246332,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    this.lotusPinkMat = new THREE.MeshStandardMaterial({
      color: 0xf279a2,
      roughness: 0.4
    });

    this.lotusWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.35
    });

    this.claySaucerMat = new THREE.MeshStandardMaterial({
      color: 0x7c4224,
      roughness: 0.8
    });

    this.lampFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22
    });

    this.flames = [];
    this.buildLotusPadsAndLamps();
    this.scene.add(this.group);
  }

  buildLotusPadsAndLamps() {
    // Clusters of lotus pads in the foreground (near the player's pier and view)
    const clusterCoords = [
      // Left foreground cluster
      { x: -14, z: 1.5, count: 7, radius: 4.5 },
      { x: -8, z: -2.0, count: 5, radius: 3.5 },
      // Right foreground cluster
      { x: 12, z: 0.5, count: 8, radius: 4.8 },
      { x: 18, z: -3.0, count: 6, radius: 4.0 },
      // Midground scattered pads
      { x: -22, z: -12.0, count: 4, radius: 3.0 },
      { x: 25, z: -14.0, count: 5, radius: 3.5 }
    ];

    for (const cl of clusterCoords) {
      for (let i = 0; i < cl.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * cl.radius;
        const px = cl.x + Math.cos(angle) * dist;
        const pz = cl.z + Math.sin(angle) * dist;
        const padRadius = 0.55 + Math.random() * 0.65;

        // 1. Lotus Leaf Pad (ใบบัวกลมมีรอยหยัก)
        const padGeo = new THREE.CircleGeometry(padRadius, 14);
        padGeo.rotateX(-Math.PI / 2);
        const padMesh = new THREE.Mesh(padGeo, this.padMaterial);
        padMesh.position.set(px, 0.04, pz);
        padMesh.rotation.y = Math.random() * Math.PI * 2;
        this.group.add(padMesh);

        // 2. Occasionally add a Lotus Flower (ดอกบัวหลวงตูม/บาน)
        if (Math.random() > 0.65) {
          const flowerGroup = new THREE.Group();
          flowerGroup.position.set(px + 0.2, 0.15, pz + 0.15);

          const petalCount = 6;
          for (let p = 0; p < petalCount; p++) {
            const pAngle = (p / petalCount) * Math.PI * 2;
            const petGeo = new THREE.ConeGeometry(0.14, 0.38, 4);
            const petMesh = new THREE.Mesh(petGeo, (Math.random() > 0.5) ? this.lotusPinkMat : this.lotusWhiteMat);
            petMesh.position.set(Math.cos(pAngle) * 0.12, 0.15, Math.sin(pAngle) * 0.12);
            petMesh.rotation.y = -pAngle;
            petMesh.rotation.z = -0.3;
            flowerGroup.add(petMesh);
          }
          this.group.add(flowerGroup);
        }

        // 3. Earthenware Clay Oil Lamp (ผางประทีปดินเผา) resting on pad or water
        if (Math.random() > 0.4) {
          const lamp = new THREE.Group();
          lamp.position.set(px, 0.08, pz);

          // Terracotta clay saucer
          const saucerGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.06, 8);
          const saucerMesh = new THREE.Mesh(saucerGeo, this.claySaucerMat);
          saucerMesh.position.y = 0.03;
          lamp.add(saucerMesh);

          // Glowing flame
          const flameGeo = new THREE.SphereGeometry(0.06, 6, 6);
          const flameMesh = new THREE.Mesh(flameGeo, this.lampFlameMat);
          flameMesh.position.y = 0.12;
          lamp.add(flameMesh);

          this.group.add(lamp);

          this.flames.push({
            mesh: flameMesh,
            seed: Math.random() * 50
          });
        }
      }
    }
  }

  update(time) {
    // Gentle flame flicker on clay oil lamps
    for (const f of this.flames) {
      const flicker = Math.sin(time * 10 + f.seed) * 0.15;
      const s = 1.0 + flicker;
      f.mesh.scale.set(s, s * 1.2, s);
    }
  }
}
