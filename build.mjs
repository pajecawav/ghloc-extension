import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";

const watch = process.argv.includes("--watch");

await build({
	entryPoints: ["./src/content-script.ts"],
	outfile: "./dist/content-script.js",
	bundle: false,
	treeShaking: true,
	plugins: [
		copy({
			resolveFrom: "cwd",
			assets: {
				from: ["./src/manifest.json"],
				to: ["./dist"],
			},
			watch,
		}),
	],
});
