import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { City } from "../types";

interface CitySearchProps {
  onSelectCity: (city: City) => void;
  currentCityName?: string;
}

export default function CitySearch({ onSelectCity, currentCityName }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search-city?name=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && Array.isArray(data.results)) {
            const formattedResults = data.results.map((item: any) => ({
              id: item.id,
              name: item.name,
              latitude: item.latitude,
              longitude: item.longitude,
              country: item.country || "",
              admin1: item.admin1 || "",
              country_code: item.country_code || "",
            }));
            setSuggestions(formattedResults);
            setIsOpen(true);
          } else {
            setSuggestions([]);
          }
        }
      } catch (error) {
        console.error("Error searching for cities:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (city: City) => {
    onSelectCity(city);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div id="city-search-container" className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="city-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={currentCityName ? `SEARCH LOCATION (CURRENT: ${currentCityName.toUpperCase()})...` : "SEARCH GLOBAL COORDINATES..."}
          className="w-full pl-10 pr-10 py-2 bg-transparent border-b border-white/25 focus:border-gold focus:outline-none font-sans text-xs tracking-widest text-[#E4E4E7] placeholder-white/30 uppercase transition-colors"
        />
        
        {isLoading && (
          <Loader2 className="absolute right-4 w-4 h-4 text-gold animate-spin" />
        )}
        
        {!isLoading && query && (
          <button
            id="clear-search-button"
            onClick={handleClear}
            className="absolute right-4 p-1 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          id="search-suggestions-dropdown" 
          className="absolute z-50 w-full mt-2 bg-[#0A0A0B]/95 border border-white/10 rounded-lg shadow-2xl overflow-hidden divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl"
        >
          {suggestions.map((city) => (
            <button
              key={`${city.id}-${city.latitude}`}
              id={`select-city-${city.id}`}
              onClick={() => handleSelect(city)}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-gold/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-sans font-semibold text-slate-200 truncate">
                  {city.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {[city.admin1, city.country].filter(Boolean).join(", ")}
                </div>
              </div>
              {city.country_code && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/10 text-gold rounded uppercase">
                  {city.country_code}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
        <div id="no-suggestions-box" className="absolute z-50 w-full mt-2 bg-[#0A0A0B] border border-white/10 rounded-lg shadow-xl p-4 text-center text-xs text-slate-500">
          No coordinates matching "{query}" found
        </div>
      )}
    </div>
  );
}
