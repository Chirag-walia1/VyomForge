"use client";

import React from "react";
import { Mountain, Waves, CloudRain, AlertOctagon } from "lucide-react";

export default function ThreatKPIBar() {
  const metrics = [
    {
      label: "Landslide High Vulnerability",
      value: "6 Zones",
      detail: "NH-21, NH-5 & Aut Tunnel sector",
      level: "CRITICAL",
      color: "border-rose-500/40 bg-rose-950/20 text-rose-400",
      icon: Mountain,
    },
    {
      label: "Basins Above Warning Mark",
      value: "2 Rivers",
      detail: "Sutlej (84%) & Beas (72%) Spate",
      level: "HIGH RISK",
      color: "border-orange-500/40 bg-orange-950/20 text-orange-400",
      icon: Waves,
    },
    {
      label: "Cloudburst / Heavy Rain Nowcast",
      value: "42.5 mm/hr",
      detail: "Peak in Dharamshala & Mandi",
      level: "SEVERE",
      color: "border-amber-500/40 bg-amber-950/20 text-amber-400",
      icon: CloudRain,
    },
    {
      label: "Active Road Blockages",
      value: "14 Corridors",
      detail: "4 Major Highways, 10 Link roads",
      level: "WARNING",
      color: "border-yellow-500/40 bg-yellow-950/20 text-yellow-400",
      icon: AlertOctagon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${item.color} backdrop-blur-md flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 font-mono">
                {item.level}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{item.value}</span>
              <span className="text-[11px] text-slate-400 truncate max-w-[140px] text-right">
                {item.detail}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
