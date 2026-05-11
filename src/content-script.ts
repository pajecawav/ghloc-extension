interface Locs {
	loc: number;
	locByLangs: Record<string, number>;
	children?: Record<string, Locs>;
}

interface CachedLocs extends Locs {
	_date: number;
}

interface GithubUrl {
	repo: string;
	type?: "tree" | "blob";
	branch?: string;
	path?: string[];
}

const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes
const DROPDOWN_BUTTON_ID = "_ghloc-btn";
const DROPDOWN_ID = "_ghloc-dropdown";
const STATS_LINK_ID = "_ghloc-stats-link";

function parseCurrentGituhbUrl(): GithubUrl | null {
	const match = location.pathname.match(
		/\/(?<repo>[^/]+\/[^/]+)(\/(?<type>tree|blob)\/(?<branch>[^/]+))?(?<path>\/[^\$]+)?/
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

function getCurrentPath(): string[] | null {
	const blob = document.getElementById("blob-path");
	if (blob) {
		return (
			blob.textContent?.trim().split("/").slice(1).filter(Boolean) ?? null
		);
	}

	const navigation = document.querySelector(".file-navigation .js-repo-root");
	if (navigation) {
		return (
			navigation.parentElement?.textContent
				?.trim()
				.split("/")
				.slice(1)
				.filter(Boolean) ?? null
		);
	}

	return null;
}

function getCachedLocs(repoId: string): Promise<CachedLocs | null> {
	return new Promise(resolve => {
		chrome.storage.local.get(repoId, data => {
			const locs = data[repoId];
			resolve(locs ? (JSON.parse(locs) as CachedLocs) : null);
		});
	});
}

function setCachedLocs(repoId: string, locs: Locs): Promise<void> {
	return new Promise(resolve => {
		chrome.storage.local.set(
			{ [repoId]: JSON.stringify({ ...locs, _date: Date.now() }) },
			resolve
		);
	});
}

function githubUrlToRepoId(url: GithubUrl): string {
	let repoId = url.repo;
	if (url.branch) {
		repoId += `/${url.branch}`;
	}
	return repoId;
}

async function getLocsForRepo(githubUrl: GithubUrl): Promise<Locs> {
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

function getLinkHref() {
	const url = parseCurrentGituhbUrl();

	if (!url) {
		return null;
	}

	const path = getCurrentPath();
	const params = new URLSearchParams();
	let href = `https://ghloc.vercel.app/${url.repo}`;

	if (url.branch) {
		params.append("branch", url.branch);
	} else {
		const branch = document
			.querySelector(".ref-selector-button-text-container")
			?.textContent.trim();

		if (branch) {
			params.append("branch", branch);
		}
	}

	if (path) {
		params.append("locs_path", JSON.stringify(path));
	}

	const paramsString = params.toString();
	if (paramsString) {
		href += `?${paramsString}`;
	}

	return href;
}

function attachStatsLink() {
	if (document.getElementById(STATS_LINK_ID)) {
		return;
	}

	const href = getLinkHref();

	if (!href) {
		return;
	}

	const textSelectors = [
		"Resources",
		"License",
		"Stars",
		"Watchers",
		"Forks",
	].map(t => `text()='${t}'`);

	const element = document.evaluate(
		`//h3[@class='sr-only' and (${textSelectors.join(" or ")})]`,
		document,
		null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,
		null
	).singleNodeValue;

	if (!element) {
		return;
	}

	const div = document.createElement("div");
	div.className = "mt-2";

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "16");
	svg.setAttribute("height", "16");
	svg.setAttribute("viewBox", "0 0 16 16");
	svg.classList.add("octicon", "octicon-code", "mr-2", "tmp-mr-2");
	svg.style.verticalAlign = "center";
	svg.innerHTML = `<path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>`;

	const link = document.createElement("a");
	link.className = "Link--muted";
	link.id = STATS_LINK_ID;
	link.target = "_blank";
	link.rel = "noopener";
	link.href = href;

	link.appendChild(svg);
	link.appendChild(document.createTextNode(" Stats"));
	div.appendChild(link);
	(element as Element).after(div);
}

const observer = new MutationObserver(() => {
	attachStatsLink();
});

attachStatsLink();

observer.observe(document.body, { subtree: true, childList: true });
