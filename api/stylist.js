import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userInput } = req.body;
    // Use Server-side environment variable (Secure)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY in environment variables.");
        return res.status(500).json({ error: 'Configuration Error' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: userInput,
            config: {
                systemInstruction: "You are an elite urban streetwear stylist for the brand SAVAGE. Provide aggressive, bold, and high-fashion styling advice. Keep it short (max 2 sentences). Use Spanish. Be charismatic and direct.",
            },
        });

        // Ensure we send back the text string
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("AI Stylist error:", error);
        return res.status(500).json({ error: 'Failed to generate advice' });
    }
}
