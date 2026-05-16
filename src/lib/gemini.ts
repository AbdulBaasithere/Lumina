import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInitialDraft(prompt: string, files: { name: string, data: string, type: string }[]) {
  const fileParts = files.map(file => ({
    inlineData: {
      data: file.data.split(',')[1], // Remove metadata prefix if present
      mimeType: file.type
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          ...fileParts,
          { text: `Write a high-quality, professional piece of writing based on this prompt: ${prompt}. Return ONLY the written content in plain text format.` }
        ]
      }
    ],
  });

  return response.text;
}

export async function iterateOnSection(context: string, selection: string, instructions: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    Context: ${context}
    Selected Text: ${selection}
    User Instructions: ${instructions}
    
    Task: Rewrite the "Selected Text" according to the "User Instructions", ensuring it fits seamlessly into the "Context". 
    Return ONLY the rewritten version of the selected text.
    `,
  });

  return response.text;
}

export async function getProactiveFeedback(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
    Document Content: ${content}
    
    Task: You are a writing companion. Review the document and provide 1-2 concise, proactive suggestions for improvement OR a predicted next sentence that continues the flow perfectly.
    If you have a suggestion for the existing text, specify the text to change and the new version.
    Return the response in JSON format:
    {
      "type": "suggestion" | "continuation",
      "originalText": "string (only for suggestion)",
      "proposedText": "string",
      "reason": "string"
    }
    If nothing meaningful to add, return null.
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || 'null');
  } catch {
    return null;
  }
}
