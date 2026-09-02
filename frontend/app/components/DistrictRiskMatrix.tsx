"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Shield, RefreshCw } from "lucide-react";

interface DistrictRisk {
  district: string;
  hazardType: "Landslide" | "Flash Flood" | "Cloudburst" | "Stable";
  rain24h: number; // in mm
  soilSaturation: number; // in %
  riskLevel: "RED" | "ORANGE" | "YELLOW" | "GREEN";
  actionRequired: string;
  lastUpdated: string;
}

const DISTRICT_DATA: DistrictRisk[] = [
  {
    district: "Mandi",
    hazardType: "Landslide",
    rain24h: 84.5,
    soilSaturation: 89,
    riskLevel: "RED",
    actionRequired: "Evacuate low-lying river banks; close NH-21 bypass.",
    lastUpdated: "5 mins ago",
  },
  {
    district: "Kullu",
    hazardType: "Flash Flood",
    rain24h: 76.2,
    soilSaturation: 82,
    riskLevel: "RED",
    actionRequired: "Sound sirens near Beas floodplains; suspend rafting/tourism.",
    lastUpdated: "8 mins ago",
  },
  {
    district: "Shimla",
    hazardType: "Landslide",
    rain24h: 58.0,
    soilSaturation: 74,
    riskLevel: "ORANGE",
    actionRequired: "Divert heavy vehicles on NH-5; keep JCB earthmovers ready.",
    lastUpdated: "12 mins ago",
  },
  {
    district: "Kangra (Dharamshala)",
    hazardType: "Cloudburst",
    rain24h: 92.4,
    soilSaturation: 78,
    riskLevel: "ORANGE",
    actionRequired: "Issue warning for Manjhi & Gaj rivulets.",
    lastUpdated: "3 mins ago",
  },
  {
    district: "Kinnaur",
    hazardType: "Landslide",
    rain24h: 31.0,
    soilSaturation: 62,
    riskLevel: "YELLOW",
    actionRequired: "Monitor shooting stones near Nigulsari zone.",
    lastUpdated: "15 mins ago",
  },
  {
    district: "Lahaul-Spiti",
    hazardType: "Stable",
    rain24h: 6.4,
    soilSaturation: 22,
    riskLevel: "GREEN",
    actionRequired: "Normal monitoring.",
    lastUpdated: "20 mins ago",
  },
  {
    district: "Solan",
    hazardType: "Landslide",
    rain24h: 44.0,
    soilSaturation: 59,
    riskLevel: "YELLOW",
    actionRequired: "Inspect retaining walls along Kalka-Shimla express stretch.",
    lastUpdated: "14 mins ago",
  },
];

export default function DistrictRiskMatrix() {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredData = DISTRICT_DATA.filter((item) => {
    if (filter === "ALL") return true;
    return item.riskLevel === filter;
  });

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "RED":
        return "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse";
      case "ORANGE":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "YELLOW":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            District Vulnerability & Incident Action Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Real-time threshold evaluation combining slope stability, soil moisture, and radar precipitation.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {["ALL", "RED", "ORANGE", "YELLOW", "GREEN"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                filter === lvl
                  ? "bg-slate-800 text-cyan-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">District</th>
              <th className="py-2.5 px-3">Primary Threat</th>
              <th className="py-2.5 px-3">24h Rainfall</th>
              <th className="py-2.5 px-3">Soil Saturation</th>
              <th className="py-2.5 px-3">IMD Alert Level</th>
              <th className="py-2.5 px-3">Advisory / Command Directive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredData.map((d, index) => (
              <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                  {d.district}
                </td>
                <td className="py-3 px-3">
                  <span className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    {d.hazardType}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-white">
                  {d.rain24h} <span className="text-slate-500 font-normal">mm</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          d.soilSaturation > 80
                            ? "bg-red-500"
                            : d.soilSaturation > 60
                            ? "bg-orange-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${d.soilSaturation}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[11px]">{d.soilSaturation}%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(
                      d.riskLevel
                    )}`}
                  >
                    {d.riskLevel}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs">
                  {d.actionRequired}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
