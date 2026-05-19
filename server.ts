import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "https://ais-dev-ukvrzqgmpwr4h6z2c5pasa-801167364681.europe-west2.run.app",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API routes
app.post("/api/refine", async (req, res) => {
  const { input, instruction } = req.body;
  console.log("Receive refinement request:", { inputLength: input?.length, instruction });

  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: `Raw story:\n${input}\n\nInstruction:\n${instruction}` }] }],
      config: {
        systemInstruction: `You are LYRAE Voice — an emotionally intelligent storytelling and identity excavation system. 
        You are a "Narrative Mirror." Your role is to uncover the emotional thread hidden inside raw thoughts and transform them into a cohesive, deeply human narrative.
        
        Storytelling is not about "content"; it is about resonance. Bridge the internal experience and external truth. Let the audience feel: "this was written for me." Build trust through honest articulation of transformation.
        
        CRITICAL VOICE & HUMANIZATION GUIDELINES:
        Do not use emojis, dashes, or bullet points. 
        Do not use AI-sounding structures like "Here is your story" or "I've refined this for you."
        Transition naturally between thoughts. Use proper punctuation and paragraph breaks for rhythm.
        Tone: feminine but powerful, calm, deeply self-aware, and editorial.
        Never over-polish; the beauty lies in the human imperfection and raw truth.
        Deliver only the narrative itself. No commentary, no intro, no outro.
        
        YOUR MISSION:
        Articulate what the user cannot explain themselves. 
        Find the meaning in the cost of the experience and the identity that emerged.
        Priority: Truth over trends, silence over noise.
        
        OUTPUT FORMAT:
        Deliver a single, cohesive storytelling version. Use whitespace and line breaks naturally to create breath. It should feel like a high-end luxury editorial or a profound personal letter.`,
      },
    });

    const text = response.text || "No resonance found.";
    console.log("Refinement successful");

    res.json({ output: text });
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    res.status(500).json({ error: "The muse encountered an error. Please try again." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
