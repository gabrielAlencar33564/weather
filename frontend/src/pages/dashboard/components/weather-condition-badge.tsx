import React from "react";
import { Badge } from "@/components";

type WeatherConditionBadgeProps = {
  condition: string;
};

const getConditionClasses = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case "ensolarado":
      return [
        "bg-[var(--color-condition-sunny-bg)]",
        "text-[var(--color-condition-sunny-fg)]",
        "border",
        "border-[var(--color-condition-sunny-border)]",
      ].join(" ");
    case "chuvoso":
      return [
        "bg-[var(--color-condition-rainy-bg)]",
        "text-[var(--color-condition-rainy-fg)]",
        "border",
        "border-[var(--color-condition-rainy-border)]",
      ].join(" ");
    default:
      return [
        "bg-[var(--color-condition-neutral-bg)]",
        "text-[var(--color-condition-neutral-fg)]",
        "border",
        "border-[var(--color-condition-neutral-border)]",
      ].join(" ");
  }
};

export const WeatherConditionBadge: React.FC<WeatherConditionBadgeProps> = ({
  condition,
}) => {
  return (
    <Badge
      variant="outline"
      className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionClasses(
        condition
      )}`}
    >
      {condition}
    </Badge>
  );
};
