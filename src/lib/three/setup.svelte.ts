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

export function keypressListener() {
  let keys: Record<string, boolean> = $state<Record<string, boolean>>({});
  window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
  });
  window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
  });

  return {
    get keys() {
      return keys;
    },
    set keys(newKeys) {
      keys = newKeys;
    }
  }
}