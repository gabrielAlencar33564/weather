import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PokemonService } from '../pokemon.service';
import {
  IPokemonApiResult,
  IPokemonFullApiResponse,
  IPokemonListApiResponse,
  IPokemonListResponse,
} from '../pokemon.interfaces';
import { PokemonMessagesHelper } from '../helpers/pokemon-messages.helper';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve listar pokémons com paginação em findAll', async () => {
    const limit = 2;
    const offset = 0;

    const apiResults: IPokemonApiResult[] = [
      {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      },
      {
        name: 'ivysaur',
        url: 'https://pokeapi.co/api/v2/pokemon/2/',
      },
    ];

    const apiResponse: AxiosResponse<IPokemonListApiResponse> = {
      data: {
        count: 2,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=2',
        previous: null,
        results: apiResults,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    };

    httpService.get.mockReturnValue(of(apiResponse));

    const resultado: IPokemonListResponse = await service.findAll(
      limit,
      offset,
    );

    expect(resultado.data).toHaveLength(2);
    expect(resultado.data[0]).toEqual({ id: '1', name: 'bulbasaur' });
    expect(resultado.data[1]).toEqual({ id: '2', name: 'ivysaur' });

    expect(resultado.meta.total).toBe(2);
    expect(resultado.meta.offset).toBe(0);
    expect(resultado.meta.limit).toBe(2);
    expect(resultado.meta.last_page).toBe(1);
    expect(resultado.meta.current_page).toBe(1);
  });

  it('deve lançar InternalServerErrorException em findAll quando houver falha na comunicação', async () => {
    httpService.get.mockImplementation(() => {
      throw new Error('Erro de rede');
    });

    await expect(service.findAll()).rejects.toThrow(
      InternalServerErrorException,
    );

    await expect(service.findAll()).rejects.toThrow(
      PokemonMessagesHelper.COMMUNICATION_FAILURE,
    );
  });

  it('deve retornar detalhes de um pokémon em findOne', async () => {
    const apiResponse: AxiosResponse<IPokemonFullApiResponse> = {
      data: {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        types: [{ type: { name: 'electric' } }],
        sprites: {
          front_default: 'https://pokeapi.co/media/sprites/pokemon/25.png',
        },
        abilities: [
          { ability: { name: 'static' } },
          { ability: { name: 'lightning-rod' } },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    };

    httpService.get.mockReturnValue(of(apiResponse));

    const resultado = await service.findOne('25');

    expect(resultado).toEqual({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      abilities: ['static', 'lightning-rod'],
      sprite: 'https://pokeapi.co/media/sprites/pokemon/25.png',
    });
  });

  it('deve lançar InternalServerErrorException em findOne quando o pokémon não for encontrado ou houver erro', async () => {
    httpService.get.mockImplementation(() => {
      throw new Error('Pokémon não encontrado');
    });

    await expect(service.findOne('99999')).rejects.toThrow(
      InternalServerErrorException,
    );

    await expect(service.findOne('99999')).rejects.toThrow(
      PokemonMessagesHelper.POKEMON_NOT_FOUND,
    );
  });
});
