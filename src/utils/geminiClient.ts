import { DAIKIN_PRESETS, ZfocFields } from '../types';

export interface GeminiClientOptions {
  action: 'autofill' | 'suggest' | 'validate' | 'chat';
  prompt?: string;
  notes?: string;
  fields?: ZfocFields;
}

export async function callGemini(options: GeminiClientOptions): Promise<{
  success: boolean;
  data?: any;
  message?: string;
  isFallback?: boolean;
}> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json;
      }
    }
  } catch {
    // Network or server unreachable; will run intelligent local fallback
  }

  // Intelligent local fallback logic
  return runSmartLocalFallback(options);
}

function runSmartLocalFallback(options: GeminiClientOptions): {
  success: boolean;
  data?: any;
  message?: string;
  isFallback: boolean;
} {
  const { action, prompt = '', notes = '', fields } = options;

  if (action === 'autofill') {
    const text = (notes || prompt).toLowerCase();
    const result: Partial<ZfocFields> = {
      orderType: 'ZFOC',
      quantity: '1 NOS',
    };

    // Extract customer name
    const custMatch = text.match(/(?:customer|client|dealer|naam|cust)[\s:]+([A-Za-z0-9\s]+?)(?:,|\.|\n|model|serial|address|$)/i);
    if (custMatch && custMatch[1].trim()) {
      result.customerName = custMatch[1].trim().toUpperCase();
    } else {
      result.customerName = 'LOTUS ELECTRONICS';
    }

    // Extract model number
    const modelMatch = text.match(/\b(F[A-Z0-9]{6,12}|FTK[A-Z0-9]+|FCQ[A-Z0-9]+|R[A-Z0-9]{6,12})\b/i);
    if (modelMatch) {
      result.modelNumber = modelMatch[1].toUpperCase();
    } else {
      result.modelNumber = 'FCQF18ARV16';
    }

    // Extract serial number
    const serialMatch = text.match(/(?:sr|serial|s\/n|sr no)[\s.:#]+([A-Za-z0-9]+)/i) || text.match(/\b(\d{6,10})\b/);
    if (serialMatch) {
      result.serialNo = serialMatch[1].toUpperCase();
    } else {
      result.serialNo = '0020050';
    }

    // Extract defect and match Daikin preset
    let matchedPreset = DAIKIN_PRESETS[0];
    if (text.includes('pcb') || text.includes('board') || text.includes('display') || text.includes('power')) {
      matchedPreset = DAIKIN_PRESETS[0];
    } else if (text.includes('fan') || text.includes('blower') || text.includes('rotor')) {
      matchedPreset = DAIKIN_PRESETS[1];
    } else if (text.includes('motor') || text.includes('winding')) {
      matchedPreset = DAIKIN_PRESETS[2];
    } else if (text.includes('compressor') || text.includes('cool') || text.includes('lock')) {
      matchedPreset = DAIKIN_PRESETS[3];
    } else if (text.includes('sensor') || text.includes('thermistor') || text.includes('temp')) {
      matchedPreset = DAIKIN_PRESETS[4];
    } else if (text.includes('eev') || text.includes('valve') || text.includes('coil')) {
      matchedPreset = DAIKIN_PRESETS[5];
    }

    result.natureDefective = matchedPreset.natureDefective;
    result.partCodeName = matchedPreset.partCodeName;
    result.reason = matchedPreset.reason;
    result.aspName = 'INFA AIR CONDITIONER';
    result.aspAddress = '8/2 BARGAL COLONY PALSIKAR SQUARE';
    result.invoiceNo = '';
    result.invoiceDate = '';

    return {
      success: true,
      data: result,
      isFallback: true,
    };
  }

  if (action === 'suggest') {
    const q = prompt.toLowerCase();
    const found = DAIKIN_PRESETS.find(
      (p) =>
        p.part.toLowerCase().includes(q) ||
        p.natureDefective.toLowerCase().includes(q) ||
        p.partCodeName.toLowerCase().includes(q)
    ) || DAIKIN_PRESETS[0];

    return {
      success: true,
      data: {
        partCodeName: found.partCodeName,
        natureDefective: found.natureDefective,
        reason: found.reason,
        tipsHindi: 'यह पार्ट डाइकिन वारंटी गाइडलाइंस के अनुकूल है। सुनिश्चित करें कि सीरियल नंबर सही लिखा है।',
      },
      isFallback: true,
    };
  }

  if (action === 'validate') {
    const missing: string[] = [];
    if (!fields?.customerName?.trim()) missing.push('Customer Name (ग्राहक का नाम)');
    if (!fields?.modelNumber?.trim()) missing.push('Machine Model Number (मॉडल नंबर)');
    if (!fields?.serialNo?.trim()) missing.push('Serial No. (सीरियल नंबर)');
    if (!fields?.natureDefective?.trim()) missing.push('Nature of Defective (खराबी का प्रकार)');
    if (!fields?.partCodeName?.trim()) missing.push('Part Code & Name (पार्ट कोड और नाम)');

    const score = Math.max(20, 100 - missing.length * 15);
    const isValid = missing.length === 0;

    return {
      success: true,
      data: {
        status: isValid ? 'valid' : 'warning',
        score,
        summaryHindi: isValid
          ? 'बहुत बढ़िया! आपके फॉर्म के सभी जरूरी फील्ड सही भरे हुए हैं। यह ZFOC क्लेम के लिए तैयार है।'
          : `कृपया ध्यान दें: ${missing.length} जरूरी फील्ड खाली हैं। डाइकिन अप्रूवल के लिए इन्हें भरना जरूरी है।`,
        suggestions: missing.length > 0 ? missing.map((m) => `कृपया ${m} भरें`) : ['सभी फील्ड पूर्ण हैं। अब आप एक्सेल या पीडीएफ एक्सपोर्ट कर सकते हैं।'],
      },
      isFallback: true,
    };
  }

  // Chat fallback in sweet Hindi
  let reply = 'नमस्ते! मैं पूजा, आपकी डाइकिन ZFOC AI गाइड हूँ। ZFOC (Zero Free Of Cost) फॉर्म भरने में मैं आपकी पूरी मदद करूँगी। आप ऊपर दिए गए ऑटो-फिल टूल से सीधे कंप्लेंट नोट्स पेस्ट करके फॉर्म भर सकते हैं!';
  const lower = prompt.toLowerCase();
  if (lower.includes('zfoc') || lower.includes('kya hai') || lower.includes('what is')) {
    reply = 'ZFOC का मतलब "Zero Free Of Cost" है। जब कोई डाइकिन एसी वारंटी पीरियड में होता है और उसका कोई पार्ट (जैसे PCB, फैन मोटर, कंप्रेसर) डिफेक्टिव हो जाता है, तो फ्री रिप्लेसमेंट पाने के लिए यह ZFOC शीट डाइकिन को सबमिट की जाती है।';
  } else if (lower.includes('invoice') || lower.includes('bill')) {
    reply = 'यदि इनवॉइस नंबर उपलब्ध नहीं है तो आप उसे खाली छोड़ सकते हैं। लेकिन मशीन का मॉडल नंबर और सीरियल नंबर बिल्कुल सटीक होना चाहिए ताकि वारंटी वैलिडेट हो सके।';
  } else if (lower.includes('pcb') || lower.includes('motor') || lower.includes('compressor')) {
    reply = 'पार्ट्स क्लेम करते समय Nature of Defective में स्पष्ट तकनीकी खराबी (जैसे PCB BURNT, BEARING NOISE, या NO COOLING) लिखना जरूरी होता है, जिससे डाइकिन टीम इसे तुरंत अप्रूव कर दे।';
  }

  return {
    success: true,
    message: reply,
    isFallback: true,
  };
}
