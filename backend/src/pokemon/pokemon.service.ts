import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  IPokemonListResponse,
  IPokemonApiResult,
  IPokemonDetailsResponse,
  IPokemonFullApiResponse,
  IPokemonListItem,
  IPokemonListApiResponse,
} from './pokemon.interfaces';
import { PokemonMessagesHelper } from './helpers/pokemon-messages.helper';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async findAll(
    limit: number = 20,
    offset: number = 0,
  ): Promise<IPokemonListResponse> {
    try {
      const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;

      const response: AxiosResponse<IPokemonListApiResponse> =
        await firstValueFrom(this.httpService.get(url));

      const results: IPokemonListItem[] = response.data.results.map(
        (pokemon: IPokemonApiResult) => {
          const urlParts = pokemon.url.split('/');
          const id = urlParts[urlParts.length - 2];
          return {
            id,
            name: pokemon.name,
          };
        },
      );

      const total = response.data.count;
      const currentPage = Math.floor(offset / limit) + 1;

      return {
        data: results,
        meta: {
          total,
          offset,
          limit,
          last_page: Math.ceil(total / limit),
          current_page: currentPage,
        },
      };
    } catch {
      throw new InternalServerErrorException(
        PokemonMessagesHelper.COMMUNICATION_FAILURE,
      );
    }
  }

  async findOne(id: string): Promise<IPokemonDetailsResponse> {
    try {
      const url = `${this.baseUrl}/pokemon/${id}`;

      const response: AxiosResponse<IPokemonFullApiResponse> =
        await firstValueFrom(this.httpService.get(url));

      return {
        id: response.data.id,
        name: response.data.name,
        height: response.data.height,
        weight: response.data.weight,
        types: response.data.types.map((t) => t.type.name),
        abilities: response.data.abilities.map((a) => a.ability.name),
        sprite: response.data.sprites.front_default,
      };
    } catch {
      throw new InternalServerErrorException(
        PokemonMessagesHelper.POKEMON_NOT_FOUND,
      );
    }
  }
}
