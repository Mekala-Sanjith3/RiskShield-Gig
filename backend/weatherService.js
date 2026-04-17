/**
 * weatherService.js — OpenWeatherMap Real-Time + Historical Validation
 * RiskShield-Gig v3.0
 *
 * Uses the free OpenWeatherMap API to fetch live weather conditions.
 * Falls back to simulated data if API is unavailable.
 * Also provides weather claim validation via ML service (Open-Meteo).
 */

const axios = require("axios");

// ── API Configuration ──────────────────────────────────────────────────────
const API_KEY = process.env.OPENWEATHER_API_KEY || "demo";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:5001";

/**
 * Fetches real-time weather data for a given city.
 * @param {string} city - e.g. "Bengaluru" | "Mumbai" | "Delhi"
 * @returns {Promise<Object>} - Normalized weather object
 */
async function getWeather(city) {
  // Use real API if key is provided
  if (API_KEY && API_KEY !== "demo") {
    try {
      const response = await axios.get(BASE_URL, {
        params: { q: city, appid: API_KEY, units: "metric" },
        timeout: 5000,
      });

      const w = response.data;
      return {
        city: w.name,
        country: w.sys?.country,
        temperature: Math.round(w.main.temp),       // °C
        feelsLike: Math.round(w.main.feels_like),
        humidity: w.main.humidity,
        windSpeed: Math.round(w.wind.speed),         // m/s
        rain: w.rain ? w.rain["1h"] || w.rain["3h"] || 1 : 0,  // mm/hr (0 if no rain)
        condition: w.weather?.[0]?.main || "Clear",
        description: w.weather?.[0]?.description || "clear sky",
        isLive: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[WeatherService] API call failed for "${city}":`, err.message);
      // Fall through to simulated data
    }
  }

  // ── Simulated fallback (realistic Indian city profiles) ──────────────────
  return simulateWeather(city);
}

/**
 * Simulates realistic weather for Indian gig worker cities.
 * Rotates through different weather profiles each call.
 */
function simulateWeather(city) {
  const cityProfiles = {
    bengaluru:   { base: 28, rainProb: 0.4, windBase: 5  },
    mumbai:      { base: 32, rainProb: 0.6, windBase: 8  },
    delhi:       { base: 38, rainProb: 0.2, windBase: 6  },
    hyderabad:   { base: 35, rainProb: 0.3, windBase: 4  },
    chennai:     { base: 34, rainProb: 0.5, windBase: 7  },
    pune:        { base: 30, rainProb: 0.35, windBase: 5 },
  };

  const key = (city || "bengaluru").toLowerCase().split(" ")[0];
  const profile = cityProfiles[key] || cityProfiles.bengaluru;

  const temp = profile.base + Math.round((Math.random() - 0.5) * 8);
  const hasRain = Math.random() < profile.rainProb;
  const rainMm = hasRain ? Math.round(Math.random() * 60 + 10) : 0;
  const windSpeed = profile.windBase + Math.round(Math.random() * 6);

  return {
    city,
    country: "IN",
    temperature: temp,
    feelsLike: temp + 2,
    humidity: hasRain ? 85 : 55,
    windSpeed,
    rain: rainMm,
    condition: hasRain ? "Rain" : temp > 35 ? "Clear" : "Clouds",
    description: hasRain
      ? "heavy intensity rain"
      : temp > 35
      ? "clear sky (hot)"
      : "few clouds",
    isLive: false,   // flag: this is simulated, not real API
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates a weather claim against historical Open-Meteo data.
 * Proxies to the ML Flask service which handles the Open-Meteo API call.
 *
 * @param {string} city - City name (e.g. "Bengaluru")
 * @param {number} rainClaimed - Rain amount claimed in mm
 * @param {string} timestamp - ISO timestamp of the event
 * @returns {Promise<Object>} - Validation result with flag if discrepancy > 30%
 */
async function validateWeatherClaim(city, rainClaimed, timestamp) {
  try {
    const response = await axios.post(`${ML_SERVICE}/validate-weather-claim`, {
      city: city,
      rain_claimed: rainClaimed,
      timestamp: timestamp,
    }, { timeout: 10000 });

    return response.data;
  } catch (err) {
    console.warn("[WeatherService] Weather validation failed:", err.message);
    // If validation service is down, allow claim by default
    return {
      valid: true,
      flag: null,
      error: "Weather validation service unavailable. Claim allowed by default.",
      claimed_rain_mm: rainClaimed,
      actual_rain_mm: null,
      discrepancy_pct: null,
      source: "ml-service-unavailable",
    };
  }
}

module.exports = { getWeather, validateWeatherClaim };
