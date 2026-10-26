// Builds seva-sahayak-single.html: index.html with the stylesheet and every script inlined.
// Use this file on a phone: it works when opened from a file manager (content:// links cannot load sibling files).
// Run: node tools/build-single.mjs
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
let html = read("index.html");

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => "<style>\n" + read(href) + "\n</style>");
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => "<script>\n" + read(src).replace(/<\/script/gi, "<\\/script") + "\n</script>");

writeFileSync(new URL("seva-sahayak-single.html", root), html);
console.log("seva-sahayak-single.html:", Math.round(Buffer.byteLength(html) / 1024), "KB");
