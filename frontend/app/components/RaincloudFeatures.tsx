"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ForecastDisaster({ risk, loading }: { risk: any, loading: boolean }) {
  if (loading || !risk) {
    return <div className="text-white/60 animate-pulse mt-8">Loading forecast threat intelligence...</div>;
  }

  // Fallback to current risk if 24h risk is not explicitly provided
  const fFlood = risk.flash_flood_24h || risk.flash_flood || 0;
  const fLandslide = risk.landslide_24h || risk.landslide || 0;
  const fRain = risk.extreme_rainfall_24h || risk.extreme_rainfall || 0;
  const fOverall = risk.overall_24h || risk.overall || "LOW";

  return (
    <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white">
      <div className="text-purple-400 font-bold text-xs tracking-widest mb-1">FORECAST DISASTER INTELLIGENCE</div>
      <h2 className="text-2xl font-semibold">Next 24-Hours Threat Outlook</h2>
      <p className="text-sm text-white/60 mb-6">Predicted risk levels based on upcoming rainfall and weather conditions.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Flash Flood Risk</p>
          <h2 className="text-3xl font-bold text-blue-400">{fFlood}%</h2>
          <small className="text-[10px] text-white/40">24-hour forecast</small>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Landslide Risk</p>
          <h2 className="text-3xl font-bold text-orange-400">{fLandslide}%</h2>
          <small className="text-[10px] text-white/40">24-hour forecast</small>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Extreme Rainfall</p>
          <h2 className="text-3xl font-bold text-cyan-400">{fRain}%</h2>
          <small className="text-[10px] text-white/40">24-hour forecast</small>
        </div>

        <div className="bg-red-500/20 rounded-2xl p-4 border border-red-500/30">
          <p className="text-xs text-red-200 uppercase tracking-wider mb-2">Overall Threat</p>
          <h2 className="text-3xl font-bold text-red-400">{fOverall}</h2>
          <small className="text-[10px] text-red-200/60">Based on 24h forecast</small>
        </div>

      </div>
    </div>
  );
}

export function TrendChart({ weather }: { weather: any }) {
  if (!weather || !weather.forecast || !weather.forecast.hours) return null;

  // We map the next 24 hours of data into a chart, simulating the 10-day trend chart from RainCloud
  const hours = weather.forecast.hours.slice(0, 24);
  const labels = hours.map((h: any) => new Date(h.time).getHours() + ":00");
  const dataPoints = hours.map((h: any) => h.precipitation);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Precipitation (mm)',
        data: dataPoints,
        borderColor: 'rgba(56, 189, 248, 1)',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { display: true, grid: { display: false, color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      y: { display: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
    },
  };

  return (
    <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white">
      <h4 className="font-semibold text-lg mb-4">Advanced Precipitation Trend (Next 24h)</h4>
      <div className="h-[250px] w-full">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
