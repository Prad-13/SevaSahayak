// Writes two review sheets from the data files (run: node tools/export-csv.mjs)
//   SCHEMES_SAMPLE.csv  the 50-scheme sample in plain language, for the faculty and for fact-checking
//   TELUGU_REVIEW.csv   every Telugu string next to its English source, with an empty column for the corrected text
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { VERIFICATION, STATUS_LABEL, CHECK_DATE } from "./verification.mjs";
const require = createRequire(import.meta.url);
const SCHEMES = require("../data/schemes.js");
const DOCS = require("../data/documents.js");
const I18N = require("../data/i18n.js");
const { SS_QUESTIONS: Q, SS_TILES: TILES } = require("../data/questions.js");

const csv = (rows) => "﻿" + rows.map((r) => r.map((c) => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(",")).join("\r\n") + "\r\n";

function need(c) {
  if (c.op === "eq") {
    if (c.value === true) return "yes";
    if (c.value === false) return "no";
    return String(c.value);
  }
  return (c.op === "gte" ? ">= " : "<= ") + c.value;
}
function cond(c) {
  if (c.op === "or") return "(" + c.conds.map(cond).join(" OR ") + ")";
  return Q[c.attr].label.en + ": " + need(c);
}
const docName = (id) => DOCS.find((d) => d.id === id).name.en;

const missing = SCHEMES.filter((x) => !VERIFICATION[x.id]).map((x) => x.id);
if (missing.length) throw new Error("No verification entry for: " + missing.join(", "));
const counts = {};
SCHEMES.forEach((x) => { const st = VERIFICATION[x.id].status; counts[st] = (counts[st] || 0) + 1; });

writeFileSync(new URL("../SCHEMES_SAMPLE.csv", import.meta.url), csv([
  ["#", "Scheme id", "Scheme", "Benefit (one line)", "Life-event tags", "Must ALL be true", "Must NOT be true (exclusions)", "Documents",
   "Desk-check result", "Evidence level", "What was checked, and what the app does not model", "Sources used", "Date checked", "Checked by", "Team confirmed on the official page (fill in)"],
  ...SCHEMES.map((s, i) => {
    const v = VERIFICATION[s.id];
    return [
      i + 1, s.id, s.name.en, s.benefit.en, s.tags.join("; "),
      s.required.map(cond).join("; "), s.exclusions.map(cond).join("; "),
      s.documents.map(docName).join("; "),
      STATUS_LABEL[v.status], v.evidence, v.note, v.sources.join("\n"), CHECK_DATE,
      "AI-assisted desk check of public web sources; not yet confirmed by the team", ""
    ];
  })
]));
console.log("desk-check results:", JSON.stringify(counts));

const rows = [["Where", "Key", "English", "Telugu draft", "Telugu corrected (fill this)"]];
for (const k of Object.keys(I18N.en)) rows.push(["Screen text", k, I18N.en[k], I18N.te[k], ""]);
for (const t of TILES) rows.push(["Tile", t.id, t.label.en, t.label.te, ""]);
for (const [a, q] of Object.entries(Q)) {
  rows.push(["Question label", a, q.label.en, q.label.te, ""]);
  rows.push(["Question text", a, q.text.en, q.text.te, ""]);
  (q.options || []).forEach((o) => rows.push(["Answer option", a + "=" + o.value, o.label.en, o.label.te, ""]));
}
for (const d of DOCS) {
  rows.push(["Document name", d.id, d.name.en, d.name.te, ""]);
  rows.push(["Document: where to get it", d.id, d.where.en, d.where.te, ""]);
}
for (const s of SCHEMES) {
  rows.push(["Scheme name", s.id, s.name.en, s.name.te, ""]);
  rows.push(["Scheme benefit", s.id, s.benefit.en, s.benefit.te, ""]);
}
writeFileSync(new URL("../TELUGU_REVIEW.csv", import.meta.url), csv(rows));
console.log("SCHEMES_SAMPLE.csv:", SCHEMES.length, "schemes; TELUGU_REVIEW.csv:", rows.length - 1, "strings");
