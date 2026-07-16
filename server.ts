import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize Gemini SDK with recommended settings
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for local/external proxying just in case
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
  });

  // API 1: Geocoding Search (City -> Coordinates)
  app.get("/api/search-city", async (req, res) => {
    try {
      const { name } = req.query;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "City name parameter is required" });
      }

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch geocoding data from Open-Meteo");
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Geocoding Error:", error);
      return res.status(500).json({ error: error.message || "Internal server error during geocoding" });
    }
  });

  // API 2: Weather Forecast Proxy
  app.get("/api/forecast", async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude parameters are required" });
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,wind_speed_10m_max&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch weather forecast from Open-Meteo");
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Forecast Error:", error);
      return res.status(500).json({ error: error.message || "Internal server error during forecast retrieval" });
    }
  });

  // API 3: Weather Intelligence (Gemini-Powered Planning Recommendations)
  app.post("/api/intelligence", async (req, res) => {
    try {
      const { current, daily, locationName } = req.body;

      if (!current || !daily || !locationName) {
        return res.status(400).json({ error: "Missing required weather data or location name" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return a gracefully structured mock intelligence when Gemini API key is not configured yet, 
        // ensuring the app never crashes but prompts the user elegantly or handles it.
        return res.status(200).json({
          summary: `Currently in ${locationName}, it's ${current.temperature_2m}${current.units?.temperature_2m || "°C"} with apparent temperature ${current.apparent_temperature}°C. Weather code is ${current.weather_code}. Note: To enable smart AI weather advice, please configure your GEMINI_API_KEY.`,
          clothing: {
            head: "Standard protection based on sunshine/rain",
            body: current.temperature_2m < 15 ? "Warm sweater or jacket" : "Light comfortable shirt",
            legs: current.temperature_2m < 15 ? "Jeans or trousers" : "Shorts or light trousers",
            footwear: current.precipitation > 0 ? "Waterproof boots" : "Sneakers or standard shoes",
            accessories: current.precipitation > 0 ? ["Umbrella", "Rain gear"] : ["Water bottle", "Sunglasses"]
          },
          activities: [
            { name: "Running / Jogging", suitability: current.precipitation > 0 ? "Poor" : "Excellent", reason: current.precipitation > 0 ? "Wet ground and rainfall makes it slippery." : "Good outdoor temperatures." },
            { name: "Indoor Reading & Work", suitability: "Excellent", reason: "Always a great cozy alternative if weather changes." },
            { name: "Social Gathering", suitability: current.precipitation > 0 ? "Good (Indoor)" : "Excellent (Outdoor)", reason: "Weather is suitable for social gatherings." }
          ],
          alerts: current.precipitation > 0 ? ["Rainy conditions reported. Take care on wet roads."] : ["No critical alerts. Enjoy your day!"],
          bestCommuteTime: "Mid-day travel is recommended to avoid early/late peak weather variations.",
          weekendOutlook: "Check the 7-day forecast cards below for daily trends."
        });
      }

      // Build weather summary prompt for Gemini
      const prompt = `
Analyze the following weather data for ${locationName} and provide smart, practical daily planning and clothing recommendations.

--- CURRENT WEATHER DATA ---
Temperature: ${current.temperature_2m}°C (Apparent Feels-Like: ${current.apparent_temperature}°C)
Humidity: ${current.relative_humidity_2m}%
Wind Speed: ${current.wind_speed_10m} km/h
Precipitation: ${current.precipitation} mm
Weather Code (WMO): ${current.weather_code}
Is Day: ${current.is_day === 1 ? "Yes" : "No"}

--- 7-DAY FORECAST SUMMARY ---
Dates: ${JSON.stringify(daily.time)}
Max Temperatures: ${JSON.stringify(daily.temperature_2m_max)}°C
Min Temperatures: ${JSON.stringify(daily.temperature_2m_min)}°C
Precipitation Sums: ${JSON.stringify(daily.precipitation_sum)} mm
Weather Codes (WMO): ${JSON.stringify(daily.weather_code)}
UV Index Max: ${JSON.stringify(daily.uv_index_max)}

Please convert this meteorological status into high-quality human planning intelligence.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite weather intelligence planner. You synthesize raw temperatures, wind speeds, UV levels, precipitation, and WMO weather codes into incredibly practical, highly readable recommendations. Do not mention WMO codes directly; instead, describe them as sunny, stormy, foggy, snowy, etc. Ensure your response is detailed, engaging, and directly applicable to daily planning.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "A friendly, cohesive paragraph summarizing today's weather conditions and what it means for the user's day (e.g., ideal for outdoor sports, or better to work from home)."
              },
              clothing: {
                type: Type.OBJECT,
                properties: {
                  head: { type: Type.STRING, description: "What to wear on head (e.g., sun hat, warm beanie, sunglasses, hood)." },
                  body: { type: Type.STRING, description: "What to wear on body (e.g., cotton t-shirt, light sweater, layered heavy winter coat, waterproof raincoat)." },
                  legs: { type: Type.STRING, description: "What to wear on legs (e.g., shorts, jeans, breathable hiking trousers, waterproof rain pants)." },
                  footwear: { type: Type.STRING, description: "Recommended footwear (e.g., breathable sneakers, hiking boots, waterproof boots, leather shoes, sports shoes)." },
                  accessories: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of key accessories to carry (e.g. compact umbrella, sunscreen SPF 50+, thermal gloves, reusable water bottle, polarized sunglasses)."
                  }
                },
                required: ["head", "body", "legs", "footwear", "accessories"]
              },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Activity name (e.g., Outdoor Jogging, Cycling, Indoor Gym, Gardening, Social Picnic, Outdoor DIY)." },
                    suitability: { type: Type.STRING, description: "Suitability rating: must be 'Excellent', 'Good', or 'Poor'" },
                    reason: { type: Type.STRING, description: "A highly specific, meteorologically relevant reason why it is suitable or unsuitable today." }
                  },
                  required: ["name", "suitability", "reason"]
                },
                description: "List of exactly 4 diverse activities (2 outdoor, 2 indoor/sheltered) and their suitability rating under today's conditions."
              },
              alerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Any key weather alerts or warnings (e.g., High UV index warning, severe wind chill, rain forecast starting at afternoon, heatstroke warning, etc. or 'No alerts, perfect conditions.')."
              },
              bestCommuteTime: {
                type: Type.STRING,
                description: "Commute suggestion (e.g., 'Best commute window is 9 AM to 1 PM to avoid the forecasted afternoon thunderstorms.')."
              },
              weekendOutlook: {
                type: Type.STRING,
                description: "A brief, actionable forecast outlook for the coming weekend based on the 7-day weather trend (e.g., 'A rainy weekend ahead—perfect for indoor museum trips.', 'Sunny and warm on Saturday, plan your hikes then!')."
              }
            },
            required: ["summary", "clothing", "activities", "alerts", "bestCommuteTime", "weekendOutlook"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API");
      }

      const intelligenceData = JSON.parse(responseText.trim());
      return res.json(intelligenceData);
    } catch (error: any) {
      console.error("Gemini Intelligence Error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate weather planning intelligence" });
    }
  });

  // Vite Integration: Serve assets in dev, built files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Intelligence server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical Server Error:", err);
});
