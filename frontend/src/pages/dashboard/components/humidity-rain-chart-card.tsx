import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { WeatherData } from "@/features/weather";

const humidityChartConfig = {
  humidity: {
    label: "Umidade",
    color: "var(--chart-2)",
  },
  precipitationProb: {
    label: "Prob. Chuva",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

type HumidityRainChartCardProps = {
  data: WeatherData[];
};

export const HumidityRainChartCard: React.FC<HumidityRainChartCardProps> = ({ data }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Umidade e Chuva</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={humidityChartConfig} className="h-[250px] w-full">
          <LineChart data={data}>
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
              yAxisId="left"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              unit="%"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              unit="%"
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="var(--color-humidity)"
              strokeWidth={2}
              dot={false}
              name="Umidade"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="precipitationProb"
              stroke="var(--color-precipitationProb)"
              strokeWidth={2}
              dot={false}
              name="Chuva (%)"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
