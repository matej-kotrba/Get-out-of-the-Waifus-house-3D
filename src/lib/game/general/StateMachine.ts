import * as THREE from "three";

class SceneMachine {
  private renderer: THREE.WebGLRenderer;
  private orbit: THREE.Object3D;
  private scene: THREE.Scene | null;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene | null, orbit: THREE.Object3D) {
    this.renderer = renderer;
    this.scene = scene;
    this.orbit = orbit;
  }

  public newScene(scene: THREE.Scene) {
    this.scene = scene;
  }

  public clear() {
    this.scene = null;
  }
}

const sceneMachine = new SceneMachine();
export default sceneMachine;