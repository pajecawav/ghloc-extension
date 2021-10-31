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

function parseCurrentGituhbUrl(): GithubUrl | null {
	const match = location.pathname.match(
		/\/(?<repo>[^/]+\/[^/]+)(\/(?<type>tree|blob)\/(?<branch>[^/]+))?(?<path>\/[^\$]+)?/
	);
	if (!match || !match.groups) {
		return null;
	}

	const groups = match.groups;
	if (groups.path) {
		groups.path = groups.path.slice(1).split("/") as any;
	}

	return groups as any;
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

	const response = await fetch(`http://ghloc.bytes.pw/${repoId}`);

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const locs = await response.json();

	await setCachedLocs(repoId, locs);

	return locs;
}

async function attachDropdown() {
	const existingDropdown = document.getElementById(DROPDOWN_ID);
	if (existingDropdown) {
		return;
	}

	const container = document.getElementById(DROPDOWN_BUTTON_ID);
	if (!container) {
		return;
	}

	const githubUrl = parseCurrentGituhbUrl();
	if (!githubUrl) {
		throw new Error("Failed to parse url");
	}

	let locs = await getLocsForRepo(githubUrl);
	if (githubUrl.path) {
		for (const part of githubUrl.path) {
			if (!locs.children?.[part]) {
				throw new Error("Failed to locate LOCs for path");
			}

			locs = locs.children[part];
		}
	}

	const wrapper = document.createElement("div");
	wrapper.className = "position-relative";

	const dropdown = document.createElement("div");
	dropdown.id = DROPDOWN_ID;
	dropdown.className = "dropdown-menu dropdown-menu-sw px-3 py-2";
	dropdown.style.top = "6px";
	dropdown.style.width = "300px";
	dropdown.style.overflowY = "auto";
	dropdown.style.overflowX = "hidden";
	wrapper.appendChild(dropdown);

	const heading = document.createElement("h2");
	heading.className = "h4 mb-1";
	heading.textContent = " Lines of Code ";
	dropdown.appendChild(heading);

	const counter = document.createElement("span");
	counter.className = "Counter";
	counter.textContent = locs.loc.toString();
	heading.appendChild(counter);

	const list = document.createElement("ul");
	list.className = "list-style-none";
	dropdown.appendChild(list);

	for (const [lang, loc] of Object.entries(locs.locByLangs)) {
		const item = document.createElement("li");
		item.className = "d-inline-block mr-3 text-small";
		item.style.whiteSpace = "nowrap";

		const label = document.createElement("span");
		label.className = "color-fg-default text-bold mr-1";
		label.textContent = lang;

		const value = document.createElement("span");
		value.textContent = loc.toString();

		item.appendChild(label);
		item.appendChild(value);

		list.appendChild(item);
	}

	container.appendChild(wrapper);
}

function attachButton() {
	if (document.getElementById(DROPDOWN_BUTTON_ID)) {
		return;
	}

	const container = document.querySelector(".file-navigation");
	if (!container) {
		return;
	}

	const details = document.createElement("details");
	details.className =
		"details-overlay details-reset position-relative d-block";

	const summary = document.createElement("summary");
	summary.setAttribute("role", "button");
	summary.className = "btn ml-2";
	details.appendChild(summary);

	const button = document.createElement("span");
	button.textContent = "Show LOC";
	button.className = "d-none d-md-flex flex-items-center";
	summary.appendChild(button);

	const caret = document.createElement("span");
	caret.className = "dropdown-caret ml-1";
	button.appendChild(caret);

	details.id = DROPDOWN_BUTTON_ID;
	details.onclick = attachDropdown;
	container.appendChild(details);
}

// TODO: investigate perfomance of observer
let previousUrl = "";
const observer = new MutationObserver(() => {
	attachButton();
});
observer.observe(document.body, { subtree: true, childList: true });