import { GroundItem, type GroundItemTemplate } from "./GroundItem";
import * as THREE from "three";

class NewGroundItemFactory {
  constructor() { }

  public async createGroundItem(groundItem: GroundItemTemplate, initialPosition: THREE.Vector3): Promise<GroundItem> {
    return await new Promise((res) => {
      groundItem.loadModel((model) => {
        res(new GroundItem(groundItem, { initialPosition, model }));
      })
    })
  }
}

const groundItemFactory = new NewGroundItemFactory();

export default groundItemFactory;