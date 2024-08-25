import * as THREE from 'three';

class PlayerVarsService {
	private playerModelCoords: THREE.Vector3;
	private playerCameraCoords: THREE.Vector3;

	constructor() {
		this.playerModelCoords = new THREE.Vector3();
		this.playerCameraCoords = new THREE.Vector3();
	}

	public setup(playerModel: THREE.Object3D, playerCamera: THREE.Camera): void {
		this.playerModelCoords = playerModel.position;
		this.playerCameraCoords = playerCamera.getWorldPosition(
			new THREE.Vector3()
		);
	}

	public playerModelPosition(): THREE.Vector3 {
		return this.playerModelCoords;
	}

	public playerCameraPosition(): THREE.Vector3 {
		return this.playerCameraCoords;
	}
}

const playerVarsMachine = new PlayerVarsService();
export default playerVarsMachine;
