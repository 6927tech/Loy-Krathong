import * as THREE from 'three';
import { Krathong } from './Krathong.js';

/**
 * Manages all active krathongs flowing along the river:
 * - The player's released krathong
 * - Public shared krathongs passing by
 */
export class RiverFlowManager {
  constructor(scene, riverWater) {
    this.scene = scene;
    this.riverWater = riverWater;
    this.krathongs = [];
    this.playerKrathong = null;

    // Spawn timer for public background krathongs
    this.spawnTimer = 0;
    this.spawnInterval = 4.5;
    this.maxKrathongs = 10;

    // Seed initial krathongs already floating down the river
    this.seedInitialRiverTraffic();
  }

  seedInitialRiverTraffic() {
    const initialCount = 7;
    for (let i = 0; i < initialCount; i++) {
      const type = Math.random() > 0.45 ? 'medium' : 'small';
      const laneX = (Math.random() - 0.5) * 60;
      const startZ = -20 - Math.random() * 150;
      const pos = new THREE.Vector3(laneX, 0, startZ);

      const k = new Krathong(type, pos, false);
      this.scene.add(k.group);
      this.krathongs.push(k);
    }
  }

  spawnPublicKrathong(type = null, customLaneX = null) {
    if (this.krathongs.length >= this.maxKrathongs) return null;

    const kType = type || (Math.random() > 0.5 ? 'medium' : 'small');
    const laneX = customLaneX !== null ? customLaneX : (Math.random() - 0.5) * 65;
    const startZ = 25 + Math.random() * 15;
    const pos = new THREE.Vector3(laneX, 0, startZ);

    const k = new Krathong(kType, pos, false);
    this.scene.add(k.group);
    this.krathongs.push(k);
    return k;
  }

  releasePlayerKrathong(type) {
    // Player releases krathong right in front of the pier steps
    const startPos = new THREE.Vector3(0, 0.2, -7.0);
    const k = new Krathong(type, startPos, true);
    this.scene.add(k.group);
    this.krathongs.push(k);
    this.playerKrathong = k;
    return k;
  }

  update(delta, time) {
    // Spawn ambient public krathongs periodically
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnPublicKrathong();
    }

    // Update all krathongs and remove out-of-bounds ones
    for (let i = this.krathongs.length - 1; i >= 0; i--) {
      const k = this.krathongs[i];
      k.update(delta, time, this.riverWater);

      if (k.isOutOfBounds()) {
        this.scene.remove(k.group);
        if (this.playerKrathong === k) {
          this.playerKrathong = null;
        }
        this.krathongs.splice(i, 1);
      }
    }
  }
}
