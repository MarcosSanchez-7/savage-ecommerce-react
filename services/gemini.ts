
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getStylingAdvice(userInput: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction: "You are an elite urban streetwear stylist for the brand SAVAGE. Provide aggressive, bold, and high-fashion styling advice. Keep it short (max 2 sentences). Use Spanish. Be charismatic and direct.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Stylist error:", error);
    return "El estilo no espera. Elige lo que te haga sentir imparable.";
  }
}
