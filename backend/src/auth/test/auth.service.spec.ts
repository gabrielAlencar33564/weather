import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { UserMessagesHelper } from 'src/users/helpers';
import { UserDocument } from 'src/users/user.schema';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'test@example.com', password: '123456' }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      service.login({ email: 'test@example.com', password: '123456' }),
    ).rejects.toThrow(UserMessagesHelper.INVALID_CREDENTIALS);
  });

  it('deve lançar UnauthorizedException quando a senha não corresponder', async () => {
    const usuarioNaoAutorizado = {
      _id: '1',
      email: 'test@example.com',
      password: 'hash',
    };

    usersService.findByEmail.mockResolvedValue(
      usuarioNaoAutorizado as unknown as UserDocument,
    );

    const compararSenhaMock = bcrypt.compare as jest.MockedFunction<
      typeof bcrypt.compare
    >;
    compararSenhaMock.mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow(UserMessagesHelper.INVALID_CREDENTIALS);
  });

  it('deve retornar um token quando as credenciais forem válidas', async () => {
    interface UsuarioFake {
      _id: string;
      email: string;
      password: string;
      name: string;
      role: string;
    }

    const usuario: UsuarioFake = {
      _id: '1',
      email: 'test@example.com',
      password: 'hash',
      name: 'Test User',
      role: 'user',
    };

    const token = 'signed-token';

    usersService.findByEmail.mockResolvedValue(
      usuario as unknown as UserDocument,
    );

    const compararSenhaMock = bcrypt.compare as jest.MockedFunction<
      typeof bcrypt.compare
    >;
    compararSenhaMock.mockResolvedValue(true as never);

    const signAsyncSpy = jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValue(token as never);

    const resultado = await service.login({
      email: 'test@example.com',
      password: '123456',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(signAsyncSpy).toHaveBeenCalledWith({
      sub: usuario._id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
    });
    expect(resultado).toEqual({ token });
  });
});
