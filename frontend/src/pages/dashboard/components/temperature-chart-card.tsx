import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { WeatherData } from "@/features/weather";

const temperatureChartConfig = {
  temperature: {
    label: "Temperatura",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type TemperatureChartCardProps = {
  data: WeatherData[];
};

export const TemperatureChartCard: React.FC<TemperatureChartCardProps> = ({ data }) => {
  return (
    <Card className="col-span-1" data-cy="temperature-chart-card">
      <CardHeader>
        <CardTitle>Variação de Temperatura (Hoje)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          config={temperatureChartConfig}
          className="h-[250px] w-full"
          data-cy="temperature-chart-container"
        >
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              unit="°C"
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="var(--color-temperature)"
              fill="var(--color-temperature)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
