import { WeatherData, WeatherIntelligence } from "../types";

export function generateClientSideIntelligence(weather: WeatherData, locationName: string): WeatherIntelligence {
  const current = weather.current;
  const temp = current.temperature_2m;
  const prec = current.precipitation;
  const code = current.weather_code;
  const isRain = prec > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  
  // 1. Summary
  let summary = `Currently in ${locationName}, it's ${Math.round(temp)}°C. `;
  if (isRain) {
    summary += "With active precipitation detected, conditions favor sheltered or indoor operations. Ideal for reading, strategic planning, or indoor physical training.";
  } else if (isSnow) {
    summary += "Snowfall is active across the region. Layer up with thermal wear. Conditions are suitable for winter sports or cozy indoor social gatherings.";
  } else if (temp > 28) {
    summary += "High thermal index observed. Limit direct midday exposure, prioritize hydration, and schedule outdoor movements in early morning or late evening.";
  } else {
    summary += "Superb, clear atmospheric conditions. Excellent for outdoor transit, jogging, and general active commuting.";
  }

  // 2. Clothing
  const clothing = {
    head: temp > 25 ? "Lightweight sun cap or polarized sunglasses" : isRain ? "Waterproof hood or wide-brim hat" : temp < 10 ? "Insulated beanie or thermal cap" : "Clear sunglasses for UV defense",
    body: temp > 25 ? "Highly breathable cotton or moisture-wicking active tee" : temp > 15 ? "Light pullover or breathable windbreaker jacket" : temp > 8 ? "Durable mid-layer fleece over cotton shirt" : "Heavy down jacket over thermal base layer",
    legs: temp > 22 ? "Comfortable active shorts or linen trousers" : temp > 12 ? "Flexible denim or athletic track pants" : "Insulated fleece-lined trousers or wind-resistant pants",
    footwear: isRain ? "Waterproof boots or treated protective shoes" : isSnow ? "Insulated high-traction winter boots" : temp > 25 ? "Breathable open sandals or light sneakers" : "Standard athletic sneakers or leather shoes",
    accessories: isRain ? ["Compact umbrella", "Waterproof backpack sleeve"] : temp > 25 ? ["Broad spectrum SPF 50+ sunscreen", "Insulated water bottle"] : ["Thermal touch-screen gloves", "Windproof neck gaiter"]
  };

  // 3. Activities
  const activities = [
    {
      name: "Outdoor Running & Training",
      suitability: isRain || isSnow || temp > 32 || temp < 5 ? "Poor" : "Excellent",
      reason: isRain ? "Precipitation creates slippery surfaces and low visibility." : "Optimal temperatures and dry pathways offer perfect cardiorespiratory conditions."
    },
    {
      name: "Cozy Coffee & Reading",
      suitability: "Excellent",
      reason: "Regardless of external thermal volatility, local indoor environments offer stable atmospheric shelter."
    },
    {
      name: "Urban Walking Transit",
      suitability: isRain ? "Poor" : temp > 28 ? "Good" : "Excellent",
      reason: isRain ? "Active rain requires continuous gear shielding." : "Pleasant wind speeds and favorable thermal conditions encourage healthy pedestrian movement."
    },
    {
      name: "Indoor Gym & Fitness",
      suitability: "Excellent",
      reason: "Perfectly climate-controlled environment to fulfill your physical training sequence without weather impact."
    }
  ];

  // 4. Alerts
  const alerts: string[] = [];
  if (isRain) alerts.push("Active precipitation. Exercise high vigilance on roadways due to reduced tire traction.");
  if (temp > 30) alerts.push("Elevated UV index and thermal loading. Keep hydration frequency high.");
  if (temp < 5) alerts.push("Low thermal metrics. Risk of localized wind chill discomfort.");
  if (alerts.length === 0) alerts.push("No severe warnings active. Enjoy the beautiful ambient atmosphere!");

  // 5. Commute
  const bestCommuteTime = isRain 
    ? "Schedule travel around high-intensity rain cells. Midday transit is advised." 
    : "Excellent conditions all day. Perfect window for standard early morning pedestrian or cyclist commutes.";

  // 6. Weekend
  const weekendOutlook = temp > 15 && !isRain 
    ? "Favorable warm conditions forecasted for Saturday/Sunday—highly recommended for park visits or outdoor social activities."
    : "Foretelling cool or overcast conditions—ideal weekend for visiting libraries, art galleries, or cozy indoor spots.";

  return {
    summary,
    clothing,
    activities,
    alerts,
    bestCommuteTime,
    weekendOutlook
  };
}
