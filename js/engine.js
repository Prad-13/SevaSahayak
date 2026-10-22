/*
 * Eligibility engine. Three-valued logic (true / false / null = unknown).
 * Runs in the browser (global SSEngine) and under Node (module.exports).
 * Answers: { attr: value } where value === "?" means "I don't know" and a missing key means unanswered.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SSEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var UNKNOWN = "?";
  var ELIGIBLE = "ELIGIBLE", NOT_ELIGIBLE = "NOT_ELIGIBLE", UNDECIDED = "UNDECIDED", NEEDS = "NEEDS_A_QUICK_CHECK";

  function hasValue(answers, attr) {
    var v = answers[attr];
    return v !== undefined && v !== UNKNOWN;
  }

  function evalCond(c, answers) {
    if (c.op === "or") {
      var sawUnknown = false;
      for (var i = 0; i < c.conds.length; i++) {
        var r = evalCond(c.conds[i], answers);
        if (r === true) return true;
        if (r === null) sawUnknown = true;
      }
      return sawUnknown ? null : false;
    }
    if (!hasValue(answers, c.attr)) return null;
    var v = answers[c.attr];
    if (c.op === "eq") return v === c.value;
    if (c.op === "gte") return v >= c.value;
    if (c.op === "lte") return v <= c.value;
    throw new Error("Unknown op " + c.op);
  }

  function condAttrs(c, out) {
    out = out || [];
    if (c.op === "or") c.conds.forEach(function (s) { condAttrs(s, out); });
    else if (out.indexOf(c.attr) < 0) out.push(c.attr);
    return out;
  }

  /* Attributes that are still unanswered AND would help resolve this condition. */
  function unresolvedAttrs(c, answers) {
    if (evalCond(c, answers) !== null) return [];
    if (c.op === "or") {
      var out = [];
      c.conds.forEach(function (s) {
        unresolvedAttrs(s, answers).forEach(function (a) { if (out.indexOf(a) < 0) out.push(a); });
      });
      return out;
    }
    return answers[c.attr] === undefined ? [c.attr] : [];
  }

  /* ELIGIBLE: all required true and all exclusions false. NOT_ELIGIBLE: any required false or exclusion true. */
  function schemeStatus(s, answers) {
    var allReq = true, allExclClear = true, i, r;
    for (i = 0; i < s.required.length; i++) {
      r = evalCond(s.required[i], answers);
      if (r === false) return NOT_ELIGIBLE;
      if (r !== true) allReq = false;
    }
    for (i = 0; i < s.exclusions.length; i++) {
      r = evalCond(s.exclusions[i], answers);
      if (r === true) return NOT_ELIGIBLE;
      if (r !== false) allExclClear = false;
    }
    return allReq && allExclClear ? ELIGIBLE : UNDECIDED;
  }

  /* Pending attributes of a scheme in "earliest required condition first" order, with a rank. */
  function pending(s, answers) {
    var out = [];
    function add(list, base) {
      list.forEach(function (c, idx) {
        unresolvedAttrs(c, answers).forEach(function (a) {
          if (!out.some(function (p) { return p.attr === a; })) out.push({ attr: a, rank: base + idx });
        });
      });
    }
    add(s.required, 0);
    add(s.exclusions, 1000);
    return out;
  }

  /* Most-needed unanswered attribute among UNDECIDED schemes; tie-break by earliest required condition. */
  function nextAttribute(schemes, answers) {
    var count = {}, rank = {}, order = [];
    schemes.forEach(function (s) {
      if (schemeStatus(s, answers) !== UNDECIDED) return;
      pending(s, answers).forEach(function (p) {
        if (!(p.attr in count)) { count[p.attr] = 0; rank[p.attr] = p.rank; order.push(p.attr); }
        count[p.attr]++;
        if (p.rank < rank[p.attr]) rank[p.attr] = p.rank;
      });
    });
    var best = null;
    order.forEach(function (a) {
      if (best === null || count[a] > count[best] || (count[a] === count[best] && rank[a] < rank[best])) best = a;
    });
    return best;
  }

  /* Final status for display: UNDECIDED with nothing left to ask becomes NEEDS_A_QUICK_CHECK. */
  function finalStatus(s, answers) {
    var st = schemeStatus(s, answers);
    if (st === UNDECIDED && pending(s, answers).length === 0) return NEEDS;
    return st;
  }

  function results(schemes, answers) {
    return schemes.map(function (s) { return { scheme: s, status: finalStatus(s, answers) }; });
  }

  /* Attributes the user answered "I don't know" that block this scheme. */
  function blockers(s, answers) {
    var out = [];
    s.required.concat(s.exclusions).forEach(function (c) {
      if (evalCond(c, answers) === null) condAttrs(c).forEach(function (a) {
        if (answers[a] === UNKNOWN && out.indexOf(a) < 0) out.push(a);
      });
    });
    return out;
  }

  /* Per-condition outcomes, for building plain-language "why" text. */
  function explain(s, answers) {
    var items = [];
    s.required.forEach(function (c) { items.push({ kind: "required", cond: c, result: evalCond(c, answers) }); });
    s.exclusions.forEach(function (c) { items.push({ kind: "exclusion", cond: c, result: evalCond(c, answers) }); });
    return items;
  }

  function fixedFormLength(schemes) {
    var seen = [];
    schemes.forEach(function (s) {
      s.required.concat(s.exclusions).forEach(function (c) {
        condAttrs(c).forEach(function (a) { if (seen.indexOf(a) < 0) seen.push(a); });
      });
    });
    return seen.length;
  }

  function candidates(schemes, tag) {
    if (!tag) return schemes.slice();
    return schemes.filter(function (s) { return s.tags.indexOf(tag) >= 0; });
  }

  /* Run the whole adaptive loop against a profile. Attributes missing from the profile are answered "?". */
  function simulate(schemes, profile) {
    var answers = {}, asked = [], a;
    while ((a = nextAttribute(schemes, answers)) !== null) {
      asked.push(a);
      answers[a] = a in profile ? profile[a] : UNKNOWN;
    }
    return { answers: answers, asked: asked, count: asked.length, results: results(schemes, answers) };
  }

  /* Documents needed by all schemes that are not rejected, deduplicated, in first-seen order. */
  function documentUnion(schemes, answers) {
    var ids = [], need = {};
    schemes.forEach(function (s) {
      if (finalStatus(s, answers) === NOT_ELIGIBLE) return;
      s.documents.forEach(function (d) {
        if (!need[d]) { need[d] = []; ids.push(d); }
        need[d].push(s.id);
      });
    });
    return ids.map(function (id) { return { id: id, schemes: need[id] }; });
  }

  return {
    UNKNOWN: UNKNOWN, ELIGIBLE: ELIGIBLE, NOT_ELIGIBLE: NOT_ELIGIBLE, UNDECIDED: UNDECIDED, NEEDS_A_QUICK_CHECK: NEEDS,
    evalCond: evalCond, schemeStatus: schemeStatus, nextAttribute: nextAttribute, finalStatus: finalStatus,
    results: results, blockers: blockers, explain: explain, fixedFormLength: fixedFormLength,
    candidates: candidates, simulate: simulate, documentUnion: documentUnion, condAttrs: condAttrs
  };
});
