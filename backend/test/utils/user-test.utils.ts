import { INestApplication } from '@nestjs/common';
import request, { Response as SupertestResponse } from 'supertest';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { UserDocument, UserRole } from 'src/users/user.schema';
import { App } from 'supertest/types';

const DEFAULT_TEST_PASSWORD = '123456';

export const createUserUtil = async (
  userModel: Model<UserDocument>,
  email: string,
  role: UserRole = UserRole.USER,
  password: string = DEFAULT_TEST_PASSWORD,
): Promise<UserDocument> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return userModel.create({
    name: role === UserRole.ADMIN ? 'Usuário Admin' : 'Usuário Comum',
    email,
    password: hashedPassword,
    role,
  });
};

export const getAuthTokenUtil = async (
  app: INestApplication,
  email: string,
  password: string = DEFAULT_TEST_PASSWORD,
): Promise<string> => {
  const response: SupertestResponse = await request(app.getHttpServer() as App)
    .post('/api/auth/login')
    .send({ email, password });

  const body = response.body as { token?: string };

  if (!body.token) {
    throw new Error('O login não retornou um token');
  }

  return body.token;
};
