// Baut die Web-Komponente nach ../admin/webcomponents/ (Modul + Manifest)
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { checkManifest } from "@iobroker/web-components";

const out = "../admin/webcomponents";
mkdirSync(out, { recursive: true });
await build({
	entryPoints: ["openmeteo-widget.js"],
	bundle: true,
	format: "esm",
	minify: true,
	target: "es2020",
	outfile: `${out}/openmeteo-widget.js`,
});
const manifest = JSON.parse(readFileSync("openmeteo-widget.json", "utf8"));
const problems = checkManifest(manifest);
if (problems && (Array.isArray(problems) ? problems.length : Object.keys(problems).length)) {
	console.error("Manifest:", problems);
	process.exit(1);
}
copyFileSync("openmeteo-widget.json", `${out}/openmeteo-widget.json`);
console.log("ok");
