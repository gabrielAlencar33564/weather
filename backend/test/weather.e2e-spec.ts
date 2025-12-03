import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { Weather, WeatherDocument } from '../src/weather/weather.schema';
import { WeatherMessagesHelper } from '../src/weather/helpers/messages.helper';
import { AuthMessagesHelper } from '../src/auth/helpers/messages.helper';
import { createUserUtil, getAuthTokenUtil } from './utils/user-test.utils';
import { UserDocument, UserRole, User } from '../src/users/user.schema';
import { App } from 'supertest/types';
import {
  WeatherEntity,
  WeatherInsightResponse,
  WeatherPaginationResponse,
} from 'src/weather/entities/weather.responses';

interface IErrorResponse {
  message: string | string[];
}

interface ITestUser {
  email: string;
  password: string;
}

type TestDataType = { [key: string]: ITestUser };

const WEATHER_ROUTE = '/api/weather';

const testData: TestDataType = {
  adminUser: {
    email: process.env.DEFAULT_ADMIN_EMAIL || '',
    password: process.env.DEFAULT_ADMIN_PASS || '',
  },
};

describe('Módulo de Weather (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let weatherModel: Model<WeatherDocument>;
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

    weatherModel = moduleFixture.get<Model<WeatherDocument>>(
      getModelToken(Weather.name),
    );

    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(User.name),
    );

    await app.init();
    httpServer = app.getHttpServer() as App;

    if (
      !(await userModel.findOne({ email: testData.adminUser.email }).exec())
    ) {
      await createUserUtil(
        userModel,
        testData.adminUser.email,
        UserRole.ADMIN,
        testData.adminUser.password,
      );
    }

    adminToken = await getAuthTokenUtil(
      app,
      testData.adminUser.email,
      testData.adminUser.password,
    );

    process.env.GEMINI_API_KEY = '';
  });

  beforeEach(async () => {
    await weatherModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  const extractMessageText = (res: IErrorResponse): string => {
    return Array.isArray(res.message)
      ? JSON.stringify(res.message)
      : String(res.message);
  };

  const createWeatherLogViaApi = async (override?: Partial<Weather>) => {
    const now = new Date();
    const payload = {
      city: 'Palmeiras - BA',
      temperature: 30,
      humidity: 70,
      wind_speed: 10,
      condition_code: 80,
      rain_probability: 60,
      location: {
        lat: '-12.5',
        lon: '-41.5',
      },
      timestamp: now.toISOString(),
      ...override,
    };

    const response = await request(httpServer)
      .post(WEATHER_ROUTE)
      .send(payload)
      .expect(201);

    return response.body as Weather;
  };

  describe('POST /weather', () => {
    it('deve criar um novo log de clima com sucesso', async () => {
      const now = new Date();
      const payload = {
        city: 'Palmeiras - BA',
        temperature: 28.5,
        humidity: 65,
        wind_speed: 12,
        condition_code: 82,
        rain_probability: 55,
        location: {
          lat: '-12.51',
          lon: '-41.52',
        },
        timestamp: now.toISOString(),
      };

      const response = await request(httpServer)
        .post(WEATHER_ROUTE)
        .send(payload)
        .expect(201);

      const body = response.body as WeatherEntity;

      expect(body).toHaveProperty('_id');
      expect(body.city).toBe(payload.city);
      expect(body.temperature).toBe(payload.temperature);
      expect(body.humidity).toBe(payload.humidity);
      expect(body.wind_speed).toBe(payload.wind_speed);
      expect(body.rain_probability).toBe(payload.rain_probability);
      expect(body.location).toEqual(expect.objectContaining(payload.location));
      expect(body).toHaveProperty('createdAt');
    });
  });

  describe('GET /weather/logs', () => {
    it('deve bloquear acesso sem token (401) e retornar a mensagem de token não autorizado', async () => {
      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/logs`)
        .expect(401);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(AuthMessagesHelper.UNAUTHORIZED_TOKEN);
    });

    it('deve listar logs de clima com paginação para usuário autenticado', async () => {
      await createWeatherLogViaApi();
      await createWeatherLogViaApi({
        city: 'Outra Cidade',
        temperature: 25,
      });

      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/logs`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ limit: 10, offset: 0 })
        .expect(200);

      const body = response.body as WeatherPaginationResponse;

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);
      expect(body.meta).toBeDefined();
      expect(body.meta.limit).toBe(10);
      expect(body.meta.offset).toBe(0);
      expect(body.meta.total).toBeGreaterThanOrEqual(body.data.length);
      expect(body.meta.current_page).toBe(1);
      expect(body.meta.last_page).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /weather/insights', () => {
    it('deve retornar 404 e mensagem de cidade não encontrada quando não há histórico', async () => {
      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/insights`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(WeatherMessagesHelper.CITY_NOT_FOUND);
    });

    it('deve retornar análise inteligente com histórico válido usando fallback (sem GEMINI)', async () => {
      const baseDate = new Date();

      for (let i = 0; i < 5; i++) {
        await createWeatherLogViaApi({
          city: 'Palmeiras - BA',
          temperature: 28 + i,
          humidity: 60 + i,
          wind_speed: 10 + i,
          createdAt: new Date(baseDate.getTime() - i * 3600 * 1000),
        });
      }

      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/insights`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = response.body as WeatherInsightResponse;

      expect(body.city).toBe('Palmeiras - BA');
      expect(body.current_data).toBeDefined();
      expect(body.analysis).toBeDefined();
      expect(typeof body.analysis.insight).toBe('string');
      expect(body.analysis.insight.length).toBeGreaterThan(0);
      expect(['low', 'medium', 'high', 'critical']).toContain(
        body.analysis.severity,
      );
      expect(body.history_sample).toBeGreaterThan(0);
      expect(body.message).toBe(WeatherMessagesHelper.GET_ANALYSIS_SUCCESS);
    });
  });

  describe('GET /weather/export.xlsx', () => {
    it('deve bloquear export sem token com 401 e mensagem adequada', async () => {
      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/export.xlsx`)
        .expect(401);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(AuthMessagesHelper.UNAUTHORIZED_TOKEN);
    });

    it('deve exportar planilha XLSX com headers corretos', async () => {
      await createWeatherLogViaApi();

      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/export.xlsx`)
        .set('Authorization', `Bearer ${adminToken}`)
        .buffer()
        .parse((res, cb) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk as Buffer));
          res.on('end', () => cb(null, Buffer.concat(chunks)));
        })
        .expect(200);

      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain(
        'weather_data.xlsx',
      );
      expect(response.body).toBeInstanceOf(Buffer);
      expect((response.body as Buffer).length).toBeGreaterThan(0);
    });
  });

  describe('GET /weather/export.csv', () => {
    it('deve bloquear export CSV sem token com 401 e mensagem adequada', async () => {
      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/export.csv`)
        .expect(401);

      const body = response.body as IErrorResponse;
      const msg = extractMessageText(body);

      expect(msg).toContain(AuthMessagesHelper.UNAUTHORIZED_TOKEN);
    });

    it('deve exportar CSV com headers corretos', async () => {
      await createWeatherLogViaApi();

      const response = await request(httpServer)
        .get(`${WEATHER_ROUTE}/export.csv`)
        .set('Authorization', `Bearer ${adminToken}`)
        .buffer()
        .parse((res, cb) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk as Buffer));
          res.on('end', () => cb(null, Buffer.concat(chunks)));
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'weather_data.csv',
      );
      expect(response.body).toBeInstanceOf(Buffer);
      expect((response.body as Buffer).length).toBeGreaterThan(0);
    });
  });
});
