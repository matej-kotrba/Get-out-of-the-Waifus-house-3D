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

			const plane = new THREE.PlaneGeometry(10, 10);
			const material = new THREE.MeshBasicMaterial({
				color: 0xaa4400,
				side: THREE.DoubleSide
			});
			const planeMesh = new THREE.Mesh(plane, material);
			planeMesh.receiveShadow = true;
			planeMesh.rotation.x = Math.PI / 2;
			scene.add(planeMesh);

			orbit.position.copy(planeMesh.position);
			orbit.add(camera);
			scene.add(orbit);

			updateService.subscribe((delta) => {
				player.characterControls?.update(delta, listenerMachine.keys);
				renderer.render(scene, camera);
				cssRenderer.render(scene, camera);
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
