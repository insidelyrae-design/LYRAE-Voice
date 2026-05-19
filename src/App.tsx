/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, BookOpen, Quote, Scissors, Loader2, Archive, Settings, Compass, MoreHorizontal, Plus } from "lucide-react";

const OUTPUT_FORMATS = [
  {
    id: "founder-story",
    label: "Founder Story",
    icon: BookOpen,
    description: "Full narrative arc",
    instruction: "Transform this into a powerful founder story with an emotionally resonant arc."
  },
  {
    id: "caption",
    label: "Caption",
    icon: MessageSquare,
    description: "Emotional engagement",
    instruction: "Transform this into a social media caption that stops the scroll and evokes deep emotion."
  },
  {
    id: "positioning",
    label: "Positioning",
    icon: Quote,
    description: "Identity statement",
    instruction: "distill this into a powerful positioning statement that defines a unique category of one."
  },
  {
    id: "hook",
    label: "Story Hook",
    icon: Scissors,
    description: "Opening clarity",
    instruction: "Create three different, arresting hooks that pull the reader into the heart of the story."
  }
];

export default function App() {
  const [rawInput, setRawInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("founder-story");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("main"); // "main", "archive", "theory", "settings"
  const [isLegacyMode, setIsLegacyMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [archive, setArchive] = useState<any[]>(() => {
    const saved = localStorage.getItem("lyrae_archive");
    return saved ? JSON.parse(saved) : [];
  });

  const handleRefine = async () => {
    if (!rawInput.trim()) return;

    setLoading(true);
    setError("");

    try {
      const format = OUTPUT_FORMATS.find(f => f.id === selectedFormat);
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: rawInput,
          instruction: format?.instruction
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to refine story";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response was not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setOutput(data.output);

      // Save to archive
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        format: format?.label,
        input: rawInput.slice(0, 50) + "...",
        output: data.output
      };
      const updatedArchive = [newEntry, ...archive];
      setArchive(updatedArchive);
      localStorage.setItem("lyrae_archive", JSON.stringify(updatedArchive));

    } catch (err: any) {
      console.error("Refine error:", err);
      setError(err?.message || "The muse is silent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string = "main") => {
    if (!text) return;
    
    const sendToClipboard = async (str: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(str);
        return true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = str;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          return successful;
        } catch (err) {
          document.body.removeChild(textArea);
          return false;
        }
      }
    };

    try {
      const success = await sendToClipboard(text);
      if (success) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  const deleteArchiveItem = (id: string) => {
    const updated = archive.filter(item => item.id !== id);
    setArchive(updated);
    localStorage.setItem("lyrae_archive", JSON.stringify(updated));
  };

  return (
    <div className={`flex flex-col h-screen w-full bg-lyrae-bg text-lyrae-paper selection:bg-lyrae-gold/30 selection:text-lyrae-paper transition-all duration-1000 ${isLegacyMode ? 'sepia-[0.3] contrast-[1.1] brightness-[0.9]' : ''}`}>
      {isLegacyMode && (
        <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden">
          <div className="absolute inset-x-0 h-[2px] bg-lyrae-gold animate-[scanline_10s_linear_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,118,0.03))] bg-[length:100%_4px,3px_100%]" />
        </div>
      )}
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-6 border-b border-lyrae-gold/10">
        <button 
          onClick={() => setCurrentView("main")}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border border-lyrae-gold flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-1 h-4 bg-lyrae-gold"></div>
          </div>
          <span className="tracking-[0.3em] text-[10px] uppercase font-medium text-lyrae-gold hidden sm:inline">Lyrae System v.2.4</span>
        </button>
        <div className="flex gap-4 lg:gap-8 text-[11px] uppercase tracking-widest opacity-60">
          <button 
            onClick={() => setCurrentView("archive")}
            className={`hover:text-lyrae-gold transition-colors flex items-center gap-2 cursor-pointer ${currentView === 'archive' ? 'text-lyrae-gold opacity-100' : ''}`}
          >
            <Archive className="w-3 h-3" /> <span className="hidden sm:inline">Archive</span>
          </button>
          <button 
            onClick={() => setCurrentView("theory")}
            className={`hover:text-lyrae-gold transition-colors flex items-center gap-2 cursor-pointer ${currentView === 'theory' ? 'text-lyrae-gold opacity-100' : ''}`}
          >
            <Compass className="w-3 h-3" /> <span className="hidden sm:inline">Theory</span>
          </button>
          <button 
            onClick={() => setCurrentView("settings")}
            className={`hover:text-lyrae-gold transition-colors flex items-center gap-2 cursor-pointer ${currentView === 'settings' ? 'text-lyrae-gold opacity-100' : ''}`}
          >
            <Settings className="w-3 h-3" /> <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div 
              key="view-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full"
            >
              {/* Sidebar: Input & Controls */}
              <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-lyrae-gold/10 flex flex-col p-6 lg:p-10 bg-lyrae-sidebar overflow-y-auto custom-scrollbar">
                <header className="mb-8 lg:mb-10">
                  <h1 className="font-serif text-4xl lg:text-5xl text-lyrae-gold font-light italic mb-2">Lyrae Voice</h1>
                  <p className="text-[9px] tracking-[0.2em] uppercase opacity-40">From raw truth to resonant story</p>
                </header>

                <div className="flex-1 flex flex-col gap-6 lg:gap-8">
                  <section>
                    <label className="text-[9px] uppercase tracking-[0.15em] opacity-40 mb-3 lg:mb-4 block">Selection Mode</label>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      {OUTPUT_FORMATS.map((format) => {
                        const isSelected = selectedFormat === format.id;
                        return (
                          <button
                            key={format.id}
                            onClick={() => setSelectedFormat(format.id)}
                            className={`
                              p-3 lg:p-4 border text-left transition-all duration-300 group
                              ${isSelected 
                                ? 'border-lyrae-gold bg-lyrae-gold/5' 
                                : 'border-lyrae-gold/20 hover:border-lyrae-gold/40 hover:bg-lyrae-gold/[0.02]'}
                            `}
                          >
                            <div className={`text-[11px] lg:text-xs mb-0.5 lg:mb-1 transition-colors ${isSelected ? 'text-lyrae-gold' : 'text-lyrae-gold/60'}`}>
                              {format.label}
                            </div>
                            <div className="text-[8px] lg:text-[9px] opacity-40 leading-relaxed font-light">
                              {format.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="flex-1 flex flex-col min-h-[200px] lg:min-h-[300px]">
                    <label className="text-[9px] uppercase tracking-[0.15em] opacity-40 mb-3 lg:mb-4 block">Input: The Raw Material</label>
                    <textarea
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Spill the silence between the words..."
                      className="
                        flex-1 bg-black/20 border border-lyrae-gold/10 p-4 lg:p-6 text-sm leading-relaxed 
                        italic opacity-80 font-serif focus:outline-none focus:border-lyrae-gold/30 transition-all
                        placeholder:opacity-30 resize-none
                      "
                    />
                  </section>

                  <button 
                    onClick={handleRefine}
                    disabled={loading || !rawInput.trim()}
                    className={`
                      w-full py-4 lg:py-5 uppercase tracking-[0.3em] text-[10px] lg:text-[11px] font-semibold transition-all duration-500
                      flex items-center justify-center gap-3
                      ${loading 
                        ? 'bg-lyrae-gold/5 border-lyrae-gold/10 text-lyrae-gold/40' 
                        : 'bg-lyrae-gold/10 border border-lyrae-gold/30 text-lyrae-gold hover:bg-lyrae-gold/20 active:scale-[0.98] cursor-pointer'}
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Distilling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Refine Narrative</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Pane */}
              <div className="flex-1 relative flex flex-col bg-lyrae-bg overflow-hidden border-t lg:border-t-0 border-lyrae-gold/10">
                <div className="absolute inset-0 opacity-20 pointer-events-none glow-bg"></div>
                
                <div className="relative z-10 flex-1 flex flex-col h-full">
                  <div className="p-6 lg:p-10 border-b border-lyrae-gold/5 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lyrae-gold/40 to-transparent"></div>
                    <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.5em] text-lyrae-gold whitespace-nowrap">Resonance Preview</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lyrae-gold/40 to-transparent"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-12 lg:py-20 custom-scrollbar flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      {output ? (
                        <motion.div
                          key="output"
                          initial={{ opacity: 0, scale: 0.99, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.99 }}
                          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                          className="max-w-2xl w-full text-center"
                        >
                          <div className="font-serif text-2xl lg:text-3xl leading-relaxed font-light mb-12 text-lyrae-paper selection:bg-lyrae-gold/20 whitespace-pre-wrap">
                            {output}
                          </div>
                          <div className="h-12 lg:h-16 w-[1px] bg-lyrae-gold mx-auto mb-12 opacity-30"></div>
                          <p className="text-[11px] lg:text-sm tracking-[0.15em] opacity-40 leading-loose max-w-sm mx-auto italic uppercase">
                            This narrative shift positions your lived experience as a primary archetype of transformation.
                          </p>
                        </motion.div>
                      ) : error ? (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400/50 font-serif italic text-lg"
                        >
                          {error}
                        </motion.p>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          className="max-w-xs lg:max-w-md text-center"
                        >
                          <p className="font-serif text-xl lg:text-2xl italic font-light leading-relaxed">
                            Capture your raw truth in the panel to the left, and let the system surface the resonance.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions & Footer */}
                  <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-lyrae-bg to-transparent">
                    <div className="flex justify-center gap-4 lg:gap-6 mb-8">
                      <button className="w-10 h-10 rounded-full border border-lyrae-gold/30 flex items-center justify-center opacity-50 hover:opacity-100 hover:border-lyrae-gold transition-all cursor-pointer">
                        <Plus className="w-4 h-4 text-lyrae-gold" />
                      </button>
                      <button 
                        onClick={() => output && copyToClipboard(output)}
                        className="px-6 lg:px-10 py-3 rounded-full border border-lyrae-gold text-lyrae-gold text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-lyrae-gold/10 transition-all cursor-pointer active:scale-95 whitespace-nowrap min-w-[160px]"
                      >
                        {copiedId === "main" ? "Resonance Saved" : "Export Story"}
                      </button>
                      <button className="w-10 h-10 rounded-full border border-lyrae-gold/30 flex items-center justify-center opacity-50 hover:opacity-100 hover:border-lyrae-gold transition-all cursor-pointer">
                        <MoreHorizontal className="w-4 h-4 text-lyrae-gold" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[8px] lg:text-[9px] uppercase tracking-[0.2em] opacity-20 border-t border-lyrae-gold/5 pt-6">
                      <span>System Generated v.2.4</span>
                      <div className="flex gap-4">
                        <span>Emotional Depth: {output ? "94%" : "--"}</span>
                        <span>Narrative Clarity: {output ? "88%" : "--"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === "archive" && (
            <motion.div 
              key="view-archive"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-20 bg-lyrae-bg/95 backdrop-blur-xl p-8 lg:p-16 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12 border-b border-lyrae-gold/10 pb-8">
                  <div>
                    <h2 className="font-serif text-4xl text-lyrae-gold italic mb-2">Archive</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Your preserved resonances</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView("main")}
                    className="text-[10px] uppercase tracking-widest text-lyrae-gold/60 hover:text-lyrae-gold"
                  >
                    Close
                  </button>
                </div>

                {archive.length === 0 ? (
                  <div className="text-center py-24 opacity-30 italic font-serif">
                    The archive is currently empty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {archive.map((item) => (
                      <div key={item.id} className="p-6 bg-lyrae-sidebar border border-lyrae-gold/10 hover:border-lyrae-gold/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] uppercase tracking-widest text-lyrae-gold/60">{item.format}</span>
                          <span className="text-[9px] opacity-30">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="font-serif text-lg leading-relaxed mb-6 opacity-80 line-clamp-3 italic">
                          "{item.output}"
                        </p>
                        <div className="flex justify-between items-center">
                          <button 
                            onClick={() => copyToClipboard(item.output, item.id)}
                            className="text-[9px] uppercase tracking-widest text-lyrae-gold hover:opacity-100 opacity-60 flex items-center gap-2"
                          >
                            {copiedId === item.id ? "Copied" : "Copy Resonance"}
                          </button>
                          <button 
                            onClick={() => deleteArchiveItem(item.id)}
                            className="text-[9px] uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === "theory" && (
            <motion.div 
              key="view-theory"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-20 bg-lyrae-bg/95 backdrop-blur-xl p-8 lg:p-16 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-16 border-b border-lyrae-gold/10 pb-8">
                  <div>
                    <h2 className="font-serif text-4xl text-lyrae-gold italic mb-2">Theory</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">The Lyrae Philosophy</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView("main")}
                    className="text-[10px] uppercase tracking-widest text-lyrae-gold/60 hover:text-lyrae-gold"
                  >
                    Back to Work
                  </button>
                </div>

                <div className="space-y-12 font-serif text-xl leading-relaxed opacity-80">
                  <p>
                    We exist in the silence between what is spoken and what is felt. Memory is often a messy, jagged landscape — a "raw dump" of trauma, victory, and the mundane.
                  </p>
                  <p>
                    <span className="text-lyrae-gold italic">Lyrae Voice</span> is built on the belief that truth requires distillation. By processing raw emotional data through our proprietary resonance filters, we strip away the noise to reveal the underlying archetype.
                  </p>
                  <div className="h-[1px] w-24 bg-lyrae-gold/30"></div>
                  <p>
                    Every woman's lived experience is a foundation for transformation. Whether you are building a legacy, a company, or a new version of yourself, your narrative is your currency.
                  </p>
                  <p className="italic text-lyrae-gold/60">
                    From raw truth to resonant story. Distill. Refine. Reclaim.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === "settings" && (
            <motion.div 
              key="view-settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 z-20 bg-lyrae-bg/95 backdrop-blur-xl p-8 lg:p-16 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-xl mx-auto">
                <header className="mb-12">
                  <h2 className="font-serif text-4xl text-lyrae-gold italic mb-2">Settings</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">System Preferences</p>
                </header>

                <div className="space-y-10">
                  <section>
                    <label className="text-[9px] uppercase tracking-widest text-lyrae-gold mb-6 block">Resonance Parameters</label>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between group">
                        <span className="text-sm opacity-60">Emotional Depth Filter</span>
                        <div className="w-32 h-[1px] bg-lyrae-gold/20 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lyrae-gold"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-60">Narrative Clarity</span>
                        <div className="w-32 h-[1px] bg-lyrae-gold/20 relative">
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lyrae-gold"></div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <label className="text-[9px] uppercase tracking-widest text-lyrae-gold mb-6 block">Interface</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-60">Legacy Aesthetic Mode</span>
                      <button 
                        onClick={() => setIsLegacyMode(!isLegacyMode)}
                        className={`w-8 h-4 border border-lyrae-gold/30 rounded-full relative p-0.5 transition-colors cursor-pointer ${isLegacyMode ? 'bg-lyrae-gold/20 border-lyrae-gold/60' : 'bg-transparent'}`}
                      >
                        <motion.div 
                          animate={{ x: isLegacyMode ? 16 : 0 }}
                          className={`w-2 h-2 rounded-full transition-colors ${isLegacyMode ? 'bg-lyrae-gold' : 'bg-lyrae-gold/50'}`}
                        />
                      </button>
                    </div>
                  </section>

                  <div className="pt-12">
                    <button 
                      onClick={() => setCurrentView("main")}
                      className="w-full py-4 border border-lyrae-gold/30 text-lyrae-gold text-[10px] uppercase tracking-widest hover:bg-lyrae-gold/5"
                    >
                      Return to System
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 110, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 110, 0.3);
        }
      `}</style>
    </div>
  );
}
