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
  },
  breadwinner_died: {
    type: "yesno",
    label: { en: "Earning member died", te: "సంపాదనాపరుడు మరణించారు", hi: "कमाने वाले का निधन" },
    text: { en: "Has the main earning member of your family died recently?", te: "మీ కుటుంబంలో ప్రధాన సంపాదనాపరుడు ఇటీవల మరణించారా?", hi: "क्या आपके परिवार के मुख्य कमाने वाले सदस्य का हाल ही में निधन हुआ है?" }
  },
  rural: {
    type: "yesno",
    label: { en: "Rural area", te: "గ్రామీణ ప్రాంతం", hi: "ग्रामीण क्षेत्र" },
    text: { en: "Do you live in a village (rural area)?", te: "మీరు గ్రామంలో (గ్రామీణ ప్రాంతంలో) నివసిస్తున్నారా?", hi: "क्या आप गाँव (ग्रामीण क्षेत्र) में रहते हैं?" }
  },
  owns_pucca_house: {
    type: "yesno",
    label: { en: "Owns a pucca house", te: "పక్కా ఇల్లు ఉంది", hi: "पक्का मकान है" },
    text: { en: "Does your family own a pucca (permanent, concrete) house?", te: "మీ కుటుంబానికి పక్కా (శాశ్వత) ఇల్లు ఉందా?", hi: "क्या आपके परिवार के पास पक्का (स्थायी) मकान है?" }
  },
  has_lpg: {
    type: "yesno",
    label: { en: "LPG connection", te: "ఎల్‌పీజీ కనెక్షన్", hi: "एलपीजी कनेक्शन" },
    text: { en: "Does your household have an LPG gas connection?", te: "మీ ఇంట్లో ఎల్‌పీజీ గ్యాస్ కనెక్షన్ ఉందా?", hi: "क्या आपके घर में एलपीजी गैस कनेक्शन है?" }
  },
  has_bank_account: {
    type: "yesno",
    label: { en: "Bank account", te: "బ్యాంకు ఖాతా", hi: "बैंक खाता" },
    text: { en: "Do you have a bank account?", te: "మీకు బ్యాంకు ఖాతా ఉందా?", hi: "क्या आपका बैंक खाता है?" }
  },
  informal_worker: {
    type: "yesno",
    label: { en: "Unorganised worker", te: "అసంఘటిత కార్మికుడు", hi: "असंगठित कामगार" },
    text: { en: "Do you work in the unorganised sector (for example daily wage, farm labour, domestic or construction work)?", te: "మీరు అసంఘటిత రంగంలో (ఉదా. రోజువారీ కూలి, వ్యవసాయ కూలి, ఇంటి పని, నిర్మాణ పని) పని చేస్తున్నారా?", hi: "क्या आप असंगठित क्षेत्र में काम करते हैं (जैसे दिहाड़ी, खेत मज़दूरी, घरेलू या निर्माण कार्य)?" }
  },
  epf_member: {
    type: "yesno",
    label: { en: "EPF, ESI or NPS member", te: "ఈపీఎఫ్/ఈఎస్ఐ/ఎన్‌పీఎస్ సభ్యుడు", hi: "ईपीएफ/ईएसआई/एनपीएस सदस्य" },
    text: { en: "Are you a member of EPF, ESI or the National Pension System?", te: "మీరు ఈపీఎఫ్, ఈఎస్ఐ లేదా నేషనల్ పెన్షన్ సిస్టమ్ సభ్యులా?", hi: "क्या आप ईपीएफ, ईएसआई या राष्ट्रीय पेंशन प्रणाली के सदस्य हैं?" }
  },
  pregnant_or_new_mother: {
    type: "yesno",
    label: { en: "Pregnant or new mother", te: "గర్భిణి లేదా కొత్త తల్లి", hi: "गर्भवती या नई माँ" },
    text: { en: "Are you pregnant, or did you have a baby in the last year?", te: "మీరు గర్భవతివా లేదా గత ఏడాదిలో ప్రసవించారా?", hi: "क्या आप गर्भवती हैं या पिछले एक साल में बच्चे को जन्म दिया है?" }
  },
  girl_child_under_10: {
    type: "yesno",
    label: { en: "Girl child under 10", te: "10 ఏళ్ల లోపు ఆడపిల్ల", hi: "10 साल से कम की बेटी" },
    text: { en: "Does your family have a girl child under 10 years old?", te: "మీ కుటుంబంలో 10 ఏళ్ల లోపు ఆడపిల్ల ఉందా?", hi: "क्या आपके परिवार में 10 साल से कम उम्र की बेटी है?" }
  },
  street_vendor: {
    type: "yesno",
    label: { en: "Street vendor", te: "వీధి వ్యాపారి", hi: "फेरीवाला" },
    text: { en: "Do you sell goods or food on the street, or from a cart or stall?", te: "మీరు వీధిలో లేదా బండి/స్టాల్ నుండి సరుకులు లేదా ఆహారం అమ్ముతారా?", hi: "क्या आप सड़क पर या ठेले/स्टॉल से सामान या खाना बेचते हैं?" }
  },
  own_business: {
    type: "yesno",
    label: { en: "Small business", te: "చిన్న వ్యాపారం", hi: "छोटा व्यवसाय" },
    text: { en: "Do you run, or plan to start, a small business?", te: "మీరు చిన్న వ్యాపారం నడుపుతున్నారా లేదా ప్రారంభించాలనుకుంటున్నారా?", hi: "क्या आप छोटा व्यवसाय चलाते हैं या शुरू करना चाहते हैं?" }
  },
  artisan: {
    type: "yesno",
    label: { en: "Traditional artisan", te: "సంప్రదాయ కళాకారుడు", hi: "पारंपरिक कारीगर" },
    text: { en: "Do you work with your hands in a traditional craft (for example carpenter, potter, weaver, blacksmith, tailor)?", te: "మీరు సంప్రదాయ హస్తకళలో (ఉదా. వడ్రంగి, కుమ్మరి, నేత, కమ్మరి, టైలర్) పని చేస్తారా?", hi: "क्या आप पारंपरिक हस्तकला में काम करते हैं (जैसे बढ़ई, कुम्हार, बुनकर, लोहार, दर्ज़ी)?" }
  },
  has_toilet: {
    type: "yesno",
    label: { en: "Toilet at home", te: "ఇంట్లో మరుగుదొడ్డి", hi: "घर में शौचालय" },
    text: { en: "Does your household have a toilet?", te: "మీ ఇంట్లో మరుగుదొడ్డి ఉందా?", hi: "क्या आपके घर में शौचालय है?" }
  },
  student: {
    type: "yesno",
    label: { en: "Student", te: "విద్యార్థి", hi: "छात्र" },
    text: { en: "Are you currently studying in a school or college?", te: "మీరు ప్రస్తుతం పాఠశాల లేదా కళాశాలలో చదువుతున్నారా?", hi: "क्या आप अभी स्कूल या कॉलेज में पढ़ रहे हैं?" }
  },
  sc_st: {
    type: "yesno",
    label: { en: "SC or ST", te: "ఎస్‌సీ లేదా ఎస్‌టీ", hi: "एससी या एसटी" },
    text: { en: "Do you belong to a Scheduled Caste (SC) or Scheduled Tribe (ST)?", te: "మీరు షెడ్యూల్డ్ కులం (ఎస్‌సీ) లేదా షెడ్యూల్డ్ తెగ (ఎస్‌టీ)కి చెందినవారా?", hi: "क्या आप अनुसूचित जाति (एससी) या अनुसूचित जनजाति (एसटी) से हैं?" }
  },
  obc: {
    type: "yesno",
    label: { en: "OBC, EBC or DNT", te: "ఓబీసీ, ఈబీసీ లేదా డీఎన్‌టీ", hi: "ओबीसी, ईबीसी या डीएनटी" },
    text: { en: "Do you belong to an Other Backward Class (OBC), Economically Backward Class (EBC) or Denotified Tribe (DNT)?", te: "మీరు ఇతర వెనుకబడిన తరగతి (ఓబీసీ), ఆర్థికంగా వెనుకబడిన తరగతి (ఈబీసీ) లేదా విముక్త తెగ (డీఎన్‌టీ)కి చెందినవారా?", hi: "क्या आप अन्य पिछड़ा वर्ग (ओबीसी), आर्थिक रूप से पिछड़ा वर्ग (ईबीसी) या विमुक्त जनजाति (डीएनटी) से हैं?" }
  },
  minority: {
    type: "yesno",
    label: { en: "Minority community", te: "మైనారిటీ వర్గం", hi: "अल्पसंख्यक समुदाय" },
    text: { en: "Do you belong to a notified minority community (for example Muslim, Christian, Sikh, Buddhist, Jain or Parsi)?", te: "మీరు నోటిఫై చేసిన మైనారిటీ వర్గానికి (ఉదా. ముస్లిం, క్రైస్తవ, సిక్కు, బౌద్ధ, జైన, పార్సీ) చెందినవారా?", hi: "क्या आप अधिसूचित अल्पसंख्यक समुदाय (जैसे मुस्लिम, ईसाई, सिख, बौद्ध, जैन, पारसी) से हैं?" }
  },
  disability_40_plus: {
    type: "yesno",
    label: { en: "Disability of 40% or more", te: "40% లేదా అంతకంటే ఎక్కువ వైకల్యం", hi: "40% या अधिक दिव्यांगता" },
    text: { en: "Do you have a disability certified at 40% or more?", te: "మీకు 40% లేదా అంతకంటే ఎక్కువ వైకల్యం ధృవీకరించబడిందా?", hi: "क्या आपकी दिव्यांगता 40% या अधिक प्रमाणित है?" }
  },
  household_income_lakh: {
    type: "number", min: 0, max: 100,
    label: { en: "Household income (lakh rupees a year)", te: "కుటుంబ ఆదాయం (సంవత్సరానికి లక్షల రూపాయలు)", hi: "परिवार की आय (सालाना, लाख रुपये)" },
    text: {
      en: "About how much does your household earn in a year, in lakh rupees? Round up to the next whole lakh (for example, 1.5 lakh is 2).",
      te: "మీ కుటుంబ వార్షిక ఆదాయం సుమారు ఎన్ని లక్షల రూపాయలు? తదుపరి పూర్తి లక్షకు పెంచండి (ఉదా. 1.5 లక్షలు అంటే 2).",
      hi: "आपके परिवार की सालाना कमाई लगभग कितने लाख रुपये है? अगले पूरे लाख तक गोल करें (जैसे 1.5 लाख के लिए 2)।"
    }
  }
};

/* Life-event tiles. They only narrow the starting set of candidate schemes (by tag). */
var SS_TILES = [
  { id: "farming", tag: "farming", icon: "🌾", label: { en: "Farming", te: "వ్యవసాయం", hi: "खेती" } },
  { id: "spouse", tag: "spouse", icon: "🕯️", label: { en: "Lost my spouse", te: "జీవిత భాగస్వామిని కోల్పోయాను", hi: "जीवनसाथी को खो दिया" } },
  { id: "old_age", tag: "old_age", icon: "🧓", label: { en: "Old age", te: "వృద్ధాప్యం", hi: "बुढ़ापा" } },
  { id: "health", tag: "health", icon: "🏥", label: { en: "Health", te: "ఆరోగ్యం", hi: "स्वास्थ्य" } },
  { id: "disability", tag: "disability", icon: "♿", label: { en: "Disability", te: "వైకల్యం", hi: "दिव्यांगता" } },
  { id: "education", tag: "education", icon: "🎓", label: { en: "Education", te: "విద్య", hi: "शिक्षा" } },
  { id: "housing", tag: "housing", icon: "🏠", label: { en: "Housing", te: "ఇల్లు", hi: "आवास" } },
  { id: "work", tag: "work", icon: "🛠️", label: { en: "Work and business", te: "ఉపాధి, వ్యాపారం", hi: "रोज़गार और व्यवसाय" } },
  { id: "women", tag: "women", icon: "👩‍👧", label: { en: "Women and children", te: "మహిళలు, పిల్లలు", hi: "महिलाएँ और बच्चे" } },
  { id: "money", tag: "money", icon: "💰", label: { en: "Money and food", te: "డబ్బు, ఆహారం", hi: "पैसा और राशन" } },
  { id: "all", tag: null, icon: "🔍", label: { en: "Not sure, check everything", te: "తెలియదు, అన్నీ తనిఖీ చేయండి", hi: "पता नहीं, सब जाँचें" } }
];
if (typeof module !== "undefined" && module.exports) module.exports = { SS_QUESTIONS: SS_QUESTIONS, SS_TILES: SS_TILES };
