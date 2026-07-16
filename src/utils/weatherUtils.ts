import { 
  Sun, 
  Moon, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning, 
  CloudRainWind,
  LucideIcon
} from "lucide-react";

export interface WeatherInterpretation {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export function getWeatherInterpretation(code: number, isDay: boolean = true): WeatherInterpretation {
  switch (code) {
    case 0:
      return {
        label: "Clear Sky",
        icon: isDay ? Sun : Moon,
        bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
        textClass: "text-amber-700 dark:text-amber-400"
      };
    case 1:
    case 2:
    case 3:
      return {
        label: code === 1 ? "Mainly Clear" : code === 2 ? "Partly Cloudy" : "Overcast",
        icon: CloudSun,
        bgClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30",
        textClass: "text-blue-700 dark:text-blue-400"
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        icon: CloudFog,
        bgClass: "bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800/30",
        textClass: "text-slate-700 dark:text-slate-400"
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Drizzle",
        icon: CloudDrizzle,
        bgClass: "bg-teal-50 border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/30",
        textClass: "text-teal-700 dark:text-teal-400"
      };
    case 56:
    case 57:
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        icon: Snowflake,
        bgClass: "bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/30",
        textClass: "text-sky-700 dark:text-sky-400"
      };
    case 61:
    case 63:
    case 65:
      return {
        label: code === 61 ? "Light Rain" : code === 63 ? "Moderate Rain" : "Heavy Rain",
        icon: CloudRain,
        bgClass: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30",
        textClass: "text-indigo-700 dark:text-indigo-400"
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: "Snowfall",
        icon: Snowflake,
        bgClass: "bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-900/30",
        textClass: "text-violet-700 dark:text-violet-400"
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Rain Showers",
        icon: CloudRainWind,
        bgClass: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-900/30",
        textClass: "text-cyan-700 dark:text-cyan-400"
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        icon: Snowflake,
        bgClass: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30",
        textClass: "text-indigo-700 dark:text-indigo-400"
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        icon: CloudLightning,
        bgClass: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30",
        textClass: "text-rose-700 dark:text-rose-400"
      };
    default:
      return {
        label: "Unknown Weather",
        icon: Cloud,
        bgClass: "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-900/30",
        textClass: "text-gray-700 dark:text-gray-400"
      };
  }
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
