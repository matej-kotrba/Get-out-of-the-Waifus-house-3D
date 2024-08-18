type Callback = () => unknown;

class UpdateMachine {
  constructor(private flag = false, private callbacks: Callback[] = []) { }

  public subscribe(callback: Callback) {
    this.callbacks.push(callback);
  }

  public unsubscribe(callback: Callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public start() {
    this.flag = true;
    this.update();
  }

  public stop() {
    this.flag = false;
  }

  private update() {
    if (!this.flag) return;
    this.callbacks.forEach(cb => cb());
    requestAnimationFrame(() => this.update.call(this));
  }
}

const updateMachine = new UpdateMachine();

export default updateMachine;