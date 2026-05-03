import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  text: "gemini-3-flash-preview",
  image: "gemini-2.5-flash-image",
  vision: "gemini-3-flash-preview",
};

export type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export async function* streamChat(messages: Message[]) {
  const chat = ai.chats.create({
    model: MODELS.text,
    history: messages.slice(0, -1),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream({
    message: lastMessage.parts[0].text,
  });

  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: MODELS.image,
    contents: [{ parts: [{ text: prompt }] }],
  });

  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) return null;

  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function analyzeImage(prompt: string, base64Data: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: MODELS.vision,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      }
    ],
  });

  return response.text;
}
