"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type {
  IContextProvider,
  IWeatherLoadParams,
  IWeatherProvider,
  IWeatherState,
} from "./weather-interface";
import {
  getWeatherLogs,
  getWeatherInsight,
  downloadWeatherXlsx,
  downloadWeatherCsv,
} from "./weather-service";
import { toastError } from "@/lib/toast";

const WeatherContext = createContext<IWeatherProvider | undefined>(undefined);

export const WeatherProvider: React.FC<IContextProvider> = ({ children }) => {
  const [state, setState] = useState<IWeatherState>({
    logs: [],
    meta: null,
    insight: null,
    insightError: null,
    isLoadingInsight: false,
    error: null,
    isLoading: false,
    isSubmitting: false,
    isInitialized: false,
  });

  const loadWeatherLogs = useCallback(async (params?: IWeatherLoadParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getWeatherLogs(params);

      setState((prev) => ({
        ...prev,
        logs: response.data,
        meta: response.meta,
      }));
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível carregar os registros de clima.";

      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
    }
  }, []);

  const loadWeatherInsight = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isLoadingInsight: true,
      insightError: null,
    }));

    try {
      const insight = await getWeatherInsight();

      setState((prev) => ({
        ...prev,
        insight,
      }));
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível carregar os insights de clima.";

      setState((prev) => ({ ...prev, insightError: message }));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoadingInsight: false,
      }));
    }
  }, []);

  const exportWeatherXlsx = useCallback(async (): Promise<void> => {
    try {
      await downloadWeatherXlsx();
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível exportar os dados de clima em XLSX.";

      toastError(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const exportWeatherCsv = useCallback(async (): Promise<void> => {
    try {
      await downloadWeatherCsv();
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível exportar os dados de clima em CSV.";

      toastError(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const clearInsight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      insight: null,
      insightError: null,
      isLoadingInsight: false,
    }));
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        ...state,
        loadWeatherLogs,
        loadWeatherInsight,
        exportWeatherXlsx,
        exportWeatherCsv,
        clearInsight,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): IWeatherProvider => {
  const ctx = useContext(WeatherContext);

  if (!ctx) {
    throw new Error("useWeather deve ser usado dentro de <WeatherProvider>");
  }

  return ctx;
};
