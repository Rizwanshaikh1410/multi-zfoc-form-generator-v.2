import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let aiClient: GoogleGenAI | null = null;
  function getAI() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      copyright: 'Made By Rizwan Shaikh @2026',
    });
  });

  // Gemini API route
  app.post('/api/gemini', async (req, res) => {
    const { action, prompt, fields, notes } = req.body || {};

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured in server environment. Using smart local assistant.',
      });
    }

    try {
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
                orderType: { type: Type.STRING, description: 'Default "ZFOC" or order type' },
                customerName: { type: Type.STRING, description: 'Customer or dealer name in uppercase' },
                aspName: { type: Type.STRING, description: 'Authorized Service Provider name in uppercase' },
                aspAddress: { type: Type.STRING, description: 'Dealer or ASP physical address' },
                modelNumber: { type: Type.STRING, description: 'Machine model number e.g. FCQF18ARV16, FTKF50' },
                serialNo: { type: Type.STRING, description: 'Machine serial number e.g. 0020050' },
                invoiceNo: { type: Type.STRING, description: 'Invoice number or empty' },
                invoiceDate: { type: Type.STRING, description: 'Invoice date or empty' },
                natureDefective: { type: Type.STRING, description: 'Concise description of defective nature in uppercase e.g. BLOWER DAMAGE, PCB BURNT' },
                partCodeName: { type: Type.STRING, description: 'Part code and name in uppercase' },
                quantity: { type: Type.STRING, description: 'Quantity e.g. 1 NOS' },
                reason: { type: Type.STRING, description: 'Technical justification for warranty replacement' },
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
                'reason'
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({ success: true, data: parsed });
      }

      if (action === 'suggest') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are a Daikin Air Conditioning technical warranty specialist.
Suggest standard, technically valid Daikin Nature of Defective, Part Code/Name, and official Reason for the following query:
Query: "${prompt}"

Return a JSON with:
- partCodeName (string: format "CODE - PART NAME")
- natureDefective (string: technical defect concise in uppercase)
- reason (string: clear warranty reason)
- tipsHindi (string: short 1-2 sentence advice in simple Hindi for the technician)`,
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
        return res.json({ success: true, data: parsed });
      }

      if (action === 'validate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Audit this Daikin ZFOC claim form data:
${JSON.stringify(fields, null, 2)}

Provide a strict audit report in friendly Hindi (Hinglish) with:
1. Status: "valid" or "warning" or "incomplete"
2. Missing or suspicious fields
3. Helpful suggestions in Hindi to prevent claim rejection by Daikin.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                score: { type: Type.NUMBER, description: '0 to 100 score' },
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
        return res.json({ success: true, data: parsed });
      }

      // Default: Chat / Q&A
      const chatResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt || 'Hello',
        config: {
          systemInstruction:
            'You are Pooja, a friendly, sweet, and highly knowledgeable Daikin ZFOC AI Assistant. You assist Indian HVAC technicians, dealers, and SSD/ASP service engineers in filling Zero Free Of Cost (ZFOC) warranty sheets accurately. Always speak in polite, clear Hindi / Hinglish. Keep answers concise, direct, helpful, and easily understandable.',
        },
      });

      return res.json({
        success: true,
        message: chatResponse.text || 'नमस्ते! मैं आपकी ZFOC असिस्टेंट हूँ।',
      });
    } catch (err: any) {
      console.error('Gemini error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Error communicating with Gemini model.',
      });
    }
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
