import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar UsersService.create e retornar o usuário criado', async () => {
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'test@example.com',
      password: '123456',
    };

    const createdUser = { _id: '1', ...dto };

    usersService.create.mockResolvedValue(createdUser);

    const result = await controller.create(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(createdUser);
  });

  it('deve chamar UsersService.findAll com limit e offset', async () => {
    const response = {
      data: [],
      meta: {
        total: 0,
        offset: 0,
        limit: 10,
        last_page: 1,
        current_page: 1,
      },
    };

    usersService.findAll.mockResolvedValue(response);

    const result = await controller.findAll(10, 0);

    expect(usersService.findAll).toHaveBeenCalledWith(10, 0);
    expect(result).toEqual(response);
  });

  it('deve chamar UsersService.findOne com o id', async () => {
    const user = { _id: '1', email: 'test@example.com' };

    usersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne('1');

    expect(usersService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('deve chamar UsersService.update com id e dto', async () => {
    const dto: Partial<CreateUserDto> = {
      name: 'Updated',
    };
    const updatedUser = {
      _id: '1',
      email: 'test@example.com',
      name: 'Updated',
    };

    usersService.update.mockResolvedValue(updatedUser);

    const result = await controller.update('1', dto);

    expect(usersService.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual(updatedUser);
  });

  it('deve chamar UsersService.remove com o id', async () => {
    usersService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('1');

    expect(usersService.remove).toHaveBeenCalledWith('1');
    expect(result).toBeUndefined();
  });
});
