const callbacks: ((e: MouseEvent) => void)[] = [];

window.addEventListener('mousemove', (e) => callbacks.forEach((cb) => cb(e)));

type Params = Record<string, unknown>;

type Item<T extends Params> = {
	id: string;
	item?: T;
	relatesTo?: HTMLElement;
	size: [number, number];
};

type DropzoneOptions = {
	id: string;
	// itemsInDropzone?: Exclude<T, 'id'>[];
	specificDropzoneId?: string;
	addClassesOnDragStart?: string[];
	itemsInDropzoneLimit?: number;
	onDragEnterClasses?: string[];
};

type DraggableOptions<T extends Params> = {
	item: T;
	id?: string;
	originalNodeClassesOnDrag?: string[];
	size: [number, number];
};

type DraggedNode<T extends Params> = {
	element: HTMLElement;
	details: DraggableOptions<T>;
	higlightedItems: HTMLElement[];
};

export class DragAndDropContext<T extends Params> {
	#items: Item<T>[] = $state([]);
	#nodes: HTMLElement[] = [];
	#draggedNode: DraggedNode<T> | null = null;
	#rowSize: number;

	constructor(itemsTemp: Item<T>[], rowSize: number) {
		this.#items = itemsTemp;
		this.#rowSize = rowSize;
		callbacks.push((e) => {
			if (!this.#draggedNode) return;
			const x = e.clientX;
			const y = e.clientY;
			const rect = this.#draggedNode.element.getBoundingClientRect();
			this.#draggedNode.element.style.transform = `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px)`;
		});
	}

	public get items() {
		return this.#items;
	}

	public get() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		return {
			dropzone: this.dropzone,
			draggable: this.draggable,
			draggedNode: this.#draggedNode,
			get items(): Item<T>[] {
				return self.#items;
			}
		};
	}

	private getConnectedNodes(initialNodeIdx: number, size: [number, number]) {
		const connectedNodes: HTMLElement[] = [];
		for (
			let i = initialNodeIdx;
			i < initialNodeIdx + size[1] * this.#rowSize;
			i += this.#rowSize
		) {
			if (i >= this.#nodes.length) return;
			for (let k = i; k < i + size[0]; k++) {
				if (k - i + (i % this.#rowSize) >= this.#rowSize) return;
				connectedNodes.push(this.#nodes[k]);
			}
		}

		return connectedNodes;
	}

	private getDropzonesByNodeAndSize(
		node: HTMLElement,
		size: [number, number]
	): HTMLElement[] | void {
		const initialNodeIdx = this.#nodes.indexOf(node);
		if (initialNodeIdx === -1) return;

		return this.getConnectedNodes(initialNodeIdx, size);
	}

	private getDropzonesByIdAndSize(
		id: string,
		size: [number, number]
	): HTMLElement[] | void {
		const node = this.#nodes.find((node) => node.dataset.id === id);
		if (!node) return;

		return this.getConnectedNodes(this.#nodes.indexOf(node), size);
	}

	private dropzone = (node: HTMLElement, options: DropzoneOptions) => {
		this.#nodes.push(node);
		node.dataset.dropzone = options?.specificDropzoneId ?? 'default';
		node.dataset.itemsInDropzoneLimit =
			options?.itemsInDropzoneLimit?.toString() ?? '';
		node.dataset.dropzoneHoverStartClasses =
			options?.addClassesOnDragStart?.join(' ') ?? '';
		node.dataset.onDragEnterClasses =
			options?.onDragEnterClasses?.join(' ') ?? '';
		node.dataset.id = options.id;

		const onDragEnter = () => {
			if (this.#draggedNode) {
				const nodesToHighlight = this.getDropzonesByNodeAndSize(
					node,
					this.#draggedNode.details.size
				);
				if (!nodesToHighlight) return;

				for (const node of nodesToHighlight) {
					node.classList.add(...(options?.onDragEnterClasses ?? []));
				}

				this.#draggedNode.higlightedItems = nodesToHighlight;

				node.classList.add(...(options?.onDragEnterClasses ?? []));
			}
		};

		const onDragLeave = () => {
			for (const node of this.#draggedNode?.higlightedItems ?? []) {
				node.classList.remove(...(options?.onDragEnterClasses ?? []));
			}

			node.classList.remove(...(options?.onDragEnterClasses ?? []));
		};

		node.addEventListener('mouseenter', onDragEnter);
		node.addEventListener('mouseleave', onDragLeave);

		return {
			destroy() {
				window.removeEventListener('mouseenter', onDragEnter);
				window.removeEventListener('mouseleave', onDragLeave);
			}
		};
	};

	private draggable = (node: HTMLElement, options: DraggableOptions<T>) => {
		const addItemToDropzoneItemById = (
			id: string,
			item: T,
			size: [number, number]
		) => {
			const dropzone = this.#items.find((dz) => dz.id === id);
			if (!dropzone) {
				this.#items = [...this.#items, { id, item, size }];
			} else {
				const idx = this.#items.indexOf(dropzone);
				this.#items[idx] = { ...dropzone, item, size };
			}
		};

		const removeItemFromDropzoneItemById = (
			id: string,
			size: [number, number]
		) => {
			for (const item of this.#items) {
				if (item.id === id) {
					item.item = undefined;

					const connectedNodes = this.getDropzonesByIdAndSize(item.id, size);
					if (connectedNodes) {
						for (const node of connectedNodes) {
							const id = node.dataset.id;
							if (id) {
								const item = this.#items.find((item) => item.id === id);
								if (item) {
									item.relatesTo = undefined;
								}
							}
						}
					}
				}
			}
		};

		const getDropzones = () => {
			return document.querySelectorAll(
				`[data-dropzone="${'default'}"]`
			) as unknown as HTMLElement[];
		};

		const isDropzoneAvailable = (dropzone: HTMLElement) => {
			const limit = dropzone.dataset.itemsInDropzoneLimit;
			if (limit === '') return true;
			return !(dropzone.children.length >= Number(limit));
		};

		const higlihtDropzones = () => {
			const dropzones = getDropzones();
			dropzones.forEach((dropzone) => {
				if (isDropzoneAvailable(dropzone)) {
					const classes = dropzone.dataset.dropzoneHoverStartClasses;
					if (classes) {
						dropzone.classList.add(...classes.split(' '));
					}
				}
			});
		};

		const removeHighlightDropzones = () => {
			const dropzones = getDropzones();
			dropzones.forEach((dropzone) => {
				const classes = dropzone.dataset.dropzoneHoverStartClasses;
				const classesDrag = dropzone.dataset.onDragEnterClasses;
				dropzone.classList.remove(
					...(classes ?? ' ').split(' '),
					...(classesDrag ?? ' ').split(' ')
				);
			});
		};

		const resetPosition = () => {
			const rect = node.getBoundingClientRect();
			nodeCopy.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
		};

		const canBePlaced = (
			connectedNodes: HTMLElement[],
			targetId: string,
			movedFromId?: string
		) => {
			const newItemsToBeCreated: { id: string; node: HTMLElement }[] = [];
			const existingItemsToBeEdited: { id: string; node: HTMLElement }[] = [];

			const originalDropzone = this.#nodes.find(
				(node) => node.dataset.id === movedFromId
			);

			for (const nodeToConnect of connectedNodes) {
				const id = nodeToConnect.dataset.id;
				if (id) {
					const item = this.#items.find((item) => item.id === id);
					if (item) {
						if (
							(item.relatesTo && item.relatesTo !== originalDropzone) ||
							(item.item && item.id !== movedFromId)
						) {
							return { can: false };
						} else {
							if (id !== targetId) {
								existingItemsToBeEdited.push({ id, node: connectedNodes[0] });
							}
						}
					} else if (id !== targetId) {
						newItemsToBeCreated.push({ id, node: connectedNodes[0] });
					}
				}
			}

			return { can: true, newItemsToBeCreated, existingItemsToBeEdited };
		};

		const editItemsByMovedDraggedNode = (
			newItemsToBeCreated: { id: string; node: HTMLElement }[],
			existingItemsToBeEdited: { id: string; node: HTMLElement }[]
		) => {
			for (const { id, node } of newItemsToBeCreated) {
				this.#items = [
					...this.#items,
					{ id, relatesTo: node, size: options.size }
				];
			}

			for (const { id, node } of existingItemsToBeEdited) {
				const item = this.#items.find((item) => item.id === id);
				if (item) {
					item.relatesTo = node;
				}
			}
		};

		const onMousedown = () => {
			node.classList.add(...(options?.originalNodeClassesOnDrag ?? ''));
			nodeCopy.style.opacity = '1';

			this.#draggedNode = {
				element: nodeCopy,
				details: options,
				higlightedItems: []
			};
			higlihtDropzones();
		};

		const onMouseup = (e: MouseEvent) => {
			if (this.#draggedNode?.element !== nodeCopy) return;
			const dropzoneElement = e.target as HTMLElement;
			const dropzoneId = dropzoneElement.dataset.dropzone;

			let isAllowed = false;
			const connectedNodes = this.getDropzonesByNodeAndSize(
				dropzoneElement,
				options.size
			);

			const newId = dropzoneElement.dataset.id;
			const oldId = node.parentElement?.dataset.id;
			let newItemsToBeCreated: { id: string; node: HTMLElement }[] = [];
			let existingItemsToBeEdited: { id: string; node: HTMLElement }[] = [];

			if (
				newId &&
				connectedNodes &&
				connectedNodes.length === options.size[0] * options.size[1]
			) {
				const result = canBePlaced(connectedNodes, newId, oldId);
				isAllowed = result.can;
				if (result.newItemsToBeCreated && result.existingItemsToBeEdited) {
					newItemsToBeCreated = result.newItemsToBeCreated;
					existingItemsToBeEdited = result.existingItemsToBeEdited;
				}
			}

			if (
				dropzoneId &&
				dropzoneElement &&
				dropzoneElement.dataset.dropzone &&
				isDropzoneAvailable(dropzoneElement) &&
				isAllowed === true
			) {
				const newNode = node.cloneNode(true) as HTMLElement;
				newNode.classList.remove(...(options?.originalNodeClassesOnDrag ?? ''));
				dropzoneElement.appendChild(newNode);

				if (oldId) {
					removeItemFromDropzoneItemById(oldId, options.size);
				}
				editItemsByMovedDraggedNode(
					newItemsToBeCreated,
					existingItemsToBeEdited
				);
				if (newId) {
					this.draggable(newNode, {
						...options,
						id: newId,
						item: options.item,
						size: options.size
					});
					nodeCopy.remove();
					node.remove();
				}
			} else {
				resetPosition();
				node.classList.remove(...(options?.originalNodeClassesOnDrag ?? ''));
				nodeCopy.style.opacity = '0';
			}

			removeHighlightDropzones();
			this.#draggedNode = null;
		};

		node.style.cursor = 'grab';
		node.style.userSelect = 'none';
		const nodeCopy = node.cloneNode(true) as HTMLElement;
		nodeCopy.style.position = 'absolute';
		nodeCopy.style.zIndex = '1000';
		nodeCopy.style.pointerEvents = 'none';
		nodeCopy.style.opacity = '0';
		nodeCopy.style.transition = 'transform 0.05s ease, opacity 0.1s';
		resetPosition();
		document.body.appendChild(nodeCopy);
		if (options.id) {
			addItemToDropzoneItemById(options.id, options.item, options.size);
		}

		node.addEventListener('mousedown', onMousedown);
		window.addEventListener('mouseup', onMouseup);

		return {
			destroy() {
				nodeCopy.remove();
				node.removeEventListener('mousedown', onMousedown);
				window.removeEventListener('mouseup', onMouseup);
			}
		};
	};
}
