"use client";

import { api } from "@/lib/api-client";
import type { IWeatherLoadParams } from "./weather-interface";
import type { IWeatherInsightResponse, IWeatherPaginationResponse } from "@/interfaces";

export const getWeatherLogs = async (
  params?: IWeatherLoadParams
): Promise<IWeatherPaginationResponse> => {
  const response = await api.get<IWeatherPaginationResponse>("/weather/logs", {
    params,
  });

  return response.data;
};

export const getWeatherInsight = async (): Promise<IWeatherInsightResponse> => {
  const response = await api.get<IWeatherInsightResponse>("/weather/insights");
  return response.data;
};

export const downloadWeatherXlsx = async (): Promise<void> => {
  const response = await api.get<Blob>("/weather/export.xlsx", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "weather_data.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadWeatherCsv = async (): Promise<void> => {
  const response = await api.get<Blob>("/weather/export.csv", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "weather_data.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
