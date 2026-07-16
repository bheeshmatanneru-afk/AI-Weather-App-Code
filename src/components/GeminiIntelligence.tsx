import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Shirt, 
  Glasses, 
  Footprints, 
  Compass, 
  Car, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { WeatherIntelligence, WeatherData } from "../types";

interface GeminiIntelligenceProps {
  intelligence: WeatherIntelligence | null;
  isLoading: boolean;
  error: string | null;
  locationName: string;
}

const LOADING_STEPS = [
  "Reading Open-Meteo atmospheric pressure and humidity levels...",
  "Running cloud cover and temperature charts...",
  "Initiating Gemini AI weather intelligence processor...",
  "Analyzing wind shear, precipitation volumes, and UV index stats...",
  "Translating meteorological vectors into human activity recommendations...",
  "Formulating layered clothing strategies...",
  "Synthesizing your custom Weather Intelligence Brief..."
];

export default function GeminiIntelligence({ 
  intelligence, 
  isLoading, 
  error, 
  locationName 
}: GeminiIntelligenceProps) {
  const [loadingStep, setLoadingStep] = useState(0);

  // Rotate loading steps for premium user experience
  useEffect(() => {
    if (!isLoading) return;
    
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div id="ai-intelligence-loader" className="p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center min-h-[350px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl animate-pulse" />
          <div className="relative p-4 bg-gold/10 border border-gold/25 rounded text-gold shadow-lg shadow-gold/5">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
        </div>
        
        <h3 className="font-display text-sm tracking-widest uppercase text-white mb-2">
          Consulting Weather Intelligence...
        </h3>
        
        <div className="max-w-md text-center">
          <p className="text-xs text-white/50 tracking-wider font-mono h-12 flex items-center justify-center">
            {LOADING_STEPS[loadingStep]}
          </p>
        </div>

        <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-gold opacity-60 rounded-full animate-pulse"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="ai-intelligence-error" className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-lg flex flex-col items-center text-center">
        <AlertTriangle className="w-8 h-8 text-rose-500 mb-3" />
        <h3 className="text-xs font-sans tracking-widest uppercase text-rose-400 mb-1">
          Meteorological Pipeline Disrupted
        </h3>
        <p className="text-xs text-white/40 max-w-sm font-sans">
          {error}. Retry the connection.
        </p>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div id="ai-intelligence-empty" className="p-6 text-center text-white/30 text-xs font-mono tracking-widest uppercase">
        SELECT COORDINATES TO ACTIVATE INTEL
      </div>
    );
  }

  const getSuitabilityBadgeClass = (suitability: string) => {
    const s = suitability.toLowerCase();
    if (s.includes("excellent")) {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }
    if (s.includes("good")) {
      return "bg-gold/10 text-gold border-gold/30";
    }
    return "bg-white/5 text-slate-400 border-white/10";
  };

  return (
    <div id="gemini-intelligence-brief" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-neutral-900 via-stone-950 to-neutral-900 text-white rounded-lg border border-white/10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-gold/10 rounded border border-gold/20 text-gold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-display font-bold tracking-widest uppercase flex items-center gap-2 text-white">
              Gemini Weather Intelligence <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            </h2>
            <p className="text-[10px] text-white/40 tracking-wider uppercase font-sans mt-0.5">
              Analyzing metrics for {locationName} • Model: gemini-3.5-flash
            </p>
          </div>
        </div>
        <div className="self-start sm:self-center">
          <span className="text-[10px] font-mono font-medium px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold rounded uppercase tracking-widest">
            AI Advisory Active
          </span>
        </div>
      </div>

      {/* Summary Box */}
      <div id="intelligence-summary-box" className="p-6 bg-white/[0.02] border border-white/10 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
        <div className="pl-4">
          <h3 className="text-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-2">
            Strategic Planning Directive
          </h3>
          <p className="font-display text-lg italic text-white/95 leading-relaxed">
            "{intelligence.summary}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clothing Guide & Travel Advisory */}
        <div className="lg:col-span-1 space-y-6">
          {/* Clothing Card */}
          <div id="clothing-recommendation-card" className="p-6 bg-white/[0.02] border border-white/10 rounded-lg">
            <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-5">
              <Shirt className="w-3.5 h-3.5 text-gold" /> Layering & Clothing Guide
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3.5">
                <div className="p-1.5 h-8 w-8 rounded border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                  <Glasses className="w-3.5 h-3.5 text-gold/80" />
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest opacity-40 uppercase">HEAD & EYEWEAR</div>
                  <div className="text-xs font-sans font-medium text-slate-200 mt-0.5">{intelligence.clothing.head}</div>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="p-1.5 h-8 w-8 rounded border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                  <Shirt className="w-3.5 h-3.5 text-gold/80" />
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest opacity-40 uppercase">BODY LAYERS</div>
                  <div className="text-xs font-sans font-medium text-slate-200 mt-0.5">{intelligence.clothing.body}</div>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="p-1.5 h-8 w-8 rounded border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold/80" />
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest opacity-40 uppercase">LEGS</div>
                  <div className="text-xs font-sans font-medium text-slate-200 mt-0.5">{intelligence.clothing.legs}</div>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="p-1.5 h-8 w-8 rounded border border-white/10 bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                  <Footprints className="w-3.5 h-3.5 text-gold/80" />
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest opacity-40 uppercase">FOOTWEAR</div>
                  <div className="text-xs font-sans font-medium text-slate-200 mt-0.5">{intelligence.clothing.footwear}</div>
                </div>
              </div>
            </div>

            {intelligence.clothing.accessories && intelligence.clothing.accessories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="font-sans text-[9px] tracking-widest opacity-40 uppercase mb-2.5">ESSENTIAL ACCESSORIES</div>
                <div className="flex flex-wrap gap-1.5">
                  {intelligence.clothing.accessories.map((acc, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 text-[9px] font-sans font-medium px-2 py-1 bg-gold/5 border border-gold/20 text-gold rounded"
                    >
                      <Compass className="w-2.5 h-2.5" /> {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Commute Optimization */}
          <div id="commute-optimization-card" className="p-5 bg-white/[0.02] border border-white/10 rounded-lg">
            <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-2">
              <Car className="w-3.5 h-3.5 text-gold" /> Commute Advisor
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {intelligence.bestCommuteTime}
            </p>
          </div>
        </div>

        {/* Right Columns: Activities & Planning Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activities Suitability */}
          <div id="activities-suitability-panel" className="p-5 bg-white/[0.02] border border-white/10 rounded-lg">
            <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-gold" /> Activities Suitability
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligence.activities.map((act, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-white/10 rounded hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-sans font-bold text-slate-200">
                      {act.name}
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded border tracking-widest uppercase ${getSuitabilityBadgeClass(act.suitability)}`}>
                      {act.suitability}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {act.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Planning Alerts & Weekend Suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alerts Box */}
            <div id="planning-alerts-box" className="p-5 bg-white/[0.02] border border-white/10 rounded-lg">
              <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Planning Alerts
              </h3>
              {intelligence.alerts && intelligence.alerts.length > 0 ? (
                <ul className="space-y-2">
                  {intelligence.alerts.map((alert, index) => (
                    <li key={index} className="flex gap-2 items-start text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No warnings or conditions today. Enjoy the clear skies!</p>
              )}
            </div>

            {/* Weekend Outlook Box */}
            <div id="weekend-outlook-box" className="p-5 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xs tracking-widest uppercase text-white flex items-center gap-2 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-gold" /> Weekend Forecast Outlook
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {intelligence.weekendOutlook}
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end text-[9px] text-gold font-semibold gap-1.5 tracking-widest uppercase">
                <span>View daily sequences below</span>
                <ArrowRight className="w-3 h-3 text-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
