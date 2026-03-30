import { GoogleGenerativeAI } from '@google/generative-ai';
import { StampExtraction } from '@/types';

const STAMP_PROMPT = `Analyze this passport stamp image. Extract the following information and respond ONLY with valid JSON (no markdown, no code blocks):

{
  "country": "country name or null if unreadable",
  "city": "city or port of entry name or null if unreadable",
  "date": "date in YYYY-MM-DD format or null if unreadable",
  "type": "entry or exit or unknown",
  "confidence": 0.0 to 1.0 how confident you are,
  "raw_text": "all readable text from the stamp"
}

If the image is not a passport stamp, return: {"country":null,"city":null,"date":null,"type":"unknown","confidence":0,"raw_text":"Not a passport stamp"}`;

/**
 * Extracts passport stamp data from a base64-encoded image using Google Gemini.
 * @param imageBase64 - The image encoded as a base64 string
 * @param mimeType - The MIME type of the image (e.g. "image/jpeg")
 * @returns Extracted stamp data
 */
export async function extractStampData(
  imageBase64: string,
  mimeType: string
): Promise<StampExtraction> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_API_KEY environment variable');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: STAMP_PROMPT },
  ]);

  const text = result.response.text();

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned) as StampExtraction;
  } catch {
    return {
      country: null,
      city: null,
      date: null,
      type: 'unknown',
      confidence: 0,
      raw_text: text,
    };
  }
}
