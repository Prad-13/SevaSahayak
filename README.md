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

- `SCHEMES_SAMPLE.csv`: the 50 schemes in plain language (rules, exclusions, documents) with the result of a desk check
  of public web sources (see below), the sources used, and an empty column for the team to confirm each row.
- `TELUGU_REVIEW.csv`: every Telugu string next to its English source, with a column for the corrected Telugu.

**Desk check of the rules (26 October 2026).** Each rule was compared with what could be read on the public web
(`tools/verification.mjs` holds the notes and sources). Result: 15 consistent with the sources, 17 consistent but
simplified (some official detail is not modelled), 12 updated because of the check, and 6 that need official
confirmation. Changes made include: the four National Social Assistance pensions were renamed by the Union Cabinet on
14 October 2026 (names updated; the disability pension now uses a 40% benchmark with no minimum age); PM Awas Yojana
Urban income ceiling changed from 18 to 9 lakh; tenant farmers added to crop insurance, Kisan Credit Card and Soil
Health Card; and age or income rules adjusted for PMMVY, DDU-GKY, Rashtriya Vayoshri, ADIP and the toilet incentive.

**Limits of this check.** It was AI-assisted and many official portals could not be opened directly (certificate
errors or blocked), so several rows rest on government-hosted documents quoted in search results or on secondary
summaries. It is not a legal or official verification. Real criteria change with time and state, and income limits use
`household_income_lakh` (yearly income rounded up to a whole lakh), so they are approximate. Before presenting any
result as correct, the team should confirm each row on the official scheme page and note it in the last column of
the CSV. State schemes are not included, because their names and rules change with each government.

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
js/compat.js     polyfills for older phones and a visible start-up error message
tools/           build-single.mjs (one-file build), export-csv.mjs (review sheets)
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
Persona 1 with "check everything" asks 23 of 28; a 72-year-old man in a city asks 14 of 28; Persona 1 with the "Lost my
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

**Use `seva-sahayak-single.html`.** It is the whole app in one file (about 195 KB). Copy just that file to the phone and
open it from a file manager (choose Chrome). This matters: when a phone opens a file from a file manager, Chrome
gets a `content://` link and cannot load the other files in the folder, so `index.html` shows only the title and
"Skip to main content" and nothing works. The single file does not have that problem.

Rebuild it after any change: `node tools/build-single.mjs`.

If something still goes wrong, the page now shows a red box with the error message instead of staying blank.
Please send a screenshot of that box. Old browsers are handled where possible (small polyfills in `js/compat.js`,
fallback for Unicode regular expressions), but a very old Chrome or Android WebView may still fail; updating Chrome from
the Play Store fixes most cases.

Other ways: serve the folder from a laptop (`python -m http.server 8000`) and open `http://<laptop-ip>:8000` on the
phone over the same Wi-Fi. Browsers only allow speech recognition on HTTPS or localhost, so voice input will not work that way.

## Translation review needed

**The Telugu and Hindi text has been reviewed by the team.** This covers `data/i18n.js`, the question texts and labels in
`data/questions.js`, and the names, benefits and "where to get it" text in `data/schemes.js` and `data/documents.js`.
Scheme names are transliterations or literal translations. `TELUGU_REVIEW.csv` (from `node tools/export-csv.mjs`) lists
every Telugu string. A native-speaker review is still worthwhile before any real-world use.

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
- Tested in a desktop Chromium-based browser at 360 px width. Real low-end phones are still untested: a first attempt on a Samsung Galaxy A10e from a folder opened in a file manager failed because of the `content://` limitation described above, and the one-file build was made in response; it has not yet been confirmed on that phone.
