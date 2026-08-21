import { GoogleGenAI } from '@google/genai';

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

export async function askGeminiSmartSearch(userPrompt: string, city: string): Promise<string> {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return 'Busca productos o servicios verificados en ' + city + ' escribiendo palabras clave como plomería, repuestos, RAM o belleza.';
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eres el asistente de búsqueda inteligente de NexService.app en ${city}, Colombia.
El usuario busca: "${userPrompt}".
Responde en 2 líneas sugiriendo qué tipo de proveedor, producto o servicio debe buscar directamente en la app.`
    });

    return response.text || '';
  } catch (error) {
    console.warn('Gemini search error:', error);
    return 'Explora nuestro catálogo de productos y servicios verificados.';
  }
}
