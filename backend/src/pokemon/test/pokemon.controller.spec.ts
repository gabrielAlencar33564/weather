import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from '../pokemon.controller';
import { PokemonService } from '../pokemon.service';

describe('PokemonController', () => {
  let controller: PokemonController;
  let pokemonService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    pokemonService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar PokemonService.findAll com limit e offset ao listar pokémons', async () => {
    const respostaService = {
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
        next_link: null,
        previous_link: null,
      },
    };

    pokemonService.findAll.mockResolvedValue(respostaService);

    const resultado = await controller.findAll(2, 0);

    expect(pokemonService.findAll).toHaveBeenCalledWith(2, 0);
    expect(resultado).toEqual(respostaService);
  });

  it('deve chamar PokemonService.findOne com id ao buscar um pokémon específico', async () => {
    const respostaService = {
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      abilities: ['static', 'lightning-rod'],
      sprite: 'https://pokeapi.co/media/sprites/pokemon/25.png',
    };

    pokemonService.findOne.mockResolvedValue(respostaService);

    const resultado = await controller.findOne('25');

    expect(pokemonService.findOne).toHaveBeenCalledWith('25');
    expect(resultado).toEqual(respostaService);
  });
});
