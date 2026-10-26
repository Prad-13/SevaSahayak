/*
 * Optional voice: Web Speech API for answering, speechSynthesis for reading questions aloud.
 * Parsers are pure functions (also run under Node for tests). Off by default; the UI shows a notice first.
 * PRIVACY: speech recognition in some browsers sends audio to the browser vendor's servers.
 * This file itself makes no network requests.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(root);
  else root.SSVoice = factory(root);
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  var UNKNOWN = "?";

  var PUNCT;
  try { PUNCT = new RegExp("[^\\p{L}\\p{N}\\p{M}\\s]", "gu"); }
  catch (e) { PUNCT = /[^\w\sÀ-ɏऀ-ॿఀ-౿]/g; }

  function tokens(text) {
    return String(text || "").normalize("NFKC").toLowerCase().replace(PUNCT, " ").split(/\s+/).filter(Boolean);
  }
  function flat(text) { return " " + tokens(text).join(" ") + " "; }

  var UNKNOWN_PHRASES = ["dont know", "don t know", "do not know", "not sure", "no idea", "idk", "teliyadu", "teliyadhu",
    "pata nahi", "pata nahin", "pata nhi", "malum nahi", "maloom nahi", "నాకు తెలియదు", "తెలియదు", "पता नहीं", "पता नही", "नहीं पता", "मालूम नहीं"];
  var YES = ["yes", "yeah", "yep", "yup", "avunu", "avnu", "awunu", "haan", "han", "haa", "ha", "hanji", "అవును", "అవునండి", "हाँ", "हां", "हा", "जी"];
  var NO = ["no", "nope", "kaadu", "kadu", "kaadhu", "ledu", "nahin", "nahi", "nahee", "కాదు", "లేదు", "नहीं", "नही", "ना"];

  /* true | false | "?" | null (not understood) */
  function parseYesNo(text) {
    var f = flat(text), i;
    for (i = 0; i < UNKNOWN_PHRASES.length; i++) if (f.indexOf(" " + UNKNOWN_PHRASES[i] + " ") >= 0) return UNKNOWN;
    var toks = tokens(text);
    for (i = 0; i < toks.length; i++) {
      if (YES.indexOf(toks[i]) >= 0) return true;
      if (NO.indexOf(toks[i]) >= 0) return false;
    }
    return null;
  }

  var ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
    thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
  var TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

  function asciiDigits(text) {
    return String(text || "").normalize("NFKC").replace(/[०-९]/g, function (d) { return String(d.charCodeAt(0) - 0x0966); })
      .replace(/[౦-౯]/g, function (d) { return String(d.charCodeAt(0) - 0x0C66); });
  }

  /* Digits (ASCII, Devanagari, Telugu) or English number words up to 119. null if none. */
  function parseNumber(text) {
    var m = asciiDigits(text).match(/\d+/);
    if (m) return parseInt(m[0], 10);
    var toks = tokens(text), total = null, i, w;
    for (i = 0; i < toks.length; i++) {
      w = toks[i];
      if (w in TENS) total = (total || 0) + TENS[w];
      else if (w in ONES) total = (total || 0) + ONES[w];
      else if (w === "hundred") total = (total || 1) * 100;
    }
    return total;
  }

  var CHOICE_WORDS = {
    female: ["female", "woman", "women", "lady", "girl", "mahila", "stree", "aurat", "ammayi", "ఆడ", "స్త్రీ", "మహిళ", "महिला", "स्त्री", "औरत"],
    male: ["male", "man", "men", "boy", "purush", "aadmi", "magavaru", "మగ", "పురుషుడు", "पुरुष", "आदमी"],
    other: ["other", "others", "transgender", "ఇతరులు", "अन्य"]
  };

  function parseChoice(text, options) {
    var f = flat(text), i, k, j;
    for (i = 0; i < UNKNOWN_PHRASES.length; i++) if (f.indexOf(" " + UNKNOWN_PHRASES[i] + " ") >= 0) return UNKNOWN;
    var toks = tokens(text);
    for (i = 0; i < toks.length; i++) {
      for (k = 0; k < options.length; k++) {
        var words = CHOICE_WORDS[options[k].value] || [];
        if (words.indexOf(toks[i]) >= 0) return options[k].value;
        for (j in options[k].label) if (tokens(options[k].label[j]).indexOf(toks[i]) >= 0) return options[k].value;
      }
    }
    return null;
  }

  /* Parse a spoken answer for a question definition from data/questions.js. null if not understood. */
  function parseAnswer(q, text) {
    if (q.type === "yesno") return parseYesNo(text);
    if (q.type === "number") {
      var u = parseYesNo(text);
      if (u === UNKNOWN) return UNKNOWN;
      var n = parseNumber(text);
      return n !== null && n >= q.min && n <= q.max ? n : null;
    }
    if (q.type === "choice") return parseChoice(text, q.options);
    return null;
  }

  /* ---- browser side ---- */
  var Rec = root && (root.SpeechRecognition || root.webkitSpeechRecognition);
  var active = null;

  function recognitionSupported() { return !!Rec; }
  function speechSupported() { return !!(root && root.speechSynthesis && root.SpeechSynthesisUtterance); }

  function listen(lang, onText, onError, onEnd) {
    stopListening();
    var r = new Rec();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = function (ev) {
      var alts = [], res = ev.results[0];
      for (var i = 0; i < res.length; i++) alts.push(res[i].transcript);
      onText(alts);
    };
    r.onerror = function (ev) { onError(ev.error || "error"); };
    r.onend = function () { active = null; onEnd(); };
    active = r;
    try { r.start(); } catch (e) { active = null; onError("start-failed"); }
  }

  function stopListening() {
    if (active) { try { active.abort(); } catch (e) { /* ignore */ } active = null; }
  }

  function speak(text, lang) {
    if (!speechSupported()) return;
    root.speechSynthesis.cancel();
    var u = new root.SpeechSynthesisUtterance(text);
    u.lang = lang;
    root.speechSynthesis.speak(u);
  }

  function stop() {
    stopListening();
    if (speechSupported()) root.speechSynthesis.cancel();
  }

  return {
    parseYesNo: parseYesNo, parseNumber: parseNumber, parseChoice: parseChoice, parseAnswer: parseAnswer,
    recognitionSupported: recognitionSupported, speechSupported: speechSupported,
    listen: listen, speak: speak, stop: stop, stopListening: stopListening
  };
});
