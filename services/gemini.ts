// SERVICES: AI Stylist Service (Proxy to Backend)
// We moved the logic to /api/stylist to protect the API Key.

export async function getStylingAdvice(userInput: string) {
  try {
    const response = await fetch('/api/stylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "El estilo no espera. Elige lo que te haga sentir imparable.";

  } catch (error) {
    console.error("AI Stylist error:", error);
    return "El estilo no espera. Elige lo que te haga sentir imparable.";
  }
}
