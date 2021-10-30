const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: "./src/content-script.ts",
	output: {
		filename: "content-script.js",
		path: path.resolve(__dirname, "dist"),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: "src/manifest.json", to: "manifest.json" }],
		}),
	],
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	optimization: {
		minimize: false,
	},
};
