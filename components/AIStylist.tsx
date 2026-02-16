
import React, { useState } from 'react';
import { getStylingAdvice } from '../services/gemini';

const AIStylist: React.FC = () => {
  const [input, setInput] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Basic sanitization to prevent simple XSS/Injection on client side
  const sanitizeInput = (text: string) => {
    return text.replace(/<[^>]*>?/gm, '').slice(0, 500); // Remove HTML tags & limit length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const cleanInput = sanitizeInput(input);
    const result = await getStylingAdvice(cleanInput);
    setAdvice(result || null);
    setLoading(false);
  };

  return (
    <div className="bg-black/50 border border-white/10 p-6 rounded-lg backdrop-blur-md max-w-xl mx-auto my-20">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-primary">psychology</span>
        <h3 className="text-xl font-bold uppercase tracking-tight">AI Savage Stylist</h3>
      </div>
      <p className="text-accent-gray text-sm mb-6">Pregúntale a nuestra IA cómo combinar tus joyas o qué outfit urban elegir para hoy.</p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: ¿Cómo combino una cadena de plata con un hoodie negro?"
          className="flex-1 bg-surface-dark border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <button
          disabled={loading}
          className="bg-primary hover:bg-red-700 disabled:bg-gray-700 text-white font-bold text-xs uppercase px-6 py-2 rounded transition-colors"
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </form>

      {advice && (
        <div className="mt-6 p-4 bg-white/5 border-l-2 border-primary rounded-r">
          <p className="text-sm italic text-gray-200">{advice}</p>
        </div>
      )}
    </div>
  );
};

export default AIStylist;
