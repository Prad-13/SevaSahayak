/* Inline line icons (no image files). Built with createElementNS, never innerHTML. 24x24 grid, drawn with currentColor. */
var SSIcons = (function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var DOC = "M7 3h8l4 4v14H7z M15 3v4h4";
  var PATHS = {
    // documents
    aadhaar: ["M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z", "M9 11.5a2 2 0 100-.01", "M5.5 16.5c.8-2.5 6.2-2.5 7 0", "M14.5 10h4 M14.5 14h4"],
    bank_passbook: ["M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z", "M5 17a3 3 0 013-3h11", "M9 8h6"],
    land_record: ["M3 18l6-8 4 5 3-3 5 6z", "M3 21h18"],
    age_proof: ["M5 5h14a2 2 0 012 2v13H3V7a2 2 0 012-2z", "M3 10h18 M8 3v4 M16 3v4", "M8 14h3 M13 14h3 M8 17h3"],
    bpl_proof: ["M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z", "M12 14.5a2.5 2.5 0 100-.01", "M6 9.5h.01 M18 14.5h.01"],
    spouse_death_certificate: [DOC, "M10 12h6 M10 16h4"],
    disability_certificate: [DOC, "M9.5 14.5l2 2 4-4"],
    ration_card: ["M4 10h16l-1.6 9H5.6z", "M8 10l3-5 M16 10l-3-5", "M9 14v2 M12 14v2 M15 14v2"],
    // generic fallbacks
    doc: [DOC, "M10 13h6 M10 17h4"],
    scheme: ["M3 10l9-6 9 6", "M5 10v8 M9 10v8 M15 10v8 M19 10v8", "M3 20h18"],
    // schemes
    pm_kisan: ["M12 21V9", "M12 9c-3 0-4-2-4-5 3 0 4 2 4 5z M12 9c3 0 4-2 4-5-3 0-4 2-4 5z", "M12 15c-3 0-4-2-4-4 M12 15c3 0 4-2 4-4"],
    ignwps: ["M12 2.5c1.6 2 2.2 3.4 0 5.5-2.2-2.1-1.6-3.5 0-5.5z", "M9 10h6v10a1 1 0 01-1 1h-4a1 1 0 01-1-1z"],
    ignoaps: ["M10 4.5a1.8 1.8 0 100-.01", "M10 8.5v5.5l-2 6.5 M10 14l3 6.5", "M15 11v9.5 M15 11a1.7 1.7 0 013.4 0"],
    igndps: ["M10 4a1.6 1.6 0 100-.01", "M10 7.5V13h4.5l2.5 5", "M8.5 15a4 4 0 104.5 5"],
    pmjay: ["M12 20.5s-7.5-4.6-7.5-10.5A4.2 4.2 0 0112 7.7 4.2 4.2 0 0119.5 10c0 5.9-7.5 10.5-7.5 10.5z", "M12 10v5 M9.5 12.5h5"]
  };

  function icon(name, fallback) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    (PATHS[name] || PATHS[fallback] || []).forEach(function (d) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
    });
    return svg;
  }

  return { icon: icon, has: function (n) { return n in PATHS; } };
})();
