import type { GithubUrl, Locs } from "./types";
import { githubUrlToRepoId } from "./utils";

interface GetLocsResponse {
	locs?: Locs;
	error?: string;
}

export async function getLocsForRepo(githubUrl: GithubUrl): Promise<Locs> {
	const repoId = githubUrlToRepoId(githubUrl);

	const response = (await chrome.runtime.sendMessage({
		type: "getLocs",
		repoId,
	})) as GetLocsResponse | undefined;

	if (!response?.locs) {
		throw new Error(response?.error ?? "Failed to get LOCs");
	}

	return response.locs;
}
