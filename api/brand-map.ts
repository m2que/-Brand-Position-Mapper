import { GoogleGenAI } from '@google/genai';
import { buildBrandMapPrompt, parseBrandMapResponse } from '../lib/brandMap.ts';

type VercelRequest = {
  method?: string;
  body?: {
    brandName?: unknown;
    scope?: unknown;
  };
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { brandName, scope } = req.body ?? {};

  const normalizedBrandName = typeof brandName === 'string' ? brandName.trim() : '';

  if (!normalizedBrandName) {
    return res.status(400).json({ error: 'Brand name is required.' });
  }

  if (normalizedBrandName.length > 300) {
    return res.status(400).json({ error: 'Brand name must be 300 characters or fewer.' });
  }

  if (typeof scope !== 'string' || !scope.trim()) {
    return res.status(400).json({ error: 'Scope is required.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`GEMINI_API_KEY present in handler: ${Boolean(apiKey)}`);

    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildBrandMapPrompt({ brandName: normalizedBrandName, scope: scope.trim() }),
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const verifiedSources = new Map<string, string>();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    groundingChunks.forEach((chunk) => {
      if (chunk.web?.uri) {
        verifiedSources.set(chunk.web.uri, chunk.web.title || '');
      }
    });

    const data = parseBrandMapResponse(response.text, verifiedSources);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Brand map generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate brand position map. Please try again.' });
  }
}
