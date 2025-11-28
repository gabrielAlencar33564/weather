import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import {
  PokemonPaginationResponse,
  PokemonDetailsEntity,
} from './entities/pokemon.responses';
import { PokemonMessagesHelper } from './helpers/pokemon-messages.helper';
import {
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from 'common/swagger/error-response.decorator';

export function ApiPokemonFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Lista pokémons com paginação (Fonte: PokeAPI)' }),
    ApiResponse({ status: HttpStatus.OK, type: PokemonPaginationResponse }),

    ApiInternalServerErrorResponse(PokemonMessagesHelper.COMMUNICATION_FAILURE),

    ApiQuery({ name: 'limit', required: false, example: 20 }),
    ApiQuery({ name: 'offset', required: false, example: 0 }),
  );
}

export function ApiPokemonFindOne() {
  return applyDecorators(
    ApiOperation({ summary: 'Busca detalhes de um Pokémon por ID ou Nome' }),
    ApiResponse({ status: HttpStatus.OK, type: PokemonDetailsEntity }),

    ApiNotFoundResponse(PokemonMessagesHelper.POKEMON_NOT_FOUND),
    ApiInternalServerErrorResponse(PokemonMessagesHelper.COMMUNICATION_FAILURE),

    ApiParam({
      name: 'id',
      description: 'ID ou Nome do Pokémon',
      example: '1',
    }),
  );
}
