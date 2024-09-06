import type { World, Vector } from '@dimforge/rapier3d';

type RapierType = typeof import('@dimforge/rapier3d');

let RAPIER: RapierType | null = null;
let gravity: Vector | null = null;
let world: World | null = null;

export async function initializeRapier() {
	return new Promise((res) => {
		import('@dimforge/rapier3d').then((rapier) => {
			RAPIER = rapier;
			gravity = new rapier.Vector3(0, -9.81, 0);
			world = new rapier.World(gravity);
			res('loaded');
		});
	});
}

export function getRapierProperties() {
	return { RAPIER, gravity, world };
}
