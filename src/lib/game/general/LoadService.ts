import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';

type LoadModelParams = {
	path: `/${string}/`;
	modelFileName: `${string}.fbx`;
	onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void;
	loadingManager: THREE.LoadingManager;
};

class LoadService {
	constructor() {}

	public loadModel({
		path,
		modelFileName,
		onLoad,
		loadingManager
	}: LoadModelParams) {
		const loader = new FBXLoader(loadingManager);
		loader.setPath(`models${path}`);
		loader.load(modelFileName, onLoad);
	}
}

const loadMachine = new LoadService();
export default loadMachine;
