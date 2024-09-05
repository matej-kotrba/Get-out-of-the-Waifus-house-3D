import listenerService from './ListenerService';

export type Screen = 'Inventory';

const screenToggleKeys: Record<KeyboardEvent['key'], Screen> = {
	i: 'Inventory'
};

class ScreenService {
	#screens: Record<Screen, boolean> = $state({
		Inventory: false
	});

	constructor() {
		listenerService.subscribe('keypress', this.onKeyDown.bind(this), {
			dontStopOnGamePause: true
		});
	}

	public getScreenToggleStatus(screen: Screen) {
		return this.#screens[screen];
	}

	public setScreenToggleStatus(screen: Screen, status: boolean) {
		for (const screenKey in this.#screens) {
			this.#screens[screenKey as Screen] = false;
		}
		this.#screens[screen] = status;
	}

	public isScreenOpened(screen: Screen) {
		return this.#screens[screen];
	}

	public isAnyScreenOpened() {
		return Object.values(this.#screens).some((screen) => screen);
	}

	private onKeyDown(e: Event) {
		const retypedEvent = e as KeyboardEvent;

		if (!this.isKeyScreenToggleKey(retypedEvent.key)) {
			return;
		}

		const screenToToggle = screenToggleKeys[retypedEvent.key];
		if (screenToToggle) {
			this.toggleScreen(screenToToggle);
		}
	}

	private isKeyScreenToggleKey(
		key: string
	): key is keyof typeof screenToggleKeys {
		return Object.keys(screenToggleKeys).includes(key);
	}

	private toggleScreen(screen: Screen) {
		if (this.isScreenOpened(screen)) {
			this.setScreenToggleStatus(screen, false);
		} else {
			this.setScreenToggleStatus(screen, true);
		}
	}
}

const screenService = new ScreenService();
export default screenService;
