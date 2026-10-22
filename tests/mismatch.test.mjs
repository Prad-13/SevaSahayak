import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const M = require("../js/mismatch.js");

function cls(a, b) { return M.compare(a, b).cls; }
function check(expected, pairs) {
  for (const [a, b] of pairs) assert.equal(cls(a, b), expected, `${a} vs ${b}`);
}

test("EXACT", () => {
  check("EXACT", [["Ramesh Kumar", "Ramesh Kumar"], ["Lakshmi Devi", "Lakshmi Devi"]]);
});

test("FORMATTING_ONLY", () => {
  check("FORMATTING_ONLY", [
    ["Ramesh Kumar", "RAMESH KUMAR"],
    ["Ramesh  Kumar", "Ramesh Kumar"],
    ["K. Ramesh", "K Ramesh"],
    ["Smt. Lakshmi Devi", "Lakshmi Devi"],
    ["D'Souza", "DSouza"]
  ]);
});

test("INITIAL_VS_FULL", () => {
  check("INITIAL_VS_FULL", [
    ["K Ramesh", "Kesiraju Ramesh"],
    ["Ramesh K", "Ramesh Kumar"],
    ["S. Lakshmi", "Sunitha Lakshmi"]
  ]);
});

test("ORDER_DIFFERS", () => {
  check("ORDER_DIFFERS", [
    ["Ramesh Kumar", "Kumar Ramesh"],
    ["Lakshmi Devi Reddy", "Reddy Lakshmi Devi"]
  ]);
});

test("SPELLING_VARIANT", () => {
  check("SPELLING_VARIANT", [
    ["Lakshmi", "Laxmi"],
    ["Venkat", "Venkata"],
    ["Srinivas Rao", "Srinivasa Rao"],
    ["Vijaya Kumari", "Vijaya Kumary"]
  ]);
});

test("DIFFERENT", () => {
  check("DIFFERENT", [
    ["Ramesh Kumar", "Suresh Babu"],
    ["Lakshmi", "Parvathi"],
    ["Ramesh Kumar", "Ramesh"]
  ]);
});

test("severity mapping", () => {
  assert.equal(M.compare("Ramesh Kumar", "RAMESH KUMAR").severity, "ok");
  assert.equal(M.compare("Ramesh Kumar", "Ramesh Kumar").severity, "ok");
  assert.equal(M.compare("Lakshmi", "Laxmi").severity, "warning");
  assert.equal(M.compare("K Ramesh", "Kesiraju Ramesh").severity, "warning");
  assert.equal(M.compare("Ramesh Kumar", "Kumar Ramesh").severity, "warning");
  assert.equal(M.compare("Ramesh Kumar", "Suresh Babu").severity, "fail");
});

test("normalize strips honorifics, punctuation, case and extra spaces", () => {
  assert.deepEqual(M.normalize("  Late  SMT. K.  Lakshmi "), ["k", "lakshmi"]);
});

test("checkRecords compares only filled records and reports worst severity", () => {
  const r = M.checkRecords([
    { key: "aadhaar", name: "Lakshmi Devi" },
    { key: "bank", name: "LAKSHMI DEVI" },
    { key: "land", name: "" }
  ]);
  assert.equal(r.pairs.length, 1);
  assert.equal(r.worst, "ok");
  const r2 = M.checkRecords([
    { key: "aadhaar", name: "Lakshmi Devi" },
    { key: "bank", name: "Laxmi Devi" },
    { key: "land", name: "Suresh" }
  ]);
  assert.equal(r2.pairs.length, 3);
  assert.equal(r2.worst, "fail");
  assert.equal(M.checkRecords([{ key: "aadhaar", name: "A" }]).worst, "none");
});

test("stretch: Telugu and Devanagari transliteration", () => {
  assert.equal(M.transliterate("రమేష్"), "ramesh");
  assert.equal(M.transliterate("रमेश"), "ramesh");
  assert.equal(M.compare("రమేష్", "Ramesh").severity, "warning"); // different script: flagged
  assert.equal(M.compare("रमेश", "Ramesh").cls, "SPELLING_VARIANT");
  assert.equal(M.compare("రమేష్", "రమేష్").cls, "EXACT");
});
