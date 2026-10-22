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
  }
];
if (typeof module !== "undefined" && module.exports) module.exports = SS_DOCS;
