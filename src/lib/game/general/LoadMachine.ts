import { FBXLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

type LoadModelParams = {
  path: `/${string}/`;
  modelFileName: `${string}.fbx`;
  onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void;
  loadingManager: THREE.LoadingManager;
}

class LoadMachine {
  constructor() { }

  public loadModel({ path, modelFileName, onLoad, loadingManager }: LoadModelParams) {
    const loader = new FBXLoader(loadingManager);
    loader.setPath(`models${path}`);
    loader.load(modelFileName, onLoad);
  }
}

const loadMachine = new LoadMachine();
export default loadMachine;