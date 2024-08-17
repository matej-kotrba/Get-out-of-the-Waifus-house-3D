export abstract class GroundItemTemplate {
  abstract loadModel(onLoad?: () => void): void;
  abstract onPickup(): void;
  abstract destroy(): void;
}

export class GroundItem {
  constructor(public x: number, public y: number, public z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}