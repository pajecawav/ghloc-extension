import type { Locs } from "./types";

export interface CachedLocs extends Locs {
	_date: number;
}

export async function getCachedLocs(repoId: string): Promise<CachedLocs | null> {
	const data = await chrome.storage.local.get(repoId);
	const locs = data[repoId];

	return typeof locs === "string" ? (JSON.parse(locs) as CachedLocs) : null;
}

export async function setCachedLocs(repoId: string, locs: Locs): Promise<void> {
	await chrome.storage.local.set({
		[repoId]: JSON.stringify({ ...locs, _date: Date.now() }),
	});
}
