export interface ZfocFields {
  orderType: string;
  customerName: string;
  aspName: string;
  aspAddress: string;
  modelNumber: string;
  serialNo: string;
  invoiceNo: string;
  invoiceDate: string;
  natureDefective: string;
  partCodeName: string;
  quantity: string;
  reason: string;
}

export interface ZfocEntry {
  id: string;
  name: string;
  fields: ZfocFields;
}

export interface GuideStep {
  key?: keyof ZfocFields;
  action?: string;
  label: string;
  hindiLabel: string;
  desc: string;
  hindiDesc: string;
  hindiSpeech: string;
  englishSpeech?: string;
  selector?: string;
  icon?: string;
}

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface GeminiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export const DEFAULT_FIELDS: ZfocFields = {
  orderType: 'ZFOC',
  customerName: 'LOTUS ELECTRONICS',
  aspName: 'INFA AIR CONDITIONER',
  aspAddress: '8/2 BARGAL COLONY PALSIKAR SQUARE',
  modelNumber: 'FCQF18ARV16',
  serialNo: '0020050',
  invoiceNo: '',
  invoiceDate: '',
  natureDefective: 'BLOWER DAMAGE',
  partCodeName: '4904178 - TURBO FAN ROTOR ( BLOWER )',
  quantity: '1 NOS',
  reason: ''
};

export const FIELD_DEFS: Array<{ key: keyof ZfocFields; label: string; hindiLabel: string; placeholder: string }> = [
  { key: 'orderType', label: 'Order Type', hindiLabel: 'ऑर्डर प्रकार', placeholder: 'ZFOC' },
  { key: 'customerName', label: 'Customer Name', hindiLabel: 'ग्राहक का नाम', placeholder: 'LOTUS ELECTRONICS' },
  { key: 'aspName', label: 'SSD/ASP Name', hindiLabel: 'सर्विस प्रोवाइडर नाम', placeholder: 'INFA AIR CONDITIONER' },
  { key: 'aspAddress', label: 'Dealer/ASP Address', hindiLabel: 'डीलर / ASP पता', placeholder: '8/2 BARGAL COLONY PALSIKAR SQUARE' },
  { key: 'modelNumber', label: 'Machine Model Number', hindiLabel: 'मशीन मॉडल नंबर', placeholder: 'FCQF18ARV16' },
  { key: 'serialNo', label: 'Serial No.', hindiLabel: 'सीरियल नंबर', placeholder: '0020050' },
  { key: 'invoiceNo', label: 'Daikin Invoice No.', hindiLabel: 'डाइकिन इनवॉइस नंबर', placeholder: 'Optional / यदि उपलब्ध हो' },
  { key: 'invoiceDate', label: 'Invoice Date', hindiLabel: 'इनवॉइस तारीख', placeholder: 'DD/MM/YYYY' },
  { key: 'natureDefective', label: 'Nature of Defective', hindiLabel: 'खराबी का प्रकार', placeholder: 'BLOWER DAMAGE / PCB BURNT' },
  { key: 'partCodeName', label: 'Part Code & Name', hindiLabel: 'पार्ट कोड और नाम', placeholder: '4904178 - TURBO FAN ROTOR' },
  { key: 'quantity', label: 'Quantity Required', hindiLabel: 'आवश्यक मात्रा', placeholder: '1 NOS' },
  { key: 'reason', label: 'Reason', hindiLabel: 'वारंटी क्लेम का कारण', placeholder: 'Defective during warranty period' }
];

export const GUIDE_STEPS: GuideStep[] = [
  {
    key: 'orderType',
    label: 'Order Type',
    hindiLabel: 'ऑर्डर टाइप',
    desc: 'Enter the order type. Standard is "ZFOC" (Zero Free Of Cost).',
    hindiDesc: 'ऑर्डर टाइप दर्ज करें। यहाँ आमतौर पर "ZFOC" लिखा जाता है।',
    hindiSpeech: 'नमस्ते! मैं आपकी ZFOC असिस्टेंट हूँ। पहला स्टेप: आर्डर टाइप भरें। यहाँ आमतौर पर ZFOC या FOC Warranty लिखा जाता है।'
  },
  {
    key: 'customerName',
    label: 'Customer Name',
    hindiLabel: 'ग्राहक का नाम',
    desc: 'Type the full name of the customer or dealer, e.g., LOTUS ELECTRONICS.',
    hindiDesc: 'ग्राहक या डीलर का पूरा नाम यहाँ लिखें, जैसे LOTUS ELECTRONICS।',
    hindiSpeech: 'स्टेप 2: ग्राहक या डीलर का नाम भरें, जैसे कि लोटस इलेक्ट्रॉनिक्स।'
  },
  {
    key: 'aspName',
    label: 'SSD/ASP Name',
    hindiLabel: 'SSD / ASP नाम',
    desc: 'Enter the authorized service provider name, e.g., INFA AIR CONDITIONER.',
    hindiDesc: 'सर्विस प्रोवाइडर या ASP का नाम दर्ज करें।',
    hindiSpeech: 'स्टेप 3: अपने सर्विस प्रोवाइडर यानी SSD या ASP का नाम दर्ज करें, जैसे इन्फा एयर कंडीशनर।'
  },
  {
    key: 'aspAddress',
    label: 'Dealer/ASP Address',
    hindiLabel: 'डीलर / ASP पता',
    desc: 'Fill in the complete address of the dealer or ASP branch.',
    hindiDesc: 'डीलर या ASP का पूरा पता यहाँ लिखें।',
    hindiSpeech: 'स्टेप 4: डीलर या ASP का पूरा पता और एरिया यहाँ दर्ज करें।'
  },
  {
    key: 'modelNumber',
    label: 'Machine Model Number',
    hindiLabel: 'मशीन मॉडल नंबर',
    desc: 'Enter the Daikin AC model number, e.g., FCQF18ARV16 or FTKF50.',
    hindiDesc: 'डाइकिन एसी का मॉडल नंबर दर्ज करें, जैसे FCQF18ARV16।',
    hindiSpeech: 'स्टेप 5: मशीन का सही मॉडल नंबर लिखें, उदाहरण के लिए FCQF18ARV16।'
  },
  {
    key: 'serialNo',
    label: 'Serial No.',
    hindiLabel: 'सीरियल नंबर',
    desc: 'Type the serial number of the unit, e.g., 0020050.',
    hindiDesc: 'मशीन का सीरियल नंबर यहाँ लिखें।',
    hindiSpeech: 'स्टेप 6: मशीन का सीरियल नंबर यहाँ दर्ज करें, जैसे 0020050।'
  },
  {
    key: 'invoiceNo',
    label: 'Daikin Invoice No.',
    hindiLabel: 'डाइकिन इनवॉइस नंबर',
    desc: 'Optional – enter the Daikin invoice number if available.',
    hindiDesc: 'डाइकिन इनवॉइस नंबर लिखें। यह वैकल्पिक है।',
    hindiSpeech: 'स्टेप 7: डाइकिन इनवॉइस नंबर दर्ज करें। अगर उपलब्ध न हो तो खाली छोड़ सकते हैं।'
  },
  {
    key: 'invoiceDate',
    label: 'Invoice Date',
    hindiLabel: 'इनवॉइस तारीख',
    desc: 'Optional – enter the original purchase or invoice date.',
    hindiDesc: 'खरीद या इनवॉइस की तारीख यहाँ दर्ज करें।',
    hindiSpeech: 'स्टेप 8: इनवॉइस की तारीख लिखें, जैसे 15 मार्च 2026।'
  },
  {
    key: 'natureDefective',
    label: 'Nature of Defective',
    hindiLabel: 'खराबी का प्रकार',
    desc: 'Describe what is wrong, e.g., BLOWER DAMAGE, PCB BURN, FAN NOISE.',
    hindiDesc: 'पार्ट में क्या खराबी आई है लिखें, जैसे BLOWER DAMAGE।',
    hindiSpeech: 'स्टेप 9: खराबी का विवरण यानी Nature of Defective लिखें, जैसे ब्लोअर डैमेज या पीसीबी बर्न।'
  },
  {
    key: 'partCodeName',
    label: 'Part Code & Name',
    hindiLabel: 'पार्ट कोड और नाम',
    desc: 'Enter the required replacement part code & description.',
    hindiDesc: 'बदले जाने वाले पार्ट का कोड और नाम लिखें।',
    hindiSpeech: 'स्टेप 10: रिप्लेसमेंट पार्ट का कोड और नाम लिखें, जैसे 4904178 टर्बो फैन रोटर।'
  },
  {
    key: 'quantity',
    label: 'Quantity Required',
    hindiLabel: 'आवश्यक मात्रा',
    desc: 'Specify the quantity needed, e.g., 1 NOS or 2 NOS.',
    hindiDesc: 'आवश्यक मात्रा दर्ज करें, जैसे 1 NOS।',
    hindiSpeech: 'स्टेप 11: जरूरी क्वांटिटी लिखें, जैसे कि 1 NOS।'
  },
  {
    key: 'reason',
    label: 'Reason',
    hindiLabel: 'क्लेम का कारण',
    desc: 'Enter the reason for warranty replacement claim.',
    hindiDesc: 'वारंटी क्लेम का तकनीकी कारण लिखें।',
    hindiSpeech: 'स्टेप 12: वारंटी रिप्लेसमेंट का कारण लिखें, जैसे डिफेक्टिव अंडर वारंटी।'
  },
  {
    action: 'addSheet',
    label: 'Add a New Sheet',
    hindiLabel: 'नई शीट जोड़ें',
    desc: 'Click the "+" button to add another ZFOC sheet tab.',
    hindiDesc: 'ऊपर "+" बटन दबाकर नई ZFOC शीट जोड़ सकते हैं।',
    hindiSpeech: 'अगर आपको एक से अधिक ZFOC बनाने हैं, तो ऊपर प्लस बटन दबाकर नई शीट जोड़ें।',
    selector: '#addEntryBtn',
    icon: '➕'
  },
  {
    action: 'renameSheet',
    label: 'Rename a Sheet',
    hindiLabel: 'शीट का नाम बदलें',
    desc: 'Double-click any tab name to edit it directly.',
    hindiDesc: 'किसी भी टैब पर डबल-क्लिक करके नाम बदलें।',
    hindiSpeech: 'टैब के नाम पर डबल-क्लिक करके आप शीट का नाम तुरंत बदल सकते हैं।',
    selector: '.tab-name',
    icon: '✏️'
  },
  {
    action: 'renameFile',
    label: 'File Name',
    hindiLabel: 'फाइल का नाम',
    desc: 'Type your custom file name in the File Name box.',
    hindiDesc: 'यहाँ एक्सपोर्ट होने वाली फाइल का नाम सेट करें।',
    hindiSpeech: 'यहाँ अपनी एक्सपोर्ट फाइल का नाम लिख सकते हैं, जैसे ZFOC क्लेम्स 2026।',
    selector: '#fileNameInput',
    icon: '📁'
  },
  {
    action: 'exportExcel',
    label: 'Export to Excel',
    hindiLabel: 'एक्सेल डाउनलोड करें',
    desc: 'Click "Download Excel" to save as multi-sheet workbook.',
    hindiDesc: '"Download Excel" बटन दबाकर मल्टी-शीट एक्सेल डाउनलोड करें।',
    hindiSpeech: 'डाउनलोड एक्सेल बटन दबाकर सभी शीट्स को एक सुंदर मल्टी-शीट एक्सेल वर्कबुक में प्राप्त करें।',
    selector: '#excelExportBtn',
    icon: '📊'
  },
  {
    action: 'exportPDF',
    label: 'Export to PDF',
    hindiLabel: 'पीडीएफ डाउनलोड करें',
    desc: 'Click "Download PDF" to generate a formatted printable document.',
    hindiDesc: '"Download PDF" दबाकर सभी शीट्स की कंबाइंड पीडीएफ बनाएं।',
    hindiSpeech: 'डाउनलोड पीडीएफ बटन दबाकर सभी शीट्स की A4 साइज पीडीएफ डाउनलोड करें।',
    selector: '#pdfExportBtn',
    icon: '📄'
  },
  {
    action: 'themeToggle',
    label: 'Dark / Light Mode',
    hindiLabel: 'डार्क / लाइट मोड',
    desc: 'Toggle between dark and light themes.',
    hindiDesc: 'अपनी पसंद के अनुसार डार्क या लाइट मोड चुनें।',
    hindiSpeech: 'यहाँ से आप डार्क मोड या लाइट मोड स्विच कर सकते हैं।',
    selector: '#themeToggle',
    icon: '🌓'
  },
  {
    action: 'clearAll',
    label: 'Clear All Sheets',
    hindiLabel: 'सभी शीट्स साफ करें',
    desc: 'Remove all sheets and start fresh with a single empty sheet.',
    hindiDesc: 'सभी शीट्स रीसेट करके फ्रेश शुरुआत करें।',
    hindiSpeech: 'क्लियर ऑल बटन दबाकर सभी शीट्स हटाकर एक नई फ्रेश शीट बना सकते हैं।',
    selector: '#clearAllBtn',
    icon: '🧹'
  }
];

export const DAIKIN_PRESETS = [
  {
    part: 'PCB (Indoor Main)',
    partCodeName: '1853920 - PRINTED CIRCUIT BOARD ASSY (INDOOR)',
    natureDefective: 'POWER ON FAILURE / PCB BURNT',
    reason: 'Internal IC short circuit during regular operation under warranty'
  },
  {
    part: 'Turbo Fan Rotor (Blower)',
    partCodeName: '4904178 - TURBO FAN ROTOR ( BLOWER )',
    natureDefective: 'BLOWER DAMAGE / ABNORMAL NOISE',
    reason: 'Blade cracked causing vibration under standard operation'
  },
  {
    part: 'Fan Motor (Indoor DC)',
    partCodeName: '2194832 - DC FAN MOTOR (INDOOR UNIT)',
    natureDefective: 'MOTOR NOT ROTATING / BEARING NOISE',
    reason: 'Internal winding open under warranty period'
  },
  {
    part: 'Compressor (Inverter Swing)',
    partCodeName: '3019284 - HERMETIC ROTARY COMPRESSOR',
    natureDefective: 'COMPRESSOR LOCK / NO COOLING',
    reason: 'Mechanical seizure confirmed by ASP site engineer'
  },
  {
    part: 'Sensor / Thermistor',
    partCodeName: '1439201 - ROOM TEMPERATURE THERMISTOR ASSY',
    natureDefective: 'INCORRECT TEMPERATURE READING / ERROR CODE',
    reason: 'Sensor value drifted causing intermittent cooling trip'
  },
  {
    part: 'Electronic Expansion Valve',
    partCodeName: '1682940 - ELECTRONIC EXPANSION VALVE (EEV)',
    natureDefective: 'EEV COIL OPEN / NOT FEEDING REFRIGERANT',
    reason: 'EEV stepper coil burned, no refrigerant flow'
  }
];
