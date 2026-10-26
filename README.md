# Seva Sahayak (prototype)

An assisted web app that helps people who may qualify for government schemes get **application-ready**:
check eligibility, prepare documents, pre-check name mismatches, and produce an application summary.

> **This is a college Design Thinking prototype. It is not an official or production app.**
> All rules are demo-simplified, results are illustrative, and the app never submits anything,
> never logs in anywhere and never scrapes or automates any government portal.

## How to run

Double-click `index.html`. That's it. Plain HTML, CSS and classic `<script>` tags: no framework, no build step,
no backend, no CDN, no fonts or images. Data files are `.js` files that assign to globals, so nothing is fetched.

Total payload is about 200 KB (`index.html`, `css/`, `js/`, `data/`), under the 300 KB budget.

Run the tests (Node 18+, built-in runner, no install):

```bash
node --test tests/engine.test.mjs tests/mismatch.test.mjs tests/i18n.test.mjs tests/voice.test.mjs
```

Optional: `index.html?idle=10` shortens the inactivity wipe to 10 seconds, handy for demoing the warning.

## Sample database (50 schemes)

`data/schemes.js` holds a sample of **50 national schemes** (farming, housing, women and children, work and business,
education, money and food, older adults, disability). Run `node tools/export-csv.mjs` to produce:

- `SCHEMES_SAMPLE.csv`: the 50 schemes in plain language (rules, exclusions, documents) with empty columns for
  "Checked by", "Official page checked" and "Notes". **Every scheme is marked UNVERIFIED.**
- `TELUGU_REVIEW.csv`: every Telugu string next to its English source, with a column for the corrected Telugu.

**Important:** the rules were drafted from general knowledge, not checked against each scheme's official page, and real
criteria change with time and state. Income limits use `household_income_lakh` (yearly income rounded up to a whole lakh),
so they are approximate. Before presenting any result as correct, someone must check each row against the official
scheme page (search the scheme name on https://www.myscheme.gov.in) and fill in the CSV. State schemes are not included,
because their names and rules change with each government; add them with the steps below once you pick a state.

## What it does

1. Language: English, Telugu, Hindi. All UI text comes from `data/i18n.js`.
2. Start screen with life-event tiles (they only narrow the starting set of schemes) and a privacy note.
3. Adaptive questions (28 possible questions across the 50 schemes; a person usually answers fewer, e.g. 15 to 24). Rules are three-valued (true / false / unknown). The next question is the unanswered
   attribute that appears in the most still-undecided schemes (tie-break: earliest required condition).
   "I don't know" is always allowed.
4. Results: Likely eligible / Needs a quick check / Not eligible (collapsed), each with a plain-language "why".
5. Document checklist with progress and generic "where to get it" guidance.
6. Name mismatch pre-check (names only, compared on-device, never any ID numbers).
7. Printable application summary with the line "Submission happens on the official website", plus Copy and Print.
   The app has no link to any government site: the person applies on the official website themselves.
8. Helper mode for CSC operators ("Next person" wipes everything; a people-helped counter, a number only).
9. "Clear my details" on every screen and auto-wipe after 5 minutes of inactivity (with a 30 s warning).
10. "Demo metrics" panel (live numbers, see below).
11. Optional voice (off by default).
12. Text size button cycles four levels; the largest (A+++) is a simplified large-print layout: 170% text, one column, taller buttons.

## Folder layout

```
index.html, css/style.css
js/app.js        state and screens
js/engine.js     three-valued eligibility + adaptive question selection (browser and Node)
js/mismatch.js   name normalisation and comparison (browser and Node)
js/voice.js      Web Speech API wrapper and spoken yes/no/number parsers
js/i18n.js       t() helper
js/metrics.js    demo metrics
js/icons.js      inline SVG icons for schemes and documents
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

## Accessibility notes

Contrast was computed from the CSS palette: all text pairs are at least 6.7:1 (WCAG AA needs 4.5:1; many are above 7:1),
and the thinnest UI-component colour (green check/progress on white) is 3.3:1 (AA needs 3:1). Inactive step bars are
decorative. Scheme and document icons are inline SVG (`js/icons.js`) and hidden from screen readers; the text next to
them carries the meaning. Not yet tested with a real screen reader.

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

Reference runs from the engine over the 50-scheme sample (see `tests/` and `DEMO_SCRIPT.md`), when every answer is known:
Persona 1 with "check everything" asks 24 of 28; a 72-year-old man in a city asks 15 of 28; Persona 1 with the "Lost my
spouse" tile asks 5 of 5 (that tile narrows to two schemes). The saving comes from rejecting schemes early, so it varies by person.

## Voice and privacy

Voice is **off by default**. When someone turns it on, the app shows a notice first. It uses the browser's
Web Speech API (recognition in `te-IN`, `hi-IN`, `en-IN`) and `speechSynthesis` to read questions aloud.
Tap input is always available, and the mic and voice buttons are hidden if the browser lacks the API.

**"Nothing leaves the device" applies to this app's own code, but not to the browser's speech service.**
In some browsers (for example Chrome and Edge) speech recognition sends audio to the browser vendor's servers.
The app cannot control that, which is why the notice appears. Text-to-speech may also use online voices in some browsers.

Everything else is in-memory only: no localStorage, sessionStorage, cookies or analytics.

## Trying it on a phone

1. Easiest: copy the whole `seva-sahayak` folder to the phone and open `index.html` with a file manager (Chrome may need
   "Open with Chrome"). Everything works except voice.
2. Or from a laptop on the same Wi-Fi: run `python -m http.server 8000` inside the folder, find the laptop's IP address,
   and open `http://<laptop-ip>:8000` on the phone. Browsers only allow speech recognition on HTTPS or localhost,
   so voice input will not work this way, but text-to-speech may.

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
- Tiles filter by scheme tag (each scheme has one or more tags in `data/schemes.js`); "Not sure" uses all 50. A narrowed set can
  hide a scheme you qualify for (for example a widow who farms should pick "Not sure" to see PM-KISAN).
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

- Rules are simplified and the sample covers 50 national schemes only, none verified yet. Real eligibility depends on the state and changes over time.
- No amounts, deadlines, helpline numbers or scheme-specific URLs are shown on purpose.
- Spoken numbers are understood as digits (in any of the three scripts) or English words; Telugu and Hindi number
  words are not parsed.
- Voice quality depends on the browser and installed voices; Telugu text-to-speech is often missing.
- Name comparison is a heuristic: it can miss real problems (a legal rule we don't know) and can't tell which record is correct.
- Inactivity is detected by pointer, keyboard, input and touch events only.
- Tested in a Chromium-based browser at 360 px width; other browsers and real low-end phones are untested.
