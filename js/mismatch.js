/*
 * Name mismatch pre-check. Names only, compared on-device. Runs in browser (SSMismatch) and Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SSMismatch = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CLASSES = ["EXACT", "FORMATTING_ONLY", "INITIAL_VS_FULL", "ORDER_DIFFERS", "SPELLING_VARIANT", "DIFFERENT"];
  var HONORIFICS = ["mr", "mrs", "ms", "smt", "sri", "shri", "late", "dr"];

  /* ---- Stretch goal: simple Telugu and Devanagari to Latin transliteration ---- */
  var IND = {
    // Devanagari
    dev: {
      lo: 0x0900, hi: 0x097F, virama: "्", deleteFinalSchwa: true,
      vowels: { "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ऋ": "ru", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au" },
      matras: { "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ru", "े": "e", "ै": "ai", "ो": "o", "ौ": "au" },
      marks: { "ं": "n", "ँ": "n", "ः": "h" },
      cons: { "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "ch", "ज": "j", "झ": "jh", "ञ": "n",
        "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
        "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "ळ": "l", "व": "v",
        "श": "sh", "ष": "sh", "स": "s", "ह": "h" }
    },
    // Telugu
    tel: {
      lo: 0x0C00, hi: 0x0C7F, virama: "్", deleteFinalSchwa: false,
      vowels: { "అ": "a", "ఆ": "a", "ఇ": "i", "ఈ": "i", "ఉ": "u", "ఊ": "u", "ఋ": "ru", "ఎ": "e", "ఏ": "e", "ఐ": "ai", "ఒ": "o", "ఓ": "o", "ఔ": "au" },
      matras: { "ా": "a", "ి": "i", "ీ": "i", "ు": "u", "ూ": "u", "ృ": "ru", "ె": "e", "ే": "e", "ై": "ai", "ొ": "o", "ో": "o", "ౌ": "au" },
      marks: { "ం": "n", "ఁ": "n", "ః": "h" },
      cons: { "క": "k", "ఖ": "kh", "గ": "g", "ఘ": "gh", "ఙ": "n", "చ": "ch", "ఛ": "ch", "జ": "j", "ఝ": "jh", "ఞ": "n",
        "ట": "t", "ఠ": "th", "డ": "d", "ఢ": "dh", "ణ": "n", "త": "t", "థ": "th", "ద": "d", "ధ": "dh", "న": "n",
        "ప": "p", "ఫ": "ph", "బ": "b", "భ": "bh", "మ": "m", "య": "y", "ర": "r", "ఱ": "r", "ల": "l", "ళ": "l", "వ": "v",
        "శ": "sh", "ష": "sh", "స": "s", "హ": "h" }
    }
  };

  function scriptOf(ch) {
    var c = ch.charCodeAt(0);
    if (c >= IND.dev.lo && c <= IND.dev.hi) return IND.dev;
    if (c >= IND.tel.lo && c <= IND.tel.hi) return IND.tel;
    return null;
  }

  function hasIndic(s) {
    for (var i = 0; i < s.length; i++) if (scriptOf(s.charAt(i))) return true;
    return false;
  }

  function scriptName(s) {
    for (var i = 0; i < s.length; i++) {
      var sc = scriptOf(s.charAt(i));
      if (sc) return sc === IND.dev ? "dev" : "tel";
    }
    return "lat";
  }

  function transliterateWord(word) {
    var out = "", pendingA = false, i, ch, sc;
    function flush() { if (pendingA) { out += "a"; pendingA = false; } }
    for (i = 0; i < word.length; i++) {
      ch = word.charAt(i);
      sc = scriptOf(ch);
      if (!sc) { flush(); out += ch; continue; }
      if (sc.cons[ch] !== undefined) { flush(); out += sc.cons[ch]; pendingA = true; }
      else if (ch === sc.virama) { pendingA = false; }
      else if (sc.matras[ch] !== undefined) { pendingA = false; out += sc.matras[ch]; }
      else if (sc.vowels[ch] !== undefined) { flush(); out += sc.vowels[ch]; }
      else if (sc.marks[ch] !== undefined) { flush(); out += sc.marks[ch]; }
      // anything else (nukta, ZWJ...) is ignored
    }
    var last = word.charAt(word.length - 1), lsc = scriptOf(last);
    if (pendingA && !(lsc && lsc.deleteFinalSchwa)) out += "a";
    return out;
  }

  function transliterate(s) {
    return s.split(/(\s+)/).map(function (w) { return hasIndic(w) ? transliterateWord(w) : w; }).join("");
  }

  /* ---- Normalisation ---- */
  // Unicode property escapes need Chrome 64+; fall back to explicit ranges on older browsers.
  var PUNCT;
  try { PUNCT = new RegExp("[^\\p{L}\\p{N}\\p{M}\\s]", "gu"); }
  catch (e) { PUNCT = /[^\w\sÀ-ɏऀ-ॿఀ-౿]/g; }

  function normalize(name) {
    var s = String(name || "").normalize("NFKC").toLowerCase();
    s = s.replace(PUNCT, " ");
    var toks = s.split(/\s+/).filter(Boolean).filter(function (t) { return HONORIFICS.indexOf(t) < 0; });
    return toks;
  }

  /* ---- Distances ---- */
  function editDistance(a, b) {
    var m = a.length, n = b.length, prev = [], cur, i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  function similarity(a, b) {
    var L = Math.max(a.length, b.length);
    return L === 0 ? 1 : 1 - editDistance(a, b) / L;
  }

  /* Rough phonetic key so Laxmi ~ Lakshmi, Venkat ~ Venkata, Vijaya ~ Wijaya. */
  function phonetic(t) {
    return t.replace(/x/g, "ks").replace(/sh/g, "s").replace(/ph/g, "f").replace(/w/g, "v").replace(/z/g, "j")
      .replace(/(.)\1+/g, "$1").replace(/ee/g, "i").replace(/oo/g, "u").replace(/([bcdgjkpt])h/g, "$1");
  }

  function spellingClose(a, b) {
    var L = Math.max(a.length, b.length);
    if (L <= 3) return false;
    var pairs = [[a, b], [phonetic(a), phonetic(b)]];
    for (var i = 0; i < pairs.length; i++) {
      var x = pairs[i][0], y = pairs[i][1], d = editDistance(x, y);
      if (d === 0) return true;
      if (Math.max(x.length, y.length) <= 4) { if (d <= 1) return true; continue; }
      if (d <= 2 || similarity(x, y) >= 0.8) return true;
    }
    return false;
  }

  function isInitialOf(a, b) { // one side is a single letter that starts the other
    return (a.length === 1 && b.length > 1 && b.charAt(0) === a) || (b.length === 1 && a.length > 1 && a.charAt(0) === b);
  }

  /* Relation of two tokens: "eq" | "initial" | "spell" | null */
  function tokenRel(a, b) {
    if (a === b) return "eq";
    if (isInitialOf(a, b)) return "initial";
    if (spellingClose(a, b)) return "spell";
    return null;
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    var out = [];
    arr.forEach(function (x, i) {
      permutations(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(function (p) { out.push([x].concat(p)); });
    });
    return out;
  }

  function classifyTokens(ta, tb) {
    if (ta.length !== tb.length || ta.length === 0) return "DIFFERENT";
    function rels(order) {
      var r = [];
      for (var i = 0; i < ta.length; i++) {
        var x = tokenRel(ta[i], order[i]);
        if (!x) return null;
        r.push(x);
      }
      return r;
    }
    var r = rels(tb);
    if (r) {
      if (r.indexOf("initial") >= 0) return "INITIAL_VS_FULL";
      if (r.indexOf("spell") >= 0) return "SPELLING_VARIANT";
      return "FORMATTING_ONLY";
    }
    if (ta.length <= 5) {
      var perms = permutations(tb);
      for (var i = 0; i < perms.length; i++) if (rels(perms[i])) return "ORDER_DIFFERS";
    }
    return "DIFFERENT";
  }

  /* Compare two names. Returns { cls, severity: "ok"|"warning"|"fail", crossScript } */
  function compare(a, b) {
    var rawA = String(a || "").trim(), rawB = String(b || "").trim();
    if (rawA === rawB && rawA !== "") return { cls: "EXACT", severity: "ok", crossScript: false };
    var cross = scriptName(rawA) !== scriptName(rawB);
    var ta = normalize(hasIndic(rawA) ? transliterate(rawA.normalize("NFKC")) : rawA);
    var tb = normalize(hasIndic(rawB) ? transliterate(rawB.normalize("NFKC")) : rawB);
    var cls;
    if (ta.join(" ") === tb.join(" ") || ta.join("") === tb.join("")) cls = "FORMATTING_ONLY";
    else cls = classifyTokens(ta, tb);
    // A name written in two different scripts is never "just formatting": the records really differ.
    if (cross && cls === "FORMATTING_ONLY") cls = "SPELLING_VARIANT";
    return { cls: cls, severity: cls === "EXACT" || cls === "FORMATTING_ONLY" ? "ok" : cls === "DIFFERENT" ? "fail" : "warning", crossScript: cross };
  }

  /*
   * records: [{ key: "aadhaar", name: "..." }, ...]. Blank names are skipped.
   * Returns { pairs: [{a, b, cls, severity, crossScript}], worst: "ok"|"warning"|"fail"|"none" }
   */
  function checkRecords(records) {
    var filled = records.filter(function (r) { return r.name && r.name.trim(); });
    var pairs = [], worst = filled.length < 2 ? "none" : "ok", rank = { ok: 0, warning: 1, fail: 2 };
    for (var i = 0; i < filled.length; i++) {
      for (var j = i + 1; j < filled.length; j++) {
        var c = compare(filled[i].name, filled[j].name);
        pairs.push({ a: filled[i].key, b: filled[j].key, cls: c.cls, severity: c.severity, crossScript: c.crossScript });
        if (worst !== "none" && rank[c.severity] > rank[worst]) worst = c.severity;
      }
    }
    return { pairs: pairs, worst: worst, filled: filled.length };
  }

  return {
    CLASSES: CLASSES, normalize: normalize, compare: compare, checkRecords: checkRecords,
    editDistance: editDistance, similarity: similarity, transliterate: transliterate, hasIndic: hasIndic
  };
});
