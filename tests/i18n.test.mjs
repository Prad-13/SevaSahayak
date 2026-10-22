import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const I18N = require("../data/i18n.js");

test("Telugu and Hindi define exactly the same keys as English", () => {
  const en = Object.keys(I18N.en).sort();
  assert.deepEqual(Object.keys(I18N.te).sort(), en);
  assert.deepEqual(Object.keys(I18N.hi).sort(), en);
});

test("placeholders match across languages", () => {
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
  for (const k of Object.keys(I18N.en)) {
    assert.equal(ph(I18N.te[k]), ph(I18N.en[k]), "te " + k);
    assert.equal(ph(I18N.hi[k]), ph(I18N.en[k]), "hi " + k);
  }
});

test("every t('key') used in app.js exists", () => {
  const src = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
  const used = new Set([...src.matchAll(/\bt\("([\w.]+)"[,)]/g)].map((m) => m[1]));
  for (const k of used) assert.ok(k in I18N.en, k);
});
