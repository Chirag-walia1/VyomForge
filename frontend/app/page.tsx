"use client";
/* eslint-disable */

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldCheck, Navigation } from "lucide-react";

// Components with correct relative path (../components/)
import BeautifulWeather from "../components/BeautifulWeather";
import { ForecastDisaster, TrendChart } from "../components/RaincloudFeatures";
import DynamicBackground from "../components/DynamicBackground";
import AuthorityHeader from "../components/AuthorityHeader";
import SitRepModal from "../components/SitRepModal";

const HydrologicalIntelligence = dynamic(
  () => import("../components/HydrologicalIntelligence"),
  { ssr: false }
);

const SafeZoneMap = dynamic(
  () => import("../components/SafeZoneMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[450px] items-center justify-center bg-slate-950/80 border border-slate-800 text-slate-400 rounded-xl">
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full"></span>
          Acquiring GPS coordinates & loading Safe Zones...
        </span>
      </div>
    ),
  }
);

export default function LocalDashboard() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState("Locating...");
  const [safePoints, setSafePoints] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [risk, setRisk] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      if (data.address && data.address.city) {
        setCityName(data.address.city);
      } else if (data.address && data.address.town) {
        setCityName(data.address.town);
      } else if (data.address && data.address.village) {
        setCityName(data.address.village);
      } else {
        setCityName("My GPS Location");
      }
    } catch (e) {
      setCityName("My GPS Location");
    }
  };

  const fetchSafePoints = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/safe-points?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setSafePoints(data.safe_points || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserLocation({ lat, lon });
          reverseGeocode(lat, lon);
          fetchSafePoints(lat, lon);
        },
        (err) => {
          console.warn("Geolocation fallback:", err);
          const fallbackLat = 32.219;
          const fallbackLon = 76.3234;
          setUserLocation({ lat: fallbackLat, lon: fallbackLon });
          reverseGeocode(fallbackLat, fallbackLon);
          fetchSafePoints(fallbackLat, fallbackLon);
        },
        { timeout: 10000 }
      );
    } else {
      const fallbackLat = 32.219;
      const fallbackLon = 76.3234;
      setUserLocation({ lat: fallbackLat, lon: fallbackLon });
      reverseGeocode(fallbackLat, fallbackLon);
      fetchSafePoints(fallbackLat, fallbackLon);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/weather?lat=${userLocation.lat}&lon=${userLocation.lon}`
        );
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://himalert.onrender.com"}/api/risk?lat=${userLocation.lat}&lon=${userLocation.lon}`
        );
        const data = await res.json();
        setRisk(data);
      } catch (e) {
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

  const condition =
    weather?.current?.rain > 0
      ? "Rain"
      : weather?.current?.cloud_cover > 50
      ? "Cloudy"
      : "Sunny";

  return (
    <DynamicBackground condition={condition}>
      <main className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 pb-20">
        {/* SDMA Authority Header */}
        <AuthorityHeader onOpenSitRep={() => setIsSitRepOpen(true)} />

        <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Top GPS Status Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Live GPS Field Operations
                </span>
                <span className="text-base font-bold text-white">
                  {cityName}
                </span>
                {userLocation && (
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    ({userLocation.lat.toFixed(4)}°N, {userLocation.lon.toFixed(4)}°E)
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back to State Command View</span>
            </Link>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Weather & Threat Predictions */}
            <div className="xl:col-span-5 space-y-6 flex flex-col">
              <BeautifulWeather
                weather={weather}
                weatherLoading={weatherLoading}
                locationName={cityName}
              />
              <ForecastDisaster risk={risk} loading={riskLoading} />
              <TrendChart weather={weather} />
            </div>

            {/* Right Column: Safe Zones Map & Hydrological Intel */}
            <div className="xl:col-span-7 space-y-6">
              {/* Real-time Safe Zones Section */}
              <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Live Safe Zones & Relief Shelter Network
                    </h3>
                    <p className="text-xs text-slate-400">
                      3km radius emergency shelters, helipads & evacuation staging points.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    GPS SYNC
                  </span>
                </div>

                <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  {!userLocation ? (
                    <div className="h-full w-full flex items-center justify-center font-medium text-slate-500 animate-pulse">
                      Acquiring GPS coordinates...
                    </div>
                  ) : (
                    <SafeZoneMap userLocation={userLocation} safePoints={safePoints} />
                  )}
                </div>
              </section>

              {/* River Catchment Intel */}
              <HydrologicalIntelligence locationName={cityName} weather={weather} />
            </div>
          </div>
        </div>

        {/* SitRep Modal */}
        <SitRepModal isOpen={isSitRepOpen} onClose={() => setIsSitRepOpen(false)} />
      </main>
    </DynamicBackground>
  );
}
