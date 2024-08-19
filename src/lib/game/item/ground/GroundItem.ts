import * as THREE from 'three';

export type GroundItemTemplate = {
  type: string;
  loadModel(onLoad?: (model: THREE.Group<THREE.Object3DEventMap>) => void): void;
  onPickup(): void;
  destroy(): void;
}

export type GroundItemRestProps = {
  model: THREE.Group<THREE.Object3DEventMap>;
  initialPosition: THREE.Vector3;
}

export class GroundItem {
  public type: GroundItemTemplate['type'];
  public loadModel: GroundItemTemplate['loadModel'];
  public onPickup: GroundItemTemplate['onPickup'];
  public destroy: GroundItemTemplate['destroy'];

  public model: GroundItemRestProps['model'];
  public initialPosition: GroundItemRestProps['initialPosition'];

  constructor(groundItem: GroundItemTemplate, restProps: GroundItemRestProps) {
    this.type = groundItem.type;
    this.loadModel = groundItem.loadModel;
    this.onPickup = groundItem.onPickup;
    this.destroy = groundItem.destroy

    this.model = restProps.model;
    this.initialPosition = restProps.initialPosition;

    this.model.position.copy(this.initialPosition);
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.model);
  }
}