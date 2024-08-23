import newItemFactory from "$lib/game/item/NewItemFactory"

class PreloadMachine {
  public isPreloading: boolean = $state(true);

  constructor() {
    this.preload();
  }

  private preload() {

  }
}

const preloadMachine = new PreloadMachine();
export default preloadMachine;