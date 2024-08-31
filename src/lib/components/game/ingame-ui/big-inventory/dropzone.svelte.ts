const callbacks: ((e: MouseEvent) => void)[] = [];

window.addEventListener('mousemove', (e) => callbacks.forEach((cb) => cb(e)));

export function createDragAndDropContext<T extends Record<string, unknown>>(
	itemsTemp: { id: string; item?: T }[]
) {
	const items = $state(itemsTemp);

	type Options = {
		id: string;
		// itemsInDropzone?: Exclude<T, 'id'>[];
		specificDropzoneId?: string;
		addClassesOnDragStart?: string[];
		itemsInDropzoneLimit?: number;
	};

	const dropzone = (node: HTMLElement, options: Options) => {
		node.dataset.dropzone = options?.specificDropzoneId ?? 'default';
		node.dataset.itemsInDropzoneLimit =
			options?.itemsInDropzoneLimit?.toString() ?? '';
		node.dataset.dropzoneHoverStartClasses =
			options?.addClassesOnDragStart?.join(' ') ?? '';
		node.dataset.id = options.id;

		return {
			destroy() {}
		};
	};

	let draggedNode: HTMLElement | null = null;

	callbacks.push((e) => {
		if (!draggedNode) return;
		const x = e.clientX;
		const y = e.clientY;
		const rect = draggedNode.getBoundingClientRect();
		draggedNode.style.transform = `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px)`;
	});

	type DraggableOptions = {
		item: T;
		id?: string;
		originalNodeClassesOnDrag?: string[];
	};

	const draggable = (node: HTMLElement, options: DraggableOptions) => {
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
			addItemToDropzoneItemById(options.id, options.item);
		}

		function addItemToDropzoneItemById(id: string, item: T) {
			let dropzone = items.find((dz) => dz.id === id);
			if (!dropzone) {
				items.push({ id, item });
			} else {
				dropzone = { ...dropzone, item };
			}
		}

		function removeItemFromDropzoneItemById(id: string) {
			for (const item of items) {
				if (item.id === id) {
					item.item = undefined;
				}
			}
		}

		function getDropzones() {
			return document.querySelectorAll(
				`[data-dropzone="${'default'}"]`
			) as unknown as HTMLElement[];
		}

		function isDropzoneAvailable(dropzone: HTMLElement) {
			const limit = dropzone.dataset.itemsInDropzoneLimit;
			if (limit === '') return true;
			return !(dropzone.children.length >= Number(limit));
		}

		function higlihtDropzones() {
			const dropzones = getDropzones();
			dropzones.forEach((dropzone) => {
				if (isDropzoneAvailable(dropzone)) {
					const classes = dropzone.dataset.dropzoneHoverStartClasses;
					if (classes) {
						dropzone.classList.add(...classes.split(' '));
					}
				}
			});
		}

		function removeHighlightDropzones() {
			const dropzones = getDropzones();
			dropzones.forEach((dropzone) => {
				const classes = dropzone.dataset.dropzoneHoverStartClasses;
				if (classes) {
					dropzone.classList.remove(...classes.split(' '));
				}
			});
		}

		function resetPosition() {
			const rect = node.getBoundingClientRect();
			nodeCopy.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
		}

		function onMousedown() {
			node.classList.add(...(options?.originalNodeClassesOnDrag ?? ''));
			nodeCopy.style.opacity = '1';
			draggedNode = nodeCopy;
			higlihtDropzones();
		}

		function onMouseup(e: MouseEvent) {
			if (draggedNode !== nodeCopy) return;
			const dropzoneElement = e.target as HTMLElement;
			const dropzoneId = dropzoneElement.dataset.dropzone;

			if (
				dropzoneId &&
				dropzoneElement &&
				dropzoneElement.dataset.dropzone &&
				isDropzoneAvailable(dropzoneElement)
			) {
				const newNode = node.cloneNode(true) as HTMLElement;
				newNode.classList.remove(...(options?.originalNodeClassesOnDrag ?? ''));
				dropzoneElement.appendChild(newNode);
				const newId = dropzoneElement.dataset.id;
				const oldId = node.parentElement?.dataset.id;
				console.log(oldId);
				if (oldId) {
					removeItemFromDropzoneItemById(oldId);
				}
				if (newId) {
					draggable(newNode, { ...options, id: newId, item: options.item });
					// addItemToDropzoneItemById(newId, options.item);
					nodeCopy.remove();
					node.remove();
				}
				console.log(items);
			} else {
				resetPosition();
				node.classList.remove(...(options?.originalNodeClassesOnDrag ?? ''));
				nodeCopy.style.opacity = '0';
			}

			removeHighlightDropzones();
			draggedNode = null;
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

	return {
		dropzone,
		draggable,
		draggedNode,
		get items() {
			return items;
		}
	};
}
