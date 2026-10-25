import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const E = require("../js/engine.js");
const SCHEMES = require("../data/schemes.js");
const DOCS = require("../data/documents.js");
const { SS_QUESTIONS, SS_TILES } = require("../data/questions.js");

// The original five demo schemes, kept as a stable regression set next to the 50-scheme sample.
const CORE_IDS = ["pm_kisan", "ignwps", "ignoaps", "igndps", "pmjay"];
const CORE = SCHEMES.filter((s) => CORE_IDS.includes(s.id));

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
  assert.equal(E.nextAttribute(CORE, {}), "age"); // 4 of the 5 core schemes use age
  assert.equal(E.nextAttribute(CORE, { age: 54 }), "bpl");
  // on the full sample the choice is whatever is most shared; check it really is the maximum
  const counts = {};
  SCHEMES.forEach((sc) => sc.required.concat(sc.exclusions).forEach((c) => E.condAttrs(c).forEach((a) => { counts[a] = (counts[a] || 0) + 1; })));
  const first = E.nextAttribute(SCHEMES, {});
  assert.equal(counts[first], Math.max(...Object.values(counts)));
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
  assert.ok(E.candidates(SCHEMES, "farming").map((s) => s.id).includes("pm_kisan"));
  assert.deepEqual(E.candidates(CORE, "old_age").map((s) => s.id), ["ignoaps", "pmjay"]);
  for (const tile of SS_TILES) if (tile.tag) assert.ok(E.candidates(SCHEMES, tile.tag).length > 0, tile.id);
});

test("fixed form length is the number of distinct attributes", () => {
  assert.equal(E.fixedFormLength(CORE), 9);
  assert.equal(E.fixedFormLength(SCHEMES), Object.keys(SS_QUESTIONS).length); // every question is used by some scheme
});

test("document union is deduplicated and skips rejected schemes", () => {
  const sim = E.simulate(CORE, PERSONA1);
  const ids = E.documentUnion(CORE, sim.answers).map((d) => d.id);
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

/* ---- the 50-scheme sample ---- */

test("sample database has 50 unique schemes, each with names in three languages and a verification note", () => {
  assert.equal(SCHEMES.length, 50);
  assert.equal(new Set(SCHEMES.map((s) => s.id)).size, 50);
  for (const s of SCHEMES) assert.match(s.official_note, /verify against official guidelines/);
});

const FULL_PERSONA1 = {
  ...PERSONA1, breadwinner_died: false, rural: true, owns_pucca_house: false, has_lpg: true, has_bank_account: true,
  informal_worker: false, epf_member: false, pregnant_or_new_mother: false, girl_child_under_10: false,
  street_vendor: false, own_business: false, artisan: false, has_toilet: true, student: false,
  sc_st: false, obc: false, minority: false, disability_40_plus: false, household_income_lakh: 1
};

test("full sample, Persona 1 with every answer known: every scheme is decided and the headline results hold", () => {
  const sim = E.simulate(SCHEMES, FULL_PERSONA1);
  sim.results.forEach((r) => assert.notEqual(r.status, E.NEEDS_A_QUICK_CHECK, r.scheme.id));
  assert.equal(status(sim, "ignwps"), E.ELIGIBLE);
  assert.equal(status(sim, "pm_kisan"), E.ELIGIBLE);
  assert.equal(status(sim, "pmfby"), E.ELIGIBLE);
  assert.equal(status(sim, "pmay_g"), E.ELIGIBLE); // rural, no pucca house, BPL
  assert.equal(status(sim, "nrlm"), E.ELIGIBLE);   // rural woman, BPL
  assert.equal(status(sim, "mgnrega"), E.ELIGIBLE);
  assert.equal(status(sim, "ignoaps"), E.NOT_ELIGIBLE);
  assert.equal(status(sim, "ujjwala"), E.NOT_ELIGIBLE); // already has LPG
  assert.equal(status(sim, "pmjdy"), E.NOT_ELIGIBLE);   // already has a bank account
  assert.equal(status(sim, "post_matric_scst"), E.NOT_ELIGIBLE);
  assert.ok(sim.count <= E.fixedFormLength(SCHEMES));
});

test("full sample, a 72-year-old with every answer known asks fewer questions than the fixed form", () => {
  const profile = { ...FULL_PERSONA1, age: 72, gender: "male", widowed: false, bpl: false, farmer_with_land: false, rural: false, household_income_lakh: 6 };
  const sim = E.simulate(SCHEMES, profile);
  assert.equal(status(sim, "pmjay"), E.ELIGIBLE);
  assert.equal(status(sim, "scss"), E.ELIGIBLE);
  assert.ok(sim.count < E.fixedFormLength(SCHEMES), `${sim.count} < ${E.fixedFormLength(SCHEMES)}`);
});

test("full sample, a student from an SC family", () => {
  const profile = { ...FULL_PERSONA1, age: 19, gender: "male", widowed: false, farmer_with_land: false, bpl: true,
    student: true, sc_st: true, household_income_lakh: 2, rural: false };
  const sim = E.simulate(SCHEMES, profile);
  assert.equal(status(sim, "post_matric_scst"), E.ELIGIBLE);
  assert.equal(status(sim, "nmms"), E.ELIGIBLE);
  assert.equal(status(sim, "yasasvi"), E.NOT_ELIGIBLE); // not OBC
  assert.equal(status(sim, "minority_post"), E.NOT_ELIGIBLE);
});

test("full sample, 'I don't know' everywhere never leaves anything undecided and never asks twice", () => {
  const sim = E.simulate(SCHEMES, {});
  sim.results.forEach((r) => assert.notEqual(r.status, E.UNDECIDED));
  assert.equal(new Set(sim.asked).size, sim.asked.length);
});

test("full sample, adaptive count never exceeds the fixed form across random profiles and every tile", () => {
  const attrs = Object.keys(SS_QUESTIONS);
  let seed = 98765;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const pick = (a) => {
    const q = SS_QUESTIONS[a];
    const r = rnd(10);
    if (r === 0) return E.UNKNOWN;
    if (q.type === "number") return rnd(q.max + 1);
    if (q.type === "choice") return q.options[rnd(q.options.length)].value;
    return rnd(2) === 0;
  };
  for (const tile of SS_TILES) {
    const cands = E.candidates(SCHEMES, tile.tag);
    const fixed = E.fixedFormLength(cands);
    for (let i = 0; i < 150; i++) {
      const profile = {};
      attrs.forEach((a) => { profile[a] = pick(a); });
      const sim = E.simulate(cands, profile);
      assert.ok(sim.count <= fixed, `${tile.id}: ${sim.count} > ${fixed}`);
    }
  }
});
