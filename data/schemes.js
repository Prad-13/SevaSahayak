/*
 * Scheme rules. ALL rules below are demo-simplified, verify against official guidelines.
 * Real criteria, amounts and exclusions vary by state and change over time.
 *
 * Condition shapes:
 *   { attr, op: "eq"|"gte"|"lte", value }
 *   { op: "or", conds: [ ...conditions ] }   (true if any sub-condition is true)
 * required: all must be true. exclusions: none may be true.
 */
var SS_SCHEMES = [
  {
    id: "pm_kisan",
    name: { en: "PM-KISAN", te: "పీఎం-కిసాన్", hi: "पीएम-किसान" },
    benefit: {
      en: "Income support for farmer families who hold farmland.",
      te: "వ్యవసాయ భూమి ఉన్న రైతు కుటుంబాలకు ఆదాయ సహాయం.",
      hi: "कृषि भूमि वाले किसान परिवारों को आय सहायता।"
    },
    tags: ["farming"],
    official_note: "demo-simplified, verify against official guidelines",
    required: [
      // demo-simplified, verify against official guidelines
      { attr: "farmer_with_land", op: "eq", value: true }
    ],
    exclusions: [
      // demo-simplified, verify against official guidelines
      { attr: "income_tax_payer", op: "eq", value: true },
      { attr: "govt_service_or_pensioner", op: "eq", value: true }
    ],
    documents: ["aadhaar", "bank_passbook", "land_record"]
  },
  {
    id: "ignwps",
    name: { en: "Indira Gandhi National Widow Pension Scheme", te: "ఇందిరా గాంధీ జాతీయ వితంతు పింఛను పథకం", hi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना" },
    benefit: {
      en: "Monthly pension for widows from poor households.",
      te: "పేద కుటుంబాల వితంతువులకు నెలవారీ పింఛను.",
      hi: "गरीब परिवारों की विधवाओं के लिए मासिक पेंशन।"
    },
    tags: ["spouse"],
    official_note: "demo-simplified, verify against official guidelines",
    required: [
      // demo-simplified, verify against official guidelines
      { attr: "gender", op: "eq", value: "female" },
      { attr: "widowed", op: "eq", value: true },
      { attr: "age", op: "gte", value: 40 },
      { attr: "age", op: "lte", value: 79 },
      { attr: "bpl", op: "eq", value: true }
    ],
    exclusions: [],
    documents: ["aadhaar", "age_proof", "bpl_proof", "spouse_death_certificate", "bank_passbook"]
  },
  {
    id: "ignoaps",
    name: { en: "Indira Gandhi National Old Age Pension Scheme", te: "ఇందిరా గాంధీ జాతీయ వృద్ధాప్య పింఛను పథకం", hi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना" },
    benefit: {
      en: "Monthly pension for older adults from poor households.",
      te: "పేద కుటుంబాల వృద్ధులకు నెలవారీ పింఛను.",
      hi: "गरीब परिवारों के बुज़ुर्गों के लिए मासिक पेंशन।"
    },
    tags: ["old_age"],
    official_note: "demo-simplified, verify against official guidelines",
    required: [
      // demo-simplified, verify against official guidelines
      { attr: "age", op: "gte", value: 60 },
      { attr: "bpl", op: "eq", value: true }
    ],
    exclusions: [],
    documents: ["aadhaar", "age_proof", "bpl_proof", "bank_passbook"]
  },
  {
    id: "igndps",
    name: { en: "Indira Gandhi National Disability Pension Scheme", te: "ఇందిరా గాంధీ జాతీయ వికలాంగ పింఛను పథకం", hi: "इंदिरा गांधी राष्ट्रीय दिव्यांगता पेंशन योजना" },
    benefit: {
      en: "Monthly pension for persons with severe disability from poor households.",
      te: "పేద కుటుంబాల్లో తీవ్ర వైకల్యం ఉన్నవారికి నెలవారీ పింఛను.",
      hi: "गरीब परिवारों के गंभीर दिव्यांग व्यक्तियों के लिए मासिक पेंशन।"
    },
    tags: ["disability"],
    official_note: "demo-simplified, verify against official guidelines",
    required: [
      // demo-simplified, verify against official guidelines
      { attr: "disability_80_plus", op: "eq", value: true },
      { attr: "age", op: "gte", value: 18 },
      { attr: "age", op: "lte", value: 79 },
      { attr: "bpl", op: "eq", value: true }
    ],
    exclusions: [],
    documents: ["aadhaar", "disability_certificate", "bpl_proof", "bank_passbook"]
  },
  {
    id: "pmjay",
    name: { en: "Ayushman Bharat PM-JAY", te: "ఆయుష్మాన్ భారత్ పీఎం-జేఏవై", hi: "आयुष्मान भारत पीएम-जेएवाई" },
    benefit: {
      en: "Health cover for hospital treatment for eligible families.",
      te: "అర్హత ఉన్న కుటుంబాలకు ఆసుపత్రి చికిత్సకు ఆరోగ్య బీమా.",
      hi: "पात्र परिवारों के लिए अस्पताल में इलाज का स्वास्थ्य कवर।"
    },
    tags: ["health", "old_age"],
    official_note: "demo-simplified, verify against official guidelines",
    required: [
      // demo-simplified, verify against official guidelines
      { op: "or", conds: [
        { attr: "age", op: "gte", value: 70 },
        { attr: "pmjay_listed", op: "eq", value: true }
      ] }
    ],
    exclusions: [],
    documents: ["aadhaar", "ration_card"]
  }
];
if (typeof module !== "undefined" && module.exports) module.exports = SS_SCHEMES;
