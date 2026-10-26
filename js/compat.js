/*
 * Compatibility helpers for older phones (for example Android 9 with an old Chrome or WebView):
 * small polyfills, and a visible message if the app fails to start (instead of a blank page).
 */
(function () {
  "use strict";

  if (!Element.prototype.replaceChildren) {
    Element.prototype.replaceChildren = function () {
      while (this.firstChild) this.removeChild(this.firstChild);
      for (var i = 0; i < arguments.length; i++) {
        var n = arguments[i];
        this.appendChild(typeof n === "string" ? document.createTextNode(n) : n);
      }
    };
  }
  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
      var out = [];
      (function walk(a, d) {
        a.forEach(function (x) {
          if (Array.isArray(x) && d > 0) walk(x, d - 1); else out.push(x);
        });
      })(this, depth === undefined ? 1 : depth);
      return out;
    };
  }

  function show(msg) {
    var box = document.getElementById("boot-error");
    if (!box) {
      box = document.createElement("div");
      box.id = "boot-error";
      box.setAttribute("role", "alert");
      box.style.cssText = "margin:12px;padding:12px;border:3px solid #7f1d1d;background:#fee2e2;color:#7f1d1d;font:16px/1.4 sans-serif;";
      var main = document.getElementById("main");
      if (main && main.parentNode) main.parentNode.insertBefore(box, main); else document.body.appendChild(box);
    }
    var p = document.createElement("p");
    p.style.margin = "0 0 6px";
    p.textContent = msg;
    box.appendChild(p);
  }

  window.addEventListener("error", function (e) {
    show("Problem: " + (e.message || "script error") + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : ""));
  });

  window.addEventListener("load", function () {
    setTimeout(function () {
      var main = document.getElementById("main");
      if (main && !main.firstChild && !document.getElementById("boot-error")) {
        show("The app could not start. Please update Chrome, or open the single-file version (seva-sahayak-single.html).");
      }
    }, 800);
  });
})();
