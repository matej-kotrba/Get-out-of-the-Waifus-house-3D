import type { GroundItemTemplate } from "./GroundItem";
import * as THREE from "three";

class NewGroundItemFactory {
  constructor() { }

  public createGrounItem(groundItem: GroundItemTemplate, initialPosition: THREE.Vector3): GroundItemTemplate {
    const newGroundItem = new groundItem(initialPosition);
  }
}

const groundItemFactory = new NewGroundItemFactory();

export default groundItemFactory;