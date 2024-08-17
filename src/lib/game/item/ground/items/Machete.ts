import { EXRLoader, FBXLoader } from "three/examples/jsm/Addons.js";
import { GroundItemTemplate, GroundItem } from "../GroundItem";
import * as THREE from "three";

export default class MacheteItem extends GroundItem implements GroundItemTemplate {
    constructor(x: number, y: number, z: number) {
        super(x, y, z);
    }
    loadModel(onLoad?: () => void): void {
        const loadingManager = new THREE.LoadingManager();
        loadingManager.addHandler(/\.exr$/i, new EXRLoader());

        const loader = new FBXLoader(loadingManager);
        loader.setPath('models/objects/machete/');
        loader.load('machete_1k.fbx', (machete) => {
            machete.scale.setScalar(1);
        });

        if (onLoad) {
            loadingManager.onLoad = onLoad;
        }
    }

    public onPickup(): void {

    }

    public destroy(): void {

    }
}