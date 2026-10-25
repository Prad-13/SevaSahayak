/* Documents master list. "where" guidance is deliberately generic: check locally. */
var SS_DOCS = [
  {
    id: "aadhaar",
    name: { en: "Aadhaar card", te: "ఆధార్ కార్డు", hi: "आधार कार्ड" },
    where: {
      en: "If you do not have it or it needs updating, visit an Aadhaar enrolment or update centre. Check locally.",
      te: "మీ దగ్గర లేకపోతే లేదా సవరణ అవసరమైతే, ఆధార్ నమోదు/సవరణ కేంద్రానికి వెళ్ళండి. స్థానికంగా తెలుసుకోండి.",
      hi: "यदि आपके पास नहीं है या सुधार चाहिए, तो आधार नामांकन/अपडेट केंद्र पर जाएँ। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "bank_passbook",
    name: { en: "Bank passbook", te: "బ్యాంకు పాస్‌బుక్", hi: "बैंक पासबुक" },
    where: {
      en: "Ask your bank branch for a passbook or account statement. Check locally.",
      te: "మీ బ్యాంకు శాఖలో పాస్‌బుక్ లేదా ఖాతా స్టేట్‌మెంట్ అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "अपनी बैंक शाखा से पासबुक या खाता विवरण माँगें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "land_record",
    name: { en: "Land record", te: "భూమి రికార్డు", hi: "भूमि अभिलेख" },
    where: {
      en: "Land records are usually kept by the local revenue office. Check locally.",
      te: "భూమి రికార్డులు సాధారణంగా స్థానిక రెవెన్యూ కార్యాలయంలో ఉంటాయి. స్థానికంగా తెలుసుకోండి.",
      hi: "भूमि अभिलेख आमतौर पर स्थानीय राजस्व कार्यालय में होते हैं। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "age_proof",
    name: { en: "Age proof", te: "వయస్సు రుజువు", hi: "आयु प्रमाण" },
    where: {
      en: "Documents such as a birth certificate or school certificate often work. Which ones are accepted differs, so check locally.",
      te: "జనన ధృవపత్రం లేదా పాఠశాల సర్టిఫికేట్ వంటివి సాధారణంగా పనిచేస్తాయి. ఏవి చెల్లుతాయో మారుతుంది, స్థానికంగా తెలుసుకోండి.",
      hi: "जन्म प्रमाण पत्र या स्कूल प्रमाण पत्र जैसे दस्तावेज़ अक्सर चलते हैं। कौन से मान्य हैं यह अलग-अलग है, स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "bpl_proof",
    name: { en: "BPL proof (card or certificate)", te: "బీపీఎల్ రుజువు (కార్డు/సర్టిఫికేట్)", hi: "बीपीएल प्रमाण (कार्ड/प्रमाण पत्र)" },
    where: {
      en: "Usually issued through the local revenue, panchayat or municipal office. The name of the document differs by state. Check locally.",
      te: "సాధారణంగా స్థానిక రెవెన్యూ, పంచాయతీ లేదా మునిసిపల్ కార్యాలయం ద్వారా ఇస్తారు. రాష్ట్రాన్ని బట్టి పేరు మారుతుంది. స్థానికంగా తెలుసుకోండి.",
      hi: "आमतौर पर स्थानीय राजस्व, पंचायत या नगरपालिका कार्यालय से मिलता है। राज्य के अनुसार नाम अलग हो सकता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "spouse_death_certificate",
    name: { en: "Spouse's death certificate", te: "జీవిత భాగస్వామి మరణ ధృవపత్రం", hi: "जीवनसाथी का मृत्यु प्रमाण पत्र" },
    where: {
      en: "Death certificates are issued through the local registrar of births and deaths (panchayat or municipality). Check locally.",
      te: "మరణ ధృవపత్రాలు స్థానిక జనన-మరణ రిజిస్ట్రార్ (పంచాయతీ/మునిసిపాలిటీ) ద్వారా ఇస్తారు. స్థానికంగా తెలుసుకోండి.",
      hi: "मृत्यु प्रमाण पत्र स्थानीय जन्म-मृत्यु पंजीयक (पंचायत/नगरपालिका) से मिलता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "disability_certificate",
    name: { en: "Disability certificate", te: "వైకల్య ధృవపత్రం", hi: "दिव्यांगता प्रमाण पत्र" },
    where: {
      en: "Issued after assessment by an authorised medical board or hospital. Ask at the district health or welfare office. Check locally.",
      te: "అధీకృత వైద్య బోర్డు లేదా ఆసుపత్రి పరీక్ష తర్వాత ఇస్తారు. జిల్లా ఆరోగ్య/సంక్షేమ కార్యాలయంలో అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "अधिकृत मेडिकल बोर्ड या अस्पताल की जाँच के बाद मिलता है। ज़िला स्वास्थ्य/कल्याण कार्यालय में पूछें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "ration_card",
    name: { en: "Ration card", te: "రేషన్ కార్డు", hi: "राशन कार्ड" },
    where: {
      en: "Ration cards are issued by the state food and civil supplies department. Ask at the local ration office. Check locally.",
      te: "రేషన్ కార్డులను రాష్ట్ర ఆహార, పౌర సరఫరాల శాఖ ఇస్తుంది. స్థానిక రేషన్ కార్యాలయంలో అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "राशन कार्ड राज्य के खाद्य एवं नागरिक आपूर्ति विभाग द्वारा जारी होते हैं। स्थानीय राशन कार्यालय में पूछें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "income_certificate",
    name: { en: "Income certificate", te: "ఆదాయ ధృవపత్రం", hi: "आय प्रमाण पत्र" },
    where: {
      en: "Usually issued by the local revenue office. Check locally.",
      te: "సాధారణంగా స్థానిక రెవెన్యూ కార్యాలయం ఇస్తుంది. స్థానికంగా తెలుసుకోండి.",
      hi: "आमतौर पर स्थानीय राजस्व कार्यालय जारी करता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "caste_certificate",
    name: { en: "Caste or community certificate", te: "కుల/సామాజిక వర్గ ధృవపత్రం", hi: "जाति/समुदाय प्रमाण पत्र" },
    where: {
      en: "Usually issued by the local revenue office. Check locally.",
      te: "సాధారణంగా స్థానిక రెవెన్యూ కార్యాలయం ఇస్తుంది. స్థానికంగా తెలుసుకోండి.",
      hi: "आमतौर पर स्थानीय राजस्व कार्यालय जारी करता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "student_proof",
    name: { en: "Student proof (bonafide or admission record)", te: "విద్యార్థి రుజువు (బోనఫైడ్ లేదా ప్రవేశ రికార్డు)", hi: "छात्र प्रमाण (बोनाफाइड या प्रवेश रिकॉर्ड)" },
    where: {
      en: "Ask your school or college office. Check locally.",
      te: "మీ పాఠశాల లేదా కళాశాల కార్యాలయంలో అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "अपने स्कूल या कॉलेज कार्यालय से पूछें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "marksheet",
    name: { en: "Last exam marksheet", te: "చివరి పరీక్ష మార్కుల జాబితా", hi: "पिछली परीक्षा की अंकतालिका" },
    where: {
      en: "Ask your school or college office. Check locally.",
      te: "మీ పాఠశాల లేదా కళాశాల కార్యాలయంలో అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "अपने स्कूल या कॉलेज कार्यालय से पूछें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "mch_card",
    name: { en: "Pregnancy or mother-child health card", te: "గర్భిణి లేదా తల్లి-బిడ్డ ఆరోగ్య కార్డు", hi: "गर्भावस्था या मातृ-शिशु स्वास्थ्य कार्ड" },
    where: {
      en: "Registered at your nearest government health centre or anganwadi. Check locally.",
      te: "సమీప ప్రభుత్వ ఆరోగ్య కేంద్రం లేదా అంగన్‌వాడీలో నమోదు చేస్తారు. స్థానికంగా తెలుసుకోండి.",
      hi: "नज़दीकी सरकारी स्वास्थ्य केंद्र या आंगनवाड़ी में पंजीकरण होता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "child_birth_certificate",
    name: { en: "Girl child's birth certificate", te: "ఆడపిల్ల జనన ధృవపత్రం", hi: "बेटी का जन्म प्रमाण पत्र" },
    where: {
      en: "Birth certificates are issued through the local registrar of births and deaths (panchayat or municipality). Check locally.",
      te: "జనన ధృవపత్రాలు స్థానిక జనన-మరణ రిజిస్ట్రార్ (పంచాయతీ/మునిసిపాలిటీ) ద్వారా ఇస్తారు. స్థానికంగా తెలుసుకోండి.",
      hi: "जन्म प्रमाण पत्र स्थानीय जन्म-मृत्यु पंजीयक (पंचायत/नगरपालिका) से मिलता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "business_plan",
    name: { en: "Simple business plan", te: "సరళమైన వ్యాపార ప్రణాళిక", hi: "सरल व्यवसाय योजना" },
    where: {
      en: "You usually write this yourself; a CSC or bank can help. Check locally.",
      te: "ఇది సాధారణంగా మీరే రాస్తారు; సీఎస్‌సీ లేదా బ్యాంకు సహాయం చేయవచ్చు. స్థానికంగా తెలుసుకోండి.",
      hi: "आमतौर पर आप खुद लिखते हैं; सीएससी या बैंक मदद कर सकते हैं। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "address_proof",
    name: { en: "Address proof", te: "చిరునామా రుజువు", hi: "पते का प्रमाण" },
    where: {
      en: "Documents such as a ration card or a utility bill are often accepted. Which ones are accepted differs, so check locally.",
      te: "రేషన్ కార్డు లేదా యుటిలిటీ బిల్లు వంటివి సాధారణంగా చెల్లుతాయి. ఏవి చెల్లుతాయో మారుతుంది, స్థానికంగా తెలుసుకోండి.",
      hi: "राशन कार्ड या बिजली-पानी का बिल जैसे दस्तावेज़ अक्सर चलते हैं। कौन से मान्य हैं यह अलग है, स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "electricity_bill",
    name: { en: "Recent electricity bill", te: "తాజా విద్యుత్ బిల్లు", hi: "हाल का बिजली बिल" },
    where: {
      en: "Ask your electricity provider's office for a copy. Check locally.",
      te: "మీ విద్యుత్ సరఫరా కార్యాలయంలో కాపీ అడగండి. స్థానికంగా తెలుసుకోండి.",
      hi: "अपने बिजली कंपनी के कार्यालय से प्रति माँगें। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "property_proof",
    name: { en: "House ownership proof", te: "ఇంటి యాజమాన్య రుజువు", hi: "घर के स्वामित्व का प्रमाण" },
    where: {
      en: "Usually from the local registration, municipal or panchayat office. Check locally.",
      te: "సాధారణంగా స్థానిక రిజిస్ట్రేషన్, మునిసిపల్ లేదా పంచాయతీ కార్యాలయం నుండి. స్థానికంగా తెలుసుకోండి.",
      hi: "आमतौर पर स्थानीय पंजीकरण, नगरपालिका या पंचायत कार्यालय से। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "death_certificate_family",
    name: { en: "Death certificate of the earning family member", te: "సంపాదనాపరుడైన కుటుంబ సభ్యుని మరణ ధృవపత్రం", hi: "कमाने वाले परिवार सदस्य का मृत्यु प्रमाण पत्र" },
    where: {
      en: "Death certificates are issued through the local registrar of births and deaths (panchayat or municipality). Check locally.",
      te: "మరణ ధృవపత్రాలు స్థానిక జనన-మరణ రిజిస్ట్రార్ (పంచాయతీ/మునిసిపాలిటీ) ద్వారా ఇస్తారు. స్థానికంగా తెలుసుకోండి.",
      hi: "मृत्यु प्रमाण पत्र स्थानीय जन्म-मृत्यु पंजीयक (पंचायत/नगरपालिका) से मिलता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "job_card",
    name: { en: "Job card (rural employment)", te: "ఉపాధి జాబ్ కార్డు", hi: "जॉब कार्ड (ग्रामीण रोज़गार)" },
    where: {
      en: "Applied for at the local gram panchayat. Check locally.",
      te: "స్థానిక గ్రామ పంచాయతీలో దరఖాస్తు చేస్తారు. స్థానికంగా తెలుసుకోండి.",
      hi: "स्थानीय ग्राम पंचायत में आवेदन किया जाता है। स्थानीय रूप से जाँचें।"
    }
  },
  {
    id: "vendor_proof",
    name: { en: "Street vendor proof (vending certificate or letter)", te: "వీధి వ్యాపారి రుజువు (వెండింగ్ సర్టిఫికేట్ లేదా లేఖ)", hi: "फेरीवाले का प्रमाण (वेंडिंग प्रमाण पत्र या पत्र)" },
    where: {
      en: "Issued by the local municipal body. Check locally.",
      te: "స్థానిక మునిసిపల్ సంస్థ ఇస్తుంది. స్థానికంగా తెలుసుకోండి.",
      hi: "स्थानीय नगर निकाय जारी करता है। स्थानीय रूप से जाँचें।"
    }
  }
];
if (typeof module !== "undefined" && module.exports) module.exports = SS_DOCS;
