import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { SceneLighting } from './scene/Lighting.js';
import { RiverWater } from './scene/Water.js';
import { GoldenPagoda } from './scene/Pagoda.js';
import { WaterfrontPier } from './scene/Pier.js';
import { SkyAndMoon } from './fx/SkyAndMoon.js';
import { SkyLanterns } from './fx/Lanterns.js';
import { FireworksSystem } from './fx/Fireworks.js';
import { RiverFlowManager } from './entities/RiverFlow.js';
import { CrowdManager } from './entities/CrowdManager.js';
import { LotusPadsSystem } from './entities/LotusPads.js';
import { TraditionalBoat } from './entities/Boat.js';
import { SoundManager } from './audio/SoundManager.js';
import { SyncManager } from './network/SyncManager.js';

class LoyKrathongApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.selectedKrathongType = 'small';
    this.clock = new THREE.Clock();

    // 1. Audio System
    this.soundManager = new SoundManager();

    // 2. 3D Scene Core
    this.sceneManager = new SceneManager(this.container);

    // 3. Lighting & Celestial Setup
    this.lighting = new SceneLighting(this.sceneManager.scene);
    const moonPos = this.lighting.moonLight.position.clone();
    this.skyAndMoon = new SkyAndMoon(this.sceneManager.scene, moonPos);

    // 4. River Water Simulation
    this.riverWater = new RiverWater(this.sceneManager.scene, this.lighting.getMoonDirection());

    // 5. Golden Pagoda & Riverside Pier
    this.pagoda = new GoldenPagoda(this.sceneManager.scene);
    this.pier = new WaterfrontPier(this.sceneManager.scene);

    // 6. Sky Lanterns & Fireworks FX (Optimized count for silky 60 FPS)
    this.lanterns = new SkyLanterns(this.sceneManager.scene, 22);
    this.fireworks = new FireworksSystem(this.sceneManager.scene, () => {
      this.soundManager.playFireworkBurst();
    });

    // 7. River Flow & Krathongs
    this.riverFlow = new RiverFlowManager(this.sceneManager.scene, this.riverWater);

    // 8. Traditional Wooden Boat & Floating Lotus Pads with Clay Lamps
    this.boat = new TraditionalBoat(this.sceneManager.scene);
    this.lotusPads = new LotusPadsSystem(this.sceneManager.scene);

    // 9. Festival Crowd Simulation (Walkers, Floaters, Gazers)
    this.crowd = new CrowdManager(this.sceneManager.scene, (npcType, releaseLaneX) => {
      this.riverFlow.spawnPublicKrathong(npcType, releaseLaneX);
    });

    // 10. Real-time Public River Sync (Privacy-guaranteed)
    this.syncManager = new SyncManager((remoteType, remoteLaneX) => {
      this.riverFlow.spawnPublicKrathong(remoteType, remoteLaneX);
    });

    // 11. Bind UI & Events
    this.initUI();

    // 10. Start Animation Loop
    this.animate();
  }

  initUI() {
    // Unlock Audio Context on first user interaction
    const unlockAudio = () => {
      this.soundManager.init();
      this.soundManager.ensureContextRunning();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    // BGM Toggle Button
    const btnBgm = document.getElementById('btn-bgm');
    btnBgm.addEventListener('click', () => {
      this.soundManager.init();
      const isPlaying = this.soundManager.toggleBgm();
      btnBgm.classList.toggle('active', isPlaying);
      btnBgm.classList.toggle('muted', !isPlaying);
      btnBgm.querySelector('.btn-label').textContent = `เพลงไทย: ${isPlaying ? 'เปิด' : 'ปิด'}`;
    });

    // Water Sound Toggle Button
    const btnWater = document.getElementById('btn-water');
    btnWater.addEventListener('click', () => {
      this.soundManager.init();
      const isPlaying = this.soundManager.toggleWater();
      btnWater.classList.toggle('active', isPlaying);
      btnWater.classList.toggle('muted', !isPlaying);
      btnWater.querySelector('.btn-label').textContent = `เสียงน้ำ: ${isPlaying ? 'เปิด' : 'ปิด'}`;
    });

    // Camera Mode Buttons
    const camButtons = document.querySelectorAll('.cam-btn');
    camButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        camButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.sceneManager.setCameraMode(mode);
      });
    });

    // Krathong Selection Cards
    const choiceCards = document.querySelectorAll('.choice-option');
    choiceCards.forEach(card => {
      card.addEventListener('click', () => {
        choiceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedKrathongType = card.dataset.type;
      });
    });

    // Wish Tag Shortcuts
    const tagButtons = document.querySelectorAll('.tag-btn');
    const wishInput = document.getElementById('wish-input');
    tagButtons.forEach(tag => {
      tag.addEventListener('click', () => {
        wishInput.value = tag.dataset.tag;
        wishInput.focus();
      });
    });

    // Launch Krathong Action
    const launchBtn = document.getElementById('btn-launch');
    const dockPanel = document.getElementById('dock-panel');
    const floatMoreBtn = document.getElementById('btn-float-more');
    const blessingToast = document.getElementById('blessing-toast');
    const toastWishDisplay = document.getElementById('toast-wish-display');

    launchBtn.addEventListener('click', () => {
      this.soundManager.init();
      this.soundManager.playWaterSplash();

      // Release Krathong into 3D river
      const playerKrathong = this.riverFlow.releasePlayerKrathong(this.selectedKrathongType);

      // Broadcast to public river (No wish message sent)
      this.syncManager.broadcastKrathong(this.selectedKrathongType);

      // Transition camera to follow mode
      this.sceneManager.setCameraMode('follow');
      camButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === 'follow'));

      // Show private blessing toast
      const wishText = wishInput.value.trim() || 'ขอขมาพระแม่คงคา และขอให้มีแต่ความสุขความเจริญ';
      toastWishDisplay.textContent = `"${wishText}"`;
      blessingToast.classList.add('show');
      setTimeout(() => {
        blessingToast.classList.remove('show');
      }, 7000);

      // Hide dock panel, show "float more" pill
      dockPanel.style.display = 'none';
      floatMoreBtn.style.display = 'block';
    });

    // Float Another Krathong
    floatMoreBtn.addEventListener('click', () => {
      dockPanel.style.display = 'block';
      floatMoreBtn.style.display = 'none';
      this.sceneManager.setCameraMode('dock');
      camButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === 'dock'));
      wishInput.value = '';
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Water waves
    this.riverWater.update(delta);

    // 2. Stars & Moon rotation
    this.skyAndMoon.update(time);

    // 3. Sky Lanterns
    this.lanterns.update(delta, time);

    // 4. Fireworks
    this.fireworks.update(delta);

    // 5. Krathongs on River
    this.riverFlow.update(delta, time);

    // 6. Traditional Boat & Lotus Pads
    this.boat.update(delta, time, this.riverWater);
    this.lotusPads.update(time);

    // 7. Festival Crowd Animation & AI
    this.crowd.update(delta, time);

    // 8. Camera smooth interpolation
    this.sceneManager.updateCamera(delta, this.riverFlow.playerKrathong);

    // 9. Render 3D Scene
    this.sceneManager.render();
  }
}

// Instantiate application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new LoyKrathongApp();
});
