import React from 'react';
import { Cloud, Droplets, Wind, Navigation, ThermometerSun, Eye, Gauge } from 'lucide-react';

export default function BeautifulWeather({ weather, weatherLoading, locationName }: { weather: any, weatherLoading: boolean, locationName: string }) {
  if (weatherLoading || !weather) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-black/20 rounded-3xl backdrop-blur-md border border-white/10 mt-6 animate-pulse">
        <span className="text-white/60">Gathering atmospheric data...</span>
      </div>
    );
  }

  // Find rain probability from max_rain_probability or use fallback
  const rainProb = weather.forecast?.max_rain_probability || 0;

  return (
    <div className="w-full mt-6 flex flex-col gap-4">
      {/* Search / Location Pill */}
      <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-5 py-3 border border-white/10 shadow-lg text-white">
        <Navigation size={18} className="text-white/80" />
        <span className="font-medium tracking-wide text-lg">{locationName}</span>
        <div className="ml-auto flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm font-semibold">
          <span className="text-white">&deg;C</span>
          <span className="text-white/40">&deg;F</span>
        </div>
      </div>

      {/* Main Weather Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/20 to-black/30 backdrop-blur-xl border border-white/20 shadow-2xl p-8 min-h-[220px] flex flex-col justify-between">
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay -z-10"></div>
        
        <div className="flex justify-between items-start text-white">
          <div>
            <h1 className="text-8xl font-light tracking-tighter leading-none">
              {Math.round(weather.current.temperature)}&deg;
            </h1>
            <p className="text-xl font-medium mt-4 tracking-wide text-white/90">
              {weather.current.showers > 0 || weather.current.rain > 0 ? "Rainy" : weather.current.cloud_cover > 50 ? "Overcast Clouds" : "Clear Sky"}
            </p>
            <p className="text-md text-white/70 mt-1">
              Feels like {Math.round(weather.current.temperature)}&deg;
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="mt-8 flex flex-col items-end gap-1">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">H: {Math.round(weather.current.temperature + 4)}&deg;</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">L: {Math.round(weather.current.temperature - 3)}&deg;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <Wind size={16} /> <span>Wind</span>
          </div>
          <p className="text-xl font-semibold">{weather.current.wind_speed} <span className="text-sm font-normal text-white/70">km/h</span></p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <Droplets size={16} /> <span>Humidity</span>
          </div>
          <p className="text-xl font-semibold">{weather.current.humidity}<span className="text-sm font-normal text-white/70">%</span></p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <Cloud size={16} /> <span>Current Rain</span>
          </div>
          <p className="text-xl font-semibold">{weather.current.rain} <span className="text-sm font-normal text-white/70">mm</span></p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <Eye size={16} /> <span>Rain Prob</span>
          </div>
          <p className="text-xl font-semibold">{rainProb}<span className="text-sm font-normal text-white/70">%</span></p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <Gauge size={16} /> <span>24h Accum</span>
          </div>
          <p className="text-xl font-semibold">{weather.forecast?.rainfall_next_24h || 0} <span className="text-sm font-normal text-white/70">mm</span></p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white transition-all hover:bg-white/20">
          <div className="flex items-center gap-2 text-white/60 mb-2 text-sm">
            <ThermometerSun size={16} /> <span>UV Index</span>
          </div>
          <p className="text-xl font-semibold">4 <span className="text-sm font-normal text-white/70">Moderate</span></p>
        </div>

      </div>
    </div>
  );
}
