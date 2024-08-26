import updateService from './UpdateService';

type SubscribeFn = (event: Event) => void;

class ListenerService2 {
	#listenerSubscribers: Map<
		keyof GlobalEventHandlersEventMap,
		((event: Event) => void)[]
	> = new Map();
	#listeners: Map<keyof GlobalEventHandlersEventMap, EventListener> = new Map();

	public subscribe(event: keyof GlobalEventHandlersEventMap, fn: SubscribeFn) {
		if (!this.#listenerSubscribers.has(event)) {
			this.#listenerSubscribers.set(event, []);
		}
		this.#listenerSubscribers.get(event)?.push(fn);
		this.updateListeners();
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

	private updateSubscribers(
		data: Event,
		event: keyof GlobalEventHandlersEventMap
	) {
		if (!updateService.isGameRunning()) return;

		const listeners = this.#listenerSubscribers.get(event);
		if (!listeners) return;
		listeners.forEach((fn) => fn(data));
	}

	private updateListeners() {
		// Get all events which are in listenerSubscribers but not in listeners
		const eventsToAdd = Array.from(this.#listenerSubscribers.keys()).filter(
			(event) => !this.#listeners.has(event)
		);

		eventsToAdd.forEach((event) => {
			this.#listeners.set(event, (e) => this.updateSubscribers(e, event));
			window.addEventListener(event, this.#listeners.get(event)!);
		});
	}
}

const listenerService2 = new ListenerService2();
export default listenerService2;
