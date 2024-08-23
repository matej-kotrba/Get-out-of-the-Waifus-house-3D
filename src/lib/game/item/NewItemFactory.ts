import { GroundItem, type GroundItemTemplate } from "./ground/GroundItem";
import * as THREE from "three";
import { getMacheteItem } from "./ground/items/Machete";
import { EXRLoader } from "three/examples/jsm/Addons.js";

export type ItemType = "machete"

class NewItemFactory {
  isPreloadingModels: boolean = true;
  #itemsToPreload: GroundItemTemplate[] = [getMacheteItem()];
  #loadedItems: {
    [key in ItemType]?: THREE.Group<THREE.Object3DEventMap>
  } = {}

  constructor() {
    this.preloadItemModels();
  }

  public createGroundItem(groundItem: GroundItemTemplate, initialPosition: THREE.Vector3): GroundItem | void {
    if (this.isPreloadingModels || !this.#loadedItems[groundItem.type]) return;
    return new GroundItem(groundItem, { initialPosition, model: this.#loadedItems[groundItem.type]! });
    // groundItem.loadModel((model) => {
    //   res(new GroundItem(groundItem, { initialPosition, model }));
    // })
  }

  public async createHandItem() { }

  private preloadItemModels() {
    const loadingManager = new THREE.LoadingManager();
    loadingManager.addHandler(/\.exr$/i, new EXRLoader());

    loadingManager.onLoad = () => {
      console.log("ahoj")
    }

    this.#itemsToPreload.forEach((item) => {
      item.loadModel(loadingManager, (model) => {
        this.#loadedItems[item.type] = model;
      })
    })
  }
}

const newItemFactory = new NewItemFactory();

export default newItemFactory;