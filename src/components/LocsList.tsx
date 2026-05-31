import { For, createMemo, createResource } from "solid-js";
import { getLocsForRepo } from "../api";
import { parseCurrentGituhbUrl } from "../utils";

export function LocsList() {
	const [locs] = createResource(() => {
		const url = parseCurrentGituhbUrl();

		if (!url) {
			throw new Error("Failed to parse URL");
		}

		return getLocsForRepo(url);
	});

	const totalLocs = createMemo(() => {
		return Object.values(locs()?.locByLangs ?? {}).reduce((sum, loc) => sum + loc, 0);
	});

	return (
		<ul>
			<For each={Object.entries(locs()?.locByLangs ?? {})}>
				{([lang, loc]) => (
					<li style={{ display: "flex", gap: "1rem" }}>
						<span
							title={lang}
							style={{
								flex: "1 1 0",
								"min-width": "0",
								overflow: "hidden",
								"text-overflow": "ellipsis",
								"white-space": "nowrap",
							}}
						>
							{lang}
						</span>
						<span style={{ "text-align": "right" }}>
							{loc.toLocaleString()} ({((loc / totalLocs()) * 100).toFixed(1)}
							%)
						</span>
					</li>
				)}
			</For>
		</ul>
	);
}
