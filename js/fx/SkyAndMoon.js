import * as THREE from 'three';

/**
 * Creates procedural twilight sky texture with soft clouds and horizon glow.
 */
function createTwilightSkyTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Vertical sky gradient (Deep cobalt blue at zenith -> warm purple-blue twilight horizon)
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, '#0a224a'); // Deep royal midnight blue
  grad.addColorStop(0.35, '#123b78'); // Vibrant cobalt blue
  grad.addColorStop(0.65, '#1e5296'); // Rich twilight blue
  grad.addColorStop(0.85, '#2b588c'); // Soft horizon dusk
  grad.addColorStop(1.0, '#3f5878'); // Warm hazy horizon

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Soft scattered twilight clouds
  ctx.fillStyle = 'rgba(18, 48, 92, 0.4)';
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * size;
    const cy = 200 + Math.random() * 550;
    const rx = 100 + Math.random() * 220;
    const ry = 30 + Math.random() * 70;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates procedural lunar texture with craters.
 */
function createProceduralMoonTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.7, '#ffffff');
  grad.addColorStop(0.9, '#fffde8');
  grad.addColorStop(1, '#fff6d4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(215, 200, 175, 0.12)';
  const maria = [
    { x: 180, y: 190, r: 90 },
    { x: 300, y: 160, r: 80 },
    { x: 260, y: 310, r: 110 },
    { x: 370, y: 260, r: 70 },
    { x: 150, y: 320, r: 75 }
  ];
  for (const m of maria) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createMoonHaloTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 250, 230, 0.95)');
  grad.addColorStop(0.25, 'rgba(255, 235, 180, 0.5)');
  grad.addColorStop(0.55, 'rgba(160, 205, 255, 0.18)');
  grad.addColorStop(1, 'rgba(0, 0, 50, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export class SkyAndMoon {
  constructor(scene, moonPosition) {
    this.scene = scene;
    this.group = new THREE.Group();

    // 1. Twilight Skydome (Deep Cobalt Blue Sky)
    const skyGeo = new THREE.SphereGeometry(650, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: createTwilightSkyTexture(),
      side: THREE.BackSide
    });
    this.skydome = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(this.skydome);

    // 2. Full Moon in Twilight Sky
    const moonGeo = new THREE.SphereGeometry(24, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      map: createProceduralMoonTexture(),
      color: 0xffffff
    });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.copy(moonPosition);
    this.group.add(this.moon);

    // 3. Inner Warm Corona
    const innerHaloMat = new THREE.SpriteMaterial({
      map: createMoonHaloTexture(),
      color: 0xfffae0,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.95
    });
    const innerHalo = new THREE.Sprite(innerHaloMat);
    innerHalo.scale.set(85, 85, 1);
    innerHalo.position.copy(moonPosition);
    this.group.add(innerHalo);

    // 4. Outer Soft Twilight Halo
    const haloMat = new THREE.SpriteMaterial({
      map: createMoonHaloTexture(),
      color: 0xb0d8ff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.7
    });
    const haloSprite = new THREE.Sprite(haloMat);
    haloSprite.scale.set(180, 180, 1);
    haloSprite.position.copy(moonPosition);
    this.group.add(haloSprite);

    // 5. Twilight Starfield
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.45;
      const radius = 620 + Math.random() * 20;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(30, radius * Math.cos(phi));
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.96;
      colors[i * 3 + 2] = 0.88;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.group.add(this.stars);

    this.scene.add(this.group);
  }

  update(time) {
    if (this.stars) {
      this.stars.rotation.y = time * 0.0015;
    }
  }
}
