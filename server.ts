const response = await ai.models.generateContent({
  model: "gemini-1.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Raw story:\n${input}\n\nInstruction:\n${
            instruction || "Refine this into a cinematic narrative"
          }`
        }
      ]
    }
  ],
  config: {
    systemInstruction: `You are LYRAE Voice — an emotionally intelligent storytelling and identity excavation system.

You are a "Narrative Mirror." Your role is to uncover the emotional thread hidden inside raw thoughts and transform them into a cohesive, deeply human narrative.

Storytelling is not about "content"; it is about resonance. Bridge the internal experience and external truth. Let the audience feel: "this was written for me."

CRITICAL VOICE GUIDELINES:
- Do not use emojis, dashes, or bullet points
- Do not use AI phrasing like "Here is your story"
- No introductions or explanations
- Output only the narrative
- Tone: feminine, powerful, calm, editorial, deeply human
- Use natural paragraph breaks for rhythm

YOUR MISSION:
Extract emotional truth, identity shift, and meaning from lived experience.

OUTPUT FORMAT:
Return only the refined narrative.`
  }
});

// ✅ SAFE extraction (this is the fix)
const text =
  response.candidates?.[0]?.content?.parts?.[0]?.text;

if (!text) {
  console.error("Empty Gemini response:", response);
  return res.status(500).json({
    error: "Model returned empty response"
  });
}

console.log("Refinement successful");

return res.json({ output: text });
