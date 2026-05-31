import { getCachedLocs, setCachedLocs } from "./cache";
import type { GithubUrl, Locs } from "./types";
import { githubUrlToRepoId } from "./utils";

const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

export async function getLocsForRepo(githubUrl: GithubUrl): Promise<Locs> {
	const repoId = githubUrlToRepoId(githubUrl);

	const cachedLocs = await getCachedLocs(repoId);
	const now = Date.now();
	if (cachedLocs && now - cachedLocs._date <= CACHE_EXPIRATION_MS) {
		return cachedLocs;
	}

	const response = await fetch(`https://ghloc.ifels.dev/${repoId}`);

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const locs = await response.json();

	await setCachedLocs(repoId, locs);

	return locs;
}
