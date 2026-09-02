"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Radio, PhoneCall, FileText, AlertTriangle, CloudLightning } from "lucide-react";

interface AuthorityHeaderProps {
  onOpenSitRep: () => void;
}

export default function AuthorityHeader({ onOpenSitRep }: AuthorityHeaderProps) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("en-IN", {
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
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Critical Emergency Ticker */}
      <div className="bg-red-950/80 border-b border-red-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-red-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 inline" /> SDMA RED ALERT:
          </span>
          <span className="truncate">
            Heavy rainfall & flash flood risk active for Kullu, Mandi, and Shimla districts. Sutlej & Beas basins above warning mark.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-300 font-mono text-[11px] shrink-0">
          <span className="flex items-center gap-1 text-amber-300">
            <PhoneCall className="w-3 h-3" /> State EOC: <strong>1070 / 1077</strong>
          </span>
          <span>NDRF: <strong>112</strong></span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-600/20 border border-rose-500/40 rounded-lg text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                HimAlert <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">FORGE</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> LIVE SENSOR FEEDS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Hazard Early Warning & Decision Support System • Himachal Pradesh
            </p>
          </div>
        </div>

        {/* Live Clock & Action Tools */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono">
            <span className="text-xs font-semibold text-slate-200">{time || "Loading time..."}</span>
            <span className="text-[10px] text-slate-500">Telemetry Refresh: 15s</span>
          </div>

          <button
            onClick={onOpenSitRep}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-md shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official SitRep</span>
          </button>

          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button className="px-2.5 py-1 rounded-md bg-cyan-600 text-white font-medium shadow">
              Authority Mode
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
