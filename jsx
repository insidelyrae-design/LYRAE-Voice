import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are LYRAE Voice — an emotionally intelligent storytelling and identity excavation system.

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
Return only the refined narrative.`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@200;300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lv-root {
    min-height: 100vh;
    background-color: #0c0a09;
    background-image: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    color: #ede9e0;
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    letter-spacing: 0.01em;
    padding: 0 24px;
  }

  .lv-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 80px 0 120px;
  }

  .lv-header {
    text-align: center;
    margin-bottom: 72px;
    animation: fadeUp 0.9s ease both;
  }

  .lv-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #c4a870;
    margin-bottom: 14px;
  }

  .lv-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500;
    font-size: clamp(42px, 7vw, 68px);
    line-height: 1.0;
    letter-spacing: -0.01em;
    color: #ede9e0;
    margin-bottom: 20px;
  }

  .lv-title em {
    font-style: italic;
    color: #c4a870;
  }

  .lv-subtitle {
    font-family: 'Jost', sans-serif;
    font-weight: 200;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6b6358;
  }

  .lv-divider {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, transparent, #3a342c, transparent);
    margin: 0 auto 72px;
    animation: fadeUp 0.9s 0.1s ease both;
  }

  .lv-form {
    animation: fadeUp 0.9s 0.2s ease both;
  }

  .lv-field {
    margin-bottom: 32px;
  }

  .lv-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #6b6358;
    margin-bottom: 12px;
    font-weight: 400;
  }

  .lv-label span {
    color: #3d3830;
    margin-left: 6px;
  }

  .lv-textarea {
    width: 100%;
    background: #111009;
    border: 1px solid #2a2520;
    border-radius: 2px;
    color: #ede9e0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 300;
    line-height: 1.75;
    padding: 20px 22px;
    resize: none;
    outline: none;
    transition: border-color 0.3s ease;
    caret-color: #c4a870;
  }

  .lv-textarea::placeholder {
    color: #3a342c;
    font-style: italic;
  }

  .lv-textarea:focus {
    border-color: #3d3830;
  }

  .lv-textarea.small {
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.6;
  }

  .lv-button {
    width: 100%;
    padding: 20px;
    background: #ede9e0;
    color: #0c0a09;
    border: none;
    border-radius: 2px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 8px;
  }

  .lv-button:hover:not(:disabled) {
    background: #c4a870;
    color: #0c0a09;
  }

  .lv-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .lv-output-wrap {
    margin-top: 64px;
    border-top: 1px solid #1e1c18;
    padding-top: 48px;
    animation: fadeUp 0.7s ease both;
  }

  .lv-output-label {
    font-size: 10px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #6b6358;
    font-weight: 400;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lv-copy-btn {
    background: none;
    border: 1px solid #2a2520;
    color: #6b6358;
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 6px 14px;
    cursor: pointer;
    border-radius: 1px;
    transition: all 0.25s ease;
  }

  .lv-copy-btn:hover {
    border-color: #c4a870;
    color: #c4a870;
  }

  .lv-output-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 300;
    line-height: 1.85;
    color: #d8d2c5;
    white-space: pre-wrap;
  }

  .lv-output-text p {
    margin-bottom: 1.4em;
  }

  .lv-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 36px 0;
  }

  .lv-loading-bar {
    height: 1px;
    background: linear-gradient(to right, transparent, #c4a870, transparent);
    animation: shimmer 2s ease-in-out infinite;
    flex: 1;
  }

  .lv-loading-text {
    font-size: 10px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #4a4540;
    white-space: nowrap;
  }

  .lv-footer {
    text-align: center;
    margin-top: 80px;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #2e2a25;
    animation: fadeUp 0.9s 0.3s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0%   { opacity: 0.3; }
    50%  { opacity: 1; }
    100% { opacity: 0.3; }
  }

  @keyframes textReveal {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .lv-revealed {
    animation: textReveal 0.8s ease both;
  }

  .lv-copied {
    color: #c4a870 !important;
    border-color: #c4a870 !important;
  }
`;

export default function LyraeVoice() {
  const [input, setInput] = useState("");
  const [instruction, setInstruction] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output]);

  const refine = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Raw story:\n${input}\n\nInstruction:\n${instruction || "Refine this into a cinematic narrative"}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text;

      if (text) {
        setOutput(text);
      } else {
        setError("The model returned an empty response. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const outputParagraphs = output
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);

  return (
    <div className="lv-root">
      <div className="lv-container">

        <header className="lv-header">
          <div className="lv-wordmark">LYRAE</div>
          <h1 className="lv-title">
            Narrative<br /><em>Mirror</em>
          </h1>
          <p className="lv-subtitle">Identity excavation system</p>
        </header>

        <div className="lv-divider" />

        <div className="lv-form">
          <div className="lv-field">
            <label className="lv-label">
              Raw Story <span>— what actually happened</span>
            </label>
            <textarea
              className="lv-textarea"
              rows={9}
              placeholder="Write it raw. Unpolished. The version you haven't shared yet."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="lv-field">
            <label className="lv-label">
              Direction <span>— optional</span>
            </label>
            <textarea
              className="lv-textarea small"
              rows={3}
              placeholder="Leave blank to let the mirror decide. Or give it a thread to pull."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </div>

          <button
            className="lv-button"
            onClick={refine}
            disabled={loading || !input.trim()}
          >
            {loading ? "Excavating" : "Refine Narrative"}
          </button>
        </div>

        {loading && (
          <div className="lv-output-wrap">
            <div className="lv-loading">
              <div className="lv-loading-bar" />
              <span className="lv-loading-text">Finding the thread</span>
              <div className="lv-loading-bar" />
            </div>
          </div>
        )}

        {error && (
          <div className="lv-output-wrap">
            <p style={{ color: "#6b6358", fontSize: "13px", fontFamily: "'Jost', sans-serif" }}>
              {error}
            </p>
          </div>
        )}

        {output && !loading && (
          <div className="lv-output-wrap" ref={outputRef}>
            <div className="lv-output-label">
              <span>Refined Narrative</span>
              <button
                className={`lv-copy-btn${copied ? " lv-copied" : ""}`}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="lv-output-text lv-revealed">
              {outputParagraphs}
            </div>
          </div>
        )}

        <div className="lv-footer">LYRAE Voice &nbsp;&middot;&nbsp; Narrative Mirror</div>
      </div>
    </div>
  );
}
