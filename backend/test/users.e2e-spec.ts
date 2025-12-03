import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { User, UserDocument, UserRole } from './../src/users/user.schema';
import { UserMessagesHelper } from './../src/users/helpers/messages.helper';
import { AuthMessagesHelper } from 'src/auth/helpers/messages.helper';
import { createUserUtil, getAuthTokenUtil } from './utils/user-test.utils';
import { App } from 'supertest/types';
import { UserEntity } from 'src/users/entities/user.responses';

interface IErrorResponse {
  message: string | string[];
}

interface ITestUser {
  email: string;
  password: string;
}

type TestDataType = { [key: string]: ITestUser };

const USERS_ROUTE = '/api/users';

const testData: TestDataType = {
  adminUser: {
    email: process.env.DEFAULT_ADMIN_EMAIL || '',
    password: process.env.DEFAULT_ADMIN_PASS || '',
  },
  duplicateUser: {
    email: 'duplicado@test.com',
    password: '123456',
  },
  listUser: {
    email: 'user@test.com',
    password: '123456',
  },
  viewMeUser: {
    email: 'me@test.com',
    password: '123456',
  },
  viewOtherUser: {
    email: 'a@test.com',
    password: '123456',
  },
  targetUser: {
    email: 'b@test.com',
    password: '123456',
  },
  updateUser: {
    email: 'update@test.com',
    password: '123456',
  },
  updateFailU1: {
    email: 'u1@test.com',
    password: '123456',
  },
  updateFailU2: {
    email: 'u2@test.com',
    password: '123456',
  },
  deleteUser: {
    email: 'delete@test.com',
    password: '123456',
  },
};

describe('Módulo de Usuários (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let userModel: Model<UserDocument>;
  let adminToken: string;

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

    adminToken = await getAuthToken(
      testData.adminUser.email,
      testData.adminUser.password,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const createUser = async (
    email: string,
    password = '123456',
    role: UserRole = UserRole.USER,
  ): Promise<UserDocument> => {
    return createUserUtil(userModel, email, role, password);
  };

  const getAuthToken = async (
    email: string,
    password = '123456',
  ): Promise<string> => {
    return getAuthTokenUtil(app, email, password);
  };

  const postUser = (payload: ITestUser & { name: string }) => {
    return request(httpServer).post(USERS_ROUTE).send(payload);
  };

  const extractMessageText = (res: IErrorResponse): string => {
    return Array.isArray(res.message)
      ? JSON.stringify(res.message)
      : String(res.message);
  };

  describe('POST /users', () => {
    it('deve criar um novo usuário com sucesso', async () => {
      const payload = {
        name: 'Teste',
        email: 'test@test.com',
        password: 'password123',
      };

      const response = await postUser(payload).expect(201);

      const data = response.body as UserEntity;
      expect(data).toHaveProperty('_id');
      expect(data.email).toBe(payload.email);
      expect(data).not.toHaveProperty('password');
    });

    it('deve ignorar tentativa de injetar role via DTO whitelist', async () => {
      const payload = {
        name: 'Hacker',
        email: 'hacker@test.com',
        password: '123456',
        role: 'admin',
      };

      const response = await postUser(payload).expect(201);

      const body = response.body as UserEntity;
      const userInDb = await userModel.findById(body._id).lean();
      expect(userInDb?.role).toBe(UserRole.USER);
    });

    it('deve rejeitar email inválido', async () => {
      const response = await postUser({
        name: 'Teste',
        email: 'email-invalido',
        password: '123456',
      }).expect(400);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(UserMessagesHelper.EMAIL_INVALID);
    });

    it('deve rejeitar senha curta', async () => {
      const response = await postUser({
        name: 'Teste',
        email: 'test@mail.com',
        password: '123',
      }).expect(400);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(UserMessagesHelper.PASSWORD_MIN_LENGTH);
    });

    it('deve falhar se o email já existir', async () => {
      await createUser(
        testData.duplicateUser.email,
        testData.duplicateUser.password,
        UserRole.USER,
      );

      const response = await postUser({
        name: 'Outro',
        email: testData.duplicateUser.email,
        password: testData.duplicateUser.password,
      }).expect(409);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(UserMessagesHelper.EMAIL_EXIST);
    });
  });

  describe('GET /users', () => {
    it('deve permitir que ADMIN liste usuários', async () => {
      await request(httpServer)
        .get(USERS_ROUTE)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('deve bloquear USER de listar usuários e retornar mensagem de admin requerido', async () => {
      await createUser(
        testData.listUser.email,
        testData.listUser.password,
        UserRole.USER,
      );
      const token = await getAuthToken(
        testData.listUser.email,
        testData.listUser.password,
      );

      const response = await request(httpServer)
        .get(USERS_ROUTE)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(AuthMessagesHelper.FORBIDDEN_ADMIN);
    });
  });

  describe('GET /users/:id', () => {
    it('deve permitir que o usuário veja seus próprios dados', async () => {
      const user = await createUser(
        testData.viewMeUser.email,
        testData.viewMeUser.password,
        UserRole.USER,
      );
      const token = await getAuthToken(
        testData.viewMeUser.email,
        testData.viewMeUser.password,
      );

      await request(httpServer)
        .get(`${USERS_ROUTE}/${user._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('deve impedir que o usuário A veja dados do usuário B e retornar mensagem de recurso proibido', async () => {
      const userB = await createUser(
        testData.targetUser.email,
        testData.targetUser.password,
        UserRole.USER,
      );

      await createUser(
        testData.viewOtherUser.email,
        testData.viewOtherUser.password,
        UserRole.USER,
      );

      const tokenA = await getAuthToken(
        testData.viewOtherUser.email,
        testData.viewOtherUser.password,
      );

      const response = await request(httpServer)
        .get(`${USERS_ROUTE}/${userB._id.toString()}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(403);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(AuthMessagesHelper.FORBIDDEN_RESOURCE);
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar o próprio nome', async () => {
      const user = await createUser(
        testData.updateUser.email,
        testData.updateUser.password,
        UserRole.USER,
      );
      const token = await getAuthToken(
        testData.updateUser.email,
        testData.updateUser.password,
      );
      const newName = 'Nome Atualizado';

      const response = await request(httpServer)
        .patch(`${USERS_ROUTE}/${user._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: newName })
        .expect(200);

      const body = response.body as UserEntity;
      expect(body.name).toBe(newName);
    });

    it('deve falhar ao tentar atualizar email para um que já existe', async () => {
      const user1 = await createUser(
        testData.updateFailU1.email,
        testData.updateFailU1.password,
        UserRole.USER,
      );

      await createUser(
        testData.updateFailU2.email,
        testData.updateFailU2.password,
        UserRole.USER,
      );

      const token1 = await getAuthToken(
        testData.updateFailU1.email,
        testData.updateFailU1.password,
      );

      const response = await request(httpServer)
        .patch(`${USERS_ROUTE}/${user1._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ email: testData.updateFailU2.email })
        .expect(409);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(UserMessagesHelper.EMAIL_EXIST);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve permitir deletar o próprio usuário', async () => {
      const user = await createUser(
        testData.deleteUser.email,
        testData.deleteUser.password,
        UserRole.USER,
      );
      const token = await getAuthToken(
        testData.deleteUser.email,
        testData.deleteUser.password,
      );

      await request(httpServer)
        .delete(`${USERS_ROUTE}/${user._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deleted = await userModel.findById(user._id);
      expect(deleted).toBeNull();
    });
  });
});
