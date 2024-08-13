<script lang="ts">
	import LandingAnimation from '$lib/components/main-menu/landing-animation.svelte';
	import Menu from '$lib/components/main-menu/menu.svelte';
	import { CharacterControls } from '$lib/three/characterControls.svelte';
	import { initialize, keypressListener } from '$lib/three/setup.svelte';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	const textToAnimate = 'Get out of the Waifus house';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const { renderer, scene, controls, camera } = initialize(canvas);

		const plane = new THREE.PlaneGeometry(10, 10);
		const material = new THREE.MeshBasicMaterial({ color: 0xaa4400, side: THREE.DoubleSide });
		const planeMesh = new THREE.Mesh(plane, material);
		planeMesh.rotation.x = Math.PI / 2;
		scene.add(planeMesh);

		const keys = keypressListener();
		$effect(() => {
			console.log(keys());
		});

		let charactersControls: CharacterControls;
		new GLTFLoader().load('/models/Soldier.glb', (gltf) => {
			const model = gltf.scene;
			model.traverse((object) => {
				object.castShadow = true;
			});
			model.rotateY(Math.PI);
			scene.add(model);

			const gltfAnimations = gltf.animations;
			const mixer = new THREE.AnimationMixer(model);
			const animationsMap: Map<string, THREE.AnimationAction> = new Map();
			gltfAnimations
				.filter((a) => a.name !== 'TPose')
				.forEach((animation) => {
					animationsMap.set(animation.name, mixer.clipAction(animation));
				});

			charactersControls = new CharacterControls(model, mixer, animationsMap, controls, camera);
		});

		function update() {
			controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(update);
		}

		update();
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
