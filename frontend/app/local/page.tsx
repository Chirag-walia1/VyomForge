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
const SafeZoneMap = dynamic(() => import("../components/SafeZoneMap"), { ssr: false });
const RiskMap = dynamic(() => import("../components/RiskMap"), { ssr: false });

export default function LocalDashboard() {
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  const [cityName, setCityName] = useState("My Location");

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      if (data.address && data.address.city) {
        setCityName(data.address.city);
      } else if (data.address && data.address.town) {
        setCityName(data.address.town);
      } else if (data.address && data.address.village) {
        setCityName(data.address.village);
      }
    } catch(e) {}
  };

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
      navigator.geolocation.getCurrentPosition((pos) => { setUserLocation({lat: pos.coords.latitude, lon: pos.coords.longitude}); reverseGeocode(pos.coords.latitude, pos.coords.longitude); fetchSafePoints(pos.coords.latitude, pos.coords.longitude); }, (err) => { console.warn("Geolocation failed", err); setUserLocation({lat: 32.219, lon: 76.3234}); reverseGeocode(32.219, 76.3234); fetchSafePoints(32.219, 76.3234); }, { timeout: 10000 });
    } else {
      // Fallback
      setUserLocation({lat: 32.219, lon: 76.3234}); reverseGeocode(32.219, 76.3234);
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
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
                  HimAlert <span className="text-blue-400 font-light">Local</span>
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 border border-white/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
                <MapPin size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Live Ops</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Link
                href="/"
                className="group relative overflow-hidden rounded-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-6 py-2 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg w-full md:w-auto"
              >
                <span className="relative z-10 text-xs font-bold tracking-wide text-blue-100">&larr; Back to Global View</span>
              </Link>
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
                    <p className="text-blue-200/60 text-sm mt-1 uppercase tracking-wider font-semibold">3km Radius OpenStreetMap Live Sync</p>
                  </div>
                </div>
                
                <div className="h-[440px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 relative">
                  {!userLocation ? (
                    <div className="h-full w-full flex items-center justify-center font-medium text-blue-200/50 animate-pulse bg-black/40">
                      Acquiring GPS coordinates...
                    </div>
                  ) : (
                    <SafeZoneMap userLocation={userLocation} safePoints={safePoints} />
                  )}
                </div>
              </section>

              {/* HYDROLOGICAL */}
              <HydrologicalIntelligence locationName={cityName} weather={weather} />

            </div>
          </div>
        </div>
      </div>
    </DynamicBackground>
  );
}




