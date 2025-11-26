export interface IPokemonApiResult {
  name: string;
  url: string;
}

export interface IPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: string;
    name: string;
  }[];
}

export interface IPokemonDetailsResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
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
