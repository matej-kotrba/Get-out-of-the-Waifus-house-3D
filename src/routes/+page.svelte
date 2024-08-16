<script lang="ts">
	import LandingAnimation from '$lib/components/main-menu/landing-animation.svelte';
	import Menu from '$lib/components/main-menu/menu.svelte';
	import { CharacterControls } from '$lib/three/characterControls.svelte';
	import { initialize, keypressListener } from '$lib/three/setup.svelte';
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { FBXLoader } from 'three/examples/jsm/Addons.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { GUI } from 'dat.gui';

	const textToAnimate = 'Get out of the Waifus house';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const { renderer, scene, controls, camera } = initialize(canvas);

		const plane = new THREE.PlaneGeometry(10, 10);
		const material = new THREE.MeshBasicMaterial({ color: 0xaa4400, side: THREE.DoubleSide });
		const planeMesh = new THREE.Mesh(plane, material);
		planeMesh.receiveShadow = true;
		planeMesh.rotation.x = Math.PI / 2;
		scene.add(planeMesh);

		const keyListener = keypressListener();

		let charactersControls: CharacterControls;

		const loader = new FBXLoader();
		loader.setPath('/');
		loader.load(
			'models/bot.fbx',
			(fbx) => {
				fbx.traverse((c) => {
					c.castShadow = true;
				});
				fbx.scale.setScalar(0.01);
				// fbx.rotateY(Math.PI);

				const gui = new GUI();

				// const modelSettings = {
				// 	scale: 0.1
				// };

				// gui.add(modelSettings, 'scale', 0.001, 1).onChange((value) => {
				// 	fbx.scale.setScalar(value);
				// });

				scene.add(fbx);

				const mixer = new THREE.AnimationMixer(fbx);
				const animationsMap: Map<string, THREE.AnimationAction> = new Map();

				function onLoad(animName: string, anim: THREE.Group<THREE.Object3DEventMap>) {
					const clip = anim.animations[0];
					const action = mixer.clipAction(clip);

					animationsMap.set(animName, action);
					console.log(animationsMap);
				}

				loader.load('animations/walking.fbx', (a) => onLoad('walk', a));
				loader.load('animations/running.fbx', (a) => onLoad('run', a));

				charactersControls = new CharacterControls(
					fbx,
					mixer,
					animationsMap,
					controls,
					camera,
					'idle'
				);

				const clock = new THREE.Clock();
				let animationFrameLoop: number = 0;
				function update() {
					let mixerUpdateDelta = clock.getDelta();
					charactersControls?.update(mixerUpdateDelta, keyListener.keys);

					controls.update();
					renderer.render(scene, camera);
					animationFrameLoop = requestAnimationFrame(update);
				}

				update();

				return () => {
					keyListener.destroy();
					if (animationFrameLoop) cancelAnimationFrame(animationFrameLoop);
				};
			},
			undefined,
			(e) => console.log(e)
		);

		// new FBXLoader().load('/models/Soldier.glb', (gltf) => {
		// 	const model = gltf.scene;
		// 	model.traverse((object) => {
		// 		object.castShadow = true;
		// 	});
		// 	model.rotateY(Math.PI);
		// 	scene.add(model);

		// 	const gltfAnimations = gltf.animations;
		// 	const mixer = new THREE.AnimationMixer(model);
		// 	const animationsMap: Map<string, THREE.AnimationAction> = new Map();
		// 	gltfAnimations
		// 		.filter((a) => a.name !== 'TPose')
		// 		.forEach((animation) => {
		// 			animationsMap.set(animation.name, mixer.clipAction(animation));
		// 		});

		// 	const loader = new FBXLoader();
		// 	loader.setPath('/animations/');
		// 	loader.load('untitled.fbx', (a) => {
		// 		console.log(a);
		// 		const clip = a.animations[0];
		// 		const clipAction = mixer.clipAction(clip);
		// 		animationsMap.set('MeleeAttack', clipAction);
		// 	});

		// 	charactersControls = new CharacterControls(
		// 		model,
		// 		mixer,
		// 		animationsMap,
		// 		controls,
		// 		camera,
		// 		'Idle'
		// 	);

		// 	const clock = new THREE.Clock();
		// 	let animationFrameLoop: number = 0;
		// 	function update() {
		// 		let mixerUpdateDelta = clock.getDelta();
		// 		charactersControls?.update(mixerUpdateDelta, keyListener.keys);

		// 		controls.update();
		// 		renderer.render(scene, camera);
		// 		animationFrameLoop = requestAnimationFrame(update);
		// 	}

		// 	update();

		// 	return () => {
		// 		keyListener.destroy();
		// 		if (animationFrameLoop) cancelAnimationFrame(animationFrameLoop);
		// 	};
		// });
	});
</script>

<div class="fixed left-0 top-0 h-screen w-screen">
	<canvas class="h-full w-full" bind:this={canvas}></canvas>
</div>

<!-- <h2 class="text-dancing mt-2 text-center text-7xl font-bold text-white">
	{textToAnimate}
</h2> -->
<!-- <LandingAnimation {textToAnimate} /> -->

<!-- <Menu /> -->
