/*
 * One question per attribute. "I don't know" is added by the UI for every question.
 * type: "number" | "yesno" | "choice". yesno answers are stored as true/false.
 */
var SS_QUESTIONS = {
  age: {
    type: "number", min: 0, max: 120,
    label: { en: "Age", te: "వయస్సు", hi: "आयु" },
    text: { en: "How old are you?", te: "మీ వయస్సు ఎంత?", hi: "आपकी उम्र कितनी है?" }
  },
  gender: {
    type: "choice",
    label: { en: "Gender", te: "లింగం", hi: "लिंग" },
    text: { en: "Are you a woman, a man, or other?", te: "మీరు స్త్రీనా, పురుషుడా, లేదా ఇతరులా?", hi: "आप महिला हैं, पुरुष हैं, या अन्य?" },
    options: [
      { value: "female", label: { en: "Woman", te: "స్త్రీ", hi: "महिला" } },
      { value: "male", label: { en: "Man", te: "పురుషుడు", hi: "पुरुष" } },
      { value: "other", label: { en: "Other", te: "ఇతరులు", hi: "अन्य" } }
    ]
  },
  widowed: {
    type: "yesno",
    label: { en: "Widowed", te: "వితంతువు", hi: "विधवा" },
    text: { en: "Have you lost your husband (are you a widow)?", te: "మీరు మీ భర్తను కోల్పోయారా (వితంతువా)?", hi: "क्या आपके पति का निधन हो गया है (क्या आप विधवा हैं)?" }
  },
  farmer_with_land: {
    type: "yesno",
    label: { en: "Farmer with land", te: "భూమి ఉన్న రైతు", hi: "भूमि वाला किसान" },
    text: { en: "Does your family own farmland?", te: "మీ కుటుంబానికి వ్యవసాయ భూమి ఉందా?", hi: "क्या आपके परिवार के पास खेती की ज़मीन है?" }
  },
  bpl: {
    type: "yesno",
    label: { en: "BPL household", te: "బీపీఎల్ కుటుంబం", hi: "बीपीएल परिवार" },
    text: { en: "Does your household have a BPL (Below Poverty Line) card or listing?", te: "మీ కుటుంబానికి బీపీఎల్ (దారిద్య్ర రేఖ దిగువ) కార్డు లేదా జాబితాలో పేరు ఉందా?", hi: "क्या आपके परिवार के पास बीपीएल (गरीबी रेखा से नीचे) कार्ड या सूची में नाम है?" }
  },
  income_tax_payer: {
    type: "yesno",
    label: { en: "Income tax payer in household", te: "ఇంట్లో ఆదాయపు పన్ను చెల్లింపుదారు", hi: "परिवार में आयकर दाता" },
    text: { en: "Does anyone in your household pay income tax?", te: "మీ ఇంట్లో ఎవరైనా ఆదాయపు పన్ను చెల్లిస్తారా?", hi: "क्या आपके परिवार में कोई आयकर देता है?" }
  },
  govt_service_or_pensioner: {
    type: "yesno",
    label: { en: "Government job or pension in household", te: "ఇంట్లో ప్రభుత్వ ఉద్యోగం/పింఛను", hi: "परिवार में सरकारी नौकरी/पेंशन" },
    text: { en: "Does anyone in your household have a government job or a government pension?", te: "మీ ఇంట్లో ఎవరికైనా ప్రభుత్వ ఉద్యోగం లేదా ప్రభుత్వ పింఛను ఉందా?", hi: "क्या आपके परिवार में किसी की सरकारी नौकरी या सरकारी पेंशन है?" }
  },
  disability_80_plus: {
    type: "yesno",
    label: { en: "Disability of 80% or more", te: "80% లేదా అంతకంటే ఎక్కువ వైకల్యం", hi: "80% या अधिक दिव्यांगता" },
    text: { en: "Do you have a disability certified at 80% or more?", te: "మీకు 80% లేదా అంతకంటే ఎక్కువ వైకల్యం ధృవీకరించబడిందా?", hi: "क्या आपकी दिव्यांगता 80% या अधिक प्रमाणित है?" }
  },
  pmjay_listed: {
    type: "yesno",
    label: { en: "Listed under PM-JAY", te: "పీఎం-జేఏవైలో నమోదు", hi: "पीएम-जेएवाई में सूचीबद्ध" },
    text: { en: "Is your family listed under Ayushman Bharat PM-JAY (do you have a PM-JAY card or name on the list)?", te: "మీ కుటుంబం ఆయుష్మాన్ భారత్ పీఎం-జేఏవైలో నమోదై ఉందా (కార్డు లేదా జాబితాలో పేరు)?", hi: "क्या आपका परिवार आयुष्मान भारत पीएम-जेएवाई में सूचीबद्ध है (कार्ड या सूची में नाम)?" }
  }
};

/* Life-event tiles. They only narrow the starting set of candidate schemes (by tag). */
var SS_TILES = [
  { id: "farming", tag: "farming", icon: "🌾", label: { en: "Farming", te: "వ్యవసాయం", hi: "खेती" } },
  { id: "spouse", tag: "spouse", icon: "🕯️", label: { en: "Lost my spouse", te: "జీవిత భాగస్వామిని కోల్పోయాను", hi: "जीवनसाथी को खो दिया" } },
  { id: "old_age", tag: "old_age", icon: "🧓", label: { en: "Old age", te: "వృద్ధాప్యం", hi: "बुढ़ापा" } },
  { id: "health", tag: "health", icon: "🏥", label: { en: "Health", te: "ఆరోగ్యం", hi: "स्वास्थ्य" } },
  { id: "disability", tag: "disability", icon: "♿", label: { en: "Disability", te: "వైకల్యం", hi: "दिव्यांगता" } },
  { id: "all", tag: null, icon: "🔍", label: { en: "Not sure, check everything", te: "తెలియదు, అన్నీ తనిఖీ చేయండి", hi: "पता नहीं, सब जाँचें" } }
];
if (typeof module !== "undefined" && module.exports) module.exports = { SS_QUESTIONS: SS_QUESTIONS, SS_TILES: SS_TILES };
