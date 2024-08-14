import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

export function initialize(canvas: HTMLCanvasElement) {
  // Setup Three.js
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
  camera.position.z = 5;
  camera.position.y = 2;

  // Setup OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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

  return { renderer, scene, camera, controls };
}

export type KeypressListenerKeys = Record<string, boolean>;

export function keypressListener() {
  const keys: KeypressListenerKeys = {}

  const onKeydown = (event: KeyboardEvent) => {
    keys[event.key] = true;
  }

  const onKeyup = (event: KeyboardEvent) => {
    keys[event.key] = false;
  }

  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);

  return {
    get keys() {
      return keys;
    },
    destroy() {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('keyup', onKeyup);
    }
  };
}