export interface IWeatherLocation {
  lat: string;
  lon: string;
}

export interface IWeatherLog {
  _id: string;
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition_code: number;
  rain_probability: number;
  location: IWeatherLocation;
  createdAt: string;
}

export interface IWeatherPaginationMeta {
  total: number;
  offset: number;
  limit: number;
  last_page: number;
  current_page: number;
}

export interface IWeatherPaginationResponse {
  data: IWeatherLog[];
  meta: IWeatherPaginationMeta;
}

export type WeatherSeverity = "low" | "medium" | "high" | "critical";

export interface IWeatherAiAnalysis {
  insight: string;
  severity: WeatherSeverity;
}

export interface IWeatherInsightResponse {
  city: string;
  current_data: IWeatherLog;
  analysis: IWeatherAiAnalysis;
  history_sample: number;
  message: string;
}
