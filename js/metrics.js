/*
 * Demo metrics, measured live. Nothing here is stored or sent anywhere.
 * Network requests: we wrap the browser's request APIs (fetch, XHR, sendBeacon, WebSocket, EventSource)
 * at load time and count every call the app's own code makes. The expected number is 0.
 * (Loading the app's own local .js/.css files at page start is not counted, it is not a runtime request.)
 */
var SSMetrics = (function () {
  "use strict";
  var wrapped = 0, startedAt = null, resultMs = null;

  function count() { wrapped++; }

  if (typeof window !== "undefined") {
    if (window.fetch) {
      var origFetch = window.fetch;
      window.fetch = function () { count(); return origFetch.apply(this, arguments); };
    }
    if (window.XMLHttpRequest) {
      var origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function () { count(); return origOpen.apply(this, arguments); };
    }
    if (navigator.sendBeacon) {
      var origBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function () { count(); return origBeacon.apply(navigator, arguments); };
    }
    ["WebSocket", "EventSource"].forEach(function (name) {
      var Orig = window[name];
      if (!Orig) return;
      var Wrapped = function () { count(); return new (Function.prototype.bind.apply(Orig, [null].concat([].slice.call(arguments))))(); };
      Wrapped.prototype = Orig.prototype;
      window[name] = Wrapped;
    });
  }

  /* Cross-check with the browser's own resource timeline (fetch / XHR / beacon initiators only). */
  function observed() {
    if (typeof performance === "undefined" || !performance.getEntriesByType) return 0;
    return performance.getEntriesByType("resource").filter(function (e) {
      return e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest" || e.initiatorType === "beacon";
    }).length;
  }

  function networkRequests() { return Math.max(wrapped, observed()); }

  function ruleDataKB() {
    var json = JSON.stringify([SS_SCHEMES, SS_QUESTIONS, SS_DOCS, SS_TILES]);
    var bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(json).length : json.length;
    return bytes / 1024;
  }

  return {
    begin: function () { startedAt = performance.now(); resultMs = null; },
    end: function () { if (startedAt !== null && resultMs === null) resultMs = performance.now() - startedAt; },
    reset: function () { startedAt = null; resultMs = null; },
    unfinish: function () { resultMs = null; },
    resultMs: function () { return resultMs; },
    networkRequests: networkRequests,
    ruleDataKB: ruleDataKB
  };
})();
