"use client";

import { useState, useEffect } from "react";

export default function AITerminal() {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const messages = [
    "[SYSTEM INITIALIZED] Hydrological Risk Engine Online.",
    "[TELEMETRY] Establishing secure uplink with NWIC Government Sensors...",
    "⚠️ [ALERT] High saturation detected. Flash flood probability 85%.",
    "✅ [UPDATE] Weather API sync complete. Next 24h rainfall: 42mm.",
    "? [AI ENGINE] Continuous risk evaluation running for Himachal Pradesh.",
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
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 text-white border border-blue-100 rounded-xl p-4 shadow-sm text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-blue-700 font-bold ml-2">Live AI Assistant</span>
      </div>
      <div className="text-slate-700 min-h-[40px] flex items-center">
        <span className="mr-2">&gt;</span>
        <span>{text}</span>
        {isTyping && <span className="w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
      </div>
    </div>
  );
}


