
import { GoogleGenAI, Type } from "@google/genai";
import { QuizSet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    multipleChoice: {
      type: Type.ARRAY,
      description: "Generate exactly 10 multiple-choice questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exactly 4 options: A, B, C, D."
          },
          answer: { type: Type.STRING, description: "The correct option (e.g., 'A')" },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "answer", "explanation"]
      }
    },
    judgement: {
      type: Type.ARRAY,
      description: "Generate exactly 10 true/false questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING }
        },
        required: ["question", "answer", "explanation"]
      }
    },
    fillInBlank: {
      type: Type.ARRAY,
      description: "Generate exactly 7 fill-in-the-blank questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Question text with '____' for the blank." },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["question", "answer", "explanation"]
      }
    },
    shortAnswer: {
      type: Type.ARRAY,
      description: "Generate exactly 3 short-answer questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          sampleAnswer: { type: Type.STRING },
          keyPoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Main concepts required in the answer."
          }
        },
        required: ["question", "sampleAnswer", "keyPoints"]
      }
    }
  },
  required: ["multipleChoice", "judgement", "fillInBlank", "shortAnswer"]
};

export const generateQuizFromMaterial = async (material: string): Promise<QuizSet> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following material, generate a comprehensive quiz. 
    Requirements:
    - Language: Chinese (Simplified)
    - Total Questions: 30
    - Multiple Choice: 10
    - Judgement (True/False): 10
    - Fill-in-the-blanks: 7
    - Short Answer: 3
    
    Material Content:
    ${material}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: QUIZ_SCHEMA,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response generated from the model.");
  }

  try {
    return JSON.parse(text) as QuizSet;
  } catch (error) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Generated content format was invalid.");
  }
};
