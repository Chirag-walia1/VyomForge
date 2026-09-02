"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Radio, PhoneCall, FileText, AlertTriangle } from "lucide-react";

export default function CommandHeader({ onOpenSitRep }: { onOpenSitRep: () => void }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50">
      {/* Live Red Alert Marquee */}
      <div className="bg-red-950/90 border-b border-red-800/70 px-4 py-1.5 flex items-center justify-between text-xs text-red-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 inline" /> SDMA RED ALERT:
          </span>
          <span className="truncate text-slate-300">
            Intense precipitation active in Kullu & Mandi. Sutlej & Beas basins above warning mark. Landslide risk critical on NH-21.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-300 font-mono text-[11px] shrink-0">
          <span className="text-amber-300 flex items-center gap-1">
            <PhoneCall className="w-3 h-3" /> State EOC: <strong>1070 / 1077</strong>
          </span>
          <span>NDRF: <strong>112</strong></span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                HimAlert <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">GLOBAL</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> LIVE SENSOR OPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Hazard Early Warning & Decision Support System • Himachal Pradesh
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono">
            <span className="text-xs font-semibold text-slate-200">{time}</span>
            <span className="text-[10px] text-slate-500">CWC / IMD Telemetry</span>
          </div>

          <button
            onClick={onOpenSitRep}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official SitRep</span>
          </button>
        </div>
      </div>
    </header>
  );
}
