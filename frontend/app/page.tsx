"use client";
/* eslint-disable */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Search, AlertTriangle, ShieldCheck, Waves, ArrowRight } from "lucide-react";

// Components from ./components/
import BeautifulWeather from "./components/BeautifulWeather";
import { ForecastDisaster, TrendChart } from "./components/RaincloudFeatures";
import DynamicBackground from "./components/DynamicBackground";
import AuthorityHeader from "./components/AuthorityHeader";
import ThreatKPIBar from "./components/ThreatKPIBar";
import DistrictRiskMatrix from "./components/DistrictRiskMatrix";
import SitRepModal from "./components/SitRepModal";

// Dynamic map & hydrological components (avoid SSR Leaflet issues)
const RiskMap = dynamic(() => import("./components/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] items-center justify-center bg-slate-950/80 border border-slate-800 text-slate-400 rounded-xl">
      <span className="flex items-center gap-2">
        <span className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full"></span>
        Loading Himachal Risk Map & GIS Layers...
      </span>
    </div>
  ),
});

const HydrologicalIntelligence = dynamic(
  () => import("./components/HydrologicalIntelligence"),
  { ssr: false }
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
    cloud_cover?: number;
  };
  forecast: {
    rainfall_next_24h: number;
    max_hourly_rain: number;
    max_rain_probability: number;
    hours: WeatherHour[];
  };
  source: string;
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
   HOME PAGE COMPONENT
============================================ */

export default function Home() {
  const [risk, setRisk] = useState<RiskData>({
    flash_flood: 0,
    landslide: 0,
    extreme_rainfall: 0,
    overall: "LOADING",
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [globalLocation, setGlobalLocation] = useState({
    name: "Dharamshala",
    lat: 32.219,
    lon: 76.3234,
  });

  // Search autocomplete
  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayFn = setTimeout(async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/locations/search?query=${searchQuery}`
          );
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (e) {}
      }, 400);
      return () => clearTimeout(delayFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Fetch Risk Telemetry
  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/risk?lat=${globalLocation.lat}&lon=${globalLocation.lon}`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          setRisk({
            flash_flood: Number(data.flash_flood) || 0,
            landslide: Number(data.landslide) || 0,
            extreme_rainfall: Number(data.extreme_rainfall) || 0,
            overall: data.overall || "LOW",
          });
        }
      } catch (error) {
        console.error("Risk API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
    const interval = setInterval(fetchRisk, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [globalLocation]);

  // Fetch Weather Forecast
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/weather?lat=${globalLocation.lat}&lon=${globalLocation.lon}`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          setWeather(data);
        }
      } catch (error) {
        console.error("Weather API Error:", error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [globalLocation]);

  // Fetch Emergency Alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/alerts`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error("Alerts API Error:", error);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [globalLocation]);

  return (
    <DynamicBackground
      condition={
        (weather as any)?.current?.rain > 0
          ? "Rain"
          : (weather as any)?.current?.cloud_cover > 50
          ? "Cloudy"
          : "Sunny"
      }
    >
      <main className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 pb-20">
        {/* 1. Official SDMA Authority Header */}
        <AuthorityHeader onOpenSitRep={() => setIsSitRepOpen(true)} />

        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Location Quick Search & Coordinates Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Active Monitoring Sector
                </span>
                <span className="text-base font-bold text-white">
                  {globalLocation.name}, Himachal Pradesh
                </span>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  ({globalLocation.lat.toFixed(3)}°N, {globalLocation.lon.toFixed(3)}°E)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* City Autocomplete */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search HP District / City..."
                  className="w-full bg-slate-950/90 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl z-50">
                    {searchResults.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-2.5 hover:bg-slate-800/80 cursor-pointer text-xs flex justify-between"
                        onClick={() => {
                          setGlobalLocation({
                            name: res.name,
                            lat: res.latitude,
                            lon: res.longitude,
                          });
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                      >
                        <span className="font-semibold text-white">{res.name}</span>
                        <span className="text-slate-400">{res.admin1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/local"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-xl transition-all shrink-0"
              >
                <span>My GPS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Top-level Threat KPI Metrics */}
          <ThreatKPIBar />

          {/* 3. Main Multi-Column Intelligence Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Weather & Forecast Features */}
            <div className="xl:col-span-5 space-y-6 flex flex-col">
              <BeautifulWeather
                weather={weather}
                weatherLoading={weatherLoading}
                locationName={globalLocation.name}
              />
              <ForecastDisaster risk={risk} loading={loading} />
              <TrendChart weather={weather} />

              {/* Active Emergency Alerts Box */}
              <section className="bg-gradient-to-b from-rose-950/40 to-slate-950/80 backdrop-blur-md border border-rose-800/40 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                  Active Emergency Alerts
                </h3>
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    All clear for monitored sectors. No active severe alerts triggered.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/50">
                            {alert.type}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {alert.timestamp}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs pt-1">{alert.location}</h4>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: GIS Risk Map & Hydrological Intelligence */}
            <div className="xl:col-span-7 space-y-6">
              {/* GIS Multispectral Map */}
              <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Multispectral Threat & Terrain GIS
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live sensor overlays: landslide hazard index, precipitation radar & river corridors.
                    </p>
                  </div>
                </div>

                <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <RiskMap />
                </div>
              </section>

              {/* Hydrological River Intel */}
              <HydrologicalIntelligence weather={weather} />
            </div>
          </div>

          {/* 4. Full District Vulnerability Matrix */}
          <DistrictRiskMatrix />
        </div>

        {/* 5. Situation Report (SitRep) Modal */}
        <SitRepModal isOpen={isSitRepOpen} onClose={() => setIsSitRepOpen(false)} />
      </main>
    </DynamicBackground>
  );
}
