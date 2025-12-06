import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildPages(
  current: number,
  last: number
): Array<number | "ellipsis-left" | "ellipsis-right"> {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [];
  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis-left");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < last - 2) {
    pages.push("ellipsis-right");
  }

  pages.push(last);

  return pages;
}
