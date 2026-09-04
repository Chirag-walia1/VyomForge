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
import { Waves, MountainSnow, CloudRain, ShieldAlert } from 'lucide-react';

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
    return (
      <div className="mt-8 bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/10 animate-pulse flex items-center justify-center">
        <span className="text-white/60 font-medium">Synthesizing threat intelligence...</span>
      </div>
    );
  }

  const fFlood = risk.flash_flood_24h || risk.flash_flood || 0;
  const fLandslide = risk.landslide_24h || risk.landslide || 0;
  const fRain = risk.extreme_rainfall_24h || risk.extreme_rainfall || 0;
  const fOverall = risk.overall_24h || risk.overall || "LOW";

  return (
    <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
        <span className="text-purple-400 font-bold text-xs tracking-[0.2em] uppercase">Forecast Intelligence</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight">Next 24-Hours Threat Outlook</h2>
      <p className="text-sm text-white/60 mt-1 mb-8">AI-predicted risk levels based on atmospheric pressure and upcoming rainfall.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 rounded-3xl p-5 border border-blue-500/20 hover:border-blue-400/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <Waves size={20} className="text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl xl:text-4xl font-black text-blue-400 tracking-tighter">{fFlood}<span className="text-xl font-medium text-blue-400/50">%</span></h2>
          <p className="text-xs text-blue-200/60 uppercase tracking-wider mt-2 font-semibold">Flash Flood</p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/40 rounded-3xl p-5 border border-orange-500/20 hover:border-orange-400/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(249,115,22,0.1)] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
              <MountainSnow size={20} className="text-orange-400" />
            </div>
          </div>
          <h2 className="text-2xl xl:text-4xl font-black text-orange-400 tracking-tighter">{fLandslide}<span className="text-xl font-medium text-orange-400/50">%</span></h2>
          <p className="text-xs text-orange-200/60 uppercase tracking-wider mt-2 font-semibold">Landslide</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/40 rounded-3xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(6,182,212,0.1)] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
              <CloudRain size={20} className="text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl xl:text-4xl font-black text-cyan-400 tracking-tighter">{fRain}<span className="text-xl font-medium text-cyan-400/50">%</span></h2>
          <p className="text-xs text-cyan-200/60 uppercase tracking-wider mt-2 font-semibold">Extreme Rain</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/40 to-red-950/50 rounded-3xl p-5 border border-red-500/40 hover:border-red-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(239,68,68,0.15)] group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <ShieldAlert size={100} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
              <ShieldAlert size={20} className="text-red-400" />
            </div>
          </div>
          <h2 className="text-xl xl:text-3xl font-black text-red-400 tracking-tighter relative z-10">{fOverall}</h2>
          <p className="text-xs text-red-200/80 uppercase tracking-wider mt-2 font-semibold relative z-10">Overall Threat</p>
        </div>

      </div>
    </div>
  );
}

export function TrendChart({ weather }: { weather: any }) {
  if (!weather || !weather.forecast || !weather.forecast.hours) return null;

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
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.5,
        pointRadius: 0,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        mode: 'index' as const, 
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'rgba(255,255,255,0.9)',
        bodyColor: 'rgba(56, 189, 248, 1)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: { 
        display: true, 
        grid: { display: false, color: 'rgba(255,255,255,0.05)' }, 
        ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'system-ui', size: 10 } } 
      },
      y: { 
        display: true, 
        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] }, 
        ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'system-ui', size: 10 } },
        beginAtZero: true
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="font-bold text-2xl tracking-tight">Precipitation Trend</h4>
          <p className="text-white/50 text-sm mt-1 font-medium">Advanced Multi-Model Forecast (Next 24h)</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-wider">
          LIVE RADAR
        </div>
      </div>
      <div className="h-[250px] w-full relative">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}

