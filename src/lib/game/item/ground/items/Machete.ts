import { GroundItemTemplate, GroundItem } from "../GroundItem";
import * as THREE from "three";
import loadMachine from "$lib/game/general/LoadMachine";

export default class MacheteItem extends GroundItem implements GroundItemTemplate {
    constructor(initialPosition: THREE.Vector3) {
        super(initialPosition);
    }

    loadModel(onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void): void {
        loadMachine.loadModel({
            path: '/objects/machete/',
            modelFileName: 'machete_1k.fbx',
            onLoad: (machete) => {
                machete.scale.setScalar(1);
                onLoad?.(machete)
            }
        });
    }

    public onPickup(): void {

    }

    public destroy(): void {

    }
}