import * as THREE from 'three';
export abstract class GroundItemTemplate {
  abstract loadModel(onLoad?: (model: THREE.Group<THREE.Object3DEventMap>) => void): void;
  abstract onPickup(): void;
  abstract destroy(): void;
}

export class GroundItem {
  constructor(public initialPosition: THREE.Vector3) { }
}