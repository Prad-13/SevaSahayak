/*
 * Seva Sahayak: app state and screens. All state lives in memory only (no storage, no cookies, no network).
 */
(function () {
  "use strict";

  const E = SSEngine, M = SSMismatch, I = SSI18n, t = I.t;
  const NAME_KEYS = ["aadhaar", "bank", "land"];
  const STEP_OF = { start: 0, question: 1, results: 2, docs: 3, names: 4, summary: 5 };
  const STEP_KEYS = ["nav.start", "nav.questions", "nav.results", "nav.docs", "nav.names", "nav.summary"];

  /* Preferences that survive "Clear my details" (they hold no personal data). */
  const ui = { size: 0, helper: false, helped: 0, metricsOn: false, voiceOn: false, voiceNotice: false };

  /* Auto-wipe after inactivity. ?idle=<seconds> shortens it for demos and testing. */
  const idleParam = Number(new URLSearchParams(location.search).get("idle"));
  const IDLE_MS = (idleParam > 0 ? idleParam : 300) * 1000;
  const WARN_MS = Math.min(30000, IDLE_MS / 2);

  function fresh() {
    return {
      screen: "start", tile: null, cands: [], answers: {}, asked: [],
      docs: {}, names: { aadhaar: "", bank: "", land: "" }, nameResult: null, copyMsg: ""
    };
  }
  let s = fresh();

  const $ = (id) => document.getElementById(id);

  /* ---------- tiny DOM helper (text is always set as text, never as HTML) ---------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.append(c.nodeType ? c : document.createTextNode(c));
    });
    return el;
  }

  /* ---------- label helpers ---------- */
  const Q = SS_QUESTIONS;

  function attrLabel(attr) { return I.pick(Q[attr].label); }

  function answerText(attr, v) {
    if (v === undefined) return "—";
    if (v === E.UNKNOWN) return t("answer.unknown");
    if (v === true) return t("answer.yes");
    if (v === false) return t("answer.no");
    const q = Q[attr];
    if (q.options) {
      const o = q.options.find((x) => x.value === v);
      if (o) return I.pick(o.label);
    }
    return String(v);
  }

  function needText(c) {
    if (c.op === "eq") {
      if (c.value === true) return t("need.yes");
      if (c.value === false) return t("need.no");
      const o = (Q[c.attr].options || []).find((x) => x.value === c.value);
      return o ? I.pick(o.label) : String(c.value);
    }
    return t(c.op === "gte" ? "need.gte" : "need.lte", { n: c.value });
  }

  function condLabel(c) { return c.op === "or" ? c.conds.map((x) => attrLabel(x.attr)).join(" / ") : attrLabel(c.attr); }
  function condAnswer(c) {
    if (c.op === "or") return c.conds.map((x) => answerText(x.attr, s.answers[x.attr])).join(", ");
    return answerText(c.attr, s.answers[c.attr]);
  }
  function condNeed(c) {
    if (c.op === "or") return c.conds.map((x) => "(" + attrLabel(x.attr) + ": " + needText(x) + ")").join(" " + t("or") + " ");
    return needText(c);
  }

  /* Plain-language "why" lines built from the user's own answers. */
  function whyLines(scheme, status) {
    const lines = [];
    E.explain(scheme, s.answers).forEach((it) => {
      // an OR that is satisfied is explained by the alternative that satisfied it
      const c = it.cond.op === "or" && it.result === true ? it.cond.conds.find((x) => E.evalCond(x, s.answers) === true) : it.cond;
      const p = { label: condLabel(c), answer: condAnswer(c), need: condNeed(c) };
      let cls, text;
      if (it.kind === "required") {
        if (it.result === true) { cls = "ok"; text = t("why.met", p); }
        else if (it.result === false) { cls = "no"; text = t("why.failed", p); }
        else { cls = "unk"; text = t("why.unknown", p); }
      } else {
        if (it.result === true) { cls = "no"; text = t("why.exclTriggered", p); }
        else if (it.result === false) { cls = "ok"; text = t("why.met", p); }
        else { cls = "unk"; text = t("why.exclUnknown", p); }
      }
      // A rejected scheme only needs the reasons it was rejected.
      if (status === E.NOT_ELIGIBLE && cls !== "no") return;
      // e.g. "age at least 40" and "age at most 79" both read "Age: 54"; show it once
      if (lines.some((l) => l.text === text)) return;
      lines.push({ cls, text });
    });
    return lines;
  }

  /* ---------- chrome (header, language buttons, tools, steps) ---------- */
  let chromeBuilt = false;
  function updateChrome() {
    $("skip").textContent = t("skip");
    $("brand").textContent = t("app.title");
    $("disclaimer").textContent = t("disclaimer");
    document.title = t("app.title");
    document.documentElement.setAttribute("data-size", String(ui.size));

    const langs = $("langs");
    langs.setAttribute("aria-label", t("lang.label"));
    if (!chromeBuilt) {
      I.LANGS.forEach((l) => {
        langs.append(h("button", { type: "button", id: "lang-" + l.code, lang: l.code, onclick: () => { I.setLang(l.code); render(false, "lang-" + l.code); } }, l.label));
      });
      const tools = $("tools");
      tools.append(
        h("button", { type: "button", id: "size-btn", class: "small", onclick: () => { ui.size = (ui.size + 1) % 4; render(false, "size-btn"); } }),
        h("button", { type: "button", id: "next-btn", class: "small primary", onclick: nextPerson }),
        h("span", { id: "helper-count", class: "hint", role: "status" }),
        h("button", { type: "button", id: "clear-btn", class: "small danger", onclick: () => wipe(t("clear.done")) }),
        h("details", { id: "more", class: "more" },
          h("summary", { id: "more-sum" }),
          h("div", { class: "more-body" },
            h("button", { type: "button", id: "helper-btn", class: "small", onclick: () => { ui.helper = !ui.helper; render(false, "helper-btn"); } }),
            h("button", { type: "button", id: "metrics-btn", class: "small", onclick: () => { ui.metricsOn = !ui.metricsOn; render(false, "metrics-btn"); } }),
            h("button", { type: "button", id: "voice-btn", class: "small", onclick: toggleVoice })))
      );
      chromeBuilt = true;
    }
    $("more-sum").textContent = "⋯ " + t("more");
    $("helper-btn").textContent = t("helper.toggle");
    $("helper-btn").setAttribute("aria-pressed", String(ui.helper));
    $("next-btn").textContent = t("helper.next");
    $("next-btn").hidden = !ui.helper;
    $("helper-count").textContent = t("helper.count", { n: ui.helped });
    $("helper-count").hidden = !ui.helper;
    $("metrics-btn").textContent = t("metrics.toggle");
    $("metrics-btn").setAttribute("aria-pressed", String(ui.metricsOn));
    $("voice-btn").textContent = ui.voiceOn ? t("voice.off") : t("voice.toggle");
    $("voice-btn").setAttribute("aria-pressed", String(ui.voiceOn));
    $("voice-btn").hidden = !(SSVoice.recognitionSupported() || SSVoice.speechSupported());
    I.LANGS.forEach((l) => $("lang-" + l.code).setAttribute("aria-pressed", String(l.code === I.getLang())));
    $("size-btn").textContent = "A" + "+".repeat(Math.min(ui.size + 1, 3));
    $("size-btn").setAttribute("aria-label", t("size.label") + ". " + t("size." + ui.size));
    $("clear-btn").textContent = t("clear");

    const cur = STEP_OF[s.screen];
    const steps = $("steps");
    steps.replaceChildren(...STEP_KEYS.map((k, i) => h("li", { "aria-current": i === cur ? "step" : null, class: i < cur ? "done" : null }, h("span", { class: "num", "aria-hidden": "true", text: String(i + 1) }), h("span", { class: "lbl", text: t(k) }))));
  }

  let toastTimer = null;
  function showToast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 4000);
  }

  /* ---------- navigation / render ---------- */
  function go(screen) { s.screen = screen; render(true); }

  function render(focusHeading, focusId) {
    // no question left to ask means the results screen, so the step indicator must say so too
    if (s.screen === "question" && E.nextAttribute(s.cands, s.answers) === null) s.screen = "results";
    updateChrome();
    const main = $("main");
    main.replaceChildren();
    const screens = { start: renderStart, question: renderQuestion, results: renderResults, docs: renderDocs, names: renderNames, summary: renderSummary };
    const heading = screens[s.screen](main);
    if (ui.voiceNotice) main.prepend(voiceNoticeBox());
    renderMetrics();
    if (ui.voiceOn && s.screen === "question") speakQuestion();
    if (focusId && $(focusId)) $(focusId).focus({ preventScroll: true });
    else if (focusHeading && heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  function wipe(message) {
    SSVoice.stop();
    SSMetrics.reset();
    s = fresh();
    ui.voiceNotice = false;
    hideIdleBanner();
    render(true);
    if (message) showToast(message);
  }

  /* ---------- 8. helper mode ---------- */
  function nextPerson() {
    if (s.asked.length > 0) ui.helped++; // a number only, no data kept
    wipe();
  }

  /* ---------- 9. inactivity wipe ---------- */
  let warnTimer = null, wipeTimer = null, countTimer = null;

  function hasData() {
    return s.screen !== "start" || s.asked.length > 0 || Object.keys(s.docs).length > 0 || NAME_KEYS.some((k) => s.names[k]);
  }

  function hideIdleBanner() {
    clearInterval(countTimer);
    $("idle-banner").hidden = true;
  }

  function showIdleWarning() {
    if (!hasData()) return;
    let left = Math.round(WARN_MS / 1000);
    const banner = $("idle-banner");
    const msg = h("span", { text: t("idle.warn", { s: left }) });
    banner.replaceChildren(msg, h("button", { type: "button", class: "primary", onclick: resetIdle }, t("idle.keep")));
    banner.hidden = false;
    clearInterval(countTimer);
    countTimer = setInterval(() => { left = Math.max(0, left - 1); msg.textContent = t("idle.warn", { s: left }); }, 1000);
  }

  function resetIdle() {
    hideIdleBanner();
    clearTimeout(warnTimer);
    clearTimeout(wipeTimer);
    warnTimer = setTimeout(showIdleWarning, IDLE_MS - WARN_MS);
    wipeTimer = setTimeout(() => { if (hasData()) wipe(t("idle.wiped")); else resetIdle(); }, IDLE_MS);
  }

  ["pointerdown", "keydown", "input", "touchstart"].forEach((ev) => document.addEventListener(ev, () => {
    if (!$("idle-banner").hidden) return; // once warned, only the "Keep my details" button keeps them
    resetIdle();
  }, true));

  /* ---------- 10. demo metrics ---------- */
  function renderMetrics() {
    const box = $("metrics");
    box.hidden = !ui.metricsOn;
    if (!ui.metricsOn) return;
    const asked = s.asked.length;
    const fixed = s.cands.length ? E.fixedFormLength(s.cands) : 0;
    const ms = SSMetrics.resultMs();
    const fixedAll = E.fixedFormLength(SS_SCHEMES);
    const row = (k, v) => [h("dt", { text: k }), h("dd", { text: v })];
    box.replaceChildren(
      h("h2", { text: t("metrics.title") }),
      h("dl", null,
        row(t("metrics.questions"), String(asked)),
        row(t("metrics.fixed"), s.cands.length ? fixed + " (" + t("metrics.fixedAll") + ": " + fixedAll + ")" : "—"),
        row(t("metrics.saved"), s.cands.length ? String(fixed - asked) : "—"),
        row(t("metrics.time"), ms === null ? t("metrics.na") : (ms / 1000).toFixed(1) + " s"),
        row(t("metrics.size"), SSMetrics.ruleDataKB().toFixed(1) + " KB"),
        row(t("metrics.net"), String(SSMetrics.networkRequests()))),
      h("p", { class: "hint", text: t("metrics.note") }));
  }

  /* ---------- 11. voice (optional, off by default) ---------- */
  function voiceNoticeBox() {
    return h("section", { class: "notice", role: "alertdialog", "aria-labelledby": "vn-h" },
      h("h3", { id: "vn-h", text: t("voice.toggle") }),
      h("p", { text: t("voice.notice") }),
      h("div", { class: "row" },
        h("button", { type: "button", class: "primary", id: "vn-ok", onclick: enableVoice }, t("voice.enable")),
        h("button", { type: "button", onclick: () => { ui.voiceNotice = false; render(false, "voice-btn"); } }, t("voice.cancel"))));
  }

  function toggleVoice() {
    if (ui.voiceOn) { ui.voiceOn = false; SSVoice.stop(); render(false, "voice-btn"); return; }
    ui.voiceNotice = true;
    render(false, "vn-ok");
  }

  function enableVoice() {
    ui.voiceOn = true;
    ui.voiceNotice = false;
    render(false, "voice-btn");
    if (s.screen === "start") SSVoice.speak(t("start.intro"), I.speechLang());
  }

  function speakQuestion() {
    const el = $("qtext");
    if (el) SSVoice.speak(el.textContent, I.speechLang());
  }

  function listenForAnswer(attr) {
    const status = $("voice-status");
    status.textContent = t("voice.listening");
    SSVoice.listen(I.speechLang(), (alts) => {
      let value = null, heard = alts[0];
      for (const a of alts) {
        const v = SSVoice.parseAnswer(Q[attr], a);
        if (v !== null) { value = v; heard = a; break; }
      }
      if (value === null) { status.textContent = t("voice.heard", { t: heard }) + " " + t("voice.unclear"); return; }
      showToast(t("voice.heard", { t: heard }));
      answer(attr, value);
    }, () => { status.textContent = t("voice.error"); }, () => {
      if (status.textContent === t("voice.listening")) status.textContent = "";
    });
  }

  function voiceControls(attr) {
    if (!ui.voiceOn) return null;
    return h("div", { class: "row noprint" },
      SSVoice.recognitionSupported() ? h("button", { type: "button", id: "mic-btn", onclick: () => listenForAnswer(attr) }, "🎤 " + t("voice.mic")) : null,
      SSVoice.speechSupported() ? h("button", { type: "button", onclick: speakQuestion }, "🔊 " + t("voice.read")) : null,
      h("p", { id: "voice-status", class: "hint", role: "status", "aria-live": "polite" }));
  }

  /* ---------- 1. start ---------- */
  function renderStart(main) {
    main.append(h("p", { class: "lead", text: t("app.tagline") }));
    const heading = h("h2", { text: t("start.heading") });
    main.append(heading, h("p", { class: "hint", text: t("start.sub") }));
    main.append(h("div", { class: "tiles" }, SS_TILES.map((tile) =>
      h("button", { type: "button", class: "tile" + (tile.id === "all" ? " wide" : ""), onclick: () => startWith(tile) },
        h("span", { class: "icon", "aria-hidden": "true", text: tile.icon }),
        h("span", { text: I.pick(tile.label) })))));
    {
      const tts = SSVoice.speechSupported(), stt = SSVoice.recognitionSupported();
      const vbox = h("section", { class: "notice", "aria-labelledby": "vbox-h" }, h("h3", { id: "vbox-h", text: "\uD83C\uDFA4 " + t("voice.toggle") }));
      if (tts || stt) {
        vbox.append(h("p", { class: "hint", text: t("voice.status", { tts: tts ? t("voice.yes") : t("voice.no"), stt: stt ? t("voice.yes") : t("voice.no") }) }));
        if (stt && window.isSecureContext === false) vbox.append(h("p", { class: "hint", text: t("voice.secure") }));
        vbox.append(h("div", { class: "row" },
          h("button", { type: "button", id: "speak-btn", onclick: () => { if (ui.voiceOn) SSVoice.speak(t("start.intro"), I.speechLang()); else toggleVoice(); } },
            "\uD83C\uDFA4 " + t("start.speak"))));
      } else {
        vbox.append(h("p", { class: "hint", text: t("voice.none") }));
      }
      main.append(vbox);
    }
    main.append(h("section", { class: "notice", "aria-labelledby": "priv-h" },
      h("h3", { id: "priv-h", text: t("privacy.title") }),
      h("p", { text: t("privacy.body") })));
    return heading;
  }

  function startWith(tile) {
    s.tile = tile.id;
    s.cands = E.candidates(SS_SCHEMES, tile.tag);
    s.answers = {};
    s.asked = [];
    SSMetrics.begin();
    go("question");
  }

  /* ---------- 3. adaptive questions ---------- */
  function renderQuestion(main) {
    const attr = E.nextAttribute(s.cands, s.answers);
    if (attr === null) { s.screen = "results"; return renderResults(main); }
    const q = Q[attr];
    const box = h("section", { class: "qcard" });
    main.append(box);
    const heading = h("h2", null,
      h("span", { class: "qnum", text: t("q.number", { n: s.asked.length + 1 }) }),
      h("span", { class: "qtext", id: "qtext", text: I.pick(q.text) }));
    box.append(heading);

    const dontKnow = h("button", { type: "button", class: "ghost unk", id: "ans-unknown", onclick: () => answer(attr, E.UNKNOWN) }, "? " + t("q.dontknow"));
    if (q.type === "yesno") {
      box.append(h("div", { class: "answers yn" },
        h("button", { type: "button", class: "primary", id: "ans-yes", onclick: () => answer(attr, true) }, "✓ " + t("q.yes")),
        h("button", { type: "button", class: "primary", id: "ans-no", onclick: () => answer(attr, false) }, "✗ " + t("q.no")),
        dontKnow));
    } else if (q.type === "choice") {
      box.append(h("div", { class: "answers" },
        q.options.map((o) => h("button", { type: "button", class: "primary", id: "ans-" + o.value, onclick: () => answer(attr, o.value) }, I.pick(o.label))),
        dontKnow));
    } else {
      const err = h("p", { class: "error", id: "q-err", role: "alert" });
      const input = h("input", { type: "number", inputmode: "numeric", id: "q-input", min: q.min, max: q.max, step: "1", "aria-describedby": "q-err", autocomplete: "off" });
      const form = h("form", { novalidate: true, onsubmit: (ev) => {
        ev.preventDefault();
        const raw = input.value.trim();
        const n = Number(raw);
        if (raw === "" || !Number.isInteger(n) || n < q.min || n > q.max) {
          err.textContent = t("q.error", { min: q.min, max: q.max });
          input.setAttribute("aria-invalid", "true");
          input.focus();
          return;
        }
        answer(attr, n);
      } },
        h("div", { class: "field" }, h("label", { for: "q-input", text: t("q.numberLabel") }), input, err),
        h("div", { class: "row" }, h("button", { type: "submit", class: "primary" }, t("q.next")), dontKnow));
      box.append(form);
    }
    const vc = voiceControls(attr);
    if (vc) box.append(vc);
    box.append(h("p", { class: "hint", text: t("q.hint") }));
    main.append(h("div", { class: "row noprint" }, h("button", { type: "button", onclick: undoLast }, "← " + t("back"))));
    return heading;
  }

  function answer(attr, value) {
    s.answers[attr] = value;
    s.asked.push(attr);
    render(true);
  }

  function undoLast() {
    if (s.asked.length === 0) { wipe(); return; }
    const a = s.asked.pop();
    delete s.answers[a];
    SSMetrics.unfinish();
    s.screen = "question";
    render(true);
  }

  /* ---------- 4. results ---------- */
  function schemeCard(r) {
    const sc = r.scheme;
    const lines = whyLines(sc, r.status);
    const card = h("article", { class: "card" },
      h("div", { class: "card-head" }, SSIcons.icon(sc.id, "scheme"), h("h3", { text: I.pick(sc.name) })),
      h("p", null, h("span", { class: "badge " + r.status },
        h("span", { "aria-hidden": "true", text: r.status === E.ELIGIBLE ? "✓" : r.status === E.NOT_ELIGIBLE ? "✗" : "?" }),
        t("status." + r.status))),
      h("p", { text: I.pick(sc.benefit) }),
      h("p", { class: "hint", text: t("results.why") + ":" }),
      h("ul", { class: "why" }, lines.map((l) => h("li", { class: l.cls, text: l.text }))));
    if (r.status === E.NEEDS_A_QUICK_CHECK) {
      const labels = E.blockers(sc, s.answers).map(attrLabel).join(", ");
      card.append(h("p", { text: t("why.check", { list: labels }) }));
    }
    return card;
  }

  function renderResults(main) {
    SSMetrics.end();
    const heading = h("h2", { text: t("results.title") });
    main.append(heading, h("p", { class: "hint", text: t("results.intro") }));
    const all = E.results(s.cands, s.answers);
    const rank = { ELIGIBLE: 0, NEEDS_A_QUICK_CHECK: 1 };
    const active = all.filter((r) => r.status !== E.NOT_ELIGIBLE).sort((a, b) => rank[a.status] - rank[b.status]);
    const rejected = all.filter((r) => r.status === E.NOT_ELIGIBLE);
    const countOf = (st) => all.filter((r) => r.status === st).length;
    main.append(h("div", { class: "chips" }, [E.ELIGIBLE, E.NEEDS_A_QUICK_CHECK, E.NOT_ELIGIBLE].map((st) =>
      h("span", { class: "chip " + st }, h("strong", { text: String(countOf(st)) }), " " + t("status." + st)))));
    active.forEach((r) => main.append(schemeCard(r)));
    if (rejected.length) {
      main.append(h("details", null,
        h("summary", { text: t("results.notEligible", { n: rejected.length }) }),
        rejected.map(schemeCard)));
    }
    main.append(h("div", { class: "row noprint" },
      h("button", { type: "button", onclick: undoLast }, "← " + t("back")),
      h("button", { type: "button", class: "primary", onclick: () => go("docs") }, t("results.next")),
      h("button", { type: "button", onclick: () => wipe() }, t("results.restart"))));
    return heading;
  }

  /* ---------- 5. document checklist ---------- */
  function neededDocs() { return E.documentUnion(s.cands, s.answers); }
  function docById(id) { return SS_DOCS.find((d) => d.id === id); }
  function schemeNames(ids) {
    const names = ids.map((id) => I.pick(SS_SCHEMES.find((x) => x.id === id).name));
    return names.length > 3 ? names.slice(0, 3).join(", ") + " " + t("docs.more", { n: names.length - 3 }) : names.join(", ");
  }

  function renderDocs(main) {
    const heading = h("h2", { text: t("docs.title") });
    main.append(heading, h("p", { class: "hint", text: t("docs.intro") }));
    const list = neededDocs();
    if (!list.length) main.append(h("p", { text: t("docs.none") }));
    const haveCount = list.filter((d) => s.docs[d.id] === true).length;
    main.append(h("p", { id: "doc-progress-label", class: "qnum", text: t("docs.progress", { x: haveCount, y: list.length }) }),
      h("progress", { class: "progress", max: list.length, value: haveCount, "aria-labelledby": "doc-progress-label" }));
    list.forEach((d) => {
      const doc = docById(d.id);
      const state = s.docs[d.id];
      const set = (v) => { s.docs[d.id] = v; render(false, "doc-" + d.id + (v ? "-have" : "-miss")); };
      const card = h("article", { class: "card docrow" },
        h("div", { class: "card-head" }, SSIcons.icon(d.id, "doc"), h("h3", { text: I.pick(doc.name) })),
        h("p", { class: "hint", text: t("docs.for", { list: schemeNames(d.schemes) }) }),
        h("div", { class: "row" },
          h("button", { type: "button", id: "doc-" + d.id + "-have", "aria-pressed": String(state === true), onclick: () => set(true) }, t("docs.have")),
          h("button", { type: "button", id: "doc-" + d.id + "-miss", "aria-pressed": String(state === false), onclick: () => set(false) }, t("docs.donthave"))));
      if (state === false) {
        card.append(h("div", { class: "guide" }, h("strong", { text: t("docs.where") + ": " }), I.pick(doc.where)));
      }
      main.append(card);
    });
    main.append(h("div", { class: "row noprint" },
      h("button", { type: "button", onclick: () => go("results") }, "← " + t("back")),
      h("button", { type: "button", class: "primary", onclick: () => go("names") }, t("docs.next"))));
    return heading;
  }

  /* ---------- 6. mismatch pre-check ---------- */
  function renderNames(main) {
    const heading = h("h2", { text: t("names.title") });
    main.append(heading, h("p", { text: t("names.intro") }));
    NAME_KEYS.forEach((k) => {
      main.append(h("div", { class: "field" },
        h("label", { for: "name-" + k, text: t("names." + k) }),
        h("input", { type: "text", id: "name-" + k, value: s.names[k], autocomplete: "off", autocapitalize: "off", spellcheck: "false",
          oninput: (ev) => { s.names[k] = ev.target.value; } })));
    });
    main.append(h("div", { class: "row" }, h("button", { type: "button", class: "primary", onclick: checkNames }, t("names.check"))));

    const box = h("section", { id: "names-result", tabindex: "-1", "aria-live": "polite" });
    const r = s.nameResult;
    if (r) {
      if (r.filled < 2) box.append(h("p", { class: "error", text: t("names.need2") }));
      else {
        if (r.worst === "ok") box.append(h("p", null, h("span", { class: "badge ok", text: "✓ " + t("sev.ok") }), " " + t("names.allOk")));
        const involved = [];
        r.pairs.forEach((p) => {
          box.append(h("article", { class: "card" },
            h("p", null, h("span", { class: "badge " + p.severity, text: t("sev." + p.severity) }), " ",
              h("strong", { text: t("names.pair", { a: t("names." + p.a), b: t("names." + p.b) }) })),
            h("p", { text: t("class." + p.cls) }),
            p.crossScript ? h("p", { class: "hint", text: t("class.cross") }) : null));
          if (p.severity !== "ok") [p.a, p.b].forEach((k) => { if (involved.indexOf(k) < 0) involved.push(k); });
        });
        if (involved.length) {
          box.append(h("div", { class: "notice" },
            h("h3", { text: t("fix.title") }),
            h("ul", null, NAME_KEYS.filter((k) => involved.indexOf(k) >= 0).map((k) => h("li", { text: t("fix." + k) }))),
            h("p", { class: "hint", text: t("fix.hint") })));
        }
      }
    }
    main.append(box);
    main.append(h("div", { class: "row noprint" },
      h("button", { type: "button", onclick: () => go("docs") }, "← " + t("back")),
      h("button", { type: "button", class: "primary", onclick: () => go("summary") }, t("names.next"))));
    return heading;
  }

  function checkNames() {
    s.nameResult = M.checkRecords(NAME_KEYS.map((k) => ({ key: k, name: s.names[k] })));
    render(false, "names-result");
  }

  /* ---------- 7. summary ---------- */
  function summarySections() {
    const sections = [];
    sections.push({ title: t("summary.answers"), items: s.asked.map((a) => attrLabel(a) + ": " + answerText(a, s.answers[a])) });
    const res = E.results(s.cands, s.answers);
    const active = res.filter((r) => r.status !== E.NOT_ELIGIBLE);
    const items = active.map((r) => I.pick(r.scheme.name) + " – " + t("status." + r.status));
    if (res.length > active.length) items.push(t("summary.notEligibleCount", { n: res.length - active.length }));
    sections.push({ title: t("summary.matched"), items: items });
    const docs = neededDocs().map((d) => {
      const st = s.docs[d.id];
      return I.pick(docById(d.id).name) + " – " + (st === true ? t("summary.have") : st === false ? t("summary.missing") : t("summary.notChecked"));
    });
    sections.push({ title: t("summary.docs"), items: docs.length ? docs : [t("summary.none")] });
    const nr = s.nameResult;
    const nameItems = !nr || nr.filled < 2 ? [t("summary.notChecked")]
      : nr.pairs.map((p) => t("names.pair", { a: t("names." + p.a), b: t("names." + p.b) }) + " – " + t("sev." + p.severity) + ": " + t("class." + p.cls));
    sections.push({ title: t("summary.names"), items: nameItems });
    return sections;
  }

  function summaryText() {
    const out = [t("app.title") + " – " + t("summary.title"), t("summary.generated"), ""];
    summarySections().forEach((sec) => {
      out.push(sec.title);
      sec.items.forEach((i) => out.push("- " + i));
      out.push("");
    });
    out.push(t("summary.official"));
    return out.join("\n");
  }

  function copySummary() {
    const text = summaryText();
    const done = (ok) => { s.copyMsg = ok ? t("summary.copied") : t("summary.copyFail"); showToast(s.copyMsg); };
    const fallback = () => {
      const ta = h("textarea", { "aria-hidden": "true", style: "position:fixed;left:-999px" });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  }

  function renderSummary(main) {
    const heading = h("h2", { text: t("summary.title") });
    main.append(heading);
    const art = h("article", { class: "summary" }, h("p", { class: "hint", text: t("summary.generated") }));
    summarySections().forEach((sec) => {
      art.append(h("section", null, h("h3", { text: sec.title }), h("ul", null, sec.items.map((i) => h("li", { text: i })))));
    });
    art.append(h("p", { class: "official", text: t("summary.official") }));
    main.append(art);
    main.append(h("div", { class: "row noprint" },
      h("button", { type: "button", onclick: copySummary }, t("summary.copy")),
      h("button", { type: "button", onclick: () => window.print() }, t("summary.print"))));
    main.append(h("div", { class: "row noprint" },
      h("button", { type: "button", onclick: () => go("names") }, "← " + t("back"))));
    return heading;
  }

  /* ---------- boot ---------- */
  render(false);
  resetIdle();
})();
