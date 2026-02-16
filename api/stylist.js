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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY env var");
        return res.status(500).json({ error: 'Config Error' });
    }

    // 1. Input Sanitization & Validation
    if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // Truncate to prevent token exhaustion (Cost Protection)
    const sanitizedInput = userInput.slice(0, 500);

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `Context: The user is asking for fashion advice for Savage Streetwear.\nUser Query: ${sanitizedInput}` }]
                }
            ],
            config: {
                systemInstruction: "You are an elite urban streetwear stylist for the brand SAVAGE. Your goal is to sell Savage products and give style advice. If the user asks about anything unrelated to fashion, clothes, or the brand, politely refuse and steer back to style. Keep responses short (max 2 sentences). Use Spanish. Be charismatic and direct.",
            },
        });

        // Ensure we send back the text string
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("AI Stylist error:", error);
        return res.status(500).json({ error: 'Failed to generate advice' });
    }
}
