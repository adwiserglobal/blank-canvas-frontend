
import { GoogleGenAI, Type, Schema } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDocumentContent = async (context: string, isSnippet: boolean = false, instructions: string = '', language: 'en' | 'pt' = 'en'): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(isSnippet ? " [AI Content Placeholder] " : `
# ${context}
This is a placeholder for your document. Please start writing here.

*AI Generation is disabled because the API Key is not configured.*
    `);
  }
  
  try {
    const langInstruction = language === 'pt' ? 'Output MUST be in Portuguese.' : 'Output MUST be in English.';

    const systemInstruction = isSnippet 
        ? `You are an expert technical writer assistant. You will be given a prompt to write a specific section, paragraph, list, or sentence. Return ONLY the HTML content for that specific request, without wrapping \`html\` or \`body\` tags. Keep it concise and professional. ${langInstruction}`
        : `You are an expert technical writer and project manager who creates clear, actionable, and structured documents for professional teams. Your output should be in HTML format suitable for a WYSIWYG editor (use h1, h2, h3, p, ul, li, strong, etc). Do not include markdown code blocks or \`<html>\` tags, just the body content. Use colors, styling and emojis sparsely to create a professional look. ${langInstruction}`;

    const userPrompt = isSnippet 
        ? `Write content for: "${context}"` 
        : instructions 
            ? `Create a document titled "${context}". \n\n Specific Instructions from user: ${instructions}. \n\n ${langInstruction} \n\n Ensure the document is well structured and comprehensive.`
            : `Generate a structured document for the following topic: "${context}". ${langInstruction} The document should have a logical structure with sections, headings, bullet points, and placeholders (e.g., "[Insert description here]") where appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate document from AI.");
  }
};

export const chatWithDocument = async (docContent: string, userMessage: string): Promise<string> => {
    if (!API_KEY) {
        return "AI is unavailable. Please check API Key.";
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Context (Document Content):
            ${docContent}
            
            User Question:
            ${userMessage}`,
            config: {
                systemInstruction: "You are Nexia, a helpful document assistant. The user is editing a document, and you have access to its current content. Answer the user's questions based on the document context, suggest improvements, or write new sections as requested. Keep answers concise.",
            }
        });
        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Error chatting with doc:", error);
        throw new Error("Failed to chat with document.");
    }
};

export interface AiProjectDetails {
  icon: string;
  columns: { title: string; color: string }[];
  slas: string;
  kpis: string;
  onboardingMessage: string;
}

export const generateProjectDetails = async (name: string, description: string): Promise<AiProjectDetails> => {
    if (!API_KEY) {
        throw new Error("API Key not configured");
    }

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            icon: {
                type: Type.STRING,
                description: "A single emoji that best represents the project theme.",
            },
            columns: {
                type: Type.ARRAY,
                description: "A list of 3 to 6 kanban column titles relevant to the project workflow.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        color: { 
                            type: Type.STRING,
                            description: "A tailwind border color class. Must be one of: 'border-l-blue-500', 'border-l-green-500', 'border-l-red-500', 'border-l-yellow-500', 'border-l-purple-500', 'border-l-pink-500', 'border-l-indigo-500', 'border-l-gray-500', 'border-l-orange-500'. Pick colors that imply progress (e.g. green for done, red for blocked, etc)." 
                        }
                    },
                    required: ["title", "color"]
                }
            },
            slas: {
                type: Type.STRING,
                description: "A formatted text block listing Service Level Agreements suitable for this project.",
            },
            kpis: {
                type: Type.STRING,
                description: "A formatted text block listing Key Performance Indicators suitable for this project.",
            },
            onboardingMessage: {
                type: Type.STRING,
                description: "A welcoming and professional onboarding message for new team members joining this project.",
            }
        },
        required: ["icon", "columns", "slas", "kpis", "onboardingMessage"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a project structure for a project named "${name}". Description: "${description}". 
            Detect the language of the input (Portuguese or English) and generate the content (KPIs, SLAs, Onboarding, Column Titles) in that same language.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are Nexia, an elite AI Project Manager assistant. You specialize in setting up efficient workflows, defining clear success metrics, and creating welcoming team environments.",
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AiProjectDetails;
        }
        throw new Error("Empty response from AI");

    } catch (error) {
        console.error("Error generating project details:", error);
        throw new Error("Failed to generate project details.");
    }
};
