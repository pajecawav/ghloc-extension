import type { Locs } from "./types";

export interface CachedLocs extends Locs {
	_date: number;
}

export function getCachedLocs(repoId: string): Promise<CachedLocs | null> {
	return new Promise(resolve => {
		chrome.storage.local.get(repoId, data => {
			const locs = data[repoId];
			resolve(typeof locs === "string" ? (JSON.parse(locs) as CachedLocs) : null);
		});
	});
}

export function setCachedLocs(repoId: string, locs: Locs): Promise<void> {
	return new Promise(resolve => {
		chrome.storage.local.set(
			{ [repoId]: JSON.stringify({ ...locs, _date: Date.now() }) },
			resolve,
		);
	});
}
