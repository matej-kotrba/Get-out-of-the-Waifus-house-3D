<script lang="ts">
	import QuickSlot from '$lib/components/game/ingame-ui/quickslot.svelte';
	import { CharacterControls } from '$lib/game/characters/player/characterControls';
	import {
		initialize,
		initializeCameraUpdation
	} from '$lib/three/setup.svelte';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GUI } from 'dat.gui';
	import updateService from '$lib/game/general/UpdateService';
	import newItemFactory from '$lib/game/item/NewItemFactory';
	import { getMacheteItem } from '$lib/game/item/ground/items/Machete';
	import listenerMachine from '$lib/game/general/ListenerService';
	import Loading from '$lib/components/game/ingame-ui/loading.svelte';
	import preloadMachine from '$lib/game/general/PreloadService.svelte';
	import player from '$lib/game/characters/player/Player.svelte';
	import worldObjects from '$lib/game/general/WorldObjects';
	import Screens from '$lib/components/game/Screens.svelte';
	import {
		getRapierProperties,
		initializeRapier
	} from '$lib/game/physics/rapier';

	const textToAnimate = 'Get out of the Waifus house';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		async function onRapierLoad() {
			await initializeRapier();
			const { RAPIER, world } = getRapierProperties();

			orbit.position.setScalar(0);
			orbit.add(camera);
			scene.add(orbit);

			updateService.subscribe((delta) => {
				player.characterControls?.update(delta, listenerMachine.keys);
				renderer.render(scene, camera);
				cssRenderer.render(scene, camera);
				world?.step();
			});
			updateService.start();

			preloadMachine.subscribeOnPreloadDone(async () => {
				player.initialize();

				const hdri = preloadMachine.getLoadedHDRi('forest');
				if (hdri) {
					scene.background = hdri;
					scene.environment = hdri;
				}

				worldObjects.addGroundItem(
					newItemFactory.createGroundItem(
						getMacheteItem(),
						new THREE.Vector3(7.6, 1, 3.2)
					),
					newItemFactory.createGroundItem(
						getMacheteItem(),
						new THREE.Vector3(0, 1, 2)
					)
				);

				if (RAPIER && world) {
					// const plane = new THREE.PlaneGeometry(10, 10, 400, 400);
					// const material = new THREE.MeshStandardMaterial({
					// 	side: THREE.DoubleSide,
					// 	transparent: true,
					// 	...preloadMachine.getLoadedTexture('leafy_grass'),
					// 	displacementScale: 0.2
					// });
					// const planeMesh = new THREE.Mesh(plane, material);
					// planeMesh.receiveShadow = true;
					// planeMesh.rotation.x = Math.PI / 2;
					// scene.add(planeMesh);

					let heights: number[] = [];

					const scale = { x: 50, z: 50, y: 5 };
					const nsubdivs = 50;

					const threeFloor = new THREE.Mesh(
						new THREE.PlaneGeometry(scale.x, scale.z, nsubdivs, nsubdivs),
						new THREE.MeshStandardMaterial({
							...preloadMachine.getLoadedTexture('leafy_grass'),
							roughness: 0.6
						})
					);

					threeFloor.rotateX(-Math.PI / 2);
					threeFloor.receiveShadow = true;
					threeFloor.castShadow = true;
					scene.add(threeFloor);

					// add height data to plane
					const vertices = threeFloor.geometry.attributes.position.array;
					const dx = scale.x / nsubdivs;
					const dy = scale.z / nsubdivs;
					// store height data in map column-row map
					const columsRows = new Map();
					for (let i = 0; i < vertices.length; i += 3) {
						// translate into colum / row indices
						let row = Math.floor(
							Math.abs((vertices as any)[i] + scale.x / 2) / dx
						);
						let column = Math.floor(
							Math.abs((vertices as any)[i + 1] - scale.z / 2) / dy
						);
						// generate height for this column & row
						const randomHeight = Math.random();
						(vertices as any)[i + 2] = scale.y * randomHeight;
						// store height
						if (!columsRows.get(column)) {
							columsRows.set(column, new Map());
						}
						columsRows.get(column).set(row, randomHeight);
					}
					threeFloor.geometry.computeVertexNormals();

					// store height data into column-major-order matrix array
					for (let i = 0; i <= nsubdivs; ++i) {
						for (let j = 0; j <= nsubdivs; ++j) {
							heights.push(columsRows.get(j).get(i));
						}
					}

					const heightArray = new Float32Array(heights);

					const bodyDesc = RAPIER.RigidBodyDesc.fixed();

					const rigidBody = world.createRigidBody(bodyDesc);

					const colliderType = RAPIER.ColliderDesc.heightfield(
						nsubdivs,
						nsubdivs,
						heightArray,
						new THREE.Vector3(scale.x, scale.y, scale.z)
					);
					world.createCollider(colliderType, rigidBody);

					const couple = { rigid: rigidBody, mesh: threeFloor };

					const modelSizes = new THREE.Box3()
						.setFromObject(threeFloor)
						.getSize(new THREE.Vector3());
					console.log(modelSizes);

					const box = new THREE.BoxGeometry(5, 5, 5);
					const material = new THREE.MeshBasicMaterial({
						color: 0x00ff00
					});
					const cube = new THREE.Mesh(box, material);
					cube.position.setY(10);
					scene.add(cube);
					const cubeBodyType = RAPIER.RigidBodyDesc.dynamic();
					cubeBodyType.setTranslation(0, 100, 0);
					const cubeRigidBody = world.createRigidBody(cubeBodyType);
					const cubeColliderType = RAPIER.ColliderDesc.cuboid(2.5, 2.5, 2.5);
					world.createCollider(cubeColliderType, cubeRigidBody);

					const cubeCouple = { rigid: cubeRigidBody, mesh: cube };

					updateService.subscribe(() => {
						const cubePosition = cubeCouple.rigid.translation();
						const cubeRotation = cubeCouple.rigid.rotation();
						cubeCouple.mesh.position.set(
							cubePosition.x,
							cubePosition.y,
							cubePosition.z
						);
						cubeCouple.mesh.rotation.set(
							cubeRotation.x,
							cubeRotation.y,
							cubeRotation.z
						);

						cubeCouple.mesh.setRotationFromQuaternion(
							new THREE.Quaternion(
								cubeRotation.x,
								cubeRotation.y,
								cubeRotation.z,
								cubeRotation.w
							)
						);

						const position = couple.rigid.translation();
						const rotation = couple.rigid.rotation();
						couple.mesh.position.set(position.x, position.y, position.z);
						couple.mesh.rotation.set(rotation.x, rotation.y, rotation.z);

						couple.mesh.setRotationFromQuaternion(
							new THREE.Quaternion(
								rotation.x,
								rotation.y,
								rotation.z,
								rotation.w
							)
						);
					});
				}
			});
		}

		initialize.initialize(canvas);

		const { camera, orbit, renderer, scene, cssRenderer } =
			initialize.getProperties();

		onRapierLoad();

		const { destroy: cameraOnMouseMoveRotationDestroy } =
			initializeCameraUpdation(orbit);

		return () => {
			cameraOnMouseMoveRotationDestroy();
		};
	});
</script>

<Loading />
<div class="fixed left-0 top-0 h-screen w-screen">
	<Screens />
	<QuickSlot />
	<canvas class="h-screen w-screen" bind:this={canvas}></canvas>
</div>

<!-- <h2 class="text-dancing mt-2 text-center text-7xl font-bold text-white">
	{textToAnimate}
</h2> -->
<!-- <LandingAnimation {textToAnimate} /> -->

<!-- <Menu /> -->

<!-- // const gui = new GUI(); -->

<!-- // gui.add(modelSettings, 'scale', 0.001, 1).onChange((value) => { -->
<!-- // 	fbx.scale.setScalar(value);
		// });

		// gui.add(machete.position, 'x', -10, 10);
		// gui.add(machete.position, 'y', -10, 10);
		// gui.add(machete.position, 'z', -10, 10);
		// gui.add(machete.rotation, 'x', -Math.PI, Math.PI);
		// gui.add(machete.rotation, 'y', -Math.PI, Math.PI);
		// gui.add(machete.rotation, 'z', -Math.PI, Math.PI); -->
