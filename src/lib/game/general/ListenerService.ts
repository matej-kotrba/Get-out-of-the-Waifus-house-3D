import updateService from './UpdateService';

export type KeypressListenerKeys = Record<string, boolean>;
type SubscribeFn = (event: Event) => void;

type SubscribeOptions = {
	dontStopOnGamePause: boolean;
};

class ListenerService {
	#keys: KeypressListenerKeys = {};

	#listenerSubscribers: Map<
		keyof GlobalEventHandlersEventMap,
		((event: Event) => void)[]
	> = new Map();
	#listeners: Map<keyof GlobalEventHandlersEventMap, EventListener> = new Map();

	constructor() {
		// Default key listeners
		window.addEventListener('keydown', this.onKeydown.bind(this));
		window.addEventListener('keyup', this.onKeyup.bind(this));
	}

	get keys() {
		return this.#keys;
	}

	public subscribe(
		event: keyof GlobalEventHandlersEventMap,
		fn: SubscribeFn,
		options: SubscribeOptions = { dontStopOnGamePause: false }
	) {
		if (!this.#listenerSubscribers.has(event)) {
			this.#listenerSubscribers.set(event, []);
		}
		this.#listenerSubscribers.get(event)?.push(fn);
		this.updateListeners(options);
	}

	public unsubscribe(
		event: keyof GlobalEventHandlersEventMap,
		fn: SubscribeFn
	) {
		const listeners = this.#listenerSubscribers.get(event);
		if (!listeners) return;
		const index = listeners.indexOf(fn);
		if (index !== -1) {
			listeners.splice(index, 1);
		}
	}

	private onKeydown(event: KeyboardEvent) {
		this.#keys[event.key.toLowerCase()] = true;
	}

	private onKeyup(event: KeyboardEvent) {
		this.#keys[event.key.toLowerCase()] = false;
	}

	private updateSubscribers(
		data: Event,
		event: keyof GlobalEventHandlersEventMap,
		options: SubscribeOptions
	) {
		if (options.dontStopOnGamePause === false && !updateService.isGameRunning())
			return;

		const listeners = this.#listenerSubscribers.get(event);
		if (!listeners) return;
		listeners.forEach((fn) => fn(data));
	}

	private updateListeners(options: SubscribeOptions) {
		// Get all events which are in listenerSubscribers but not in listeners
		const eventsToAdd = Array.from(this.#listenerSubscribers.keys()).filter(
			(event) => !this.#listeners.has(event)
		);

		eventsToAdd.forEach((event) => {
			this.#listeners.set(event, (e) =>
				this.updateSubscribers(e, event, options)
			);
			window.addEventListener(event, this.#listeners.get(event)!);
		});
	}
}

const listenerService = new ListenerService();
export default listenerService;
