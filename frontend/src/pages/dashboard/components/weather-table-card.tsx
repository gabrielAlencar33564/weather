import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components";
import { WeatherConditionBadge } from "./weather-condition-badge";
import type { IWeatherPaginationMeta } from "@/interfaces";
import { buildPages } from "@/lib/utils";
import type { WeatherData } from "@/features/weather";

type WeatherTableCardProps = {
  data: WeatherData[];
  meta: IWeatherPaginationMeta | null;
  onPageChange?: (page: number) => void;
};

export const WeatherTableCard: React.FC<WeatherTableCardProps> = ({
  data,
  meta,
  onPageChange,
}) => {
  const hasPagination = meta && meta.last_page > 1 && onPageChange;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const pages = hasPagination ? buildPages(currentPage, lastPage) : [];

  return (
    <Card data-cy="weather-table-card">
      <CardHeader>
        <CardTitle>Registros Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table data-cy="weather-table">
          <TableHeader>
            <TableRow>
              <TableHead>Horário</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Umidade</TableHead>
              <TableHead>Vento</TableHead>
              <TableHead>Condição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={`${row.timestamp}-${i}`} data-cy="weather-table-row">
                <TableCell className="font-medium">{row.timestamp}</TableCell>
                <TableCell>{row.temperature}°C</TableCell>
                <TableCell>{row.humidity}%</TableCell>
                <TableCell>{row.windSpeed} km/h</TableCell>
                <TableCell>
                  <WeatherConditionBadge condition={row.condition} />
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {hasPagination && (
          <div
            className="flex flex-col items-center justify-center border-t border-border px-4 py-3 gap-2"
            data-cy="weather-table-pagination-wrapper"
          >
            <div className="w-full max-w-full overflow-x-auto">
              <div className="flex justify-center">
                <Pagination data-cy="weather-table-pagination">
                  <PaginationContent className="flex flex-nowrap gap-1 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={currentPage === 1}
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1 && onPageChange) {
                            onPageChange(currentPage - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    {pages.map((page, index) => {
                      if (page === "ellipsis-left" || page === "ellipsis-right") {
                        return (
                          <PaginationItem key={`${page}-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      const pageNumber = page as number;

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === currentPage}
                            onClick={(event) => {
                              event.preventDefault();
                              if (pageNumber !== currentPage && onPageChange) {
                                onPageChange(pageNumber);
                              }
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={currentPage === lastPage}
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage < lastPage && onPageChange) {
                            onPageChange(currentPage + 1);
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
