import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { OwnershipGuard } from '../guards/ownership.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User, UserRole } from 'src/users/user.schema';
import { AuthMessagesHelper } from '../helpers/messages.helper';
import { IUserPayload } from '../auth.interface';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

function criarExecutionContext<TRequest>(request: TRequest): ExecutionContext {
  const httpContext = {
    getRequest: () => request,
    getResponse: () => ({}),
    getNext: () => ({}),
  } as HttpArgumentsHost;

  const contextoParcial: Partial<ExecutionContext> = {
    switchToHttp: () => httpContext,
    getHandler: () =>
      function handlerMock() {
        return null;
      },
    getClass: () => class FakeController {} as never,
  };

  return contextoParcial as ExecutionContext;
}

describe('Guards de Autenticação e Autorização', () => {
  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let getAllAndOverrideMock: jest.Mock<UserRole[] | undefined, any[]>;

    beforeEach(() => {
      getAllAndOverrideMock = jest.fn<UserRole[] | undefined, any[]>();

      const reflectorMock = {
        getAllAndOverride: getAllAndOverrideMock,
      } as unknown as Reflector;

      guard = new RolesGuard(reflectorMock);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('deve permitir acesso quando não houver roles exigidas (requiredRoles undefined)', () => {
      getAllAndOverrideMock.mockReturnValue(undefined);

      const usuario: User & { _id: string } = {
        _id: '1',
        name: 'User Teste',
        email: 'user@example.com',
        password: 'hash',
        role: UserRole.USER,
      };

      const request = { user: usuario };
      const context = criarExecutionContext<typeof request>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve permitir acesso quando o usuário possuir uma das roles exigidas', () => {
      getAllAndOverrideMock.mockReturnValue([UserRole.ADMIN]);

      const usuario: User & { _id: string } = {
        _id: '1',
        name: 'Admin Teste',
        email: 'admin@example.com',
        password: 'hash',
        role: UserRole.ADMIN,
      };

      const request = { user: usuario };
      const context = criarExecutionContext<typeof request>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve lançar ForbiddenException com FORBIDDEN_ADMIN quando a role exigida for ADMIN e o usuário não for admin', () => {
      getAllAndOverrideMock.mockReturnValue([UserRole.ADMIN]);

      const usuario: User & { _id: string } = {
        _id: '1',
        name: 'User Teste',
        email: 'user@example.com',
        password: 'hash',
        role: UserRole.USER,
      };

      const request = { user: usuario };
      const context = criarExecutionContext<typeof request>(request);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        AuthMessagesHelper.FORBIDDEN_ADMIN,
      );
    });

    it('deve lançar ForbiddenException com FORBIDDEN_RESOURCE quando o usuário não possuir a role necessária (sem ADMIN nas requiredRoles)', () => {
      getAllAndOverrideMock.mockReturnValue([UserRole.USER]);

      const usuario: User & { _id: string } = {
        _id: '1',
        name: 'Outro User',
        email: 'other@example.com',
        password: 'hash',
        role: UserRole.ADMIN,
      };

      const request = { user: usuario };
      const context = criarExecutionContext<typeof request>(request);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        AuthMessagesHelper.FORBIDDEN_RESOURCE,
      );
    });
  });

  describe('OwnershipGuard', () => {
    let guard: OwnershipGuard;

    interface RequisicaoOwnership {
      user?: IUserPayload;
      params: {
        id: string;
      };
    }

    beforeEach(() => {
      guard = new OwnershipGuard();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('deve retornar false quando não houver usuário na requisição', () => {
      const request: RequisicaoOwnership = {
        user: undefined,
        params: { id: '1' },
      };

      const context = criarExecutionContext<RequisicaoOwnership>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(false);
    });

    it('deve retornar false quando não houver id de destino nos params', () => {
      const usuario: IUserPayload = {
        userId: '1',
        name: 'User Teste',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const request: RequisicaoOwnership = {
        user: usuario,
        params: { id: '' },
      };

      const context = criarExecutionContext<RequisicaoOwnership>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(false);
    });

    it('deve permitir acesso quando o usuário for ADMIN', () => {
      const usuario: IUserPayload = {
        userId: '1',
        name: 'Admin Teste',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const request: RequisicaoOwnership = {
        user: usuario,
        params: { id: 'qualquer-id' },
      };

      const context = criarExecutionContext<RequisicaoOwnership>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve permitir acesso quando o usuário for o dono do recurso (userId igual ao params.id)', () => {
      const usuario: IUserPayload = {
        userId: '123',
        name: 'Owner Teste',
        email: 'owner@example.com',
        role: UserRole.USER,
      };

      const request: RequisicaoOwnership = {
        user: usuario,
        params: { id: '123' },
      };

      const context = criarExecutionContext<RequisicaoOwnership>(request);

      const resultado = guard.canActivate(context);

      expect(resultado).toBe(true);
    });

    it('deve lançar ForbiddenException com FORBIDDEN_RESOURCE quando o usuário não for admin nem dono do recurso', () => {
      const usuario: IUserPayload = {
        userId: '123',
        name: 'User Teste',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const request: RequisicaoOwnership = {
        user: usuario,
        params: { id: '999' },
      };

      const context = criarExecutionContext<RequisicaoOwnership>(request);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        AuthMessagesHelper.FORBIDDEN_RESOURCE,
      );
    });
  });

  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
      guard = new JwtAuthGuard();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('deve retornar o usuário quando não houver erro e o usuário for válido', () => {
      const payload: IUserPayload = {
        userId: '1',
        name: 'User Teste',
        email: 'user@example.com',
        role: UserRole.USER,
      };

      const resultado = guard.handleRequest<IUserPayload>(null, payload);

      expect(resultado).toBe(payload);
    });

    it('deve lançar UnauthorizedException com UNAUTHORIZED_TOKEN quando não houver usuário e não houver erro', () => {
      expect(() =>
        guard.handleRequest<IUserPayload | false>(null, false),
      ).toThrow(UnauthorizedException);

      expect(() =>
        guard.handleRequest<IUserPayload | false>(null, false),
      ).toThrow(AuthMessagesHelper.UNAUTHORIZED_TOKEN);
    });

    it('deve relançar o erro original quando err não for nulo', () => {
      const erroOriginal = new Error('Erro original');

      expect(() =>
        guard.handleRequest<IUserPayload | false>(erroOriginal, false),
      ).toThrow(erroOriginal);
    });
  });
});
