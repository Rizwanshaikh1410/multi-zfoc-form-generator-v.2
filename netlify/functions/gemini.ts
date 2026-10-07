import { GoogleGenAI, Type } from '@google/genai';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        success: false,
        error: 'GEMINI_API_KEY environment variable is not configured on Netlify.',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, prompt, fields, notes } = body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    if (action === 'autofill') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert Daikin ZFOC (Zero Free Of Cost) warranty claim specialist.
Extract and map the provided unstructured job note or service complaint into standard Daikin ZFOC fields.
Return a structured JSON object strictly matching the schema.

User Raw Input:
"${notes || prompt || ''}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              orderType: { type: Type.STRING },
              customerName: { type: Type.STRING },
              aspName: { type: Type.STRING },
              aspAddress: { type: Type.STRING },
              modelNumber: { type: Type.STRING },
              serialNo: { type: Type.STRING },
              invoiceNo: { type: Type.STRING },
              invoiceDate: { type: Type.STRING },
              natureDefective: { type: Type.STRING },
              partCodeName: { type: Type.STRING },
              quantity: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: [
              'orderType',
              'customerName',
              'aspName',
              'aspAddress',
              'modelNumber',
              'serialNo',
              'natureDefective',
              'partCodeName',
              'quantity',
              'reason',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: parsed }),
      };
    }

    if (action === 'suggest') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Suggest standard Daikin defect details for query: "${prompt}". Return JSON with partCodeName, natureDefective, reason, tipsHindi.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              partCodeName: { type: Type.STRING },
              natureDefective: { type: Type.STRING },
              reason: { type: Type.STRING },
              tipsHindi: { type: Type.STRING },
            },
            required: ['partCodeName', 'natureDefective', 'reason', 'tipsHindi'],
          },
        },
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: parsed }),
      };
    }

    if (action === 'validate') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Audit this Daikin ZFOC claim form data: ${JSON.stringify(fields, null, 2)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              score: { type: Type.NUMBER },
              summaryHindi: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['status', 'score', 'summaryHindi', 'suggestions'],
          },
        },
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: parsed }),
      };
    }

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt || 'Hello',
      config: {
        systemInstruction:
          'You are Oria, a friendly, sweet, and highly knowledgeable Daikin ZFOC AI Assistant. Always speak in polite, clear Hindi / Hinglish. Keep answers concise, direct, helpful, and easily understandable.',
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: chatResponse.text || 'नमस्ते! मैं आपकी ZFOC असिस्टेंट हूँ।',
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
