import express from "express";
import cors from "cors";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `You are an expert web developer. Your task is to update the HTML, CSS, and JavaScript of a single-page web application based on a user's request.
The user will provide the current code and their request.
You must return a complete, valid HTML document that includes all necessary CSS (in <style> tags) and JavaScript (in <script> tags).

SAFETY & USAGE POLICY:
1. Do not generate harmful, offensive, or illegal content.
2. Do not include external scripts or resources unless they are from trusted CDNs (like Tailwind via CDN, Lucide icons, or Google Fonts).
3. Keep the code efficient and avoid unnecessary bloat.
4. If the request is ambiguous, make reasonable assumptions to provide a polished result.
5. Ensure the UI is responsive and accessible.

RESPONSE FORMAT:
You must respond with a JSON object containing:
- code: The full HTML string of the updated page.
- explanation: A brief summary of the changes made.
- safetyCheck: A boolean indicating if the request was safe to process. If false, provide a reason in the explanation and return the original code.
`;

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }));
  app.use(express.json());

  // API Routes
  app.post("/api/update-page", async (req, res) => {
    const { currentCode, userPrompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Current Code:\n\`\`\`html\n${currentCode}\n\`\`\`\n\nUser Request: ${userPrompt}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              explanation: { type: Type.STRING },
              safetyCheck: { type: Type.BOOLEAN }
            },
            required: ["code", "explanation", "safetyCheck"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Backend AI Error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });

  app.get("/", (req, res) => {
    res.json({ message: "Live Architect API is running" });
  });

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
