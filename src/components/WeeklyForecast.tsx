import React, { useState } from "react";
import { Calendar, CloudRain, Sun, Wind } from "lucide-react";
import { WeatherData } from "../types";
import { getWeatherInterpretation, formatDayName, formatDateLabel } from "../utils/weatherUtils";

interface WeeklyForecastProps {
  weather: WeatherData;
}

export default function WeeklyForecast({ weather }: WeeklyForecastProps) {
  const { daily } = weather;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!daily || !daily.time) return null;

  // Calculate scales for the SVG chart
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const uvIndices = daily.uv_index_max || [];
  const precipSums = daily.precipitation_sum || [];

  const absoluteMax = Math.max(...maxTemps);
  const absoluteMin = Math.min(...minTemps);
  const tempRange = absoluteMax - absoluteMin || 1;

  // Chart configuration
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate coordinate points for max and min temps
  const pointsMax = maxTemps.map((temp, i) => {
    const x = paddingX + (i * chartWidth) / (maxTemps.length - 1);
    const y = paddingY + chartHeight - ((temp - absoluteMin) / tempRange) * chartHeight;
    return { x, y, val: temp };
  });

  const pointsMin = minTemps.map((temp, i) => {
    const x = paddingX + (i * chartWidth) / (minTemps.length - 1);
    const y = paddingY + chartHeight - ((temp - absoluteMin) / tempRange) * chartHeight;
    return { x, y, val: temp };
  });

  // SVG Path generator helper
  const maxPath = pointsMax.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const minPath = pointsMin.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  
  // Shaded range path
  const shadedPath = [
    `M ${pointsMax[0].x} ${pointsMax[0].y}`,
    ...pointsMax.slice(1).map(p => `L ${p.x} ${p.y}`),
    `L ${pointsMin[pointsMin.length - 1].x} ${pointsMin[pointsMin.length - 1].y}`,
    ...pointsMin.slice().reverse().map(p => `L ${p.x} ${p.y}`),
    "Z"
  ].join(" ");

  return (
    <div id="weekly-forecast-panel" className="space-y-6">
      {/* Horizontal Forecast List */}
      <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
        <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-5">
          <Calendar className="w-3.5 h-3.5 text-gold" /> Weekly Sequence Forecast
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.time.map((timeStr, index) => {
            const maxTemp = Math.round(maxTemps[index]);
            const minTemp = Math.round(minTemps[index]);
            const code = daily.weather_code[index];
            const prec = precipSums[index];
            const interpretation = getWeatherInterpretation(code, true);
            const Icon = interpretation.icon;

            return (
              <div
                key={timeStr}
                id={`forecast-card-${index}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 border rounded text-center flex flex-col items-center justify-between transition-all duration-300 ${
                  hoveredIndex === index
                    ? "bg-white/5 border-gold scale-[1.03]"
                    : "bg-white/[0.01] border-white/10"
                }`}
              >
                <div>
                  <div className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">
                    {index === 0 ? "Today" : formatDayName(timeStr)}
                  </div>
                  <div className="text-[9px] font-mono text-white/30 mt-0.5">
                    {formatDateLabel(timeStr)}
                  </div>
                </div>

                <div className={`my-3.5 p-2 rounded bg-white/5 text-slate-300 transition-all duration-500 ${
                  hoveredIndex === index ? "rotate-6 scale-110 text-gold" : ""
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1 w-full">
                  <div className="text-[10px] font-sans text-white/40 tracking-wider uppercase truncate max-w-full">
                    {interpretation.label}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-xs font-sans font-bold">
                    <span className="text-slate-100">{maxTemp}°</span>
                    <span className="text-white/20 font-normal">/</span>
                    <span className="text-slate-400 font-medium">{minTemp}°</span>
                  </div>

                  {prec > 0 && (
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gold font-medium pt-1">
                      <CloudRain className="w-2.5 h-2.5 shrink-0" />
                      <span>{prec}mm</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Trend Chart */}
      <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-xs tracking-widest uppercase text-white">
              7-Day Atmospheric Thermal Range
            </h3>
            <p className="text-[10px] text-white/40 tracking-wider uppercase font-sans mt-0.5">
              Visualize the atmospheric thermal spectrum and daily thermal variance.
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-sans font-bold tracking-wider uppercase">
            <div className="flex items-center gap-1.5 text-gold">
              <span className="h-1.5 w-1.5 bg-gold" /> MAX METRICS
            </div>
            <div className="flex items-center gap-1.5 text-white/40">
              <span className="h-1.5 w-1.5 bg-white/20" /> MIN METRICS
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="overflow-x-auto">
          <div className="min-w-[580px] py-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
              <defs>
                {/* Temperature spectrum gradient */}
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A227" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0A0A0B" stopOpacity="0.01" />
                </linearGradient>
                {/* High contrast point shadows */}
                <filter id="pointShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Grid Background Lines */}
              {Array.from({ length: 5 }).map((_, index) => {
                const y = paddingY + (index * chartHeight) / 4;
                const tempLabel = Math.round(absoluteMax - (index * tempRange) / 4);
                return (
                  <g key={index} className="opacity-40">
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-white/10"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-white/30 font-mono text-[9px] font-semibold"
                    >
                      {tempLabel}°
                    </text>
                  </g>
                );
              })}

              {/* Vertical Guide Ticks & Hover Interactive Zones */}
              {daily.time.map((timeStr, i) => {
                const x = paddingX + (i * chartWidth) / (daily.time.length - 1);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={timeStr}>
                    {/* Hover column background highlight */}
                    {isHovered && (
                      <rect
                        x={x - chartWidth / 14}
                        y={paddingY - 5}
                        width={chartWidth / 7}
                        height={chartHeight + 10}
                        fill="currentColor"
                        className="text-white/5 rounded"
                        rx="4"
                      />
                    )}
                    
                    {/* Vertical tick line */}
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={height - paddingY + 5}
                      stroke="currentColor"
                      strokeWidth={isHovered ? "1.5" : "0.5"}
                      className={isHovered ? "text-gold/20" : "text-white/10"}
                    />

                    {/* Date labels on X Axis */}
                    <text
                      x={x}
                      y={height - 5}
                      textAnchor="middle"
                      className={`font-sans text-[9px] tracking-wider uppercase font-bold transition-colors duration-200 ${
                        isHovered ? "fill-gold" : "fill-white/30"
                      }`}
                    >
                      {formatDayName(timeStr)}
                    </text>
                  </g>
                );
              })}

              {/* Thermal shaded polygon range */}
              <path d={shadedPath} fill="url(#tempGradient)" />

              {/* Trend lines */}
              <path d={maxPath} fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" />
              <path d={minPath} fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

              {/* Temperature circles and digital output notes */}
              {pointsMax.map((p, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g 
                    key={i} 
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? "5" : "4"}
                      fill="#0A0A0B"
                      stroke="#C9A227"
                      strokeWidth={isHovered ? "3.5" : "2"}
                      filter="url(#pointShadow)"
                      className="transition-all duration-200"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className={`font-mono text-[9px] font-bold transition-all duration-200 ${
                        isHovered ? "fill-gold scale-110" : "fill-white/80"
                      }`}
                    >
                      {Math.round(p.val)}°
                    </text>
                  </g>
                );
              })}

              {pointsMin.map((p, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g 
                    key={i} 
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? "4.5" : "3.5"}
                      fill="#0A0A0B"
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth={isHovered ? "2.5" : "1.5"}
                      filter="url(#pointShadow)"
                      className="transition-all duration-200"
                    />
                    <text
                      x={p.x}
                      y={p.y + 14}
                      textAnchor="middle"
                      className={`font-mono text-[9px] font-bold transition-all duration-200 ${
                        isHovered ? "fill-white scale-110" : "fill-white/40"
                      }`}
                    >
                      {Math.round(p.val)}°
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
