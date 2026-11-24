import * as THREE from 'three';

/**
 * SceneManager: Configures Three.js WebGLRenderer, PerspectiveCamera,
 * smooth camera transitions, and rendering loops.
 */
export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;

    // 1. Scene (Twilight Blue Hour)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x10315c);
    this.scene.fog = new THREE.FogExp2(0x163a6e, 0.0032);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.5,
      1200
    );

    // Camera viewpoints
    this.views = {
      dock: {
        pos: new THREE.Vector3(2, 4.2, 12.5),
        target: new THREE.Vector3(-15, 6.5, -60)
      },
      pier: {
        pos: new THREE.Vector3(0, 3.0, 3.0),
        target: new THREE.Vector3(-12, 4.5, -55)
      },
      follow: {
        pos: new THREE.Vector3(0, 2.2, 4.5),
        target: new THREE.Vector3(0, 0.5, -18)
      },
      panoramic: {
        pos: new THREE.Vector3(40, 14, 22),
        target: new THREE.Vector3(-45, 18, -85)
      }
    };

    this.currentMode = 'dock';
    this.camera.position.copy(this.views.dock.pos);
    this.cameraTarget = this.views.dock.target.clone();

    // 3. WebGL Renderer (Optimized for 60 FPS)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = false; // Disabled heavy dynamic shadow pass for smooth performance

    this.container.appendChild(this.renderer.domElement);

    // Window Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setCameraMode(modeName) {
    if (this.views[modeName]) {
      this.currentMode = modeName;
    }
  }

  updateCamera(delta, targetPlayerKrathong = null) {
    let desiredPos = this.views[this.currentMode].pos;
    let desiredTarget = this.views[this.currentMode].target;

    if (this.currentMode === 'follow' && targetPlayerKrathong) {
      const kp = targetPlayerKrathong.group.position;
      desiredPos = new THREE.Vector3(kp.x + 0.5, kp.y + 2.2, kp.z + 6.5);
      desiredTarget = new THREE.Vector3(kp.x - 4, kp.y + 1.2, kp.z - 25);
    }

    // Smooth camera damping
    this.camera.position.lerp(desiredPos, delta * 2.8);
    this.cameraTarget.lerp(desiredTarget, delta * 3.0);
    this.camera.lookAt(this.cameraTarget);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
