import { GoogleGenAI, Type } from '@google/genai';

const MODEL = 'gemini-3.6-flash';

const CROP_SCANNER_SYSTEM = `You are an expert East African agronomist. Analyze this crop leaf image. Identify any disease, severity percentage, symptoms, and organic/chemical treatments suitable for farming in Rwanda. Format response cleanly. If the image is not a plant, crop, or leaf, set isCropImage to false. Respond ONLY with valid JSON matching the schema.`;

function buildAgriSystemPrompt(lang: 'en' | 'rw' = 'en'): string {
  if (lang === 'rw') {
    return `Uraguye aho AgriX AI, umujyanama w'ubuhinzi w'inzobere mu Rwanda na Afurika y'Iburasirazuba. Ufite inshingano yo gutanga inama zikurikira:
- Gusubiza GUSA mu Kinyarwanda. Ntukoresha Icyongereza cyangwa ururimi urundi mu gisubizo.
- Tanga ibisubizo byoroshye kandi byunvikana vuba ku bibazo by'ubuhinzi.
- Bigisha abahinzi ku bijanye n'ubutaka, ifumbire (NPK/Urea), kurwanya inzoka n'indwara, n'ibihe.
- Gukoresha markdown (###, bullet lists) iyo bikenewe.
- Rangiza buri gisubizo ugize: "Ni iki ariko nakufasha mu buhinzi bwawe uyu munsi?"`;
  }
  return `You are AgriX AI, an elite agricultural advisor for farmers in Rwanda and East Africa. Your rules:
- Respond ONLY in English. Do NOT include Kinyarwanda translations in the same message.
- Give direct, concise agricultural answers immediately — no preamble.
- Cover soil health, fertilizer (NPK/Urea), pest management, regional weather, and market advice.
- Use markdown headings (###) and bullet lists when helpful for clarity.
- End every response with: "How else can I assist your farm today?"`;
}

export interface VisionDiagnostic {
  isCropImage: boolean;
  condition: string;
  severityPercent: number;
  severityLevel: 'low' | 'moderate' | 'high';
  affectedCrop: string;
  confidence: number;
  symptomsEn: string;
  symptomsRw: string;
  preventionEn: string;
  preventionRw: string;
  treatmentEn: string;
  treatmentRw: string;
  organicTreatments: string;
  chemicalTreatments: string;
  summaryEn: string;
  summaryRw: string;
}

export function getGeminiApiKey(): string | undefined {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (typeof key !== 'string') return undefined;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== undefined;
}

/**
 * Parses raw image strings or Data URLs into clean base64 data and MIME types.
 * Converts SVG images to PNG canvas raster images before passing to Gemini API.
 */
export async function prepareBase64Image(rawImageString: string): Promise<{ base64: string; mimeType: string }> {
  // Extract base64 payload cleanly
  const base64Data = rawImageString.includes(',') ? rawImageString.split(',')[1] : rawImageString;

  let mimeType = 'image/jpeg';
  const headerMatch = rawImageString.match(/^data:([^;]+);base64,/);
  if (headerMatch) {
    mimeType = headerMatch[1].toLowerCase();
  }

  // Handle SVGs safely by converting SVG to PNG data URL via HTML Canvas
  if (mimeType.includes('svg') || rawImageString.startsWith('data:image/svg+xml') || rawImageString.includes('<svg')) {
    try {
      const pngDataUrl = await convertSvgToPngDataUrl(
        rawImageString.startsWith('data:') ? rawImageString : `data:image/svg+xml;base64,${base64Data}`
      );
      const pngBase64 = pngDataUrl.includes(',') ? pngDataUrl.split(',')[1] : pngDataUrl;
      return {
        mimeType: 'image/png',
        base64: pngBase64,
      };
    } catch (err) {
      console.warn('SVG to PNG canvas conversion notice:', err);
    }
  }

  // Ensure supported raster image MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(mimeType)) {
    mimeType = 'image/png';
  }

  return {
    mimeType,
    base64: base64Data.trim(),
  };
}

function convertSvgToPngDataUrl(svgDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 600;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to obtain 2D canvas context'));
        return;
      }
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.onerror = (e) => reject(e);
    img.src = svgDataUrl;
  });
}

const visionSchema = {
  type: Type.OBJECT,
  properties: {
    isCropImage: { type: Type.BOOLEAN },
    condition: { type: Type.STRING },
    severityPercent: { type: Type.NUMBER },
    severityLevel: { type: Type.STRING, enum: ['low', 'moderate', 'high'] },
    affectedCrop: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    symptomsEn: { type: Type.STRING },
    symptomsRw: { type: Type.STRING },
    preventionEn: { type: Type.STRING },
    preventionRw: { type: Type.STRING },
    treatmentEn: { type: Type.STRING },
    treatmentRw: { type: Type.STRING },
    organicTreatments: { type: Type.STRING },
    chemicalTreatments: { type: Type.STRING },
    summaryEn: { type: Type.STRING },
    summaryRw: { type: Type.STRING },
  },
  required: [
    'isCropImage',
    'condition',
    'severityPercent',
    'severityLevel',
    'affectedCrop',
    'confidence',
    'symptomsEn',
    'symptomsRw',
    'preventionEn',
    'preventionRw',
    'treatmentEn',
    'treatmentRw',
    'organicTreatments',
    'chemicalTreatments',
    'summaryEn',
    'summaryRw',
  ],
};

export async function analyzeCropImage(rawImageString: string): Promise<VisionDiagnostic> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const { base64, mimeType } = await prepareBase64Image(rawImageString);
  const promptText = `You are an expert East African agronomist. Analyze this crop leaf image. Identify any disease, severity percentage, symptoms, and organic/chemical treatments suitable for farming in Rwanda. Format response cleanly. Return valid JSON.`;

  // Attempt SDK call first
  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: promptText },
          ],
        },
      ],
      config: {
        systemInstruction: CROP_SCANNER_SYSTEM,
        responseMimeType: 'application/json',
        responseSchema: visionSchema,
      },
    });

    if (response.text) {
      let raw = response.text.trim();
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      const parsed = JSON.parse(raw) as VisionDiagnostic;
      parsed.severityPercent = Math.min(100, Math.max(0, Math.round(parsed.severityPercent || 0)));
      parsed.confidence = Math.min(100, Math.max(0, Math.round(parsed.confidence || 0)));
      return parsed;
    }
  } catch (sdkErr) {
    console.warn('Gemini SDK vision call failed, falling back to direct REST endpoint:', sdkErr);
  }

  // Fallback to direct REST endpoint URL format:
  // https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: promptText },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: CROP_SCANNER_SYSTEM }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: visionSchema,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {
        const text = await res.text();
        if (text) errorMsg = text;
      }
      throw new Error(`Gemini Vision API error (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini vision model.');
    }

    let clean = candidateText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(clean) as VisionDiagnostic;
    parsed.severityPercent = Math.min(100, Math.max(0, Math.round(parsed.severityPercent || 0)));
    parsed.confidence = Math.min(100, Math.max(0, Math.round(parsed.confidence || 0)));
    return parsed;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unexpected network or server error contacting the AgriX Vision AI.');
  }
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export async function sendAgriChatMessage(
  history: ChatTurn[],
  userMessage: string,
  lang: 'en' | 'rw' = 'en',
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const contents = [
    ...history.map((turn) => ({
      role: turn.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: turn.text }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  // Try SDK call first
  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildAgriSystemPrompt(lang),
      },
    });

    if (response.text?.trim()) {
      return response.text.trim();
    }
  } catch (sdkErr) {
    console.warn('AI chat SDK call failed, falling back to direct REST endpoint:', sdkErr);
  }

  // Fallback to direct REST endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const payload = {
    contents: contents.map((c) => ({
      role: c.role === 'model' ? 'model' : 'user',
      parts: c.parts,
    })),
    systemInstruction: {
      parts: [{ text: buildAgriSystemPrompt(lang) }],
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {
        const text = await res.text();
        if (text) errorMsg = text;
      }
      throw new Error(`AI Chat API error (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Empty response from AgriX AI chat model.');
    }
    return text;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unexpected network or server error contacting the AgriX AI Chat API.');
  }
}

export function severityBarColor(percent: number): string {
  if (percent <= 33) return '#22c55e';
  if (percent <= 66) return '#eab308';
  return '#ef4444';
}

export function severityBarTone(percent: number): 'good' | 'warn' | 'bad' {
  if (percent <= 33) return 'good';
  if (percent <= 66) return 'warn';
  return 'bad';
}
