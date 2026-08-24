"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BeautifulWeather from "./components/BeautifulWeather";
import { ForecastDisaster, TrendChart } from "./components/RaincloudFeatures";
import DynamicBackground from "./components/DynamicBackground";
import Link from "next/link";
const AITerminal = dynamic(() => import("./components/AITerminal"), { ssr: false });

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RiskMap = dynamic(() => import("./components/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm text-white/70">
      Loading Himachal Risk Map...
    </div>
  ),
});

const HydrologicalIntelligence = dynamic(
  () => import("./components/HydrologicalIntelligence"),
  {
    ssr: false,
  }
);

/* ============================================
   TYPES
============================================ */

type RiskData = {
  flash_flood: number;
  landslide: number;
  extreme_rainfall: number;
  overall: string;
};

type WeatherHour = {
  time: string;
  precipitation: number;
  rain: number;
  showers: number;
  precipitation_probability: number;
  soil_moisture: number;
};

type WeatherData = {
  location: {
    latitude: number;
    longitude: number;
  };

  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    rain: number;
    showers: number;
    wind_speed: number;
  };

  forecast: {
    rainfall_next_24h: number;
    max_hourly_rain: number;
    max_rain_probability: number;
    hours: WeatherHour[];
  };

  source: string;
};

type LocationRisk = {
  name: string;
  latitude: number;
  longitude: number;

  flash_flood: number;
  landslide: number;
  extreme_rainfall: number;
  overall: string;

  // Government rainfall telemetry
  government_rainfall?: number | null;
  rainfall_station?: string | null;
  rainfall_status?: string | null;
  rainfall_updated?: string | null;
  rainfall_source?: string | null;
  rainfall_age_hours?: number | null;

  // Water-level data
  water_level?: number | null;
  water_status?: string | null;

  inputs: {
    current_rain: number;
    government_rainfall?: number | null;
    rainfall_next_24h: number;
    rain_probability: number;
    humidity: number;
    wind_speed: number;
    soil_moisture: number;
    water_level?: number | null;
    water_status?: string;
  };
};

type RiskHistory = {
  timestamp: string;
  location: string;
  flash_flood: number;
  landslide: number;
  extreme_rainfall: number;
  overall: string;
};

type Alert = {
  location: string;
  type: string;
  severity: string;
  risk: number;
  title: string;
  message: string;
  timestamp: string;
};

/* ============================================
   HOME
============================================ */

export default function Home() {
  const [risk, setRisk] = useState<RiskData>({
    flash_flood: 0,
    landslide: 0,
    extreme_rainfall: 0,
    overall: "LOADING",
  });

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [locations, setLocations] =
    useState<LocationRisk[]>([]);

  const [riskHistory, setRiskHistory] =
    useState<RiskHistory[]>([]);

  const [historyLocation, setHistoryLocation] =
    useState("Dharamshala");

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [locationsLoading, setLocationsLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [alertsLoading, setAlertsLoading] =
    useState(true);

  const [apiOnline, setApiOnline] =
    useState(false);

  /* ==========================================
     RISK API
  ========================================== */

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/risk`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Risk API failed");
        }

        const data = await response.json();

        setRisk({
          flash_flood: Number(data.flash_flood),
          landslide: Number(data.landslide),
          extreme_rainfall: Number(data.extreme_rainfall),
          overall: data.overall,
        });

        setApiOnline(true);
      } catch (error) {
        console.error(
          "Risk API Error:",
          error
        );

        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();

    const interval = setInterval(
      fetchRisk,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /* ==========================================
     WEATHER API
  ========================================== */

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/weather`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Weather API failed"
          );
        }

        const data =
          await response.json();

        setWeather(data);
      } catch (error) {
        console.error(
          "Weather API Error:",
          error
        );

        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();

    const interval = setInterval(
      fetchWeather,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /* ==========================================
     LOCATION RISK API
  ========================================== */

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/locations-risk`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Location Risk API failed"
          );
        }

        const data =
          await response.json();

        setLocations(
          data.locations || []
        );
      } catch (error) {
        console.error(
          "Location Risk API Error:",
          error
        );

        setLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();

    const interval = setInterval(
      fetchLocations,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /* ==========================================
     RISK HISTORY API
  ========================================== */

  useEffect(() => {
    const fetchRiskHistory = async () => {
      try {
        setHistoryLoading(true);

        const response = await fetch(
          `https://himalert.onrender.com/api/risk-history?location=${encodeURIComponent(
            historyLocation
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Risk History API failed"
          );
        }

        const data =
          await response.json();

        setRiskHistory(
          data.history || []
        );
      } catch (error) {
        console.error(
          "Risk History Error:",
          error
        );

        setRiskHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchRiskHistory();

    const interval = setInterval(
      fetchRiskHistory,
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [historyLocation]);

  /* ==========================================
     ALERT API
  ========================================== */

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/alerts`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Alerts API failed"
          );
        }

        const data =
          await response.json();

        console.log(
          "Alerts API Response:",
          data
        );

        setAlerts(
          data.alerts || []
        );
      } catch (error) {
        console.error(
          "Alerts API Error:",
          error
        );

        setAlerts([]);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();

    const interval = setInterval(
      fetchAlerts,
      2 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /* ==========================================
     RISK COLOR
  ========================================== */

  const getRiskColor = (
    value: number
  ) => {
    if (value >= 75) {
      return "text-red-400";
    }

    if (value >= 60) {
      return "text-orange-400";
    }

    if (value >= 40) {
      return "text-yellow-400";
    }

    return "text-emerald-400";
  };

  /* ==========================================
     RISK BORDER
  ========================================== */

  const getRiskBorder = (
    overall: string
  ) => {
    if (overall === "CRITICAL") {
      return "border-red-500/40 bg-red-500/10";
    }

    if (overall === "HIGH") {
      return "border-orange-500/30 bg-orange-500/5";
    }

    if (overall === "MODERATE") {
      return "border-yellow-500/20 bg-yellow-500/5";
    }

    return "border-emerald-500/20 bg-emerald-500/5";
  };

  /* ==========================================
     ALERT STYLING
  ========================================== */

  const getAlertStyle = (
    severity: string
  ) => {
    if (severity === "CRITICAL") {
      return {
        border:
          "border-red-500/40 bg-red-500/10",
        badge:
          "bg-red-500/20 text-red-300",
        icon: "",
      };
    }

    if (severity === "HIGH") {
      return {
        border:
          "border-orange-500/30 bg-orange-500/5",
        badge:
          "bg-orange-500/20 text-orange-300",
        icon: "",
      };
    }

    if (severity === "MODERATE") {
      return {
        border:
          "border-yellow-500/30 bg-yellow-500/5",
        badge:
          "bg-yellow-500/20 text-yellow-300",
        icon: "",
      };
    }

    return {
      border:
        "border-emerald-500/20 bg-emerald-500/5",
      badge:
        "bg-emerald-500/20 text-emerald-300",
      icon: "",
    };
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <DynamicBackground condition={(weather as any)?.current?.cloud_cover > 50 ? "Cloudy" : (weather as any)?.current?.rain > 0 ? "Rain" : "Sunny"}>
  <main className="min-h-screen text-white font-sans selection:bg-cyan-500/30">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white/80 backdrop-blur-md ">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              HimAlert
            </h1>
            <p className="mt-1 text-xs text-blue-600 uppercase tracking-widest font-semibold">
              VyomForge Hydrological Intelligence Network
            </p>
          </div>
          <Link href="/local" className="mb-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"> Go to My Exact Live Location Dashboard</Link>
          
          <div className="w-full md:w-[500px]">
            <Link href="/local" className="mb-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"> Go to My Exact Live Location Dashboard</Link>
            <AITerminal />

          </div>
        </div>
      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ====================================
            HEADING
        ==================================== */}

        <section className="mb-8">

          <p className="mb-2 text-sm font-medium text-blue-600">
            REAL-TIME DISASTER INTELLIGENCE
          </p>

          <h2 className="text-4xl font-bold tracking-tight">
            Himachal Pradesh Risk Monitor
          </h2>

          <p className="mt-3 max-w-2xl text-white/70">
            AI-powered prediction of flash floods,
            landslides and extreme rainfall using
            weather, terrain, soil and hydrological
            data.
          </p>

        </section>

        {/* ====================================
            RISK CARDS
        ==================================== */}

        <section className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-6">
            <p className="text-sm text-white/70">
              Flash Flood Risk
            </p>

            <p className="mt-3 text-4xl font-bold text-orange-400">
              {loading
                ? "..."
                : `${risk.flash_flood}%`}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Live weather assessment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-6">
            <p className="text-sm text-white/70">
              Landslide Risk
            </p>

            <p className="mt-3 text-4xl font-bold text-yellow-400">
              {loading
                ? "..."
                : `${risk.landslide}%`}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Live weather assessment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-6">
            <p className="text-sm text-white/70">
              Extreme Rainfall
            </p>

            <p className="mt-3 text-4xl font-bold text-red-400">
              {loading
                ? "..."
                : `${risk.extreme_rainfall}%`}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Live weather assessment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-6">
            <p className="text-sm text-white/70">
              Overall Threat
            </p>

            <p className="mt-3 text-4xl font-bold text-red-500">
              {loading
                ? "..."
                : risk.overall}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Based on current weather inputs
            </p>
          </div>

        </section>

        {/* ====================================
            LIVE ALERTS
        ==================================== */}

        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                 Live Disaster Alerts
              </h3>

              <p className="text-sm text-white/70">
                Automatically generated from current risk conditions
              </p>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs ${alerts.length > 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-emerald-500/10 text-emerald-400"
                }`}
            >
              {alerts.length > 0
                ? `${alerts.length} ACTIVE`
                : "NO ACTIVE ALERTS"}
            </div>

          </div>

          {alertsLoading ? (

            <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-8 text-center text-white/70">
              Loading live alerts...
            </div>

          ) : alerts.length === 0 ? (

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">

              <div className="text-4xl">
                
              </div>

              <h4 className="mt-3 text-lg font-semibold text-emerald-400">
                No Active Disaster Alerts
              </h4>

              <p className="mt-2 text-sm text-white/70">
                Current monitored conditions are below
                alert thresholds.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {alerts.map(
                (alert, index) => {

                  const style =
                    getAlertStyle(
                      alert.severity
                    );

                  return (
                    <div
                      key={`${alert.type}-${alert.location}-${index}`}
                      className={`rounded-2xl border p-5 ${style.border}`}
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex gap-4">

                          <div className="text-2xl">
                            {style.icon}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h4 className="font-semibold">
                                {alert.title}
                              </h4>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
                              >
                                {alert.severity}
                              </span>

                            </div>

                            <p className="mt-2 text-sm text-slate-700">
                              {alert.message}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/70">

                              <span>
                                 {alert.location}
                              </span>

                              <span>
                                {" "}
                                {alert.type.replace(
                                  /_/g,
                                  " "
                                )}
                              </span>

                              <span>
                                {" "}
                                {new Date(
                                  alert.timestamp
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="shrink-0">

                          <p className="text-right text-xs text-white/70">
                            Risk
                          </p>

                          <p
                            className={`text-right text-3xl font-bold ${alert.risk >= 75
                                ? "text-red-400"
                                : "text-orange-400"
                              }`}
                          >
                            {Math.round(
                              alert.risk
                            )}%
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        
        {/* ====================================
            WEATHER & TRENDS
        ==================================== */}
        <div className="max-w-4xl mx-auto">
          <BeautifulWeather weather={weather} weatherLoading={weatherLoading} locationName="Himachal Pradesh (Regional Avg)" />
          <ForecastDisaster risk={risk} loading={loading} />
          <TrendChart weather={weather} />
        </div>
{/* ====================================
            RISK TREND
        ==================================== */}

        <section className="mt-8">

          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                 Risk Trend
              </h3>

              <p className="text-sm text-white/70">
                Historical disaster-risk progression
              </p>
            </div>

            <select
              value={historyLocation}
              onChange={(event) =>
                setHistoryLocation(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-300 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm px-4 py-2 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="Dharamshala">
                Dharamshala
              </option>

              <option value="Kangra">
                Kangra
              </option>

              <option value="Mandi">
                Mandi
              </option>
            </select>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm p-6">

            {historyLoading ? (

              <div className="flex h-[350px] items-center justify-center text-white/70">
                Loading risk history...
              </div>

            ) : riskHistory.length === 0 ? (

              <div className="flex h-[350px] items-center justify-center text-white/70">
                No historical risk data available yet.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <LineChart
                  data={riskHistory}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                      />

                      <XAxis
                        dataKey="timestamp"
                        stroke="#94a3b8"
                        tickFormatter={(value) =>
                          new Date(
                            value
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        }
                      />

                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        tickFormatter={(value) =>
                          `${value}%`
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "#0f172a",
                          border:
                            "1px solid #334155",
                          borderRadius:
                            "12px",
                          color: "#fff",
                        }}
                        labelFormatter={(value) =>
                          new Date(
                            String(value)
                          ).toLocaleString(
                            "en-IN"
                          )
                        }
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="flash_flood"
                        name="Flash Flood"
                        stroke="#fb923c"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="landslide"
                        name="Landslide"
                        stroke="#facc15"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="extreme_rainfall"
                        name="Extreme Rainfall"
                        stroke="#f87171"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </section>

        {/* ====================================
            HYDROLOGICAL INTELLIGENCE
        ==================================== */}

        <section className="mt-8">
          
      <HydrologicalIntelligence />

      

        </section>

        {/* ====================================
            MAP + DANGER ZONES
        ==================================== */}

        <section
          className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]"
        >

          {/* RISK MAP */}
          <div
            className="min-w-0 self-start overflow-hidden rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm"
          >
            <RiskMap />
          </div>

          {/* DANGER ZONES */}
          <aside
            className="min-w-0 self-start overflow-hidden rounded-2xl border border-slate-200 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm lg:h-[560px]"
          >

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div>
                <h3 className="text-xl font-semibold">
                  Danger Zones
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  Live location-wise disaster risk
                </p>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                LIVE
              </span>
            </div>

            <div className="p-4 lg:h-[471px] lg:overflow-y-auto">
              <div className="space-y-4">

                {locationsLoading ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-5 text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Loading location risks...
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Fetching live disaster intelligence
                    </p>
                  </div>
                ) : locations.length === 0 ? (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
                     Location risk data unavailable.
                    <p className="mt-1 text-xs text-yellow-500/70">
                      Check that the HimAlert backend is running.
                    </p>
                  </div>
                ) : (
                  locations.map((location) => {
                    const riskValue = Math.max(
                      location.flash_flood,
                      location.landslide,
                      location.extreme_rainfall
                    );

                    const riskColor =
                      riskValue >= 75
                        ? "text-red-400"
                        : riskValue >= 60
                          ? "text-orange-400"
                          : riskValue >= 40
                            ? "text-yellow-400"
                            : "text-emerald-400";

                    const riskBg =
                      riskValue >= 75
                        ? "bg-red-500/10"
                        : riskValue >= 60
                          ? "bg-orange-500/10"
                          : riskValue >= 40
                            ? "bg-yellow-500/10"
                            : "bg-emerald-500/10";

                    return (
                      <div
                        key={location.name}
                        className={`rounded-xl border p-4 transition hover:bg-slate-800/40 ${getRiskBorder(
                          location.overall
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {location.name}
                            </p>
                            <p className={`mt-1 text-xs font-semibold ${riskColor}`}>
                              {location.overall} RISK
                            </p>
                          </div>

                          <div className={`rounded-xl px-3 py-2 text-center ${riskBg}`}>
                            <p className={`text-2xl font-bold ${riskColor}`}>
                              {riskValue}%
                            </p>
                            <p className="text-[10px] text-white/70">
                              OVERALL
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-slate-100 p-2">
                            <p className="text-[10px] text-white/70"> FLOOD</p>
                            <p className="mt-1 font-semibold text-white">
                              {location.flash_flood}%
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-100 p-2">
                            <p className="text-[10px] text-white/70"> LANDSLIDE</p>
                            <p className="mt-1 font-semibold text-white">
                              {location.landslide}%
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-100 p-2">
                            <p className="text-[10px] text-white/70"> RAIN</p>
                            <p className="mt-1 font-semibold text-white">
                              {location.extreme_rainfall}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                          <p className="text-xs font-semibold text-white/70">
                            LIVE TELEMETRY
                          </p>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <span className="text-white/70"> Gov Rain</span>
                              <p className="font-medium text-slate-700">
                                {location.government_rainfall ?? "N/A"} mm
                              </p>
                            </div>
                            <div>
                              <span className="text-white/70"> Probability</span>
                              <p className="font-medium text-slate-700">
                                {location.inputs?.rain_probability ?? 0}%
                              </p>
                            </div>
                            <div>
                              <span className="text-white/70"> Humidity</span>
                              <p className="font-medium text-slate-700">
                                {location.inputs?.humidity ?? 0}%
                              </p>
                            </div>
                            <div>
                              <span className="text-white/70"> Soil</span>
                              <p className="font-medium text-slate-700">
                                {location.inputs?.soil_moisture ?? 0}
                              </p>
                            </div>
                          </div>

                          {location.rainfall_status === "STALE" && (
                            <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
                              <p className="text-xs font-semibold text-yellow-400">
                                 Government rainfall data is stale
                              </p>
                              <p className="mt-1 text-[11px] text-yellow-500/70">
                                {location.rainfall_age_hours != null
                                  ? `${location.rainfall_age_hours} hours old`
                                  : "Older than freshness limit"}
                              </p>
                            </div>
                          )}

                          {location.rainfall_status === "AVAILABLE" && (
                            <div className="mt-3 text-xs font-medium text-emerald-400">
                               Government rainfall data available
                            </div>
                          )}

                          <div className="mt-3 text-[11px] text-white/70">
                             Station: <span className="text-white/70">{location.rainfall_station ?? "N/A"}</span>
                          </div>
                          <div className="text-[11px] text-white/70">
                             Updated: <span className="text-white/70">{location.rainfall_updated ?? "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </div>
          </aside>

        </section>

        {/* ====================================
            FOOTER
        ==================================== */}

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-white/70">

          HimAlert  AI-powered Himalayan Disaster Intelligence

        </footer>

      </div>

    </main></DynamicBackground>);
}












