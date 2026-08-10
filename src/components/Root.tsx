import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Dropdown } from "./Dropdown";

interface RootProps {
	id: string;
	href: string;
}

export function Root(props: RootProps) {
	const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
	let root: HTMLDivElement | undefined;

	onMount(() => {
		const handleClick = (event: MouseEvent) => {
			if (!root?.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.body.addEventListener("click", handleClick);

		onCleanup(() => {
			document.body.removeEventListener("click", handleClick);
		});
	});

	return (
		<div ref={root} id={props.id} class="mt-2" style={{ position: "relative" }}>
			<a class="Link--muted" target="_blank" rel="noopener" href={props.href}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					class="octicon octicon-code mr-2 tmp-mr-2"
					style={{ "vertical-align": "center" }}
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>
				</svg>
				{" Stats"}
			</a>
			<button
				class="ml-1"
				style={{
					all: "unset",
					cursor: "pointer",
					color: "var(--fgColor-muted)",
				}}
				onClick={() => setIsDropdownOpen(!isDropdownOpen())}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					class="octicon octicon-triangle-down mr-2 tmp-mr-2"
					xmlns="http://www.w3.org/2000/svg"
					style={{ "vertical-align": "center" }}
				>
					<path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
				</svg>
			</button>

			<Show when={isDropdownOpen()}>
				<Dropdown anchor={root!} />
			</Show>
		</div>
	);
}
