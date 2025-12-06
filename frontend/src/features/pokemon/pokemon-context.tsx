"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { IPokemonDetailsResponse } from "@/interfaces";
import {
  getPokemons as getPokemonsApi,
  getPokemonDetails as getPokemonDetailsApi,
} from "./pokemon-service";
import type {
  IContextProvider,
  IPokemonsProvider,
  IPokemonsState,
  IPokemonsLoadParams,
} from "./pokemon-interface";
import { toastError } from "@/lib/toast";

const PokemonsContext = createContext<IPokemonsProvider | undefined>(undefined);

export const PokemonsProvider: React.FC<IContextProvider> = ({ children }) => {
  const [state, setState] = useState<IPokemonsState>({
    pokemons: [],
    meta: null,
    selected: null,
    error: null,
    isLoading: false,
    isSubmitting: false,
    isInitialized: false,
  });

  const loadPokemons = useCallback(async (params?: IPokemonsLoadParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getPokemonsApi(params);

      setState((prev) => ({
        ...prev,
        pokemons: response.data,
        meta: response.meta,
      }));
    } catch (e) {
      const error = e as Error & { response?: { data?: { message?: string } } };
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível carregar os Pokemons.";

      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
    }
  }, []);

  const loadPokemonDetails = useCallback(
    async (id: string): Promise<IPokemonDetailsResponse> => {
      try {
        const pokemon = await getPokemonDetailsApi(id);

        setState((prev) => ({
          ...prev,
          selected: pokemon,
        }));

        return pokemon;
      } catch (e) {
        const error = e as Error & { response?: { data?: { message?: string } } };
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os detalhes do Pokemon.";

        toastError(message);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    []
  );

  const clearSelected = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selected: null,
    }));
  }, []);

  return (
    <PokemonsContext.Provider
      value={{
        ...state,
        loadPokemons,
        loadPokemonDetails,
        clearSelected,
      }}
    >
      {children}
    </PokemonsContext.Provider>
  );
};

export const usePokemons = (): IPokemonsProvider => {
  const ctx = useContext(PokemonsContext);

  if (!ctx) {
    throw new Error("usePokemons deve ser usado dentro de <PokemonsProvider>");
  }

  return ctx;
};
