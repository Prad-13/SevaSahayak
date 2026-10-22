# Seva Sahayak (prototype)

An assisted web app that helps people who may qualify for government schemes get **application-ready**:
check eligibility, prepare documents, pre-check name mismatches, and produce an application summary.

> **This is a college Design Thinking prototype. It is not an official or production app.**
> All rules are demo-simplified, results are illustrative, and the app never submits anything,
> never logs in anywhere and never scrapes or automates any government portal.

## How to run

Double-click `index.html`. That's it. Plain HTML, CSS and classic `<script>` tags: no framework, no build step,
no backend, no CDN, no fonts or images. Data files are `.js` files that assign to globals, so nothing is fetched.

Total payload is about 120 KB (`cat index.html css/* js/* data/*`), well under the 300 KB budget.

Run the tests (Node 18+, built-in runner, no install):

```bash
node --test tests/engine.test.mjs tests/mismatch.test.mjs tests/i18n.test.mjs tests/voice.test.mjs
```

Optional: `index.html?idle=10` shortens the inactivity wipe to 10 seconds, handy for demoing the warning.

## What it does

1. Language: English, Telugu, Hindi. All UI text comes from `data/i18n.js`.
2. Start screen with life-event tiles (they only narrow the starting set of schemes) and a privacy note.
3. Adaptive questions. Rules are three-valued (true / false / unknown). The next question is the unanswered
   attribute that appears in the most still-undecided schemes (tie-break: earliest required condition).
   "I don't know" is always allowed.
4. Results: Likely eligible / Needs a quick check / Not eligible (collapsed), each with a plain-language "why".
5. Document checklist with progress and generic "where to get it" guidance.
6. Name mismatch pre-check (names only, compared on-device, never any ID numbers).
7. Printable application summary with "Submission happens on the official website", a link to
   https://www.myscheme.gov.in, Copy and Print.
8. Helper mode for CSC operators ("Next person" wipes everything; a people-helped counter, a number only).
9. "Clear my details" on every screen and auto-wipe after 5 minutes of inactivity (with a 30 s warning).
10. "Demo metrics" panel (live numbers, see below).
11. Optional voice (off by default).

## Folder layout

```
index.html, css/style.css
js/app.js        state and screens
js/engine.js     three-valued eligibility + adaptive question selection (browser and Node)
js/mismatch.js   name normalisation and comparison (browser and Node)
js/voice.js      Web Speech API wrapper and spoken yes/no/number parsers
js/i18n.js       t() helper
js/metrics.js    demo metrics
data/schemes.js, documents.js, questions.js, i18n.js
tests/           Node tests
```

## How to add a scheme

1. Add any new document to `data/documents.js` (id, name in 3 languages, generic "where to get it").
2. Add an object to `SS_SCHEMES` in `data/schemes.js`:

```js
{
  id: "my_scheme",
  name: { en: "...", te: "...", hi: "..." },
  benefit: { en: "...", te: "...", hi: "..." },   // one line, no invented amounts
  tags: ["farming"],                               // matches a tile's tag in data/questions.js (SS_TILES)
  official_note: "demo-simplified, verify against official guidelines",
  required:   [ { attr: "age", op: "gte", value: 60 } ],     // ALL must be true
  exclusions: [ { attr: "income_tax_payer", op: "eq", value: true } ],  // NONE may be true
  documents: ["aadhaar", "bank_passbook"]
}
```

   Ops: `eq`, `gte`, `lte`, and `{ op: "or", conds: [ ... ] }` for "any of". Mark each rule with the comment
   `demo-simplified, verify against official guidelines`.
3. If you use a new attribute, add a question for it in `SS_QUESTIONS` (`type`: `number`, `yesno` or `choice`,
   with `text` and `label` in three languages).
4. Run the tests; the data-integrity test checks that every attribute has a question and every document exists.

## Demo metrics (honest numbers)

The panel computes everything from the current run:

- **Questions asked** vs **fixed-form length**: the number of distinct attributes across the candidate schemes
  (the schemes picked by the tile). The count over all five schemes (9) is shown alongside.
- **Time to result**: from the first question being shown to the results screen. It includes the user's thinking
  time, so it measures the whole interaction, not computing speed.
- **Rule data size**: size in KB of the schemes, questions, documents and tiles data as JSON.
- **Network requests**: calls made by the app's own code to `fetch`, XHR, `sendBeacon`, `WebSocket` and
  `EventSource` (wrapped at load), cross-checked against the browser's resource timeline. It should read 0.
  Loading the app's own local files at page start is not counted.

Reference runs from the engine (see `tests/` and `DEMO_SCRIPT.md`): Persona 1 with "check everything" asks
9 of 9 (no saving, every scheme is relevant to her); the same person with the "Lost my spouse" tile asks 4 of 4;
a 72-year-old asks 3 of 9. The saving comes from rejecting schemes early, so it is large for some people and zero for others.

## Voice and privacy

Voice is **off by default**. When someone turns it on, the app shows a notice first. It uses the browser's
Web Speech API (recognition in `te-IN`, `hi-IN`, `en-IN`) and `speechSynthesis` to read questions aloud.
Tap input is always available, and the mic and voice buttons are hidden if the browser lacks the API.

**"Nothing leaves the device" applies to this app's own code, but not to the browser's speech service.**
In some browsers (for example Chrome and Edge) speech recognition sends audio to the browser vendor's servers.
The app cannot control that, which is why the notice appears. Text-to-speech may also use online voices in some browsers.

Everything else is in-memory only: no localStorage, sessionStorage, cookies or analytics.

## Translation review needed

**The Telugu and Hindi strings are drafts and need review by a native speaker** before any real use. This covers
`data/i18n.js`, the question texts and labels in `data/questions.js`, and the names, benefits and "where to get it"
text in `data/schemes.js` and `data/documents.js`. Scheme names are transliterations or literal translations.

## Assumptions

- **Exclusions must be answered.** A scheme is "Likely eligible" only when all required conditions are true and
  all exclusions are false, so PM-KISAN asks about income tax and government service instead of assuming "no".
  (A literal "no exclusion is true" reading would mark PM-KISAN eligible without asking.)
- If the user answers "I don't know" to something a scheme needs and nothing can settle it, the scheme shows
  "Needs a quick check" and names what could not be confirmed.
- "Widowed" is only asked while a scheme that needs it (the widow pension) is still undecided, so it is naturally
  asked only when gender is female or unknown.
- Tiles filter by scheme tag: Farming → PM-KISAN, Lost my spouse → widow pension, Old age → old age pension and PM-JAY,
  Health → PM-JAY, Disability → disability pension, Not sure → everything. A narrowed set can hide a scheme you
  qualify for (for example a widow who farms should pick "Not sure" to see PM-KISAN).
- PM-JAY is "age 70 or more OR listed" per the brief (demo-simplified).
- Name comparison: honorifics `mr mrs ms smt sri shri late dr` are ignored. Tokens of three letters or fewer must
  match exactly to count as a spelling variant, and four-letter tokens may differ by one letter, to avoid calling
  different short names "variants". A phonetic key (x→ks, sh→s, ph→f, w→v, doubled letters) lets Laxmi match
  Lakshmi. An honorific-only difference counts as formatting. A different number of name words (for example
  "Ramesh Kumar" vs "Ramesh") is DIFFERENT.
- Telugu/Devanagari transliteration is the stretch goal: a simple rule-based mapping. Names in different scripts
  are never treated as "just formatting", they are flagged as a warning to check the spelling.
- "Clear my details" and the inactivity wipe keep the language, text size and helper settings (no personal data).
  "Next person" adds to the counter only if the previous person had answered at least one question.
- Fixing guidance for mismatches is generic and labelled "check locally". The app does not know which record is right.
- Emoji on the tiles are system emoji characters (no image files are shipped).

## Known limitations

- Rules are simplified and cover five schemes only. Real eligibility depends on the state and changes over time.
- No amounts, deadlines, helpline numbers or scheme-specific URLs are shown on purpose.
- Spoken numbers are understood as digits (in any of the three scripts) or English words; Telugu and Hindi number
  words are not parsed.
- Voice quality depends on the browser and installed voices; Telugu text-to-speech is often missing.
- Name comparison is a heuristic: it can miss real problems (a legal rule we don't know) and can't tell which record is correct.
- Inactivity is detected by pointer, keyboard, input and touch events only.
- Tested in a Chromium-based browser at 360 px width; other browsers and real low-end phones are untested.
