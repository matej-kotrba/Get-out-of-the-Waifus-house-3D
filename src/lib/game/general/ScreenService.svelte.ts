import listenerService from './ListenerService';

type Screens = 'Inventory';

const screenToggleKeys: Record<KeyboardEvent['key'], Screens> = {
	Tab: 'Inventory'
};

class ScreenService {
	#screens: Record<Screens, boolean> = $state({
		Inventory: false
	});

	constructor() {
		listenerService.subscribe('keypress', this.onKeyPress);
	}

	public getScreenToggleStatus(screen: Screens) {
		return this.#screens[screen];
	}

	public setScreenToggleStatus(screen: Screens, status: boolean) {
		this.#screens[screen] = status;
	}

	private onKeyPress(e: Event) {
		const retypedEvent = e as KeyboardEvent;

		const screenToToggle = screenToggleKeys[retypedEvent.key];
		if (screenToToggle) {
			this.toggleScreen(screenToToggle);
		}
	}

	private toggleScreen(screen: Screens) {
		this.#screens[screen] = !this.#screens[screen];
	}
}

const screenService = new ScreenService();
export default screenService;
