import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const E = require("../js/engine.js");
const SCHEMES = require("../data/schemes.js");
const DOCS = require("../data/documents.js");
const { SS_QUESTIONS, SS_TILES } = require("../data/questions.js");

const status = (sim, id) => sim.results.find((r) => r.scheme.id === id).status;

const PERSONA1 = {
  gender: "female", age: 54, widowed: true, bpl: true, farmer_with_land: true,
  income_tax_payer: false, govt_service_or_pensioner: false,
  disability_80_plus: false, pmjay_listed: false
};

test("Persona 1: widow pension and PM-KISAN likely eligible; old age and disability not", () => {
  const sim = E.simulate(SCHEMES, PERSONA1);
  assert.equal(status(sim, "ignwps"), E.ELIGIBLE);
  assert.equal(status(sim, "pm_kisan"), E.ELIGIBLE);
  assert.equal(status(sim, "ignoaps"), E.NOT_ELIGIBLE);
  assert.equal(status(sim, "igndps"), E.NOT_ELIGIBLE);
});

test("72-year-old: PM-JAY eligible with fewer questions than the fixed form", () => {
  const sim = E.simulate(SCHEMES, { age: 72, bpl: false, farmer_with_land: false });
  assert.equal(status(sim, "pmjay"), E.ELIGIBLE);
  assert.ok(sim.count < E.fixedFormLength(SCHEMES), `${sim.count} < ${E.fixedFormLength(SCHEMES)}`);
});

test("'I don't know' on BPL leads to Needs a quick check", () => {
  const sim = E.simulate(SCHEMES, { ...PERSONA1, bpl: E.UNKNOWN });
  assert.equal(status(sim, "ignwps"), E.NEEDS_A_QUICK_CHECK);
  assert.deepEqual(E.blockers(SCHEMES.find((s) => s.id === "ignwps"), sim.answers), ["bpl"]);
});

test("first question is the attribute needed by most undecided schemes", () => {
  assert.equal(E.nextAttribute(SCHEMES, {}), "age"); // 4 schemes use age
  assert.equal(E.nextAttribute(SCHEMES, { age: 54 }), "bpl");
});

test("tie-break uses the earliest required condition", () => {
  const only = SCHEMES.filter((s) => s.id === "ignwps");
  assert.equal(E.nextAttribute(only, {}), "gender");
});

test("attributes no undecided scheme needs are skipped", () => {
  // Male: widow pension is out, so 'widowed' must never be asked.
  const sim = E.simulate(SCHEMES, { gender: "male", age: 30, bpl: false, farmer_with_land: false });
  assert.ok(!sim.asked.includes("widowed"));
  // An answered attribute is never asked twice.
  assert.equal(new Set(sim.asked).size, sim.asked.length);
});

test("an unanswered exclusion keeps PM-KISAN undecided until it is asked", () => {
  assert.equal(E.schemeStatus(SCHEMES[0], { farmer_with_land: true }), E.UNDECIDED);
  assert.equal(E.schemeStatus(SCHEMES[0], { farmer_with_land: true, income_tax_payer: true }), E.NOT_ELIGIBLE);
});

test("three-valued OR: unknown pmjay_listed with age < 70 stays undecided", () => {
  const jay = SCHEMES.find((s) => s.id === "pmjay");
  assert.equal(E.schemeStatus(jay, { age: 50, pmjay_listed: E.UNKNOWN }), E.UNDECIDED);
  assert.equal(E.finalStatus(jay, { age: 50, pmjay_listed: E.UNKNOWN }), E.NEEDS_A_QUICK_CHECK);
  assert.equal(E.schemeStatus(jay, { age: 50, pmjay_listed: true }), E.ELIGIBLE);
});

test("adaptive question count never exceeds the fixed form, over many profiles", () => {
  const vals = {
    age: [10, 25, 54, 62, 72, 85, E.UNKNOWN],
    gender: ["female", "male", E.UNKNOWN],
    widowed: [true, false, E.UNKNOWN],
    farmer_with_land: [true, false, E.UNKNOWN],
    bpl: [true, false, E.UNKNOWN],
    income_tax_payer: [true, false],
    govt_service_or_pensioner: [true, false],
    disability_80_plus: [true, false],
    pmjay_listed: [true, false, E.UNKNOWN]
  };
  const attrs = Object.keys(vals);
  let seed = 12345;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (const tile of SS_TILES) {
    const cands = E.candidates(SCHEMES, tile.tag);
    const fixed = E.fixedFormLength(cands);
    for (let i = 0; i < 300; i++) {
      const profile = {};
      attrs.forEach((a) => { profile[a] = vals[a][rnd(vals[a].length)]; });
      const sim = E.simulate(cands, profile);
      assert.ok(sim.count <= fixed, `${tile.id}: ${sim.count} > ${fixed}`);
      sim.results.forEach((r) => assert.notEqual(r.status, E.UNDECIDED));
    }
  }
});

test("tiles only narrow the candidate set", () => {
  assert.equal(E.candidates(SCHEMES, null).length, SCHEMES.length);
  assert.deepEqual(E.candidates(SCHEMES, "farming").map((s) => s.id), ["pm_kisan"]);
  assert.deepEqual(E.candidates(SCHEMES, "old_age").map((s) => s.id), ["ignoaps", "pmjay"]);
});

test("fixed form length is the number of distinct attributes", () => {
  assert.equal(E.fixedFormLength(SCHEMES), 9);
});

test("document union is deduplicated and skips rejected schemes", () => {
  const sim = E.simulate(SCHEMES, PERSONA1);
  const ids = E.documentUnion(SCHEMES, sim.answers).map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("land_record") && ids.includes("spouse_death_certificate"));
  assert.ok(!ids.includes("disability_certificate"));
});

test("data integrity: every attribute has a question and every doc id exists", () => {
  const docIds = DOCS.map((d) => d.id);
  for (const s of SCHEMES) {
    for (const d of s.documents) assert.ok(docIds.includes(d), `${s.id}: ${d}`);
    for (const c of [...s.required, ...s.exclusions]) {
      for (const a of E.condAttrs(c)) assert.ok(SS_QUESTIONS[a], a);
    }
    for (const l of ["en", "te", "hi"]) assert.ok(s.name[l] && s.benefit[l]);
  }
  for (const d of DOCS) for (const l of ["en", "te", "hi"]) assert.ok(d.name[l] && d.where[l]);
});
