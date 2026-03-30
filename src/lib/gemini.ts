import { StampExtraction } from '@/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function extractStampData(imageBase64: string, mimeType: string): Promise<StampExtraction> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_API_KEY environment variable');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Analyze this passport stamp image. Extract the following information and respond ONLY with valid JSON (no markdown, no code blocks):

{
  "country": "country name or null if unreadable",
  "city": "city or port of entry name or null if unreadable",
  "date": "date in YYYY-MM-DD format or null if unreadable",
  "type": "entry or exit or unknown",
  "confidence": 0.0 to 1.0 how confident you are,
  "raw_text": "all readable text from the stamp"
}

If the image is not a passport stamp, return: {"country":null,"city":null,"date":null,"type":"unknown","confidence":0,"raw_text":"Not a passport stamp"}`,
            },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${error}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
