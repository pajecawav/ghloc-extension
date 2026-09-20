import { getCachedLocs, setCachedLocs } from "./cache";
import type { Locs } from "./types";

const CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

async function getLocs(repoId: string): Promise<Locs> {
	const cachedLocs = await getCachedLocs(repoId);
	const now = Date.now();
	if (cachedLocs && now - cachedLocs._date <= CACHE_EXPIRATION_MS) {
		return cachedLocs;
	}

	const response = await fetch(`https://ghloc.ifels.dev/${repoId}`);

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const locs = (await response.json()) as Locs;

	await setCachedLocs(repoId, locs);

	return locs;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message?.type !== "getLocs" || typeof message.repoId !== "string") {
		return;
	}

	getLocs(message.repoId).then(
		locs => sendResponse({ locs }),
		error => sendResponse({ error: String(error) }),
	);

	return true; // keep the message channel open for the async response
});
