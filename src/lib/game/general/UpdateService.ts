import * as THREE from 'three';

type Callback = (delta: number, time: number) => unknown;
class UpdateService {
	private clock: THREE.Clock;

	constructor(
		private flag = false,
		private callbacks: Callback[] = []
	) {
		this.clock = new THREE.Clock();
	}

	public subscribe(callback: Callback) {
		this.callbacks.push(callback);
	}

	public unsubscribe(callback: Callback) {
		this.callbacks = this.callbacks.filter((cb) => cb !== callback);
	}

	public start() {
		this.flag = true;
		this.update();
	}

	public stop() {
		this.flag = false;
	}

	public isGameRunning() {
		return this.flag;
	}

	private update() {
		if (!this.flag) return;
		const delta = this.clock.getDelta();
		this.callbacks.forEach((cb) => cb(delta, this.clock.elapsedTime));
		requestAnimationFrame(() => this.update.call(this));
	}
}

const updateService = new UpdateService();

export default updateService;
