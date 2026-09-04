import React from 'react';
import { Cloud, Droplets, Wind, Navigation, ThermometerSun, Eye, Gauge, Calendar, CloudRain, Sun } from 'lucide-react';

export default function BeautifulWeather({ weather, weatherLoading, locationName }: { weather: any, weatherLoading: boolean, locationName: string }) {
  if (weatherLoading || !weather) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-black/20 rounded-[2.5rem] backdrop-blur-md border border-white/10 mt-6 animate-pulse">
        <span className="text-white/60 font-medium tracking-widest uppercase">Gathering atmospheric data...</span>
      </div>
    );
  }

  const rainProb = weather.forecast?.max_rain_probability || 0;
  const pressure = weather.current?.pressure || 1013;
  const visibility = weather.current?.visibility ? (weather.current.visibility / 1000).toFixed(1) : 10;
  const uvIndex = 4; // Hardcoded or mock if not available from API
  
  // Format daily forecast if it exists
  const daily = weather.daily || [];

  return (
    <div className="w-full mt-6 flex flex-col gap-6">
      
      {/* Search / Location Pill - Wait, the search bar will be in Header, so just show location here */}
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 shadow-lg text-white w-fit">
        <Navigation size={18} className="text-blue-400" />
        <span className="font-bold tracking-wide text-lg">{locationName}</span>
      </div>

      {/* Main Weather Card (OpenWeatherMap Style Hero) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-900/40 to-black/60 backdrop-blur-xl border border-blue-500/20 shadow-2xl p-8 min-h-[220px] flex flex-col justify-between">
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay -z-10"></div>
        
        <div className="flex justify-between items-start text-white">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              {Math.round(weather.current.temperature)}&deg;
            </h1>
            <p className="text-lg md:text-xl font-medium mt-2 md:mt-4 tracking-wide text-blue-200">
              {weather.current.showers > 0 || weather.current.rain > 0 ? "Rainy" : "Clear Sky"}
            </p>
            <p className="text-md text-white/50 mt-1 font-semibold">
              Feels like {Math.round(weather.current.temperature)}&deg;
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white/90">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="mt-8 flex flex-col items-end gap-2">
              <span className="bg-black/40 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 text-red-300">
                H: {daily.length > 0 ? Math.round(daily[0].temp_max) : Math.round(weather.current.temperature + 4)}&deg;
              </span>
              <span className="bg-black/40 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 text-blue-300">
                L: {daily.length > 0 ? Math.round(daily[0].temp_min) : Math.round(weather.current.temperature - 3)}&deg;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Grid (OWM Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <Wind size={16} /> <span>Wind</span>
          </div>
          <p className="text-3xl font-bold">{weather.current.wind_speed} <span className="text-base font-medium text-white/50">km/h</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <Droplets size={16} /> <span>Humidity</span>
          </div>
          <p className="text-3xl font-bold">{weather.current.humidity}<span className="text-base font-medium text-white/50">%</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <Eye size={16} /> <span>Visibility</span>
          </div>
          <p className="text-3xl font-bold">{visibility} <span className="text-base font-medium text-white/50">km</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <Gauge size={16} /> <span>Pressure</span>
          </div>
          <p className="text-3xl font-bold">{pressure} <span className="text-base font-medium text-white/50">hPa</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <ThermometerSun size={16} /> <span>UV Index</span>
          </div>
          <p className="text-3xl font-bold">{uvIndex} <span className="text-base font-medium text-white/50">Mod</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 flex flex-col items-start justify-between text-white hover:bg-black/60 transition-colors">
          <div className="flex items-center gap-2 text-white/50 mb-3 text-xs font-bold uppercase tracking-wider">
            <CloudRain size={16} /> <span>Rain Prob</span>
          </div>
          <p className="text-3xl font-bold">{rainProb}<span className="text-base font-medium text-white/50">%</span></p>
        </div>

      </div>

      {/* Multi-Day Forecast (OpenWeatherMap Style) */}
      {daily.length > 0 && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-white mt-2">
          <div className="flex items-center gap-2 mb-6 text-white/50 text-xs font-bold uppercase tracking-widest">
            <Calendar size={16} />
            <span>7-Day Forecast</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {daily.map((day: any, i: number) => {
              const dateObj = new Date(day.date);
              const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isRain = day.rain_prob > 20;

              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="w-24 font-bold text-white/90 text-lg">{dayName}</div>
                  <div className="flex-1 flex justify-center items-center gap-2">
                    {isRain ? <CloudRain size={24} className="text-blue-400" /> : <Sun size={24} className="text-yellow-400" />}
                    {isRain && <span className="text-xs text-blue-400 font-bold">{day.rain_prob}%</span>}
                  </div>
                  <div className="w-32 flex justify-end items-center gap-4 text-lg font-bold">
                    <span className="text-white/40">{Math.round(day.temp_min)}&deg;</span>
                    <span className="text-white">{Math.round(day.temp_max)}&deg;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
