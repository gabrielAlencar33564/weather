import React, { useEffect, useMemo } from "react";
import {
  DashboardHeader,
  AiInsightCard,
  HumidityRainChartCard,
  TemperatureChartCard,
  WeatherKpiCards,
  WeatherTableCard,
} from "./components";
import { useWeather } from "@/features/weather";
import type { WeatherData } from "@/features/weather";

const mapConditionCode = (code: number): string => {
  if (code < 300) return "Tempestade";
  if (code < 600) return "Chuvoso";
  if (code < 700) return "Neve";
  if (code === 800) return "Ensolarado";
  if (code > 800) return "Nublado";
  return "Indefinido";
};

const DashboardPage: React.FC = () => {
  const {
    logs,
    meta,
    insight,
    insightError,
    isLoadingInsight,
    loadWeatherLogs,
    loadWeatherInsight,
    exportWeatherCsv,
    exportWeatherXlsx,
  } = useWeather();

  useEffect(() => {
    void loadWeatherLogs({
      limit: 10,
      offset: 0,
    });
    void loadWeatherInsight();
  }, [loadWeatherLogs, loadWeatherInsight]);

  const data: WeatherData[] = useMemo(
    () =>
      logs.map((log) => ({
        timestamp: new Date(log.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.wind_speed,
        condition: mapConditionCode(log.condition_code),
        precipitationProb: log.rain_probability,
      })),
    [logs]
  );
  const current: WeatherData | null = data.length > 0 ? data[data.length - 1] : null;

  const insightText =
    insight?.analysis?.insight ??
    "Analisando dados atmosféricos com IA com base nas últimas medições...";

  const handleExport = async (format: "csv" | "xlsx") => {
    if (format === "csv") {
      await exportWeatherCsv();
    } else {
      await exportWeatherXlsx();
    }
  };

  const handlePageChange = async (page: number) => {
    const limit = meta?.limit ?? 10;
    const offset = (page - 1) * limit;

    await loadWeatherLogs({ limit, offset });
  };

  return (
    <div className="space-y-6">
      <DashboardHeader onExport={handleExport} />
      <WeatherKpiCards current={current} />
      <AiInsightCard
        insight={insightText}
        isLoading={isLoadingInsight}
        error={insightError}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TemperatureChartCard data={data} />
        <HumidityRainChartCard data={data} />
      </div>
      <WeatherTableCard data={data} meta={meta} onPageChange={handlePageChange} />
    </div>
  );
};

export default DashboardPage;
