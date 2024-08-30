type Options = {
	specificDropzoneId?: string;
	addClassesOnDragStart?: string[];
};

const callbacks: ((e: MouseEvent) => void)[] = [];

window.addEventListener('mousemove', (e) => callbacks.forEach((cb) => cb(e)));

export function createDragAndDropContext<T extends { id: string }[]>(items: T) {
	const dropzone = (node: HTMLElement, options?: Options) => {
		node.dataset.dropzone = options?.specificDropzoneId ?? 'default';
		node.dataset.dropzoneHoverStartClasses =
			options?.addClassesOnDragStart?.join(' ') ?? '';

		return {
			update(props) {
				console.log(props);
			},
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
		itemId: string;
		originalNodeClassesOnDrag?: string[];
	};

	const draggable = (node: HTMLElement, options: DraggableOptions) => {
		node.style.cursor = 'grab';
		node.style.userSelect = 'none';
		node.dataset.dropzone = 'default';
		const nodeCopy = node.cloneNode(true) as HTMLElement;
		nodeCopy.style.position = 'absolute';
		nodeCopy.style.zIndex = '1000';
		nodeCopy.style.pointerEvents = 'none';
		nodeCopy.style.opacity = '0';
		nodeCopy.style.transition = 'transform 0.05s ease, opacity 0.1s';
		resetPosition();
		document.body.appendChild(nodeCopy);

		function getDropzones() {
			return document.querySelectorAll(
				`[data-dropzone="${node.dataset.dropzone}"]`
			) as unknown as HTMLElement[];
		}

		function higlihtDropzones() {
			const dropzones = getDropzones();
			dropzones.forEach((dropzone) => {
				const classes = dropzone.dataset.dropzoneHoverStartClasses;
				if (classes) {
					dropzone.classList.add(...classes.split(' '));
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
			nodeCopy.style.transform = `translate(${node.offsetLeft}px, ${node.offsetTop}px)`;
		}

		function onMousedown(e: MouseEvent) {
			node.classList.add(...(options?.originalNodeClassesOnDrag ?? ''));
			nodeCopy.style.opacity = '1';
			draggedNode = nodeCopy;
			higlihtDropzones();
		}

		function onMouseup(e: MouseEvent) {
			if (draggedNode !== nodeCopy) return;
			const dropzone = (e.target as HTMLElement)?.dataset.dropzone;
			if (!dropzone) {
				resetPosition();
			}

			node.classList.remove(...(options?.originalNodeClassesOnDrag ?? ''));
			nodeCopy.style.opacity = '0';
			draggedNode = null;
			removeHighlightDropzones();
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
		draggedNode
	};
}
