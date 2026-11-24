import * as THREE from 'three';
import { ThaiCharacter } from './Character.js';

/**
 * CrowdManager: Controls all animated festival participants on the waterfront pier
 * and promenade, orchestrating walking paths, krathong release ceremonies, and gazing.
 */
export class CrowdManager {
  constructor(scene, onNpcKrathongReleased = null) {
    this.scene = scene;
    this.onNpcKrathongReleased = onNpcKrathongReleased;
    this.members = [];
    this.group = new THREE.Group();

    this.spawnFestivalCrowd();
    this.scene.add(this.group);
  }

  spawnFestivalCrowd() {
    // 1. Promenade Walkers (6 NPCs walking left and right - Optimized for 60 FPS)
    for (let i = 0; i < 6; i++) {
      const char = new ThaiCharacter(i, Math.random() > 0.5);
      const startX = -45 + (i / 6) * 90 + (Math.random() - 0.5) * 5;
      const startZ = 8.2 + (i % 2) * 2.5;
      const direction = i % 2 === 0 ? 1 : -1;

      char.group.position.set(startX, 1.8, startZ);
      char.group.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;

      this.group.add(char.group);

      this.members.push({
        type: 'walker',
        character: char,
        speed: 1.1 + Math.random() * 0.4,
        dirX: direction,
        targetZ: startZ,
        state: 'walking'
      });
    }

    // 2. Dedicated Krathong Floaters (2 NPCs alternating releasing krathongs at the pier steps)
    for (let j = 0; j < 2; j++) {
      const floater = new ThaiCharacter(j + 1, true);
      const spawnX = -18 + j * 36;
      floater.group.position.set(spawnX, 1.8, 10);
      this.group.add(floater.group);

      this.members.push({
        type: 'floater',
        character: floater,
        speed: 1.2,
        state: 'approaching_pier',
        timer: j * 5.0,
        initialSpawnX: spawnX
      });
    }

    // 3. Riverfront Gazers (3 NPCs standing along railings admiring moon and pagoda)
    const gazerSpots = [
      { x: -25, z: 6.8, rotY: -Math.PI * 0.9 },
      { x: 25, z: 6.8, rotY: -Math.PI * 1.1 },
      { x: 3.2, z: -1.5, rotY: Math.PI * 0.6 }
    ];

    for (let k = 0; k < gazerSpots.length; k++) {
      const spot = gazerSpots[k];
      const gazer = new ThaiCharacter(k + 4, false);
      gazer.group.position.set(spot.x, spot.z < 2 ? 1.7 : 1.8, spot.z);
      gazer.group.rotation.y = spot.rotY;
      this.group.add(gazer.group);

      this.members.push({
        type: 'gazer',
        character: gazer,
        state: 'gazing',
        swayOffset: Math.random() * Math.PI * 2
      });
    }
  }

  update(delta, time) {
    for (const m of this.members) {
      if (m.type === 'walker') {
        this.updateWalker(m, delta, time);
      } else if (m.type === 'floater') {
        this.updateFloater(m, delta, time);
      } else if (m.type === 'gazer') {
        this.updateGazer(m, time);
      }
    }
  }

  updateWalker(m, delta, time) {
    const pos = m.character.group.position;
    pos.x += m.dirX * m.speed * delta;

    // Turn around at ends of boardwalk
    if (m.dirX > 0 && pos.x > 55) {
      m.dirX = -1;
      m.character.group.rotation.y = -Math.PI / 2;
    } else if (m.dirX < 0 && pos.x < -55) {
      m.dirX = 1;
      m.character.group.rotation.y = Math.PI / 2;
    }

    m.character.animateWalk(time, m.speed);
  }

  updateFloater(m, delta, time) {
    const char = m.character;
    const pos = char.group.position;

    switch (m.state) {
      case 'approaching_pier': {
        // Move towards center pier entrance (X: 0, Z: 6.0)
        const targetX = 0;
        const targetZ = 6.0;
        const dx = targetX - pos.x;
        const dz = targetZ - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.4) {
          pos.x += (dx / dist) * m.speed * delta;
          pos.z += (dz / dist) * m.speed * delta;
          char.group.rotation.y = Math.atan2(dx, dz);
          char.animateWalk(time, m.speed);
        } else {
          m.state = 'on_pier';
        }
        break;
      }

      case 'on_pier': {
        // Walk down pier deck towards steps (Z: -3.0)
        const targetZ = -3.0;
        if (pos.z > targetZ) {
          pos.z -= m.speed * delta;
          char.group.rotation.y = Math.PI; // facing river
          char.animateWalk(time, m.speed);
        } else {
          m.state = 'descending_steps';
        }
        break;
      }

      case 'descending_steps': {
        // Step down stairs to water level (Z: -5.0, Y: 0.3)
        const targetZ = -5.0;
        if (pos.z > targetZ) {
          pos.z -= m.speed * delta * 0.7;
          pos.y = Math.max(0.3, pos.y - delta * 0.9);
          char.group.rotation.y = Math.PI;
          char.animateWalk(time, m.speed * 0.7);
        } else {
          m.state = 'kneeling';
          m.kneelProgress = 0;
        }
        break;
      }

      case 'kneeling': {
        m.kneelProgress += delta * 0.8;
        char.setKneeling(m.kneelProgress);

        if (m.kneelProgress >= 1.0) {
          // Release held krathong into river!
          if (char.hasKrathong) {
            char.removeHeldKrathong();
            if (this.onNpcKrathongReleased) {
              const releaseType = Math.random() > 0.4 ? 'medium' : 'small';
              this.onNpcKrathongReleased(releaseType, pos.x + (Math.random() - 0.5) * 1.5);
            }
          }
          m.state = 'praying';
          m.prayTimer = 0;
        }
        break;
      }

      case 'praying': {
        m.prayTimer += delta;
        char.setWaiPose(time);

        if (m.prayTimer > 3.0) {
          m.state = 'standing_up';
          m.standProgress = 1.0;
        }
        break;
      }

      case 'standing_up': {
        m.standProgress -= delta * 0.9;
        char.setKneeling(m.standProgress);

        if (m.standProgress <= 0) {
          pos.y = 1.7;
          m.state = 'returning_promenade';
        }
        break;
      }

      case 'returning_promenade': {
        // Walk back up to boardwalk (Z: 9.0)
        if (pos.z < 9.0) {
          pos.z += m.speed * delta;
          pos.y = 1.8;
          char.group.rotation.y = 0; // facing back to temple
          char.animateWalk(time, m.speed);
        } else {
          // Reset cycle with new krathong
          char.attachHeldKrathong();
          pos.x = m.initialSpawnX;
          m.state = 'approaching_pier';
        }
        break;
      }
    }
  }

  updateGazer(m, time) {
    m.character.animateIdle(time);
    // Subtle head glance upwards occasionally
    const headNod = Math.sin(time * 0.8 + m.swayOffset) * 0.12;
    m.character.headGroup.rotation.x = -0.15 + headNod;
  }
}
