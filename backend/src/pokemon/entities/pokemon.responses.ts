import { ApiProperty } from '@nestjs/swagger';

export class PokemonSimpleEntity {
  @ApiProperty({ example: '1', description: 'ID extraído da URL' })
  id: string;

  @ApiProperty({ example: 'bulbasaur' })
  name: string;
}

export class PokemonDetailsEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'bulbasaur' })
  name: string;

  @ApiProperty({ example: 7, description: 'Altura em decímetros' })
  height: number;

  @ApiProperty({ example: ['grass', 'poison'], type: [String] })
  types: string[];

  @ApiProperty({ example: 69, description: 'Peso em hectogramas' })
  weight: number;

  @ApiProperty({ example: ['overgrow', 'chlorophyll'], type: [String] })
  abilities: string[];

  @ApiProperty({ example: 'https://raw.githubusercontent.com/.../1.png' })
  sprite: string;
}

class PokemonMetaData {
  @ApiProperty({ example: 1302 })
  total: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 66 })
  last_page: number;

  @ApiProperty({ example: 1 })
  current_page: number;
}

export class PokemonPaginationResponse {
  @ApiProperty({ type: [PokemonSimpleEntity] })
  data: PokemonSimpleEntity[];

  @ApiProperty({ type: PokemonMetaData })
  meta: PokemonMetaData;
}
