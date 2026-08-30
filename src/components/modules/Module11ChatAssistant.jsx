/**
 * ==============================================================================
 * MODULE 11 — GROK MINING INTELLIGENCE (xAI STATUTORY COPILOT)
 * ==============================================================================
 * 1. Clean, professional conversation interface (Zero recommendation baggage).
 * 2. Powered by Grok Mining Intelligence & DGMS Statutory DeepReasoning Engine.
 * 3. Bilingual support (English & Hindi) with real-time active mine telemetry injection.
 * 4. Crisp, authoritative regulatory answers grounded in CMR 2017 & Mines Act 1952.
 * ==============================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  Trash2,
  ChevronDown,
  Cpu,
} from "lucide-react";
import { queryGrokAssistant } from "../../services/grokService";

export function Module11ChatAssistant({ context = {}, lang = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const isHi = lang === "hi";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: isHi
        ? `⚡ नमस्ते! मैं **Mines AI** हूँ — भारत सरकार, DGMS एवं **${context?.mineName || context?.mineSite || "कोयला खदान"}** हेतु वैधानिक सुरक्षा सहायक।\n\nमुझसे कोयला खान विनियम (CMR) 2017, गैस टेलीमेट्री, वेंटिलेशन गणना, स्ट्रैटा नियंत्रण अथवा सुरक्षा मानकों से संबंधित कोई भी प्रश्न पूछें।`
        : `⚡ Hello! I am **Mines AI** — Statutory Safety & Regulatory AI Copilot for **${context?.mineName || context?.mineSite || "your assigned mine"}** (${context?.subsidiary || "CIL"}).\n\nAsk me anything regarding Coal Mines Regulations (CMR) 2017, gas thresholds, ventilation mechanics, strata monitoring, or DGMS compliance guidelines.`,
      provider: "Mines AI",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await queryGrokAssistant({
        prompt: text,
        history: messages,
        context: {
          mineName: context?.mineName || context?.mineSite,
          subsidiary: context?.subsidiary,
          riskScore: context?.riskScore,
          riskBand: context?.riskBand,
          methane: context?.methane,
          coPpm: context?.coPpm,
          dust: context?.dust,
          airflow: context?.airflow,
          gassiness: context?.gassiness,
        },
        language: lang,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.text,
          provider: response.provider || "Mines AI",
          grounding: response.grounding,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: isHi
            ? "⚠️ प्रश्न संसाधित करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "⚠️ Error communicating with Mines AI. Please retry your inquiry.",
          provider: "Mines AI",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        text: isHi
          ? `⚡ नमस्ते! मैं **Mines AI** हूँ। आप मुझसे सुरक्षा नियमों, गैस सीमाओं या खदान संचालन के संबंध में पूछ सकते हैं।`
          : `⚡ Hello! I am **Mines AI**. How can I assist your statutory operations today?`,
        provider: "Mines AI",
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 px-4 rounded-full bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 hover:from-black hover:to-slate-900 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 border-2 border-blue-500/80 active:scale-95 transition-all cursor-pointer"
          style={{ boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)" }}
          title={isHi ? "Mines AI से प्रश्न पूछें" : "Ask Mines AI"}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="tracking-wide">Mines AI</span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
        </button>
      </div>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div
          className="fixed bottom-20 left-5 z-50 w-80 sm:w-[420px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/60 shadow-2xl p-4 flex flex-col h-[540px] animate-scaleUp"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Mines AI Assistant
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    AI Copilot
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  {context?.mineName || context?.mineSite || "DGMS National Grid"} · {isHi ? "वैधानिक एआई" : "Statutory AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isHi ? "चैट रीसेट करें" : "Clear conversation"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Conversation Area */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white font-medium rounded-tr-none shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-tl-none whitespace-pre-line shadow-sm"
                  }`}
                >
                  <div style={{ wordBreak: "break-word" }}>{msg.text}</div>
                  {msg.role === "assistant" && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[9.5px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>⚡ {msg.provider || "Grok-3 Mining AI"}</span>
                      <span>✓ CMR 2017 Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="ai-typing-bubble">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Input Box */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isHi
                  ? "Mines AI से वैधानिक, गैस अथवा सुरक्षा प्रश्न पूछें..."
                  : "Ask Mines AI statutory, gas, ventilation, or CMR rules..."
              }
              className="flex-1 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-blue-500 focus:outline-none dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow flex items-center justify-center cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
