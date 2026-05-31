import type { GithubUrl } from "./types";

export function parseCurrentGituhbUrl(): GithubUrl | null {
	const match = location.pathname.match(
		/\/(?<repo>[^/]+\/[^/]+)(\/(?<type>tree|blob)\/(?<branch>[^/]+))?(?<path>\/[^\$]+)?/,
	);
	if (!match || !match.groups) {
		return null;
	}

	const groups = match.groups as Record<string, string | undefined>;

	// if (groups.path) {
	// 	groups.path = groups.path.slice(1).split("/") as any;
	// }
	groups.path = getCurrentPath() as any;

	if (!groups.branch) {
		const branchSelect = document.querySelector("[data-hotkey='w']");
		if (branchSelect) {
			groups.branch = branchSelect.textContent?.trim();
		}
	}

	return groups as any;
}

export function getCurrentBranch() {
	return document.querySelector(".ref-selector-button-text-container")?.textContent.trim();
}

export function getCurrentPath(): string[] | null {
	const blob = document.getElementById("blob-path");
	if (blob) {
		return blob.textContent?.trim().split("/").slice(1).filter(Boolean) ?? null;
	}

	const navigation = document.querySelector(".file-navigation .js-repo-root");
	if (navigation) {
		return (
			navigation.parentElement?.textContent?.trim().split("/").slice(1).filter(Boolean) ??
			null
		);
	}

	return null;
}

export function githubUrlToRepoId(url: GithubUrl): string {
	let repoId = url.repo;
	if (url.branch) {
		repoId += `/${url.branch}`;
	}
	return repoId;
}
