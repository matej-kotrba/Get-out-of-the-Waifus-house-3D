import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/Addons.js';

export class CharacterControls {

  model: THREE.Group
  mixer: THREE.AnimationMixer
  animationsMap: Map<string, THREE.AnimationAction> = new Map()
  orbitControls: OrbitControls
  camera: THREE.Camera

  currentAction: string;

  constructor(model: THREE.Group, mixer: THREE.AnimationMixer, animations: Map<string, THREE.AnimationAction>, orbitControls: OrbitControls, camera: THREE.Camera, currentAction: string) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animations;
    this.orbitControls = orbitControls;
    this.camera = camera;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key === this.currentAction) {
        value.play();
      }
    })
    this.orbitControls = orbitControls;
    this.camera = camera;
  }
}