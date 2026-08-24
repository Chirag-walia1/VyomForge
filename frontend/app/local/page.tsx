"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BeautifulWeather from "../components/BeautifulWeather";
import { ForecastDisaster, TrendChart } from "../components/RaincloudFeatures";
import DynamicBackground from "../components/DynamicBackground";
import Link from "next/link";

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
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({lat: pos.coords.latitude, lon: pos.coords.longitude});
        fetchSafePoints(pos.coords.latitude, pos.coords.longitude);
      });
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
      <div className="min-h-screen pb-20 pt-8 px-4 sm:px-8 max-w-4xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-white/60 text-sm mb-2 inline-block hover:text-white">&larr; Back to Global View</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
              HimAlert : My Location
            </h1>
            <p className="mt-1 text-xs text-blue-300 uppercase tracking-widest font-semibold drop-shadow">
              VyomForge Hydrological Intelligence Network
            </p>
          </div>
          <div className="w-full md:w-[400px]">
             <AITerminal />
          </div>
        </header>

        {/* New OpenWeather Style Components */}
        <BeautifulWeather weather={weather} weatherLoading={weatherLoading} locationName="My Exact Location" />
        
        <ForecastDisaster risk={risk} loading={riskLoading} />
        
        <TrendChart weather={weather} />

        {/* Existing Safe Zones using Glassmorphism */}
        {safePoints.length > 0 && (
          <section className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Real-Time Safe Zones</h2>
            <p className="text-white/60 mb-6">Detected live emergency points (OpenStreetMap) within 3km of your exact GPS location.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safePoints.map((sp, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-center">
                  <div className="font-bold text-blue-300 text-lg">{sp.name}</div>
                  <div className="text-white/40 text-sm mt-1 uppercase tracking-widest">{sp.type}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <HydrologicalIntelligence />
        </div>

      </div>
    </DynamicBackground>
  );
}
