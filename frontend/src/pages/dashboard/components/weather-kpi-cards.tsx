import React from "react";
import { CloudRain, Droplets, Sun, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherData } from "@/features/weather";

type WeatherKpiCardsProps = {
  current?: WeatherData | null;
  isLoading?: boolean;
};

export const WeatherKpiCards: React.FC<WeatherKpiCardsProps> = ({
  current,
  isLoading,
}) => {
  const showSkeleton = !!isLoading;

  const safeCurrent: WeatherData = current ?? {
    timestamp: "",
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    condition: "Indisponivel",
    precipitationProb: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-cy="weather-kpi-cards">
      <Card className="border-l-4 border-l-yellow-500" data-cy="kpi-temperatura">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {showSkeleton ? <Skeleton className="h-4 w-24" /> : "Temperatura"}
          </CardTitle>
          <Sun className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <>
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-3 w-40" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold" data-cy="kpi-temperatura-valor">
                {safeCurrent.temperature}°C
              </div>
              <p className="text-xs text-muted-foreground">
                Sensacao termica de {safeCurrent.temperature + 2}°C
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500" data-cy="kpi-umidade">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {showSkeleton ? <Skeleton className="h-4 w-20" /> : "Umidade"}
          </CardTitle>
          <Droplets className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <>
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold" data-cy="kpi-umidade-valor">
                {safeCurrent.humidity}%
              </div>
              <p className="text-xs text-muted-foreground">Zona de conforto: Ideal</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-gray-500" data-cy="kpi-vento">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {showSkeleton ? <Skeleton className="h-4 w-16" /> : "Vento"}
          </CardTitle>
          <Wind className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <>
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold" data-cy="kpi-vento-valor">
                {safeCurrent.windSpeed} km/h
              </div>
              <p className="text-xs text-muted-foreground">Direcao: Sudeste</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500" data-cy="kpi-prob-chuva">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {showSkeleton ? <Skeleton className="h-4 w-28" /> : "Prob. Chuva"}
          </CardTitle>
          <CloudRain className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <>
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-36" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold" data-cy="kpi-prob-chuva-valor">
                {safeCurrent.precipitationProb}%
              </div>
              <p className="text-xs text-muted-foreground">{safeCurrent.condition}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
