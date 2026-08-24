"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BeautifulWeather from "../components/BeautifulWeather";
import { ForecastDisaster, TrendChart } from "../components/RaincloudFeatures";
import DynamicBackground from "../components/DynamicBackground";
import HideOnScrollHeader from "../components/HideOnScrollHeader";
import Link from "next/link";
import { MapPin } from "lucide-react";

const HydrologicalIntelligence = dynamic(() => import("../components/HydrologicalIntelligence"), { ssr: false });
const RiskMap = dynamic(() => import("../components/RiskMap"), { ssr: false });
const AITerminal = dynamic(() => import("../components/AITerminal"), { ssr: false });

export default function LocalDashboard() {
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [safePoints, setSafePoints] = useState<any[]>([]);
  
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [risk, setRisk] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(true);

  const fetchSafePoints = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/safe-points?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setSafePoints(data.safe_points || []);
    } catch(e) {}
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => { setUserLocation({lat: pos.coords.latitude, lon: pos.coords.longitude}); fetchSafePoints(pos.coords.latitude, pos.coords.longitude); }, (err) => { console.warn("Geolocation failed", err); setUserLocation({lat: 32.219, lon: 76.3234}); fetchSafePoints(32.219, 76.3234); }, { timeout: 10000 });
    } else {
      // Fallback
      setUserLocation({lat: 32.219, lon: 76.3234});
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/weather?lat=${userLocation.lat}&lon=${userLocation.lon}`);
        const data = await res.json();
        setWeather(data);
      } catch (e) {
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    const fetchRisk = async () => {
      try {
        setRiskLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/risk?lat=${userLocation.lat}&lon=${userLocation.lon}`);
        const data = await res.json();
        setRisk(data);
      } catch(e) {
        setRisk(null);
      } finally {
        setRiskLoading(false);
      }
    };

    fetchWeather();
    fetchRisk();
    
    const interval = setInterval(() => {
      fetchWeather();
      fetchRisk();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userLocation]);

  const condition = weather?.current?.cloud_cover > 50 ? "Cloudy" : weather?.current?.rain > 0 ? "Rain" : "Sunny";

  return (
    <DynamicBackground condition={condition}>
      <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 pb-20 pt-8 px-4 sm:px-8">
        
        <div className="max-w-[90rem] mx-auto space-y-8">
          {/* PREMIUM HEADER */}
          <HideOnScrollHeader>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
            <div>
              <Link href="/" className="group text-white/50 hover:text-white transition-colors text-sm font-semibold tracking-wider uppercase flex items-center gap-2 mb-3 inline-block">
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Global View
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
                <MapPin size={14} className="text-emerald-400" /><span className="text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase">GPS Locked</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-md">
                HimAlert <span className="text-blue-400 font-light">Local</span>
              </h1>
              <p className="mt-1 text-sm text-blue-300 uppercase tracking-widest font-semibold drop-shadow">
                Personalized Threat Intelligence
              </p>
            </div>
            
            <div className="w-full md:w-[450px]">
               <AITerminal />
            </div>
          </header>
          </HideOnScrollHeader>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: WEATHER & FORECAST */}
            <div className="xl:col-span-5 space-y-8 flex flex-col">
              <BeautifulWeather weather={weather} weatherLoading={weatherLoading} locationName={userLocation ? "My Exact Location" : "Locating..."} />
              <ForecastDisaster risk={risk} loading={riskLoading} />
              <TrendChart weather={weather} />
            </div>

            {/* RIGHT COLUMN: SAFE ZONES & HYDROLOGICAL */}
            <div className="xl:col-span-7 space-y-8">
              
              {/* SAFE ZONES */}
              <section className="bg-gradient-to-b from-blue-950/60 to-black/60 backdrop-blur-xl border border-blue-500/30 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Real-Time Safe Zones</h2>
                    <p className="text-blue-200/60 text-sm mt-1 uppercase tracking-wider font-semibold">3km Radius • OpenStreetMap Live Sync</p>
                  </div>
                  <div className="text-4xl">🛡️</div>
                </div>
                
                {!userLocation ? (
                  <div className="h-[200px] flex items-center justify-center font-medium text-blue-200/50 animate-pulse">
                    Acquiring GPS coordinates...
                  </div>
                ) : safePoints.length === 0 ? (
                  <div className="h-[200px] flex flex-col items-center justify-center font-medium text-blue-200/50">
                    <p>No verified emergency safe points found nearby.</p>
                    <p className="text-xs mt-2 opacity-50">Expanding search radius...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safePoints.map((sp, i) => (
                      <div key={i} className="bg-blue-900/20 border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-800/30 transition-all p-5 rounded-2xl flex flex-col justify-center">
                        <div className="font-bold text-blue-100 text-lg mb-1">{sp.name}</div>
                        <div className="text-blue-300/60 text-xs font-bold uppercase tracking-widest">{sp.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* HYDROLOGICAL */}
              <HydrologicalIntelligence />

            </div>
          </div>
        </div>
      </div>
    </DynamicBackground>
  );
}



