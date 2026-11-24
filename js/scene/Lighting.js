import * as THREE from 'three';

/**
 * Scene Lighting for Twilight Blue Hour Atmosphere
 */
export class SceneLighting {
  constructor(scene) {
    this.scene = scene;

    // Ambient twilight light: Rich cobalt blue
    this.ambient = new THREE.AmbientLight(0x22487a, 2.0);
    this.scene.add(this.ambient);

    // Directional Moonlight in Twilight Sky
    this.moonLight = new THREE.DirectionalLight(0xdbe9ff, 2.4);
    this.moonLight.position.set(-36, 60, -130);
    this.scene.add(this.moonLight);

    // Temple complex warm golden illumination
    this.pagodaSpot = new THREE.SpotLight(0xffbe3d, 4.5, 300, Math.PI / 3.5, 0.5, 1.2);
    this.pagodaSpot.position.set(-45, 12, -75);
    this.pagodaSpot.target.position.set(-60, 35, -115);
    this.scene.add(this.pagodaSpot);
    this.scene.add(this.pagodaSpot.target);

    // Boardwalk warm festival lantern glow
    this.boardwalkLight = new THREE.PointLight(0xff9922, 2.4, 45);
    this.boardwalkLight.position.set(0, 5.0, 7.5);
    this.scene.add(this.boardwalkLight);
  }

  getMoonDirection() {
    return this.moonLight.position.clone().normalize();
  }
}
