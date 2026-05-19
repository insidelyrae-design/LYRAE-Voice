const response = await ai.models.generateContent({
  model: "gemini-1.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Raw story:\n${input}\n\nInstruction:\n${instruction}`
        }
      ]
    }
  ],
  config: {
    systemInstruction: `You are LYRAE Voice — an emotionally intelligent storytelling system...
    (keep your system prompt exactly as-is)`
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

res.json({ output: text });
