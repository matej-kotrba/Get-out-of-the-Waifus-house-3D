import listenerMachine from "$lib/game/general/ListenerMachine";
import inventory from "$lib/game/inventory/Inventory.svelte";
import * as THREE from "three";

export function initialize(canvas: HTMLCanvasElement) {
  // Setup Three.js
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
  camera.position.z = 5;
  camera.position.y = 3;

  // Setup OrbitControls
  const orbit = new THREE.Object3D();
  orbit.rotation.order = 'YXZ';

  // Basic lighting
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Setup ResizeObserver
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);

  return { renderer, scene, camera, orbit };
}



export function initializeCameraUpdation(orbit: THREE.Object3D) {
  function onMouseMove(event: MouseEvent) {
    const scale = -0.005;
    const axisXLimits = [-0.4, 0.2]

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
  window.addEventListener('mousemove', onMouseMove, { signal: abortController.signal });

  const mousewheelAbortController = new AbortController();

  const minMaxZoom = [0.5, 0.8];
  orbit.scale.setScalar(0.8);
  window.addEventListener('wheel', (event) => {
    if (listenerMachine.keys[";"]) {
      let newScale = orbit.scale.x + event.deltaY * 0.001;
      if (newScale < minMaxZoom[0]) {
        newScale = minMaxZoom[0];
      } else if (newScale > minMaxZoom[1]) {
        newScale = minMaxZoom[1];
      }
      orbit.scale.setScalar(newScale);
    } else {
      inventory.selectedSlot += event.deltaY > 0 ? 1 : -1;
    }
  }, { signal: mousewheelAbortController.signal });

  return {
    destroy() {
      abortController.abort();
      mousewheelAbortController.abort();
    }
  }
}