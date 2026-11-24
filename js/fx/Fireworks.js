import * as THREE from 'three';

/**
 * Festive Fireworks system (พลุดอกไม้ไฟเฉลิมฉลอง)
 * Launches fireworks periodically behind the pagoda, exploding with particle dispersion
 * and dynamic scene flash lights.
 */
export class FireworksSystem {
  constructor(scene, soundCallback = null) {
    this.scene = scene;
    this.soundCallback = soundCallback;
    this.particles = [];
    this.activeBursts = [];

    this.timer = 0;
    this.interval = 3.2; // Next firework burst interval

    // Flash light when firework explodes
    this.flashLight = new THREE.PointLight(0xffeedd, 0, 160);
    this.scene.add(this.flashLight);

    // Festival color palettes
    this.colorPalettes = [
      [0xffd700, 0xffaa00, 0xffffff], // Gold
      [0xff2a4b, 0xff6688, 0xffeedd], // Ruby Red
      [0x00e676, 0x69f0ae, 0xffffff], // Emerald
      [0x2979ff, 0x82b1ff, 0xffffff], // Sapphire
      [0xd500f9, 0xea80fc, 0xffd700]  // Orchid & Gold
    ];
  }

  triggerRandomBurst() {
    const burstX = -90 + (Math.random() - 0.5) * 80;
    const burstY = 75 + Math.random() * 35;
    const burstZ = -120 + (Math.random() - 0.5) * 60;
    const pos = new THREE.Vector3(burstX, burstY, burstZ);

    const palette = this.colorPalettes[Math.floor(Math.random() * this.colorPalettes.length)];
    this.createBurst(pos, palette);

    if (this.soundCallback) {
      this.soundCallback();
    }
  }

  createBurst(position, palette) {
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const baseColor = new THREE.Color(palette[0]);
    const highlightColor = new THREE.Color(palette[1]);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Spherical explosion velocity
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const speed = 12 + Math.random() * 18;

      velocities.push(new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.cos(phi),
        speed * Math.sin(phi) * Math.sin(theta)
      ));

      // Color interpolation
      const c = Math.random() > 0.3 ? baseColor : highlightColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const pointCloud = new THREE.Points(geometry, material);
    this.scene.add(pointCloud);

    // Trigger flash light
    this.flashLight.position.copy(position);
    this.flashLight.color.copy(baseColor);
    this.flashLight.intensity = 4.5;

    this.activeBursts.push({
      pointCloud,
      geometry,
      velocities,
      positions,
      age: 0,
      maxAge: 1.8
    });
  }

  update(delta) {
    // Launch timer
    this.timer += delta;
    if (this.timer >= this.interval) {
      this.timer = 0;
      this.interval = 2.8 + Math.random() * 2.2;
      this.triggerRandomBurst();
    }

    // Decay flash light
    if (this.flashLight.intensity > 0) {
      this.flashLight.intensity = Math.max(0, this.flashLight.intensity - delta * 6.0);
    }

    // Update active particle bursts
    for (let i = this.activeBursts.length - 1; i >= 0; i--) {
      const b = this.activeBursts[i];
      b.age += delta;

      const progress = b.age / b.maxAge;
      b.pointCloud.material.opacity = Math.max(0, 1.0 - progress);

      const posArray = b.positions;
      for (let j = 0; j < b.velocities.length; j++) {
        const vel = b.velocities[j];
        vel.y -= 9.8 * delta * 0.45; // Gravity
        vel.multiplyScalar(0.97);     // Air drag

        posArray[j * 3] += vel.x * delta;
        posArray[j * 3 + 1] += vel.y * delta;
        posArray[j * 3 + 2] += vel.z * delta;
      }
      b.geometry.attributes.position.needsUpdate = true;

      if (b.age >= b.maxAge) {
        this.scene.remove(b.pointCloud);
        b.geometry.dispose();
        b.pointCloud.material.dispose();
        this.activeBursts.splice(i, 1);
      }
    }
  }
}
