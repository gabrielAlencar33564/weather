export interface IPokemonApiResult {
  name: string;
  url: string;
}

export interface IPokemonListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IPokemonApiResult[];
}

export interface IPokemonListItem {
  id: string;
  name: string;
  url: string;
}

export interface IPokemonListMeta {
  total: number;
  offset: number;
  limit: number;
  last_page: number;
  current_page: number;
}

export interface IPokemonListResponse {
  data: IPokemonListItem[];
  meta: IPokemonListMeta;
}

export interface IPokemonDetailsResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  sprite: string;
}

export interface IPokemonFullApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  abilities: {
    ability: {
      name: string;
    };
  }[];
}
