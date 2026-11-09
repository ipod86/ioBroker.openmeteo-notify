// Baut die Web-Komponente nach ../admin/webcomponents/ (Modul + Manifest)
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { checkManifest } from "@iobroker/web-components";

const out = "../admin/webcomponents";
mkdirSync(out, { recursive: true });
for (const name of ["openmeteo-widget", "openmeteo-wallpaper"]) {
	await build({
		entryPoints: [`${name}.js`],
		bundle: true,
		format: "esm",
		minify: true,
		target: "es2020",
		outfile: `${out}/${name}.js`,
	});
	const manifest = JSON.parse(readFileSync(`${name}.json`, "utf8"));
	const problems = checkManifest(manifest);
	if (problems && (Array.isArray(problems) ? problems.length : Object.keys(problems).length)) {
		console.error(`${name}.json:`, problems);
		process.exit(1);
	}
	copyFileSync(`${name}.json`, `${out}/${name}.json`);
}
console.log("ok");
