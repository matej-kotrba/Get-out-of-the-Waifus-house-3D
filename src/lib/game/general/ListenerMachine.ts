export type KeypressListenerKeys = Record<string, boolean>;

class ListenerMachine {
	keys: KeypressListenerKeys = {};

	constructor() {
		window.addEventListener('keydown', this.onKeydown.bind(this));
		window.addEventListener('keyup', this.onKeyup.bind(this));
	}

	private onKeydown(event: KeyboardEvent) {
		this.keys[event.key.toLowerCase()] = true;
	}

	private onKeyup(event: KeyboardEvent) {
		this.keys[event.key.toLowerCase()] = false;
	}

	public destroy() {
		window.removeEventListener('keydown', this.onKeydown.bind(this));
		window.removeEventListener('keyup', this.onKeyup.bind(this));
	}
}

const listenerMachine = new ListenerMachine();
export default listenerMachine;
