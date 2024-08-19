import { EXRLoader, FBXLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

type LoadModelParams = {
  path: `/${string}/`;
  modelFileName: `${string}.fbx`;
  onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void;
}

class LoadMachine {
  constructor() { }

  public loadModel({ path, modelFileName, onLoad }: LoadModelParams) {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.addHandler(/\.exr$/i, new EXRLoader());

    const loader = new FBXLoader(loadingManager);
    loader.setPath(`models${path}`);
    loader.load(modelFileName, onLoad);

    // if (onLoad) {
    //   loadingManager.onLoad = onLoad;
    // }
  }
}

const loadMachine = new LoadMachine();
export default loadMachine;