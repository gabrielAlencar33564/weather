import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import type { IPokemonDetailsResponse } from "@/interfaces";

type PokemonDetailSectionProps = {
  selected: IPokemonDetailsResponse | null;
  detailLoading: boolean;
};

export const PokemonDetailSection: React.FC<PokemonDetailSectionProps> = ({
  selected,
  detailLoading,
}) => {
  return (
    <div className="md:col-span-1">
      <Card
        className="sticky top-6 h-full min-h-[300px] border-l-4 border-l-primary"
        data-cy="pokemon-detail-section"
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
          {detailLoading ? (
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              data-cy="pokemon-detail-loader"
            />
          ) : selected ? (
            <div
              className="space-y-4 animate-in fade-in zoom-in duration-300"
              data-cy="pokemon-detail-selected"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-50" />
                <img
                  src={selected.sprite}
                  alt={selected.name}
                  className="w-40 h-40 relative z-10 mx-auto pixelated"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <div>
                <h2
                  className="text-2xl font-bold capitalize text-foreground"
                  data-cy="pokemon-detail-name"
                >
                  {selected.name}
                </h2>
                <p className="text-muted-foreground">
                  #{selected.id.toString().padStart(3, "0")}
                </p>
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {selected.types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-medium capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Altura</p>
                  <p className="font-semibold text-foreground">
                    {selected.height / 10} m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Peso</p>
                  <p className="font-semibold text-foreground">
                    {selected.weight / 10} kg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="text-muted-foreground flex flex-col items-center"
              data-cy="pokemon-detail-empty"
            >
              <Search className="h-12 w-12 mb-2 opacity-20" />
              <p>Selecione um item da lista para ver os detalhes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
