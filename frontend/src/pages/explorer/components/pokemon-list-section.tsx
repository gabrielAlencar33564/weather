import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type {
  IPokemonListItem,
  IPokemonDetailsResponse,
  IPokemonListMeta,
} from "@/interfaces";
import { buildPages } from "@/lib/utils";

type PokemonListSectionProps = {
  list: IPokemonListItem[];
  loading: boolean;
  meta: IPokemonListMeta | null;
  selected: IPokemonDetailsResponse | null;
  onSelect: (id: string) => void;
  onPageChange?: (page: number) => void;
};

export const PokemonListSection: React.FC<PokemonListSectionProps> = ({
  list,
  meta,
  loading,
  selected,
  onSelect,
  onPageChange,
}) => {
  const hasPagination = meta && meta.last_page > 1 && onPageChange;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const pages = hasPagination ? buildPages(currentPage, lastPage) : [];

  return (
    <div className="md:col-span-2 space-y-4">
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {list.map((poke) => (
                <button
                  key={poke.id}
                  onClick={() => onSelect(poke.id)}
                  className={`p-4 rounded-lg border text-left transition-all hover:shadow-md capitalize font-medium ${
                    selected?.id === Number(poke.id)
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {poke.name}
                </button>
              ))}

              {list.length === 0 && !loading && (
                <div className="col-span-2 sm:col-span-3 text-center text-sm text-muted-foreground py-6">
                  Nenhum Pokemon encontrado
                </div>
              )}
            </div>
          )}

          {hasPagination && (
            <div className="flex items-center justify-center mt-6">
              <Pagination>
                <PaginationContent>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
