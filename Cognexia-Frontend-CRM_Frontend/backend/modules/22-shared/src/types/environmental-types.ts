// ===========================================
// ENVIRONMENTAL MONITORING TYPES
// Industry 5.0 ERP Backend System
// ===========================================

export interface EnvironmentalConditions {
  timestamp: Date;
  temperature: number;
  humidity: number;
  pressure: number;
  vibration: number;
  acousticLevel: number;
  dustLevel: number;
  lightLevel: number;
  airQuality: number;
}

export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
}

export interface SeismicData {
  timestamp: Date;
  magnitude: number;
  depth: number;
  location: { latitude: number; longitude: number };
  intensity: number;
  duration: number;
}

export interface AtmosphericData {
  timestamp: Date;
  oxygenLevel: number;
  co2Level: number;
  particulateMatter: number;
  ozonLevel: number;
  pollutantLevels: Record<string, number>;
}
