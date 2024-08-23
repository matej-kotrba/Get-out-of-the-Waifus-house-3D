import * as THREE from 'three';
import type { KeypressListenerKeys } from '$lib/game/general/ListenerMachine';
import preloadMachine from '$lib/game/general/PreloadMachine.svelte';

const DIRECTIONS = {
  forward: "w",
  left: "a",
  backward: "s",
  right: "d"
} as const;

const allowedAnimations = ["idle", "run", "walk", "meleeAttack", "walkWithItem"] as const;

export type CharacterAction = (typeof allowedAnimations)[number];
export type CharacterAnimationsMap = Map<CharacterAction, THREE.AnimationAction>;

export class CharacterControls {

  model: THREE.Group
  mixer: THREE.AnimationMixer
  animationsMap: CharacterAnimationsMap = new Map()
  orbit: THREE.Object3D
  camera: THREE.Camera

  currentAction: CharacterAction;

  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  fadeDuration = 0.2;
  runVelocity = 5;
  walkVelocity = 2;

  constructor(model: THREE.Group, orbit: THREE.Object3D, camera: THREE.Camera, currentAction: CharacterAction) {
    this.model = model;
    this.animationsMap = new Map();
    this.mixer = new THREE.AnimationMixer(model);
    preloadMachine.animationsLoaded.forEach((clip, action) => {
      if (!allowedAnimations.includes(action)) return;
      this.animationsMap.set(action, this.mixer.clipAction(clip));
    })

    this.orbit = orbit;
    this.camera = camera;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key === this.currentAction) {
        value.play();
      }
    })
    this.camera = camera;
  }

  public update(delta: number, keys: KeypressListenerKeys) {
    const directionPressed = Object.values(DIRECTIONS).some(key => keys[key] === true)

    let play: CharacterAction = "idle"
    if (keys["q"]) {
      play = "meleeAttack"
    }
    else if (directionPressed && keys["shift"]) {
      play = "run"
    } else if (directionPressed) {
      play = "walk"
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

    if (this.isMobilityAction(this.currentAction)) {
      this.updateCharacterRotation(keys, delta)

      const velocity = this.currentAction === "run" ? this.runVelocity : this.walkVelocity;
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.updateCameraTarget(moveX, moveZ)
    }
  }

  private isMobilityAction(action: CharacterAction) {
    return action === "run" || action === "walk" || action === "walkWithItem"
  }

  private updateCharacterRotation(keys: KeypressListenerKeys, delta: number) {
    const cameraWorldPosition = new THREE.Vector3()
    this.camera.getWorldPosition(cameraWorldPosition)

    const angleCameraDirection = Math.atan2(cameraWorldPosition.x - this.model.position.x, cameraWorldPosition.z - this.model.position.z)
    const directionOffset = this.dirationOffset(keys);

    this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleCameraDirection + directionOffset + Math.PI)
    this.model.quaternion.rotateTowards(this.rotateQuaternion, delta * 7)

    this.camera.getWorldDirection(this.walkDirection);
    this.walkDirection.y = 0;
    this.walkDirection.normalize()
    this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
  }

  private updateCameraTarget(moveX: number, moveZ: number) {
    this.orbit.position.x += moveX;
    this.orbit.position.z += moveZ;
  }

  private dirationOffset(keysPressed: KeypressListenerKeys) {
    let directionOffset = 0

    if (keysPressed[DIRECTIONS.forward]) {
      if (keysPressed[DIRECTIONS.left]) {
        directionOffset = Math.PI / 4
      } else if (keysPressed[DIRECTIONS.right]) {
        directionOffset = Math.PI / -4
      }
    } else if (keysPressed[DIRECTIONS.backward]) {
      if (keysPressed[DIRECTIONS.left]) {
        directionOffset = Math.PI / 4 + Math.PI / 2
      } else if (keysPressed[DIRECTIONS.right]) {
        directionOffset = Math.PI / -4 - Math.PI / 2
      } else {
        directionOffset = Math.PI
      }
    } else if (keysPressed[DIRECTIONS.left]) {
      directionOffset = Math.PI / 2
    } else if (keysPressed[DIRECTIONS.right]) {
      directionOffset = Math.PI / -2
    }

    return directionOffset
  }
}