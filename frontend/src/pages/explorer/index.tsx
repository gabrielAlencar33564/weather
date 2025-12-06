import React, { useEffect } from "react";
import { ExplorerHeader, PokemonDetailSection, PokemonListSection } from "./components";
import { usePokemons } from "@/features/pokemon";

const ExplorerPage: React.FC = () => {
  const {
    pokemons,
    meta,
    selected,
    isLoading,
    isSubmitting,
    loadPokemons,
    loadPokemonDetails,
  } = usePokemons();

  useEffect(() => {
    void loadPokemons({ limit: 18 });
  }, [loadPokemons]);

  const handlePageChange = async (page: number) => {
    const limit = meta?.limit ?? 10;
    const offset = (page - 1) * limit;

    await loadPokemons({
      limit,
      offset,
    });
  };

  const handleSelect = (id: string) => {
    void loadPokemonDetails(id);
  };

  return (
    <div className="space-y-6">
      <ExplorerHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PokemonListSection
          meta={meta}
          list={pokemons}
          loading={isLoading}
          selected={selected}
          onSelect={handleSelect}
          onPageChange={handlePageChange}
        />
        <PokemonDetailSection selected={selected} detailLoading={isSubmitting} />
      </div>
    </div>
  );
};

export default ExplorerPage;
