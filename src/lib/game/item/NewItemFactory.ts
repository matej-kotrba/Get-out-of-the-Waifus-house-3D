import { GroundItem, type GroundItemTemplate } from "./ground/GroundItem";
import * as THREE from "three";
import preloadMachine from "../general/PreloadMachine.svelte";

class NewItemFactory {
  public createGroundItem(groundItem: GroundItemTemplate, initialPosition: THREE.Vector3): GroundItem | void {
    if (preloadMachine.itemsLoaded[groundItem.type] || !preloadMachine.itemsLoaded[groundItem.type]) return;
    return new GroundItem(groundItem, { initialPosition, model: preloadMachine.itemsLoaded[groundItem.type]! });
    // groundItem.loadModel((model) => {
    //   res(new GroundItem(groundItem, { initialPosition, model }));
    // })
  }

  public async createHandItem() { }
}

const newItemFactory = new NewItemFactory();

export default newItemFactory;