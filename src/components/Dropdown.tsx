import { ErrorBoundary, onCleanup, onMount, Suspense, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { LocsList } from "./LocsList";

interface DropdownProps {
	anchor: HTMLElement;
}

export function Dropdown(props: DropdownProps) {
	const getPosition = () => {
		const { bottom, left, width } = props.anchor.getBoundingClientRect();

		return {
			top: bottom + 2,
			left: left + 1,
			width: Math.max(width - 2, 0),
		};
	};

	const [position, setPosition] = createSignal(getPosition());

	onMount(() => {
		const updatePosition = () => setPosition(getPosition());

		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		onCleanup(() => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		});
	});

	return (
		<Portal>
			<div
				on:click={event => event.stopPropagation()}
				style={{
					position: "fixed",
					top: `${position().top}px`,
					left: `${position().left}px`,
					width: `${position().width}px`,
					"background-color": "var(--overlay-bgColor, #fff)",
					padding: "0.5rem",
					"border-radius": "var(--borderRadius-medium)",
					"box-shadow": "var(--shadow-floating-small)",
					"max-height": "50vh",
					"max-width": "calc(100vw - 2px)",
					"overflow-y": "auto",
				}}
			>
				<ErrorBoundary fallback="Failed to load...">
					<Suspense fallback="Loading...">
						<LocsList />
					</Suspense>
				</ErrorBoundary>
			</div>
		</Portal>
	);
}
