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

const rivers: River[] = [
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
    forecast: [42, 44, 46, 51, 56],
  },
  {
    name: "Sutlej",
    basin: "Sutlej Basin",
    risk: 39,
    status: "LOW",
    flow: 43,
    trend: "STABLE",
    rainfall: 8.7,
    saturation: 49,
    forecast: [39, 39, 40, 41, 43],
  },
  {
    name: "Chenab",
    basin: "Chenab Basin",
    risk: 57,
    status: "MODERATE",
    flow: 61,
    trend: "RISING",
    rainfall: 14.6,
    saturation: 65,
    forecast: [51, 53, 57, 61, 67],
  },
];

const forecastLabels = ["Now", "+6h", "+12h", "+24h", "+48h"];

function getRiskClass(status: River["status"]) {
  switch (status) {
    case "CRITICAL":
      return {
        border: "border-red-500/40",
        bg: "bg-red-500/10",
        text: "text-red-400",
        bar: "bg-red-500",
      };

    case "HIGH":
      return {
        border: "border-orange-500/40",
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        bar: "bg-orange-500",
      };

    case "MODERATE":
      return {
        border: "border-yellow-500/40",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        bar: "bg-yellow-400",
      };

    default:
      return {
        border: "border-emerald-500/40",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        bar: "bg-emerald-500",
      };
  }
}

export default function HydrologicalIntelligence() {
  const highestRiskRiver = rivers.reduce((highest, river) =>
    river.risk > highest.risk ? river : highest
  );

  const selectedRiver = highestRiskRiver;

  const chartData = forecastLabels.map((label, index) => ({
    time: label,
    risk: selectedRiver.forecast[index],
  }));

  const selectedStyles = getRiskClass(selectedRiver.status);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-md shadow-2xl">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 p-6 md:p-8">

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Hydrological Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Live River Network & 48-Hour Flow Outlook
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Monitor major Himalayan river systems, catchment conditions,
              rainfall impact and short-term flood-risk trends.
            </p>

          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            GIS + FLOOD MODEL

          </div>

        </div>


        {/* Status strip */}

        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs md:flex-row md:items-center md:justify-between">

          <span className="text-slate-600">
             River network monitoring active
          </span>

          <span className="text-cyan-400">
            Forecast horizon: 48 hours
          </span>

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-3">

        {/* ===================================================
            HIGHEST RISK
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center justify-between">

            <h3 className="font-semibold text-white">
              Highest Model River Risk
            </h3>

            <span className="text-xs font-semibold text-cyan-400">
              LIVE
            </span>

          </div>


          <div className="mt-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-2xl font-bold text-white">
                   {highestRiskRiver.name}
                </p>

                <p className="mt-1 text-sm text-white/70">
                  {highestRiskRiver.basin}
                </p>

              </div>

              <div className="text-right">

                <p className={`text-3xl font-bold ${selectedStyles.text}`}>
                  {highestRiskRiver.risk}%
                </p>

                <p className={`text-xs font-semibold ${selectedStyles.text}`}>
                  {highestRiskRiver.status}
                </p>

              </div>

            </div>


            <div className="mt-6">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-white/70">
                  Flood risk
                </span>

                <span className={selectedStyles.text}>
                  {highestRiskRiver.risk}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className={`h-full rounded-full transition-all ${selectedStyles.bar}`}
                  style={{
                    width: `${highestRiskRiver.risk}%`,
                  }}
                />

              </div>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-xs text-white/70">
                  Flow
                </p>

                <p className="mt-1 font-semibold text-white">
                  {highestRiskRiver.flow}%
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-xs text-white/70">
                  Trend
                </p>

                <p className="mt-1 font-semibold text-orange-400">
                   {highestRiskRiver.trend}
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-xs text-white/70">
                  Rainfall
                </p>

                <p className="mt-1 font-semibold text-cyan-400">
                  {highestRiskRiver.rainfall} mm
                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-xs text-white/70">
                  Catchment
                </p>

                <p className="mt-1 font-semibold text-white">
                  {highestRiskRiver.saturation}%
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            48 HOUR CHART
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold text-white">
                48-Hour River Risk Outlook
              </h3>

              <p className="mt-1 text-xs text-white/70">
                {selectedRiver.name} River model forecast
              </p>

            </div>

            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
               RISING
            </span>

          </div>


          <div className="mt-5 h-[250px] w-full">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={chartData}>

                <defs>

                  <linearGradient
                    id="riverRiskGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#06b6d4"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="100%"
                      stopColor="#06b6d4"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value}%`, "Risk"]}
                />

                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#riverRiskGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* =====================================================
          RIVER CARDS
      ====================================================== */}

      <div className="border-t border-slate-200 p-6 md:p-8">

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h3 className="text-xl font-semibold text-white">
              Major River Systems
            </h3>

            <p className="mt-1 text-sm text-white/70">
              Current model assessment across monitored basins
            </p>

          </div>

          <span className="hidden rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 sm:block">
            {rivers.length} RIVERS
          </span>

        </div>


        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {rivers.map((river) => {

            const styles = getRiskClass(river.status);

            return (

              <div
                key={river.name}
                className={`rounded-2xl border ${styles.border} bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-sm p-5 transition hover:-translate-y-1 hover:bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-sm`}
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-lg font-bold text-white">
                       {river.name}
                    </p>

                    <p className="mt-1 text-xs text-white/70">
                      {river.basin}
                    </p>

                  </div>

                  <div className={`rounded-lg ${styles.bg} px-2 py-1`}>

                    <span className={`text-sm font-bold ${styles.text}`}>
                      {river.risk}%
                    </span>

                  </div>

                </div>


                <div className="mt-4">

                  <div className="mb-2 flex justify-between text-xs">

                    <span className="text-white/70">
                      Risk
                    </span>

                    <span className={styles.text}>
                      {river.status}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className={`h-full rounded-full ${styles.bar}`}
                      style={{
                        width: `${river.risk}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="mt-4 space-y-2 text-xs">

                  <div className="flex justify-between">

                    <span className="text-white/70">
                      Flow
                    </span>

                    <span className="text-slate-800">
                      {river.flow}%
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-white/70">
                      Rainfall
                    </span>

                    <span className="text-cyan-400">
                      {river.rainfall} mm
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-white/70">
                      Catchment
                    </span>

                    <span className="text-slate-800">
                      {river.saturation}%
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-white/70">
                      Trend
                    </span>

                    <span
                      className={
                        river.trend === "RISING"
                          ? "text-orange-400"
                          : river.trend === "FALLING"
                          ? "text-emerald-400"
                          : "text-slate-800"
                      }
                    >
                      {river.trend === "RISING"
                        ? " Rising"
                        : river.trend === "FALLING"
                        ? " Falling"
                        : " Stable"}
                    </span>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>


      {/* =====================================================
          AI INTERPRETATION
      ====================================================== */}

      <div className="border-t border-slate-200 p-6 md:p-8">

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
              
            </div>

            <div>

              <p className="font-semibold text-cyan-400">
                Hydrological Risk Assessment
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-800">

                {selectedRiver.name} River is currently showing a{" "}
                <strong className={selectedStyles.text}>
                  {selectedRiver.status.toLowerCase()}
                </strong>{" "}
                risk signal. The model indicates a{" "}
                <strong className="text-orange-400">
                  {selectedRiver.trend.toLowerCase()}
                </strong>{" "}
                flow trend with increasing catchment pressure.

              </p>

              <p className="mt-3 text-xs leading-5 text-white/70">

                 This initial dashboard layer uses demonstration
                hydrological values. The next stage will connect
                verified river-flow and hydrological forecast sources.

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

