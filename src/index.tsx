import { render } from "solid-js/web";
import { Root } from "./components/Root";
import { getCurrentBranch, parseCurrentGituhbUrl } from "./utils";

const STATS_LINK_ID = "_ghloc-stats-link";

function getLinkHref() {
	const url = parseCurrentGituhbUrl();

	if (!url) {
		return null;
	}

	// const path = getCurrentPath();
	const params = new URLSearchParams();
	let href = `https://ghloc.dev/${url.repo}`;

	if (url.branch) {
		params.append("branch", url.branch);
	} else {
		const branch = getCurrentBranch();

		if (branch) {
			params.append("branch", branch);
		}
	}

	// if (path) {
	// 	params.append("locs_path", JSON.stringify(path));
	// }

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

	const textSelectors = ["Resources", "License", "Stars", "Watchers", "Forks"].map(
		t => `contains(., '${t}')`,
	);

	const selector = `
	  //h3[
        contains(@class, 'sr-only')
		and not(ancestor::*[@id='responsive-meta-container'])
		and (${textSelectors.join(" or ")})]
		`.trim();

	const element = document.evaluate(
		selector,
		document,
		null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,
		null,
	).singleNodeValue;

	if (!element) {
		return;
	}

	const root = document.createElement("div");
	(element as Element).after(root);

	render(() => <Root id={STATS_LINK_ID} href={href} />, root);
}

const observer = new MutationObserver(() => {
	attachStatsLink();
});

attachStatsLink();

observer.observe(document.body, { subtree: true, childList: true });
