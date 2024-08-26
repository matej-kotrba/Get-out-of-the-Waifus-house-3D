import listenerMachine from '$lib/game/general/ListenerService';
import * as THREE from 'three';
import player from '$lib/game/characters/player/Player.svelte';
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';

class Initialize {
	renderer: THREE.WebGLRenderer | undefined;
	cssRenderer: CSS2DRenderer | undefined;
	camera: THREE.PerspectiveCamera | undefined;
	scene: THREE.Scene | undefined;
	orbit: THREE.Object3D | undefined;

	public getProperties() {
		return {
			renderer: this.renderer as Exclude<typeof this.renderer, undefined>,
			cssRenderer: this.cssRenderer as Exclude<
				typeof this.cssRenderer,
				undefined
			>,
			camera: this.camera as Exclude<typeof this.camera, undefined>,
			scene: this.scene as Exclude<typeof this.scene, undefined>,
			orbit: this.orbit as Exclude<typeof this.orbit, undefined>
		};
	}

	public initialize(canvas: HTMLCanvasElement) {
		// Setup Three.js
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

		// Setup CSS2DRenderer
		this.cssRenderer = new CSS2DRenderer();
		this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
		this.cssRenderer.domElement.style.position = 'absolute';
		this.cssRenderer.domElement.style.top = '0';
		this.cssRenderer.domElement.style.pointerEvents = 'none';
		document.body.appendChild(this.cssRenderer.domElement);

		// Setup Scene
		this.scene = new THREE.Scene();

		// Setup Camera
		this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
		this.camera.position.z = 5;
		this.camera.position.y = 3;

		// Setup OrbitControls
		this.orbit = new THREE.Object3D();
		this.orbit.rotation.order = 'YXZ';

		// Basic lighting
		const light = new THREE.AmbientLight(0xffffff, 0.5);
		this.scene.add(light);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 5, 5);
		directionalLight.castShadow = true;
		this.scene.add(directionalLight);

		const onWindowResize = () => {
			if (this.camera && this.renderer && this.cssRenderer) {
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
				this.renderer.setSize(window.innerWidth, window.innerHeight);
				this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
			}
		};

		window.addEventListener('resize', onWindowResize);
		onWindowResize();

		canvas.addEventListener('click', () => {
			canvas.requestPointerLock();
		});
	}
}

export const initialize = new Initialize();

export function initializeCameraUpdation(orbit: THREE.Object3D) {
	function onMouseMove(event: MouseEvent) {
		const scale = -0.005;
		const axisXLimits = [-0.4, 0.2];

		orbit.rotateY(event.movementX * scale);
		orbit.rotateX(event.movementY * scale);
		orbit.rotation.z = 0;

		if (orbit.rotation.x < axisXLimits[0]) {
			orbit.rotation.x = axisXLimits[0];
		} else if (orbit.rotation.x > axisXLimits[1]) {
			orbit.rotation.x = axisXLimits[1];
		}
	}

	const abortController = new AbortController();
	window.addEventListener('mousemove', onMouseMove, {
		signal: abortController.signal
	});

	const mousewheelAbortController = new AbortController();

	// const minMaxZoom = [0.5, 0.8];
	orbit.scale.setScalar(0.8);
	// window.addEventListener(
	// 	'wheel',
	// 	(event) => {
	// 		if (listenerMachine.keys[';']) {
	// 			let newScale = orbit.scale.x + event.deltaY * 0.001;
	// 			if (newScale < minMaxZoom[0]) {
	// 				newScale = minMaxZoom[0];
	// 			} else if (newScale > minMaxZoom[1]) {
	// 				newScale = minMaxZoom[1];
	// 			}
	// 			orbit.scale.setScalar(newScale);
	// 		} else {
	// 			if (player.inventory) {
	// 				player.inventory.selectedSlot += event.deltaY > 0 ? 1 : -1;
	// 			}
	// 		}
	// 	},
	// 	{ signal: mousewheelAbortController.signal }
	// );

	return {
		destroy() {
			abortController.abort();
			mousewheelAbortController.abort();
		}
	};
}
