"use client";

import type {
  IWeatherInsightResponse,
  IWeatherLog,
  IWeatherPaginationMeta,
} from "@/interfaces";

export interface IWeatherLoadParams {
  limit?: number;
  offset?: number;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitationProb: number;
}

export interface IWeatherState {
  logs: IWeatherLog[];
  meta: IWeatherPaginationMeta | null;
  insight: IWeatherInsightResponse | null;
  error: string | null;
  insightError: string | null;
  isLoadingInsight: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  isInitialized: boolean;
}

export interface IWeatherProvider extends IWeatherState {
  loadWeatherLogs: (params?: IWeatherLoadParams) => Promise<void>;
  loadWeatherInsight: () => Promise<void>;
  exportWeatherXlsx: () => Promise<void>;
  exportWeatherCsv: () => Promise<void>;
  clearInsight: () => void;
}

export interface IContextProvider {
  children: React.ReactNode;
}
