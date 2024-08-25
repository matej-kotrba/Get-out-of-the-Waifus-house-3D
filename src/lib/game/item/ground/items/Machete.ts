import { type GroundItemTemplate } from '../GroundItem';
import * as THREE from 'three';
import loadMachine from '$lib/game/general/LoadService';

export function getMacheteItem(): GroundItemTemplate {
	return {
		type: 'machete',
		loadModel(
			loadingManager: THREE.LoadingManager,
			onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void
		) {
			loadMachine.loadModel({
				path: '/objects/machete/',
				modelFileName: 'machete_1k.fbx',
				onLoad: (machete) => {
					machete.scale.setScalar(0.01);
					onLoad?.(machete);
				},
				loadingManager
			});
		},
		onPickup(): void {},
		destroy(): void {}
	};
}

// export default class MacheteItem extends GroundItem implements GroundItemTemplate {
//     constructor(initialPosition: THREE.Vector3) {
//         super(initialPosition);
//     }

//     loadModel(onLoad: (model: THREE.Group<THREE.Object3DEventMap>) => void): void {
//         loadMachine.loadModel({
//             path: '/objects/machete/',
//             modelFileName: 'machete_1k.fbx',
//             onLoad: (machete) => {
//                 machete.scale.setScalar(1);
//                 onLoad?.(machete)
//             }
//         });
//     }

//     public onPickup(): void {

//     }

//     public destroy(): void {

//     }
// }
