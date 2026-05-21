import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

let googleAiClient: GoogleGenAI | null = null;

export function isGoogleAiConfigured() {
  return Boolean(geminiApiKey);
}

export function getGoogleAiClient() {
  if (!geminiApiKey) {
    throw new Error('Google AI ainda nao esta configurado. Preencha GEMINI_API_KEY em .env.local.');
  }

  if (!googleAiClient) {
    googleAiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  return googleAiClient;
}

export async function generateGoogleAiText(prompt: string) {
  const response = await getGoogleAiClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text ?? '';
}
