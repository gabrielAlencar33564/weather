import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PokemonService } from '../src/pokemon/pokemon.service';
import { InternalServerErrorException } from '@nestjs/common';
import { PokemonMessagesHelper } from '../src/pokemon/helpers/pokemon-messages.helper';
import { App } from 'supertest/types';
import {
  PokemonDetailsEntity,
  PokemonPaginationResponse,
} from 'src/pokemon/entities/pokemon.responses';

describe('Módulo de Pokemon (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let pokemonServiceMock: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeAll(async () => {
    pokemonServiceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PokemonService)
      .useValue(pokemonServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
    httpServer = app.getHttpServer() as App;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /explore/pokemons', () => {
    it('deve chamar o serviço com limit e offset numéricos e retornar a lista de pokemons', async () => {
      const stub: PokemonPaginationResponse = {
        data: [
          { id: '1', name: 'bulbasaur' },
          { id: '2', name: 'ivysaur' },
        ],
        meta: {
          total: 2,
          offset: 0,
          limit: 2,
          last_page: 1,
          current_page: 1,
        },
      };

      pokemonServiceMock.findAll.mockResolvedValueOnce(stub);

      const response = await request(httpServer)
        .get('/api/explore/pokemons')
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(pokemonServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(pokemonServiceMock.findAll).toHaveBeenCalledWith(2, 0);

      const body = response.body as PokemonPaginationResponse;

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);
      expect(body.data[0]).toEqual({ id: '1', name: 'bulbasaur' });
      expect(body.meta.total).toBe(2);
      expect(body.meta.limit).toBe(2);
      expect(body.meta.offset).toBe(0);
      expect(body.meta.current_page).toBe(1);
    });
  });

  describe('GET /explore/pokemons/:id', () => {
    it('deve chamar o serviço com o id correto e retornar os detalhes do pokemon', async () => {
      const stub: PokemonDetailsEntity = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        types: ['grass', 'poison'],
        abilities: ['overgrow', 'chlorophyll'],
        sprite: 'https://example.com/bulbasaur.png',
      };

      pokemonServiceMock.findOne.mockResolvedValueOnce(stub);

      const response = await request(httpServer)
        .get('/api/explore/pokemons/1')
        .expect(200);

      expect(pokemonServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(pokemonServiceMock.findOne).toHaveBeenCalledWith('1');

      const body = response.body as PokemonDetailsEntity;

      expect(body.id).toBe(1);
      expect(body.name).toBe('bulbasaur');
      expect(body.height).toBe(7);
      expect(body.weight).toBe(69);
      expect(body.abilities).toEqual(['overgrow', 'chlorophyll']);
      expect(body.sprite).toBe('https://example.com/bulbasaur.png');
    });

    it('deve propagar erro InternalServerErrorException com mensagem de pokemon não encontrado', async () => {
      pokemonServiceMock.findOne.mockRejectedValueOnce(
        new InternalServerErrorException(
          PokemonMessagesHelper.POKEMON_NOT_FOUND,
        ),
      );

      const response = await request(httpServer)
        .get('/api/explore/pokemons/9999')
        .expect(500);

      expect(pokemonServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(pokemonServiceMock.findOne).toHaveBeenCalledWith('9999');

      const body = response.body as { message: string | string[] };

      const messageText = Array.isArray(body.message)
        ? JSON.stringify(body.message)
        : String(body.message);

      expect(messageText).toContain(PokemonMessagesHelper.POKEMON_NOT_FOUND);
    });
  });
});
