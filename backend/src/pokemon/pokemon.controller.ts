import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { ApiPokemonFindAll, ApiPokemonFindOne } from './pokemon.swagger';

@ApiTags('Pokemon')
@Controller('explore/pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @ApiPokemonFindAll()
  @Get()
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.pokemonService.findAll(limit, offset);
  }

  @ApiPokemonFindOne()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(id);
  }
}
