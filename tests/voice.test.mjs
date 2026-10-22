import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const V = require("../js/voice.js");
const { SS_QUESTIONS } = require("../data/questions.js");

test("yes / no / don't know in English, Telugu and Hindi (romanised and native script)", () => {
  for (const s of ["yes", "Yeah", "avunu", "haan", "అవును", "हाँ"]) assert.equal(V.parseYesNo(s), true, s);
  for (const s of ["no", "kaadu", "nahin", "కాదు", "नहीं"]) assert.equal(V.parseYesNo(s), false, s);
  for (const s of ["I don't know", "not sure", "pata nahi", "teliyadu", "తెలియదు", "पता नहीं"]) assert.equal(V.parseYesNo(s), "?", s);
  assert.equal(V.parseYesNo("banana"), null);
});

test("numbers from digits, other-script digits and English words", () => {
  assert.equal(V.parseNumber("I am 54 years old"), 54);
  assert.equal(V.parseNumber("७२"), 72);
  assert.equal(V.parseNumber("౫౪"), 54);
  assert.equal(V.parseNumber("seventy two"), 72);
  assert.equal(V.parseNumber("sixty"), 60);
  assert.equal(V.parseNumber("hello"), null);
});

test("parseAnswer respects question type and range", () => {
  assert.equal(V.parseAnswer(SS_QUESTIONS.age, "fifty four"), 54);
  assert.equal(V.parseAnswer(SS_QUESTIONS.age, "500"), null);
  assert.equal(V.parseAnswer(SS_QUESTIONS.age, "I don't know"), "?");
  assert.equal(V.parseAnswer(SS_QUESTIONS.bpl, "avunu"), true);
  assert.equal(V.parseAnswer(SS_QUESTIONS.gender, "I am a woman"), "female");
  assert.equal(V.parseAnswer(SS_QUESTIONS.gender, "purush"), "male");
});
