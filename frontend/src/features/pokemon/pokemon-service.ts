"use client";

import type { IPokemonListResponse, IPokemonDetailsResponse } from "@/interfaces";
import { api } from "@/lib/api-client";
import type { IPokemonsLoadParams } from "./pokemon-interface";

export const getPokemons = async (
  params?: IPokemonsLoadParams
): Promise<IPokemonListResponse> => {
  const response = await api.get<IPokemonListResponse>("/explore/pokemons", {
    params,
  });

  return response.data;
};

export const getPokemonDetails = async (id: string): Promise<IPokemonDetailsResponse> => {
  const response = await api.get<IPokemonDetailsResponse>(`/explore/pokemons/${id}`);

  return response.data;
};
