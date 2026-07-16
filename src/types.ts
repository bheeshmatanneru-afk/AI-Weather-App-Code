export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code?: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  wind_speed_10m_max: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: CurrentWeather;
  daily: DailyWeather;
}

export interface ClothingGuide {
  head: string;
  body: string;
  legs: string;
  footwear: string;
  accessories: string[];
}

export interface WeatherActivity {
  name: string;
  suitability: "Excellent" | "Good" | "Poor" | string;
  reason: string;
}

export interface WeatherIntelligence {
  summary: string;
  clothing: ClothingGuide;
  activities: WeatherActivity[];
  alerts: string[];
  bestCommuteTime: string;
  weekendOutlook: string;
}
