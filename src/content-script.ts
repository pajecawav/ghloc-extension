interface Locs {
	loc: number;
	locByLangs: Record<string, number>;
	sourceUrl: string;
}

interface CachedLocs extends Locs {
	_date: number;
}

const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

function getCachedLocs(repo: string): Promise<CachedLocs | null> {
	return new Promise(resolve => {
		chrome.storage.local.get(repo, data => {
			const locs = data[repo];
			resolve(locs ? (JSON.parse(locs) as CachedLocs) : null);
		});
	});
}

function setCachedLocs(repo: string, locs: Locs): Promise<void> {
	return new Promise(resolve => {
		chrome.storage.local.set(
			{ [repo]: JSON.stringify({ ...locs, _date: Date.now() }) },
			resolve
		);
	});
}

function getRepoPath(): string | null {
	const author = document
		.querySelector("[itemprop='author']")
		?.textContent?.trim();

	if (!author) {
		return null;
	}

	const name = document
		.querySelector("[itemprop='name']")
		?.textContent?.trim();

	if (!name) {
		return null;
	}

	return `${author}/${name}`;
}

async function getLocsForRepo(repo: string): Promise<Locs> {
	const cachedLocs = await getCachedLocs(repo);
	const now = Date.now();
	if (cachedLocs && now - cachedLocs._date <= CACHE_EXPIRATION_MS) {
		return cachedLocs;
	}

	const response = await fetch(`http://ghloc.bytes.pw/${repo}`);

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const json = await response.json();
	const locs = {
		loc: json.loc,
		locByLangs: json.locByLangs,
		sourceUrl: response.url,
	};

	await setCachedLocs(repo, locs);

	return locs;
}

function showLocs(locs: Locs) {
	const parent = document.querySelector(".Layout-sidebar > .BorderGrid");
	if (!parent) {
		throw new Error("Failed to locate parent");
	}

	const grid = document.createElement("div");
	grid.className = "BorderGrid-row";

	const cell = document.createElement("div");
	cell.className = "BorderGrid-cell";
	grid.appendChild(cell);

	const heading = document.createElement("h2");
	heading.className = "h4 mb-3";
	cell.appendChild(heading);

	const link = document.createElement("a");
	link.className = "Link--primary no-underline";
	link.href = locs.sourceUrl;
	link.textContent = " Lines of Code ";
	heading.appendChild(link);

	const counter = document.createElement("span");
	counter.className = "Counter";
	counter.textContent = locs.loc.toString();
	link.appendChild(counter);

	const list = document.createElement("ul");
	list.className = "list-style-none";
	cell.appendChild(list);

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

	parent.appendChild(grid);
}

(async () => {
	const repo = getRepoPath();

	if (repo) {
		const locs = await getLocsForRepo(repo);
		showLocs(locs);
	}
})();
