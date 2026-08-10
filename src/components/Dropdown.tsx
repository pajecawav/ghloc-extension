import { ErrorBoundary, Suspense } from "solid-js";
import { LocsList } from "./LocsList";

export function Dropdown() {
	return (
		<div
			style={{
				position: "absolute",
				top: "calc(100% + 2px)",
				left: "1px",
				right: "1px",
				"background-color": "var(--overlay-bgColor, #fff)",
				padding: "0.5rem",
				"border-radius": "var(--borderRadius-medium)",
				"box-shadow": "var(--shadow-floating-small)",
				"max-height": "50vh",
				"max-width": "100%",
				"overflow-y": "auto",
			}}
		>
			<ErrorBoundary fallback="Failed to load...">
				<Suspense fallback="Loading...">
					<LocsList />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}
