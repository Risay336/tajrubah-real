
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  if (!text.trim()) {
    return "";
  }
  
  try {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translation, without any additional explanations or context.

Text to translate: "${text}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API translation error:", error);
    throw new Error("Failed to translate text. Please check your API key and network connection.");
  }
};
