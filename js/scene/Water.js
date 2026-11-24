import * as THREE from 'three';

/**
 * Procedural normal map generator for water ripples.
 * Creates a seamlessly tileable 256x256 normal map texture.
 */
function createProceduralWaterNormalMap() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const waves = [
    { fx: 4, fy: 3, a: 1.0 },
    { fx: 8, fy: 6, a: 0.6 },
    { fx: 14, fy: 10, a: 0.35 }
  ];

  for (let y = 0; y < size; y++) {
    const ny = (y / size) * Math.PI * 2;
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      let dhdx = 0;
      let dhdy = 0;

      for (const w of waves) {
        const phase = w.fx * nx + w.fy * ny;
        const cosP = Math.cos(phase) * w.a;
        dhdx += cosP * w.fx;
        dhdy += cosP * w.fy;
      }

      let vx = -dhdx * 0.15;
      let vy = 1.0;
      let vz = -dhdy * 0.15;
      const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      vx /= len;
      vy /= len;
      vz /= len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((vx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((vz * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((vy * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  return texture;
}

/**
 * High-performance single-pass River Water Surface.
 * Eliminates duplicate scene mirror-rendering passes while retaining
 * sparkling moonlight reflections and silky wave currents.
 */
export class RiverWater {
  constructor(scene) {
    this.scene = scene;
    const waterGeometry = new THREE.PlaneGeometry(1200, 1200);

    this.normalTexture = createProceduralWaterNormalMap();

    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a264a, // Rich twilight blue reflection
      roughness: 0.08,
      metalness: 0.92,
      normalMap: this.normalTexture,
      normalScale: new THREE.Vector2(0.28, 0.28)
    });

    this.waterMesh = new THREE.Mesh(waterGeometry, this.waterMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = 0;
    this.scene.add(this.waterMesh);
  }

  update(delta) {
    if (this.normalTexture) {
      this.normalTexture.offset.x += delta * 0.025;
      this.normalTexture.offset.y += delta * 0.018;
    }
  }

  getWaveHeight(x, z, time) {
    const wave1 = Math.sin(x * 0.15 + time * 1.5) * 0.07;
    const wave2 = Math.cos(z * 0.12 + time * 1.2) * 0.05;
    const ripple = Math.sin((x + z) * 0.3 + time * 2.5) * 0.03;
    return wave1 + wave2 + ripple;
  }
}
