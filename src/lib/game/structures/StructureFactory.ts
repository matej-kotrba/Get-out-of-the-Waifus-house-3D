import type { RigidBody } from '@dimforge/rapier3d';
import type { RawRigidBodyType } from '@dimforge/rapier3d/rapier_wasm3d';
import * as THREE from 'three';
import type { texturesToPreload } from '../general/PreloadService.svelte';

const structureTemplates = [];

type StructureObject = {
	three: THREE.Object3D;
	physics: unknown;
};

type CreateStructureProps = {
	rigidBodyType: RawRigidBodyType;
	materialType: (typeof texturesToPreload)[number];
	mesh: THREE.Mesh;

	position: THREE.Vector3;
	rotation?: THREE.Vector3;
};

class StructureFactory {
	#structures: StructureObject[] = [];

	public get structures() {
		return this.#structures;
	}

	public createStructure(props: CreateStructureProps) {
		const { rigidBodyType, materialType, mesh, position, rotation } = props;

		const newStructure: StructureObject = {
			three: mesh,
			physics: ''
		};
	}
}

const structureFactory = new StructureFactory();
export default structureFactory;
