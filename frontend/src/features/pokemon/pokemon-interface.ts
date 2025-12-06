"use client";

import type { ReactNode } from "react";
import type {
  IPokemonListItem,
  IPokemonListMeta,
  IPokemonDetailsResponse,
} from "@/interfaces";

export interface IPokemonsState {
  pokemons: IPokemonListItem[];
  meta: IPokemonListMeta | null;
  selected: IPokemonDetailsResponse | null;
  error: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isInitialized: boolean;
}

export interface IPokemonsLoadParams {
  limit?: number;
  offset?: number;
}

export interface IPokemonsProvider extends IPokemonsState {
  loadPokemons: (params?: IPokemonsLoadParams) => Promise<void>;
  loadPokemonDetails: (id: string) => Promise<IPokemonDetailsResponse>;
  clearSelected: () => void;
}

export interface IContextProvider {
  children: ReactNode;
}
