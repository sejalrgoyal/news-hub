import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;
let cachedKey = null;

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!client || cachedKey !== apiKey) {
    client = new GoogleGenerativeAI(apiKey);
    cachedKey = apiKey;
  }
  // Use stable v1 endpoint — gemini-1.5-flash is not on v1beta
  return client.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
}
