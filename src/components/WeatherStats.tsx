import React from "react";
import { Thermometer, Droplets, Wind, CloudRain, Sun } from "lucide-react";
import { WeatherData } from "../types";

interface WeatherStatsProps {
  weather: WeatherData;
}

export default function WeatherStats({ weather }: WeatherStatsProps) {
  const { current, daily } = weather;
  
  const stats = [
    {
      id: "stat-feels-like",
      label: "Feels Like",
      value: `${Math.round(current.apparent_temperature)}°C`,
      icon: Thermometer,
      fillWidth: "w-3/4",
      description: "Apparent feels-like temperature metric."
    },
    {
      id: "stat-humidity",
      label: "Humidity",
      value: `${current.relative_humidity_2m}%`,
      icon: Droplets,
      fillWidth: `w-[${current.relative_humidity_2m}%]`,
      description: "Atmospheric moisture percentage."
    },
    {
      id: "stat-wind",
      label: "Wind Velocity",
      value: `${current.wind_speed_10m} km/h`,
      icon: Wind,
      fillWidth: "w-1/3",
      description: "Current horizontal air movement velocity."
    },
    {
      id: "stat-precipitation",
      label: "Precipitation",
      value: `${current.precipitation} mm`,
      icon: CloudRain,
      fillWidth: current.precipitation > 0 ? "w-1/2" : "w-0",
      description: "Precipitation aggregate of current telemetry."
    }
  ];

  // Get UV index if available in daily forecast for today (first index)
  const todayUv = daily?.uv_index_max?.[0];

  return (
    <div id="weather-stats-panel" className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          return (
            <div
              key={stat.id}
              id={stat.id}
              className="glass-panel p-6 flex flex-col justify-between min-h-[140px] rounded-lg border border-white/8 bg-white/[0.02] transition-all-300 hover:bg-white/[0.04]"
            >
              <div className="flex justify-between items-start">
                <span className="font-sans text-[10px] tracking-widest opacity-40 uppercase">
                  {stat.label}
                </span>
                <span className="text-gold/50"><stat.icon className="w-3.5 h-3.5" /></span>
              </div>
              
              <div className="my-2">
                <p className="font-display text-3xl font-light text-white">
                  {stat.value}
                </p>
                <p className="text-[9px] text-white/30 leading-snug mt-1 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>

              <div className="h-1 bg-white/5 w-full mt-1 overflow-hidden rounded-full">
                <div className={`h-full bg-gold opacity-60 ${stat.fillWidth}`} />
              </div>
            </div>
          );
        })}
      </div>

      {todayUv !== undefined && (
        <div 
          id="stat-uv-bar" 
          className="glass-panel p-5 rounded-lg border border-white/8 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="p-2.5 rounded-lg border border-gold/20 bg-gold/5 text-gold shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="font-sans text-[10px] tracking-widest opacity-40 uppercase">UV Radiation Index</div>
              <div className="text-md font-display italic text-white/95 mt-0.5">
                Level {todayUv} <span className="font-sans text-xs tracking-widest opacity-40 not-italic uppercase ml-2">({todayUv <= 2 ? "Low" : todayUv <= 5 ? "Moderate" : todayUv <= 7 ? "High" : "Severe"})</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:flex-1 max-w-md bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold opacity-75 transition-all duration-1000"
              style={{ width: `${Math.min((todayUv / 11) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
