# Privacy Policy for ghloc

_Last updated: October 18, 2026_

This Privacy Policy describes how the **ghloc** browser extension ("the Extension"), maintained by **pajecawav**, handles information when you use it. The Extension displays the number of lines of code in a GitHub repository.

## What the Extension does

The Extension runs only on `github.com` pages. When you open a GitHub repository page, the Extension reads the repository owner and name from the page URL and sends this repository identifier to the [ghloc](https://ghloc.ifels.dev/) API (`https://ghloc.ifels.dev/`) — a service operated by the developer of the Extension — to retrieve the lines-of-code statistics that the Extension then displays on the page.

## Information handled

- **Repository identifier** (repository owner and name): read from the URL of the GitHub page you are viewing and transmitted to the developer-operated ghloc API over HTTPS solely to fetch the statistics to be displayed.
- **Local cache**: the Extension stores API responses in the browser's local storage (`chrome.storage.local`) for about 10 minutes to avoid repeated requests. This cache never leaves your browser and is removed when you uninstall the Extension.

The Extension does **not**:

- collect, store, or transmit personally identifiable information;
- collect browsing history, tracking data, or any data unrelated to its single purpose;
- use analytics, advertising, or tracking of any kind;
- sell, rent, or transfer data to third parties (the ghloc API is operated by the developer and is not a third party in this sense).

## Server-side processing

The ghloc API processes incoming requests solely to compute and return the requested lines-of-code statistics. Standard server logs (such as IP addresses) may be kept for operational and abuse-prevention purposes, and computed results may be cached to speed up subsequent requests. This is the ordinary, unavoidable processing of any web request and is not used to profile users.

## Permissions

The Extension requests only the permissions needed for its single purpose:

- Access to `github.com` pages, to display the statistics on repository pages.
- Access to `ghloc.ifels.dev`, to fetch the statistics.
- The `storage` permission, for the local cache described above.

## Limited Use

The use of information received from Google APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/policies), including the Limited Use requirements.

## Changes

If the Extension's data practices change in the future, this Privacy Policy will be updated and the change will be disclosed in the Extension's Chrome Web Store listing.

## Contact

Questions or concerns about this Privacy Policy can be filed at the Extension's issue tracker: [github.com/pajecawav/ghloc-extension/issues](https://github.com/pajecawav/ghloc-extension/issues).
