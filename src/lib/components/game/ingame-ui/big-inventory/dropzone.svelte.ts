const callbacks: ((e: MouseEvent) => void)[] = [];

window.addEventListener('mousemove', (e) => callbacks.forEach((cb) => cb(e)));

export function createDragAndDropContext<T extends Record<string, unknown>>(
	itemsTemp: { id: string; item?: T }[],
	rowSize: number
) {
	const items = $state(itemsTemp);
	const nodes: HTMLElement[] = [];

	type Options = {
		id: string;
		// itemsInDropzone?: Exclude<T, 'id'>[];
		specificDropzoneId?: string;
		addClassesOnDragStart?: string[];
		itemsInDropzoneLimit?: number;
		onDragEnterClasses?: string[];
	};

	const dropzone = (node: HTMLElement, options: Options) => {
		nodes.push(node);
		node.dataset.dropzone = options?.specificDropzoneId ?? 'default';
		node.dataset.itemsInDropzoneLimit =
			options?.itemsInDropzoneLimit?.toString() ?? '';
		node.dataset.dropzoneHoverStartClasses =
			options?.addClassesOnDragStart?.join(' ') ?? '';
		node.dataset.id = options.id;

		function onDragEnter() {
			if (draggedNode) {
				const size = draggedNode.details.size;
				const initialNodeIdx = nodes.indexOf(node);
				if (initialNodeIdx === -1) return;

				const nodesToHighlight = [];

				for (
					let i = initialNodeIdx;
					i < initialNodeIdx + size[1] * rowSize;
					i += rowSize
				) {
					if (i >= nodes.length) return;
					nodesToHighlight.push(nodes[i]);
					for (let k = i; k < i + size[0]; k++) {
						if (k - i + (i % rowSize) >= rowSize) return;
						nodesToHighlight.push(nodes[k]);
					}
				}

				for (const node of nodesToHighlight) {
					node.classList.add(...(options?.onDragEnterClasses ?? []));
				}

				draggedNode.higlightedItems = nodesToHighlight;

				node.classList.add(...(options?.onDragEnterClasses ?? []));
			}
		}

		function onDragLeave() {
			for (const node of draggedNode?.higlightedItems ?? []) {
				node.classList.remove(...(options?.onDragEnterClasses ?? []));
			}

			node.classList.remove(...(options?.onDragEnterClasses ?? []));
		}

		node.addEventListener('mouseenter', onDragEnter);
		node.addEventListener('mouseleave', onDragLeave);

		return {
			destroy() {
				window.removeEventListener('mouseenter', onDragEnter);
				window.removeEventListener('mouseleave', onDragLeave);
			}
		};
	};

	type DraggableOptions = {
		item: T;
		id?: string;
		originalNodeClassesOnDrag?: string[];
		size: [number, number];
	};

	let draggedNode: {
		element: HTMLElement;
		details: DraggableOptions;
		higlightedItems: HTMLElement[];
	} | null = null;

	callbacks.push((e) => {
		if (!draggedNode) return;
		const x = e.clientX;
		const y = e.clientY;
		const rect = draggedNode.element.getBoundingClientRect();
		draggedNode.element.style.transform = `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px)`;
	});

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
			draggedNode = {
				element: nodeCopy,
				details: options,
				higlightedItems: []
			};
			higlihtDropzones();
		}

		function onMouseup(e: MouseEvent) {
			if (draggedNode?.element !== nodeCopy) return;
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
				if (oldId) {
					removeItemFromDropzoneItemById(oldId);
				}
				if (newId) {
					draggable(newNode, { ...options, id: newId, item: options.item });
					nodeCopy.remove();
					node.remove();
				}
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
