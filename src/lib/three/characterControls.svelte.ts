import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/Addons.js';
import type { KeypressListenerKeys } from './setup.svelte';

const DIRECTIONS = ["a", "d", "w", "s"];

export class CharacterControls {

  model: THREE.Group
  mixer: THREE.AnimationMixer
  animationsMap: Map<string, THREE.AnimationAction> = new Map()
  orbitControls: OrbitControls
  camera: THREE.Camera

  currentAction: string;

  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  fadeDuration = 0.2;
  runVelocity = 5;
  walkVelocity = 2;

  constructor(model: THREE.Group, mixer: THREE.AnimationMixer, animations: Map<string, THREE.AnimationAction>, orbitControls: OrbitControls, camera: THREE.Camera, currentAction: string) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animations;
    this.orbitControls = orbitControls;
    this.camera = camera;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key === this.currentAction) {
        value.play();
      }
    })
    this.orbitControls = orbitControls;
    this.camera = camera;
  }

  public update(delta: number, keys: KeypressListenerKeys) {
    const directionPressed = DIRECTIONS.some(key => keys[key] === true)

    let play = ""
    if (keys["q"]) {
      play = "meleeAttack"
    }
    else if (directionPressed && keys["shift"]) {
      play = "run"
    } else if (directionPressed) {
      play = "walk-with-item"
    } else {
      play = "idle"
    }

    if (this.currentAction !== play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      current?.fadeOut(this.fadeDuration)
      toPlay?.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    this.mixer.update(delta)

    if (this.currentAction === "run" || this.currentAction === "walk") {
      const angleCameraDirection = Math.atan2(this.camera.position.x - this.model.position.x, this.camera.position.z - this.model.position.z)
      const directionOffset = this.dirationOffset(keys);

      this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleCameraDirection + directionOffset + Math.PI)
      this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.05)

      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize()
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity = this.currentAction === "run" ? this.runVelocity : this.walkVelocity;

      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.updateCameraTarget(moveX, moveZ)
    }
  }

  private updateCameraTarget(moveX: number, moveZ: number) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    this.cameraTarget.x = this.model.position.x
    this.cameraTarget.y = this.model.position.y + 1
    this.cameraTarget.z = this.model.position.z
    this.orbitControls.target = this.cameraTarget
  }

  private dirationOffset(keysPressed: KeypressListenerKeys) {
    let directionOffset = 0

    if (keysPressed["w"]) {
      if (keysPressed["a"]) {
        directionOffset = Math.PI / 4
      } else if (keysPressed["d"]) {
        directionOffset = Math.PI / -4
      }
    } else if (keysPressed["s"]) {
      if (keysPressed["a"]) {
        directionOffset = Math.PI / 4 + Math.PI / 2
      } else if (keysPressed["d"]) {
        directionOffset = Math.PI / -4 - Math.PI / 2
      } else {
        directionOffset = Math.PI
      }
    } else if (keysPressed["a"]) {
      directionOffset = Math.PI / 2
    } else if (keysPressed["d"]) {
      directionOffset = Math.PI / -2
    }

    return directionOffset
  }
}