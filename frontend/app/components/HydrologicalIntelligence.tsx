"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type River = {
  name: string;
  basin: string;
  risk: number;
  status: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  flow: number;
  trend: "RISING" | "STABLE" | "FALLING";
  rainfall: number;
  saturation: number;
  forecast: number[];
};

const ALL_RIVERS: River[] = [
  {
    name: "Beas",
    basin: "Beas Basin",
    risk: 68,
    status: "HIGH",
    flow: 72,
    trend: "RISING",
    rainfall: 18.4,
    saturation: 72,
    forecast: [61, 64, 68, 74, 81],
  },
  {
    name: "Ravi",
    basin: "Ravi Basin",
    risk: 46,
    status: "MODERATE",
    flow: 51,
    trend: "RISING",
    rainfall: 11.2,
    saturation: 58,
    forecast: [40, 42, 46, 52, 59],
  },
  {
    name: "Sutlej",
    basin: "Sutlej Basin",
    risk: 84,
    status: "CRITICAL",
    flow: 89,
    trend: "RISING",
    rainfall: 26.8,
    saturation: 91,
    forecast: [75, 80, 84, 91, 96],
  },
  {
    name: "Chenab",
    basin: "Chenab Basin",
    risk: 32,
    status: "LOW",
    flow: 38,
    trend: "STABLE",
    rainfall: 4.1,
    saturation: 41,
    forecast: [34, 33, 32, 34, 31],
  },
  {
    name: "Parvati",
    basin: "Beas Basin",
    risk: 72,
    status: "HIGH",
    flow: 78,
    trend: "RISING",
    rainfall: 22.4,
    saturation: 84,
    forecast: [65, 68, 72, 79, 86],
  }
];

function getRiskClass(status: string) {
  switch (status) {
    case "LOW":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        bar: "bg-emerald-400",
      };
    case "MODERATE":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/20",
        bar: "bg-yellow-400",
      };
    case "HIGH":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
        bar: "bg-orange-400",
      };
    case "CRITICAL":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
        bar: "bg-red-400",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/20",
        bar: "bg-slate-400",
      };
  }
}

export default function HydrologicalIntelligence({ locationName }: { locationName?: string }) {
  // Filter rivers based on locationName if provided
  let displayRivers = ALL_RIVERS;
  if (locationName) {
    const loc = locationName.toLowerCase();
    if (loc.includes("dharamshala")) {
      displayRivers = []; // No major rivers
    } else if (loc.includes("chamba")) {
      displayRivers = ALL_RIVERS.filter(r => r.name === "Ravi");
    } else if (loc.includes("kullu") || loc.includes("manali")) {
      displayRivers = ALL_RIVERS.filter(r => r.name === "Beas" || r.name === "Parvati");
    } else if (loc.includes("mandi") || loc.includes("kangra")) {
      displayRivers = ALL_RIVERS.filter(r => r.name === "Beas");
    } else if (loc.includes("shimla") || loc.includes("kinnaur") || loc.includes("spiti")) {
      displayRivers = ALL_RIVERS.filter(r => r.name === "Sutlej");
    } else if (loc.includes("lahaul")) {
      displayRivers = ALL_RIVERS.filter(r => r.name === "Chenab");
    }
  }

  if (displayRivers.length === 0) {
    return (
      <section className="mt-8 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Hydrological Intelligence</h2>
          <p className="text-white/50">Safe from rivers within a 10km radius.</p>
        </div>
      </section>
    );
  }

  const selectedRiver = displayRivers[0];
  const chartData = selectedRiver.forecast.map((val, idx) => ({
    time: `T+${(idx + 1) * 3}h`,
    risk: val,
  }));
  const selectedStyles = getRiskClass(selectedRiver.status);

  return (
    <section className="mt-8 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="p-6 md:p-8 md:border-r border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
              Hydro Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            River Network Status
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Real-time multi-basin river flow analytics and catchment saturation levels.
          </p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Highest Risk Basin
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tighter text-white">
                {selectedRiver.name}
              </span>
              <span className={`text-lg font-bold ${selectedStyles.text}`}>
                {selectedRiver.status}
              </span>
            </div>
            <div className="mt-4 flex gap-4 text-sm font-medium">
              <div className="flex flex-col">
                <span className="text-white/50">Flow</span>
                <span className="text-white">{selectedRiver.flow}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/50">Saturation</span>
                <span className="text-white">{selectedRiver.saturation}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/50">Trend</span>
                <span className={selectedRiver.trend === "RISING" ? "text-orange-400" : "text-emerald-400"}>
                  {selectedRiver.trend}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 p-6 md:p-8 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Projected Risk Trajectory ({selectedRiver.name})</h3>
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
              Next 15 Hours
            </span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="riverRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", color: "#fff" }}
                  formatter={(value) => [`${value}%`, "Risk"]}
                />
                <Area type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={3} fill="url(#riverRiskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Major River Systems</h3>
            <p className="mt-1 text-sm text-white/50">Current model assessment across monitored basins</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {displayRivers.map((river) => {
            const styles = getRiskClass(river.status);
            return (
              <div key={river.name} className={`rounded-2xl border ${styles.border} bg-black/40 backdrop-blur-md text-white p-5 transition hover:-translate-y-1 hover:bg-black/60 shadow-lg`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{river.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest font-bold text-white/50">{river.basin}</p>
                  </div>
                  <div className={`rounded-lg ${styles.bg} px-2 py-1`}>
                    <span className={`text-sm font-bold ${styles.text}`}>{river.risk}%</span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-semibold">
                    <span className="text-white/50">Risk Status</span>
                    <span className={styles.text}>{river.status}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${river.risk}%` }} />
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs font-medium">
                  <div className="flex justify-between"><span className="text-white/50">Flow</span><span className="text-white">{river.flow}%</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Rainfall</span><span className="text-cyan-400">{river.rainfall} mm</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Catchment</span><span className="text-white">{river.saturation}%</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Trend</span><span className={river.trend === "RISING" ? "text-orange-400" : river.trend === "FALLING" ? "text-emerald-400" : "text-white"}>{river.trend}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

