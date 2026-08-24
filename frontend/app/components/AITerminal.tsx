"use client";

import { useState, useEffect } from "react";

export default function AITerminal() {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const messages = [
    "[SYSTEM INITIALIZED] Hydrological Risk Engine Online.",
    "[SCANNING] Analyzing soil moisture in Mandi region...",
    "⚠️ [ALERT] High saturation detected. Flash flood probability 85%.",
    "✅ [UPDATE] Weather API sync complete. Next 24h rainfall: 42mm.",
    "[PREDICTION] Evacuation of low-lying areas recommended within 12 hours.",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let currentText = "";
    let i = 0;
    const targetText = messages[messageIndex];
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      currentText += targetText.charAt(i);
      setText(currentText);
      i++;
      if (i >= targetText.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000); // wait 3s before next message
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [messageIndex]);

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 font-mono text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-cyan-400 font-bold ml-2">VYOMFORGE // AI PREDICTIVE INSIGHTS</span>
      </div>
      <div className="text-emerald-400 min-h-[40px] flex items-center">
        <span className="mr-2">&gt;</span>
        <span>{text}</span>
        {isTyping && <span className="w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>}
      </div>
    </div>
  );
}
