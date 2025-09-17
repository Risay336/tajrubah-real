

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

export const getDefinition = async (
  word: string,
  language: string
): Promise<string> => {
  if (!word.trim()) {
    return "";
  }
  
  try {
    const prompt = `Provide all possible definitions for the following word or expression in ${language}. 
If it is an expression, explain its meaning. 
Format the output clearly with headings for each definition if there are multiple.
If no definition can be found, please state that clearly.

Word/Expression: "${word}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API definition error:", error);
    throw new Error("Failed to get definition.");
  }
};

export const getExamples = async (
  word: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  if (!word.trim()) {
    return "";
  }
  
  try {
    const prompt = `Provide a few clear example sentences for how to use the following word or expression in ${targetLang}. 
For each example, provide the sentence in ${targetLang} and also provide its translation in ${sourceLang}.
Format the output as a list.
If no examples can be found, please state that clearly.

Word/Expression: "${word}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API examples error:", error);
    throw new Error("Failed to get examples.");
  }
};
