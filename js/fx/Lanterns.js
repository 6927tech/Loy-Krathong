import * as THREE from 'three';

/**
 * Creates glowing lantern aura sprite texture
 */
function createLanternGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 235, 140, 0.95)');
  grad.addColorStop(0.35, 'rgba(255, 160, 40, 0.45)');
  grad.addColorStop(0.7, 'rgba(255, 100, 20, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Yi Peng Floating Sky Lanterns (โคมลอยยี่เป็ง)
 * Matches the warm golden lanterns ascending into the twilight cobalt sky.
 */
export class SkyLanterns {
  constructor(scene, count = 36) {
    this.scene = scene;
    this.lanterns = [];
    this.group = new THREE.Group();

    // Reusable Materials
    this.paperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd26a,
      transparent: true,
      opacity: 0.92
    });

    this.hotCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    this.flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800
    });

    this.bambooMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a2e12
    });

    this.glowTexture = createLanternGlowTexture();
    this.glowMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8
    });

    this.initLanterns(count);
    this.scene.add(this.group);
  }

  createLanternMesh() {
    const lGroup = new THREE.Group();

    // 1. Cylindrical translucent paper lantern
    const cylinderGeo = new THREE.CylinderGeometry(0.85, 0.65, 1.8, 12, 1, true);
    const cylinderMesh = new THREE.Mesh(cylinderGeo, this.paperMaterial);
    cylinderMesh.position.y = 0.9;
    lGroup.add(cylinderMesh);

    // 2. Paper top cap
    const capGeo = new THREE.CircleGeometry(0.85, 12);
    capGeo.rotateX(-Math.PI / 2);
    const capMesh = new THREE.Mesh(capGeo, this.paperMaterial);
    capMesh.position.y = 1.8;
    lGroup.add(capMesh);

    // 3. Bamboo base rim
    const ringGeo = new THREE.TorusGeometry(0.68, 0.04, 6, 16);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, this.bambooMaterial);
    ringMesh.position.y = 0.02;
    lGroup.add(ringMesh);

    // 4. Glowing fuel burner
    const burnerGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const burnerMesh = new THREE.Mesh(burnerGeo, this.hotCoreMaterial);
    burnerMesh.position.y = 0.35;
    lGroup.add(burnerMesh);

    // 5. Additive glow halo sprite
    const halo = new THREE.Sprite(this.glowMat);
    halo.scale.set(4.5, 4.5, 1);
    halo.position.set(0, 0.7, 0);
    lGroup.add(halo);

    return lGroup;
  }

  initLanterns(count) {
    // Specific photogenic lantern positions matching reference photo
    const signatureCoords = [
      { x: -16, y: 14, z: -25, scale: 2.2 },
      { x: -9, y: 24, z: -40, scale: 1.8 },
      { x: 12, y: 22, z: -35, scale: 2.0 },
      { x: 22, y: 16, z: -28, scale: 1.9 },
      { x: -5, y: 35, z: -60, scale: 1.5 },
      { x: 8, y: 32, z: -55, scale: 1.4 },
      { x: -1.5, y: 45, z: -75, scale: 1.3 }
    ];

    for (let i = 0; i < count; i++) {
      const mesh = this.createLanternMesh();
      let posX, posY, posZ, s;

      if (i < signatureCoords.length) {
        const sc = signatureCoords[i];
        posX = sc.x;
        posY = sc.y;
        posZ = sc.z;
        s = sc.scale;
      } else {
        posX = -70 + Math.random() * 140;
        posY = 15 + Math.random() * 120;
        posZ = -20 - Math.random() * 140;
        s = 0.8 + Math.random() * 0.9;
      }

      mesh.position.set(posX, posY, posZ);
      mesh.scale.set(s, s, s);
      this.group.add(mesh);

      this.lanterns.push({
        mesh,
        speedY: 0.5 + Math.random() * 0.7,
        driftSpeedX: (Math.random() - 0.4) * 0.2,
        driftSpeedZ: (Math.random() - 0.5) * 0.15,
        swaySpeed: 0.9 + Math.random() * 1.2,
        swayOffset: Math.random() * Math.PI * 2
      });
    }
  }

  update(delta, time) {
    for (const l of this.lanterns) {
      l.mesh.position.y += l.speedY * delta * 1.8;
      l.mesh.position.x += l.driftSpeedX * delta;
      l.mesh.position.z += l.driftSpeedZ * delta;

      const sway = Math.sin(time * l.swaySpeed + l.swayOffset) * 0.06;
      l.mesh.rotation.z = sway;
      l.mesh.rotation.x = sway * 0.4;

      if (l.mesh.position.y > 150) {
        l.mesh.position.y = 8 + Math.random() * 10;
        l.mesh.position.x = -60 + Math.random() * 120;
        l.mesh.position.z = -30 - Math.random() * 110;
      }
    }
  }
}
