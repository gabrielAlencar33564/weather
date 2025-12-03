import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserMessagesHelper } from '../helpers';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user.schema';
import { CreateUserDto } from '../dto/create-user.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

type UserModelConstructorMockType = jest.Mock<
  UserDocument,
  [Partial<UserDocument>]
>;

type FunctionsType =
  | 'findOne'
  | 'create'
  | 'find'
  | 'countDocuments'
  | 'findById'
  | 'findByIdAndUpdate'
  | 'findByIdAndDelete';

type UserModelMockType = UserModelConstructorMockType &
  Record<FunctionsType, jest.Mock>;

describe('UsersService', () => {
  let service: UsersService;
  let userModel: UserModelMockType;

  beforeEach(async () => {
    const mockUserModel = jest.fn<
      UserDocument,
      [Partial<UserDocument>]
    >() as UserModelMockType;

    mockUserModel.findOne = jest.fn();
    mockUserModel.create = jest.fn();
    mockUserModel.find = jest.fn();
    mockUserModel.countDocuments = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.findByIdAndUpdate = jest.fn();
    mockUserModel.findByIdAndDelete = jest.fn();

    userModel = mockUserModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar admin padrão na inicialização do módulo se o admin não existir', async () => {
    process.env.DEFAULT_ADMIN_EMAIL = 'admin@example.com';
    process.env.DEFAULT_ADMIN_PASS = '123456';

    userModel.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
    userModel.create.mockResolvedValue({});

    await service.onModuleInit();

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(userModel.create).toHaveBeenCalledWith({
      name: 'Admin GDASH',
      email: 'admin@example.com',
      password: 'hashed-pass',
      role: 'admin',
    });
  });

  it('não deve criar admin padrão se ele já existir', async () => {
    process.env.DEFAULT_ADMIN_EMAIL = 'admin@example.com';
    process.env.DEFAULT_ADMIN_PASS = '123456';

    userModel.findOne.mockResolvedValue({ _id: '1' });

    await service.onModuleInit();

    expect(userModel.create).not.toHaveBeenCalled();
  });

  it('deve criar um usuário quando o email não existir', async () => {
    userModel.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');

    const savedUser = {
      _id: '1',
      name: 'Test',
      email: 'test@example.com',
      password: 'hashed-pass',
    };

    const saveMock = jest.fn().mockResolvedValue(savedUser);

    userModel.mockImplementation(
      (data: Partial<UserDocument>): UserDocument => {
        return {
          ...data,
          save: saveMock,
        } as UserDocument;
      },
    );

    const result = await service.create({
      name: 'Test',
      email: 'test@example.com',
      password: '123456',
    });

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual(savedUser);
  });

  it('deve lançar ConflictException ao criar um usuário com email existente', async () => {
    userModel.findOne.mockResolvedValue({ _id: '1' });

    const dto: CreateUserDto = {
      name: 'Test',
      email: 'test@example.com',
      password: '123456',
    };

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    await expect(service.create(dto)).rejects.toThrow(
      UserMessagesHelper.EMAIL_EXIST,
    );
  });

  it('deve retornar usuários paginados em findAll', async () => {
    const users = [
      { _id: '1', email: 'a@test.com' },
      { _id: '2', email: 'b@test.com' },
    ];

    const execMock = jest.fn().mockResolvedValue(users);
    const limitMock = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        exec: execMock,
      }),
    });

    userModel.find.mockReturnValue({
      limit: limitMock,
    } as any);

    userModel.countDocuments.mockResolvedValue(users.length);

    const result = await service.findAll(2, 0);

    expect(userModel.find).toHaveBeenCalled();
    expect(limitMock).toHaveBeenCalledWith(2);
    expect(userModel.countDocuments).toHaveBeenCalled();
    expect(result).toEqual({
      data: users,
      meta: {
        total: 2,
        offset: 0,
        limit: 2,
        last_page: 1,
        current_page: 1,
      },
    });
  });

  it('deve retornar um usuário em findOne', async () => {
    const user = { _id: '1', email: 'test@example.com' };
    const execMock = jest.fn().mockResolvedValue(user);

    userModel.findById.mockReturnValue({
      exec: execMock,
    });

    const result = await service.findOne('1');

    expect(userModel.findById).toHaveBeenCalledWith('1');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it('deve lançar NotFoundException em findOne quando o usuário não existir', async () => {
    const execMock = jest.fn().mockResolvedValue(null);

    userModel.findById.mockReturnValue({
      exec: execMock,
    });

    await expect(service.findOne('1')).rejects.toThrow(
      new NotFoundException(UserMessagesHelper.USER_NOT_FOUND),
    );
  });

  it('deve encontrar usuário por email com senha selecionada', async () => {
    const user = { _id: '1', email: 'test@example.com', password: 'hash' };
    const execMock = jest.fn().mockResolvedValue(user);
    const selectMock = jest.fn().mockReturnValue({
      exec: execMock,
    });

    userModel.findOne.mockReturnValue({
      select: selectMock,
    });

    const result = await service.findByEmail('test@example.com');

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(selectMock).toHaveBeenCalledWith('+password');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it('deve atualizar o usuário e fazer hash da senha quando fornecida', async () => {
    const existingWithSameEmail = null;
    userModel.findOne.mockResolvedValue(existingWithSameEmail);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

    const updatedUser = {
      _id: '1',
      email: 'new@example.com',
      password: 'new-hash',
    };
    const execMock = jest.fn().mockResolvedValue(updatedUser);

    userModel.findByIdAndUpdate.mockReturnValue({
      exec: execMock,
    });

    const result = await service.update('1', {
      email: 'new@example.com',
      password: '123456',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      {
        email: 'new@example.com',
        password: 'new-hash',
      },
      { new: true },
    );
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(updatedUser);
  });

  it('deve lançar ConflictException ao atualizar para um email que já existe em outro usuário', async () => {
    const existing = { _id: '2', email: 'new@example.com' };
    userModel.findOne.mockResolvedValue(existing);

    await expect(
      service.update('1', {
        email: 'new@example.com',
      }),
    ).rejects.toThrow(new ConflictException(UserMessagesHelper.EMAIL_EXIST));
  });

  it('deve lançar NotFoundException ao atualizar um usuário inexistente', async () => {
    userModel.findOne.mockResolvedValue(null);
    const execMock = jest.fn().mockResolvedValue(null);

    userModel.findByIdAndUpdate.mockReturnValue({
      exec: execMock,
    });

    await expect(
      service.update('1', {
        name: 'Test',
      }),
    ).rejects.toThrow(new NotFoundException(UserMessagesHelper.USER_NOT_FOUND));
  });

  it('deve remover o usuário com sucesso em remove', async () => {
    const execMock = jest.fn().mockResolvedValue({ _id: '1' });

    userModel.findByIdAndDelete.mockReturnValue({
      exec: execMock,
    });

    await service.remove('1');

    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(execMock).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException em remove quando o usuário não existir', async () => {
    const execMock = jest.fn().mockResolvedValue(null);

    userModel.findByIdAndDelete.mockReturnValue({
      exec: execMock,
    });

    await expect(service.remove('1')).rejects.toThrow(
      new NotFoundException(UserMessagesHelper.USER_NOT_FOUND),
    );
  });
});
