import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const CATEGORIES = {
  ANXIETY: "Anxiety",
  DEPRESSION: "Depression",
  ADHD: "ADHD",
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

export async function categorizeResponse(question: string, userResponse: string): Promise<Category> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Question: ${question}\nUser Response: ${userResponse}\n\nCategorize this response into exactly one of these three categories: Anxiety, Depression, or ADHD. Return ONLY the category name.`,
    config: {
      temperature: 0.1,
    },
  });

  const text = response.text?.trim() || "";
  if (text.includes("Anxiety")) return CATEGORIES.ANXIETY;
  if (text.includes("Depression")) return CATEGORIES.DEPRESSION;
  if (text.includes("ADHD")) return CATEGORIES.ADHD;
  
  return CATEGORIES.ANXIETY; // Fallback
}

export async function getEmpathicResponse(userResponse: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user just shared this about their mental health: "${userResponse}". \n\nAs Harper, a trustworthy and empathic mental health companion, provide a very brief (1-2 sentences), warm, and acknowledging response that validates their feelings. Do not give medical advice. Keep it calm and comforting.`,
    config: {
      temperature: 0.7,
    },
  });

  return response.text?.trim() || "I hear you, and I'm here with you. Thank you for sharing that with me.";
}
