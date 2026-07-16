import React from "react";
import { Star, Trash2, MapPin, Sparkles } from "lucide-react";
import { City } from "../types";

interface SavedLocationsProps {
  favorites: City[];
  currentCity: City | null;
  onSelectCity: (city: City) => void;
  onAddFavorite: (city: City) => void;
  onRemoveFavorite: (city: City) => void;
}

export default function SavedLocations({
  favorites,
  currentCity,
  onSelectCity,
  onAddFavorite,
  onRemoveFavorite,
}: SavedLocationsProps) {
  const isCurrentFavorite = currentCity && favorites.some((fav) => fav.id === currentCity.id);

  const toggleFavorite = () => {
    if (!currentCity) return;
    if (isCurrentFavorite) {
      onRemoveFavorite(currentCity);
    } else {
      onAddFavorite(currentCity);
    }
  };

  return (
    <div id="saved-locations-panel" className="p-5 bg-white/[0.02] border border-white/10 rounded-lg space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <h3 className="font-display text-xs tracking-widest uppercase text-white">
            Favorite Coordinates
          </h3>
        </div>
        
        {currentCity && (
          <button
            id="toggle-favorite-button"
            onClick={toggleFavorite}
            className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] tracking-widest uppercase font-sans font-bold transition-all duration-300 ${
              isCurrentFavorite
                ? "bg-gold/5 border-gold/40 text-gold"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
            }`}
          >
            <Star className={`w-3 h-3 ${isCurrentFavorite ? "fill-gold text-gold" : ""}`} />
            <span>{isCurrentFavorite ? "Saved" : "Pin Location"}</span>
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          No coordinates pinned yet. Click "Pin Location" to save {currentCity?.name || "your locations"} for immediate access.
        </p>
      ) : (
        <div id="favorites-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {favorites.map((city) => {
            const isSelected = currentCity && currentCity.id === city.id;
            return (
              <div
                key={`${city.id}-${city.latitude}`}
                id={`fav-item-${city.id}`}
                className={`group p-3 border rounded flex items-center justify-between gap-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-white/5 border-gold"
                    : "bg-white/[0.01] border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  id={`select-fav-${city.id}`}
                  onClick={() => onSelectCity(city)}
                  className="flex-1 min-w-0 text-left flex items-center gap-2"
                >
                  <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? "text-gold" : "text-slate-500"}`} />
                  <div className="truncate">
                    <div className={`text-xs font-sans font-bold truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {city.name}
                    </div>
                    <div className="text-[9px] font-sans text-slate-500 truncate uppercase tracking-wider">
                      {city.country_code ? city.country_code.toUpperCase() : city.country}
                    </div>
                  </div>
                </button>

                <button
                  id={`remove-fav-${city.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(city);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all duration-300 focus:opacity-100"
                  title={`Remove ${city.name} from favorites`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
