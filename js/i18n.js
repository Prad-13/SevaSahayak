/* Tiny i18n helper. All text lives in data/i18n.js (SS_I18N); data files carry their own en/te/hi fields. */
var SSI18n = (function () {
  "use strict";
  var LANGS = [
    { code: "en", label: "English", speech: "en-IN" },
    { code: "te", label: "తెలుగు", speech: "te-IN" },
    { code: "hi", label: "हिन्दी", speech: "hi-IN" }
  ];
  var lang = "en";

  function t(key, params) {
    var table = SS_I18N[lang] || SS_I18N.en;
    var s = table[key];
    if (s === undefined) s = SS_I18N.en[key];
    if (s === undefined) return key;
    return params ? s.replace(/\{(\w+)\}/g, function (m, k) { return k in params ? params[k] : m; }) : s;
  }

  /* Pick the current language from a {en,te,hi} object, falling back to English. */
  function pick(obj) { return obj[lang] || obj.en; }

  function setLang(code) {
    lang = code;
    document.documentElement.lang = code;
  }

  function speechLang() {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === lang) return LANGS[i].speech;
    return "en-IN";
  }

  return { LANGS: LANGS, t: t, pick: pick, setLang: setLang, getLang: function () { return lang; }, speechLang: speechLang };
})();
