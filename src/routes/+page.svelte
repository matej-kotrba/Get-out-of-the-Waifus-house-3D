<script lang="ts">
	import LandingAnimation from '$lib/components/main-menu/landing-animation.svelte';
	import Menu from '$lib/components/main-menu/menu.svelte';
	import SmallInventory from '$lib/components/game/ingame-ui/small-inventory.svelte';
	import {
		CharacterControls,
		type CharacterAction,
		type CharacterAnimationsMap
	} from '$lib/game/characters/player/characterControls';
	import {
		initialize,
		initializeCameraUpdation
	} from '$lib/three/setup.svelte';
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { GUI } from 'dat.gui';
	import { FBXLoader } from 'three/examples/jsm/Addons.js';
	import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
	import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
	import updateService from '$lib/game/general/UpdateService';
	import loadMachine from '$lib/game/general/LoadService';
	import newItemFactory from '$lib/game/item/NewItemFactory';
	import { getMacheteItem } from '$lib/game/item/ground/items/Machete';
	import listenerMachine from '$lib/game/general/ListenerService';
	import Loading from '$lib/components/game/ingame-ui/loading.svelte';
	import preloadMachine from '$lib/game/general/PreloadService.svelte';
	import player from '$lib/game/characters/player/Player.svelte';
	import worldObjects from '$lib/game/general/WorldObjects';
	import BigInventory from '$lib/components/game/ingame-ui/big-inventory/big-inventory.svelte';
	import Screens from '$lib/components/game/Screens.svelte';

	const textToAnimate = 'Get out of the Waifus house';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		initialize.initialize(canvas);
		const { camera, orbit, renderer, scene, cssRenderer } =
			initialize.getProperties();

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

		const { destroy: cameraOnMouseMoveRotationDestroy } =
			initializeCameraUpdation(orbit);

		let charactersControls: CharacterControls;

		const gui = new GUI();

		preloadMachine.subscribeOnPreloadDone(async () => {
			player.initialize();

			const hdri = preloadMachine.getLoadedHDRi('forest');
			if (hdri) {
				scene.background = hdri;
				scene.environment = hdri;
			}

			// const bot = preloadMachine.getLoadedModel('bot');
			// if (bot) {
			// 	// REMOVE THIS, TAKE THE LOGIC FROM PLAYER.TS
			// 	charactersControls = new CharacterControls(bot, orbit, camera, 'idle');
			// 	playerVarsMachine.setup(bot, camera);
			// 	scene.add(bot);
			// } else {
			// 	throw new Error('Bot model not loaded');
			// }

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

		// loader.load(
		// 	'models/characters/bot.fbx',
		// 	(fbxTemp) => {
		// 		fbx = fbxTemp;
		// 		fbxTemp.traverse((c) => {
		// 			c.castShadow = true;
		// 		});
		// 		fbxTemp.scale.setScalar(0.01);

		// 		playerVarsMachine.setup(fbx, camera);

		// const modelSettings = {
		// 	scale: 0.1
		// };

		// gui.add(modelSettings, 'scale', 0.001, 1).onChange((value) => {
		// 	fbx.scale.setScalar(value);
		// });

		// scene.add(fbxTemp);

		// mixer = new THREE.AnimationMixer(fbx);

		// function onLoad(animName: CharacterAction, anim: THREE.Group<THREE.Object3DEventMap>) {
		// 	const clip = anim.animations[0];
		// 	const action = mixer.clipAction(clip);

		// 	animationsMap.set(animName, action);
		// }

		// Loading animations
		// loader.load('animations/idle.fbx', (a) => onLoad('idle', a));
		// loader.load('animations/walking.fbx', (a) => onLoad('walk', a));
		// loader.load('animations/walking-with-item.fbx', (a) => onLoad('walkWithItem', a));
		// loader.load('animations/running.fbx', (a) => onLoad('run', a));
		// loader.load('animations/melee-attack.fbx', (a) => onLoad('meleeAttack', a));

		// Loading object models
		// const groundItmeTest = newItemFactory.createGroundItem(
		// 	getMacheteItem(),
		// 	new THREE.Vector3(7.6, 0, 3.2)
		// );
		// groundItmeTest.then((item) => {
		// 	item.addToScene(scene);
		// });

		// loadMachine.loadModel({
		// 	path: '/objects/machete/',
		// 	modelFileName: 'machete_1k.fbx',
		// 	onLoad: (machete) => {
		// 		machete.scale.setScalar(1);

		// 		const rightHand = fbx.getObjectByName('mixamorigRightHandIndex1');
		// 		if (rightHand) {
		// 			rightHand.add(machete);
		// 			machete.position.x += 7.6;
		// 			machete.position.z += 3.2;

		// 			machete.rotation.x = -1.2;
		// 			machete.rotation.y = 0;
		// 			machete.rotation.z = -1.6;
		// 		}
		// 	}
		// });

		// gui.add(machete.position, 'x', -10, 10);
		// gui.add(machete.position, 'y', -10, 10);
		// gui.add(machete.position, 'z', -10, 10);
		// gui.add(machete.rotation, 'x', -Math.PI, Math.PI);
		// gui.add(machete.rotation, 'y', -Math.PI, Math.PI);
		// gui.add(machete.rotation, 'z', -Math.PI, Math.PI);
		// },
		// 	undefined,
		// 	(e) => console.log(e)
		// );
		// loadingManager.onLoad = () => {
		// 	charactersControls = new CharacterControls(fbx, orbit, camera, 'idle');
		// };

		updateService.subscribe((delta) => {
			player.characterControls?.update(delta, listenerMachine.keys);
			renderer.render(scene, camera);
			cssRenderer.render(scene, camera);
		});
		updateService.start();

		return () => {
			cameraOnMouseMoveRotationDestroy();
		};
	});

	// UI Components logic and placeholders
	// const inventory: InventoryType = {
	// 	slots: [
	// 		{

	// 		}
	// 	]
	// }
</script>

<Loading />
<div class="fixed left-0 top-0 h-screen w-screen">
	<Screens />
	<SmallInventory />
	<canvas class="h-screen w-screen" bind:this={canvas}></canvas>
</div>

<!-- <h2 class="text-dancing mt-2 text-center text-7xl font-bold text-white">
	{textToAnimate}
</h2> -->
<!-- <LandingAnimation {textToAnimate} /> -->

<!-- <Menu /> -->
