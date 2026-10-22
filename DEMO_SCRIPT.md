# Demo script (about 5 minutes)

Setup: open `index.html` in a browser (phone width or a narrow window looks best). Tap **Demo metrics** so the
panel is visible. Mention up front: *college prototype, illustrative rules, never submits anything.*

Numbers below come from real runs of the engine. Read the actual panel in your demo, since typing speed changes the time.

## 1. Persona 1, end to end (2 min)

Persona: widow, 54, small farm, relative's shared phone, prefers Telugu.

1. Tap **తెలుగు**. Point out the privacy note on the start screen. Tap **Not sure, check everything**
   (she is both a widow and a farmer, so we want every scheme considered).
2. Answer: age **54**, BPL **Yes**, farmland **Yes**, woman, disability **No**, PM-JAY **No**, widowed **Yes**,
   income tax **No**, government job/pension **No**.
3. Results: **Widow pension** and **PM-KISAN** are *Likely eligible*; **Old age pension** and **Disability pension**
   are collapsed under *Not eligible*, and PM-JAY is not eligible. Open one card to show the "why" built from her own answers.
4. Tap **Get my documents ready**. Mark Aadhaar and bank passbook as "I have it". Mark the death certificate as
   "I don't have it" and show the "where to get it (check locally)" guidance and the "Documents ready: x of y" bar.
5. Tap **Check names** and go on to the summary: show the *Submission happens on the official website* line,
   then **Copy summary** and **Print**. Do not click through to the official site during the demo unless asked.

Optional contrast: restart, choose **Lost my spouse**, answer gender, widowed, age, BPL. Only 4 questions, but
PM-KISAN is not considered, which is why the "check everything" tile exists.

## 2. A 72-year-old (1 min)

Tap **Clear my details**, switch to English, choose **Not sure, check everything**.

- Age **72**, BPL **No**, farmland **No**. That's all: 3 questions.
- Result: **PM-JAY** is *Likely eligible*; the other four schemes are rejected.
- Read the panel: **3 questions asked vs 9 in the fixed form** (6 saved). Network requests: **0**.

Then show "I don't know": restart, choose **Not sure**, age **54**, BPL **I don't know**, and answer the rest as in
Persona 1 but with disability **No**. The widow pension shows **Needs a quick check** with a plain-language reason naming BPL.

## 3. Name mismatch scenario (1 min)

From any results screen go to the **Names** step. Type:

- Aadhaar: `K Ramesh`
- Bank passbook: `Kesiraju Ramesh`
- Land record: `Ramesh Kesiraju`

Press **Check names**. Expected: Aadhaar vs bank is a *warning* (initial vs full name), bank vs land is a *warning*
(order differs), Aadhaar vs land is a *warning*. The fix list says which record to correct and where, labelled
"check locally".

Then change the land name to `Suresh Babu`: a *Likely to fail* result appears. Also try `Lakshmi` vs `Laxmi`
(spelling variant) and `Ramesh Kumar` vs `RAMESH KUMAR` (only formatting, OK). Stress that no ID numbers are typed
and the comparison happens on the device.

## 4. Quick extras (30 s, if time allows)

- **Helper mode**: toggle it, finish a person, tap **Next person**. All data is wiped and the counter shows a number only.
- **Inactivity**: open `index.html?idle=10`, answer a question and wait: a warning appears, then the data is wiped.
- **Voice** is off by default. Turning it on shows the browser-speech privacy notice first.

## Metrics to read off the panel afterwards

| Metric | What to quote |
|---|---|
| Questions asked vs fixed form | 72-year-old: **3 of 9**. Persona 1 ("check everything"): **9 of 9** (no saving, every scheme applies to her). Persona 1 with the spouse tile: **4 of 4**. |
| Time to result | Read the panel (includes thinking time, so it varies by person). |
| Rule data size | About **17 KB** of rule data (schemes, questions, documents, tiles); the whole app is about 120 KB. |
| Network requests made by the app | **0** |

Be honest in the presentation: savings depend on the person. The adaptive approach helps most when early answers
rule out several schemes at once.
