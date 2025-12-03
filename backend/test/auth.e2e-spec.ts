import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { User, UserDocument, UserRole } from '../src/users/user.schema';
import { LoginResponse } from 'src/auth/entities/auth.responses';
import { UserEntity } from 'src/users/entities/user.responses';
import { createUserUtil, getAuthTokenUtil } from './utils/user-test.utils';

interface ITestUserFixture {
  email?: string;
  password?: string;
  role?: UserRole;
}

const AUTH_LOGIN_ROUTE = '/api/auth/login';
const USERS_ROUTE = '/api/users';

const testUsers: Record<string, ITestUserFixture> = {
  validUser: {
    email: 'valid@test.com',
    password: '123456',
    role: UserRole.USER,
  },
  authUser: {
    email: 'auth@test.com',
    password: '123456',
    role: UserRole.USER,
  },
  noAuthUser: {
    email: 'noauth@test.com',
    password: '123456',
    role: UserRole.USER,
  },
  nonExistentUser: {
    email: 'nouser@test.com',
    password: '123456',
  },
  invalidPasswordUser: {
    email: 'valid@test.com',
    password: 'wrongpass',
  },
  invalidFormatEmail: {
    email: 'invalid-email',
  },
  shortPassword: {
    password: '123',
  },
};

describe('Módulo de Autenticação (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(User.name),
    );

    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  const createUser = async (
    email: string,
    role: UserRole = UserRole.USER,
    password = '123456',
  ): Promise<UserDocument> => {
    return createUserUtil(userModel, email, role, password);
  };

  const getAuthToken = async (
    email: string,
    password = '123456',
  ): Promise<string> => {
    return getAuthTokenUtil(app, email, password);
  };

  const loginRequest = (email: string, password: string) => {
    return request(httpServer).post(AUTH_LOGIN_ROUTE).send({ email, password });
  };

  describe('POST /auth/login', () => {
    it('deve autenticar e retornar um token', async () => {
      const { email, password, role } = testUsers.validUser;

      await createUser(email!, role, password);

      const response: { body: LoginResponse } = await loginRequest(
        email!,
        password!,
      ).expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('deve rejeitar login com formato de e-mail inválido', async () => {
      const { password } = testUsers.validUser;
      const { email } = testUsers.invalidFormatEmail;

      await loginRequest(email!, password!).expect(400);
    });

    it('deve rejeitar login com senha curta', async () => {
      const { email } = testUsers.validUser;
      const { password } = testUsers.shortPassword;

      await loginRequest(email!, password!).expect(400);
    });

    it('deve rejeitar login de usuário inexistente', async () => {
      const { email, password } = testUsers.nonExistentUser;

      await loginRequest(email!, password!).expect(401);
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const { email, password: correctPassword, role } = testUsers.validUser;
      const { password: wrongPassword } = testUsers.invalidPasswordUser;

      await createUser(email!, role, correctPassword);

      await loginRequest(email!, wrongPassword!).expect(401);
    });
  });

  describe('Rotas protegidas (comportamento do JwtAuthGuard)', () => {
    it('deve permitir acesso com token válido', async () => {
      const { email, password, role } = testUsers.authUser;

      const user = await createUser(email!, role, password);
      const token = await getAuthToken(email!, password);

      const response: { body: UserEntity } = await request(httpServer)
        .get(`${USERS_ROUTE}/${user._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(email);
    });

    it('deve bloquear acesso sem token', async () => {
      const { email, password, role } = testUsers.noAuthUser;

      await createUser(email!, role, password);

      await request(httpServer).get(USERS_ROUTE).expect(401);
    });

    it('deve bloquear acesso com token inválido', async () => {
      await request(httpServer)
        .get(USERS_ROUTE)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
