import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { WeatherService } from '../services/weather.service';
import { WeatherAiService } from '../services/weather-ai.service';
import { Weather, WeatherDocument } from '../weather.schema';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import { WeatherMessagesHelper } from '../helpers';

jest.mock('exceljs', () => {
  const addRowMock = jest.fn();
  const addWorksheetMock = jest.fn().mockReturnValue({
    columns: [],
    addRow: addRowMock,
  });

  const workbookMock = {
    addWorksheet: addWorksheetMock,
  };

  return {
    Workbook: jest.fn(() => workbookMock),
  };
});

type WeatherModelConstructorMockType = jest.Mock<
  WeatherDocument,
  [Partial<WeatherDocument>]
>;

type WeatherModelMockType = WeatherModelConstructorMockType &
  Partial<Pick<Model<WeatherDocument>, 'find' | 'countDocuments'>> & {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };

describe('WeatherService', () => {
  let service: WeatherService;
  let weatherModel: WeatherModelMockType;
  let weatherAiService: {
    analyzeHistory: jest.Mock;
  };

  beforeEach(async () => {
    const mockWeatherModel = jest.fn<
      WeatherDocument,
      [Partial<WeatherDocument>]
    >() as WeatherModelMockType;

    mockWeatherModel.find = jest.fn();
    mockWeatherModel.countDocuments = jest.fn();

    weatherModel = mockWeatherModel;

    weatherAiService = {
      analyzeHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(Weather.name),
          useValue: weatherModel,
        },
        {
          provide: WeatherAiService,
          useValue: weatherAiService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um registro de clima usando o timestamp como createdAt', async () => {
    const timestamp = new Date('2025-01-01T10:00:00Z').toISOString();

    const dto: CreateWeatherDto = {
      city: 'Palmeiras - BA',
      temperature: 28,
      humidity: 70,
      wind_speed: 10,
      condition_code: 80,
      rain_probability: 40,
      location: {
        lat: '-12.5',
        lon: '-41.5',
      },
      timestamp,
    };

    const savedWeather: Partial<WeatherDocument> = {
      ...dto,
      createdAt: new Date(timestamp),
    };

    let dadosCriacao: Partial<WeatherDocument> | undefined;
    const saveMock = jest
      .fn()
      .mockResolvedValue(savedWeather as WeatherDocument);

    weatherModel.mockImplementation(
      (data: Partial<WeatherDocument>): WeatherDocument => {
        dadosCriacao = data;
        return {
          ...(data as WeatherDocument),
          save: saveMock,
        } as unknown as WeatherDocument;
      },
    );

    const resultado = await service.create(dto);

    expect(saveMock).toHaveBeenCalled();
    expect(dadosCriacao).toBeDefined();
    expect(dadosCriacao?.city).toBe(dto.city);
    expect(dadosCriacao?.temperature).toBe(dto.temperature);
    expect(dadosCriacao?.createdAt).toEqual(new Date(timestamp));
    expect(resultado).toEqual(savedWeather);
  });

  it('deve retornar lista paginada em findAll', async () => {
    const registros: WeatherDocument[] = [
      {
        city: 'Palmeiras - BA',
        temperature: 30,
        humidity: 60,
        wind_speed: 12,
        condition_code: 80,
        rain_probability: 20,
        location: { lat: '-12.5', lon: '-41.5' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WeatherDocument,
      {
        city: 'Salvador - BA',
        temperature: 29,
        humidity: 70,
        wind_speed: 15,
        condition_code: 90,
        rain_probability: 50,
        location: { lat: '-12.9', lon: '-38.5' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WeatherDocument,
    ];

    const execMock = jest.fn().mockResolvedValue(registros);
    const limitMock = jest.fn().mockReturnValue({
      exec: execMock,
    });
    const skipMock = jest.fn().mockReturnValue({
      limit: limitMock,
    });
    const sortMock = jest.fn().mockReturnValue({
      skip: skipMock,
    });

    weatherModel.find.mockReturnValue({
      sort: sortMock,
    } as unknown as Model<WeatherDocument>);

    weatherModel.countDocuments.mockResolvedValue(registros.length);

    const resultado = await service.findAll(2, 0);

    expect(weatherModel.find).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(2);
    expect(weatherModel.countDocuments).toHaveBeenCalled();

    expect(resultado).toEqual({
      data: registros,
      meta: {
        total: 2,
        offset: 0,
        limit: 2,
        last_page: 1,
        current_page: 1,
      },
    });
  });

  it('deve lançar NotFoundException quando não houver histórico para a cidade em getSmartAnalysis', async () => {
    const execMock = jest.fn().mockResolvedValue([]);
    const limitMock = jest.fn().mockReturnValue({
      exec: execMock,
    });
    const sortMock = jest.fn().mockReturnValue({
      limit: limitMock,
    });

    const findMock = jest.fn().mockReturnValue({
      sort: sortMock,
    });

    weatherModel.find = findMock as unknown as jest.Mock;

    await expect(
      service.getSmartAnalysis('Cidade Inexistente'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.getSmartAnalysis('Cidade Inexistente'),
    ).rejects.toThrow(WeatherMessagesHelper.CITY_NOT_FOUND);
  });

  it('deve chamar WeatherAiService.analyzeHistory e retornar análise quando houver histórico', async () => {
    const logAtual: WeatherDocument = {
      city: 'Palmeiras - BA',
      temperature: 30,
      humidity: 60,
      wind_speed: 15,
      condition_code: 90,
      rain_probability: 50,
      location: { lat: '-12.5', lon: '-41.5' },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WeatherDocument;

    const historico: WeatherDocument[] = [logAtual];

    const execMock = jest.fn().mockResolvedValue(historico);
    const limitMock = jest.fn().mockReturnValue({
      exec: execMock,
    });
    const sortMock = jest.fn().mockReturnValue({
      limit: limitMock,
    });

    const findMock = jest.fn().mockReturnValue({
      sort: sortMock,
    });

    weatherModel.find = findMock as unknown as jest.Mock;

    const analiseAi = {
      insight: 'Risco moderado de chuva à tarde.',
      severity: 'medium' as const,
    };

    weatherAiService.analyzeHistory.mockResolvedValue(analiseAi);

    const resultado = await service.getSmartAnalysis('Palmeiras - BA');

    expect(weatherAiService.analyzeHistory).toHaveBeenCalledWith(historico);
    expect(resultado.city).toBe('Palmeiras - BA');
    expect(resultado.current_data).toEqual(logAtual);
    expect(resultado.analysis).toEqual(analiseAi);
    expect(resultado.history_sample).toBe(historico.length);
    expect(resultado.message).toBe(WeatherMessagesHelper.GET_ANALYSIS_SUCCESS);
  });

  it('deve exportar dados para Excel com exportExcel', async () => {
    const log1: WeatherDocument = {
      city: 'Palmeiras - BA',
      temperature: 30,
      humidity: 60,
      wind_speed: 10,
      condition_code: 80,
      rain_probability: 20,
      location: { lat: '-12.5', lon: '-41.5' },
      createdAt: new Date('2025-01-01T10:00:00Z'),
      updatedAt: new Date(),
    } as WeatherDocument;

    const log2: WeatherDocument = {
      city: 'Salvador - BA',
      temperature: 29,
      humidity: 70,
      wind_speed: 15,
      condition_code: 90,
      rain_probability: 50,
      location: { lat: '-12.9', lon: '-38.5' },
      createdAt: new Date('2025-01-02T10:00:00Z'),
      updatedAt: new Date(),
    } as WeatherDocument;

    const registros: WeatherDocument[] = [log1, log2];

    const execMock = jest.fn().mockResolvedValue(registros);
    const sortMock = jest.fn().mockReturnValue({
      exec: execMock,
    });

    weatherModel.find.mockReturnValue({
      sort: sortMock,
    } as unknown as Model<WeatherDocument>);

    const workbook = await service.exportExcel();

    expect(ExcelJS.Workbook).toHaveBeenCalledTimes(1);
    expect(workbook).toBeDefined();
  });
});
