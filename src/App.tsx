import React, { useState, useEffect } from "react";
import { 
  CloudSun, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  RefreshCw,
  Sun,
  Moon,
  Compass,
  LogIn,
  LogOut,
  CloudOff
} from "lucide-react";
import { City, WeatherData, WeatherIntelligence } from "./types";
import CitySearch from "./components/CitySearch";
import WeatherStats from "./components/WeatherStats";
import GeminiIntelligence from "./components/GeminiIntelligence";
import WeeklyForecast from "./components/WeeklyForecast";
import SavedLocations from "./components/SavedLocations";
import { getWeatherInterpretation } from "./utils/weatherUtils";
import { useFirebaseSync } from "./hooks/useFirebaseSync";
import { signInWithGoogle, signOutUser, isFirebaseEnabled } from "./lib/firebase";

const DEFAULT_CITY: City = {
  id: 5128581,
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  country: "United States",
  admin1: "New York",
  country_code: "US"
};

export default function App() {
  const [currentCity, setCurrentCity] = useState<City>(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [intelligence, setIntelligence] = useState<WeatherIntelligence | null>(null);

  const {
    user,
    authLoading,
    syncLoading,
    favorites,
    addFavorite,
    removeFavorite
  } = useFirebaseSync();

  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isIntelLoading, setIsIntelLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);

  // Load weather and intelligence on load/change
  useEffect(() => {
    fetchWeatherAndIntelligence(currentCity);
  }, [currentCity]);

  const fetchWeatherAndIntelligence = async (city: City) => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    setIntelError(null);
    setIntelligence(null);

    try {
      // 1. Fetch weather forecast from server proxy
      const weatherRes = await fetch(`/api/forecast?latitude=${city.latitude}&longitude=${city.longitude}`);
      if (!weatherRes.ok) {
        throw new Error("Failed to load meteorological data for this region");
      }
      const weatherData = await weatherRes.ok ? await weatherRes.json() : null;
      if (!weatherData) throw new Error("Received empty weather payload");
      
      setWeather(weatherData);
      setIsWeatherLoading(false);

      // 2. Fetch intelligence recommendations asynchronously
      setIsIntelLoading(true);
      const intelRes = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: weatherData.current,
          daily: weatherData.daily,
          locationName: city.name
        })
      });

      if (!intelRes.ok) {
        throw new Error("Gemini API intelligence pipeline failed");
      }

      const intelligenceData = await intelRes.json();
      setIntelligence(intelligenceData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      if (isWeatherLoading) {
        setWeatherError(err.message || "An unexpected error occurred while contacting weather service");
      } else {
        setIntelError(err.message || "Could not retrieve customized advice from Gemini");
      }
    } finally {
      setIsWeatherLoading(false);
      setIsIntelLoading(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setCurrentCity(city);
  };

  const handleAddFavorite = (city: City) => {
    addFavorite(city);
  };

  const handleRemoveFavorite = (city: City) => {
    removeFavorite(city);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Auth sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.error("Auth sign-out failed:", err);
    }
  };

  const handleRefresh = () => {
    fetchWeatherAndIntelligence(currentCity);
  };

  // Get current weather styling
  const interpretation = weather 
    ? getWeatherInterpretation(weather.current.weather_code, weather.current.is_day === 1)
    : null;
  const WeatherIcon = interpretation ? interpretation.icon : CloudSun;

  return (
    <div id="weather-intelligence-root" className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col font-sans selection:bg-gold/10 selection:text-gold">
      
      {/* Visual Navigation Header */}
      <header className="bg-[#0A0A0B] border-b border-white/10 py-5 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-gold/40 flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-gold opacity-80"></div>
            </div>
            <div>
              <h1 className="font-display text-xl tracking-widest uppercase font-bold text-white leading-none">
                Weather <span className="text-gold">Intelligence</span>
              </h1>
              <p className="text-[9px] text-white/40 tracking-[0.25em] uppercase font-sans mt-1.5 leading-none">
                Decision Science & Meteorological Advisory
              </p>
            </div>
          </div>

          {/* Search & Firebase Controls */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 flex-1 justify-end max-w-2xl">
            <div className="w-full max-w-md">
              <CitySearch 
                onSelectCity={handleSelectCity} 
                currentCityName={currentCity.name} 
              />
            </div>
            
            <div id="firebase-auth-control" className="flex items-center gap-3 shrink-0">
              {isFirebaseEnabled ? (
                user ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full border border-gold/40"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gold text-[#0A0A0B] text-[10px] font-bold rounded-full flex items-center justify-center">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div className="text-left hidden md:block">
                      <div className="text-[10px] text-white font-bold leading-none truncate max-w-[100px]">
                        {user.displayName || "Observer"}
                      </div>
                      <div className="text-[8px] text-white/40 leading-none mt-0.5 truncate max-w-[100px]">
                        Syncing active
                      </div>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="p-1 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded transition-colors"
                      title="Disconnect Cloud Sync"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-gold text-black hover:bg-gold/90 text-[10px] font-sans font-bold tracking-widest uppercase transition-colors border border-transparent"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sync Cloud</span>
                  </button>
                )
              ) : (
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-[9px] font-sans font-medium text-white/40 tracking-wider uppercase"
                  title="Firebase is unconfigured. Operating in offline/local storage mode."
                >
                  <CloudOff className="w-3 h-3 text-gold" />
                  <span>Local Mode</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Favorites Section */}
        <SavedLocations
          favorites={favorites}
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
          onAddFavorite={handleAddFavorite}
          onRemoveFavorite={handleRemoveFavorite}
        />

        {/* Main Loading Block */}
        {isWeatherLoading && !weather ? (
          <div id="global-loading-screen" className="flex flex-col items-center justify-center p-20 bg-white/[0.02] border border-white/10 rounded-lg min-h-[450px]">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
            <h3 className="font-display text-sm tracking-widest uppercase text-white">Retrieving Local Telemetry...</h3>
            <p className="text-[10px] text-white/40 tracking-wider uppercase font-sans mt-1">Connecting to Open-Meteo satellite grid</p>
          </div>
        ) : weatherError ? (
          <div id="global-error-screen" className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-lg flex flex-col items-center justify-center text-center min-h-[350px]">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-4 animate-pulse" />
            <h3 className="text-xs font-sans tracking-widest uppercase text-rose-400">Connection Interrupted</h3>
            <p className="text-xs text-white/40 max-w-md mt-1">{weatherError}</p>
            <button
              onClick={handleRefresh}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 hover:bg-gold/20 text-gold rounded text-xs font-semibold shadow-sm transition-all uppercase tracking-widest"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Request
            </button>
          </div>
        ) : weather && interpretation ? (
          <div className="space-y-6">
            
            {/* Top Weather Hero Summary Card */}
            <div 
              id="weather-hero-card" 
              className="p-8 bg-white/[0.02] border border-white/10 rounded-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all-300"
            >
              <div className="flex items-center gap-5 shrink-0">
                <div className="p-4 bg-white/5 rounded border border-white/10 flex items-center justify-center shrink-0">
                  <WeatherIcon className="w-10 h-10 text-gold" />
                </div>
                <div>
                  <div className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-2 italic">Atmospheric Overview</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <h2 className="text-2xl font-display italic text-white font-medium">
                      {currentCity.name}
                    </h2>
                  </div>
                  <p className="text-[10px] text-white/40 font-sans mt-1 uppercase tracking-widest">
                    {[currentCity.admin1, currentCity.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>

              {/* Dynamic Temperatures & Status Output */}
              <div className="flex items-end justify-between md:text-right gap-6">
                <div>
                  <h2 className="font-display text-7xl md:text-8xl font-light leading-none text-white">
                    {Math.round(weather.current.temperature_2m)}<span className="text-3xl align-top mt-2 text-gold">°C</span>
                  </h2>
                  <div className="flex items-center md:justify-end gap-2 text-[10px] font-sans tracking-widest uppercase text-white/50 mt-2">
                    <span>{interpretation.label}</span>
                    <span>•</span>
                    <span>
                      High: {Math.round(weather.daily.temperature_2m_max[0])}°
                    </span>
                    <span>•</span>
                    <span>
                      Low: {Math.round(weather.daily.temperature_2m_min[0])}°
                    </span>
                  </div>
                </div>
                
                {/* Refresh and metadata buttons */}
                <button
                  id="refresh-button"
                  onClick={handleRefresh}
                  disabled={isWeatherLoading || isIntelLoading}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-slate-300 hover:text-white transition-all disabled:opacity-50 shrink-0"
                  title="Force telemetry refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${(isWeatherLoading || isIntelLoading) ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Current Atmospheric Telemetry Grid */}
            <WeatherStats weather={weather} />

            {/* Gemini AI Intelligence Section */}
            <GeminiIntelligence
              intelligence={intelligence}
              isLoading={isIntelLoading}
              error={intelError}
              locationName={currentCity.name}
            />

            {/* 7-Day Forecast & SVG Temperature range chart */}
            <WeeklyForecast weather={weather} />

          </div>
        ) : null}

      </main>

      {/* Modern Compact Page Footer matching design specs */}
      <footer className="mt-auto h-16 border-t border-white/5 flex items-center justify-between px-10 flex-shrink-0 bg-black/40 text-[9px] text-white/30 tracking-widest uppercase font-sans">
        <div className="flex space-x-8">
          <span>COORD: {currentCity.latitude.toFixed(4)}° N, {currentCity.longitude.toFixed(4)}° W</span>
          <span>DATA SOURCE: OPEN-METEO V3</span>
        </div>
        <div>© 2026 WEATHER INTEL BUREAU</div>
      </footer>

    </div>
  );
}
