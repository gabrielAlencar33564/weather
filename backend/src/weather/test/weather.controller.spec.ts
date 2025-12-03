import { Test, TestingModule } from '@nestjs/testing';
import { type Response } from 'express';
import { WeatherController } from '../weather.controller';
import { WeatherService } from './..//services/weather.service';
import { CreateWeatherDto } from '../dto/create-weather.dto';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: {
    create: jest.Mock;
    findAll: jest.Mock;
    getSmartAnalysis: jest.Mock;
    exportExcel: jest.Mock;
  };

  beforeEach(async () => {
    weatherService = {
      create: jest.fn(),
      findAll: jest.fn(),
      getSmartAnalysis: jest.fn(),
      exportExcel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: weatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar WeatherService.create ao criar um registro', async () => {
    const dto: CreateWeatherDto = {
      city: 'Palmeiras - BA',
      temperature: 30,
      humidity: 60,
      wind_speed: 10,
      condition_code: 80,
      rain_probability: 20,
      location: {
        lat: '-12.5',
        lon: '-41.5',
      },
      timestamp: new Date().toISOString(),
    };

    const retornoService = {
      id: '1',
      ...dto,
    };

    weatherService.create.mockResolvedValue(retornoService);

    const resultado = await controller.create(dto);

    expect(weatherService.create).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual(retornoService);
  });

  it('deve chamar WeatherService.findAll ao listar os logs', async () => {
    const respostaService = {
      data: [],
      meta: {
        total: 0,
        offset: 0,
        limit: 10,
        last_page: 1,
        current_page: 1,
      },
    };

    weatherService.findAll.mockResolvedValue(respostaService);

    const resultado = await controller.findAll(10, 0);

    expect(weatherService.findAll).toHaveBeenCalledWith(10, 0);
    expect(resultado).toEqual(respostaService);
  });

  it('deve chamar WeatherService.getSmartAnalysis ao obter insights', async () => {
    const respostaInsights = {
      city: 'Palmeiras - BA',
      current_data: {},
      analysis: {
        insight: 'Risco moderado de chuva.',
        severity: 'medium',
      },
      history_sample: 5,
      message: 'Análise gerada com sucesso.',
    };

    weatherService.getSmartAnalysis.mockResolvedValue(respostaInsights);

    const resultado = await controller.getInsights();

    expect(weatherService.getSmartAnalysis).toHaveBeenCalledWith(
      'Palmeiras - BA',
    );
    expect(resultado).toEqual(respostaInsights);
  });

  it('deve exportar XLSX e escrever no response', async () => {
    const writeMock = jest.fn().mockResolvedValue(undefined);
    const workbookMock = {
      xlsx: {
        write: writeMock,
      },
    };

    weatherService.exportExcel.mockResolvedValue(workbookMock);

    const setHeaderMock = jest.fn();
    const endMock = jest.fn();

    const res = {
      setHeader: setHeaderMock,
      end: endMock,
    } as unknown as Response;

    await controller.exportXlsx(res);

    expect(weatherService.exportExcel).toHaveBeenCalled();
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=weather_data.xlsx',
    );
    expect(writeMock).toHaveBeenCalledWith(res);
    expect(endMock).toHaveBeenCalled();
  });

  it('deve exportar CSV e escrever no response', async () => {
    const writeMock = jest.fn().mockResolvedValue(undefined);
    const workbookMock = {
      csv: {
        write: writeMock,
      },
    };

    weatherService.exportExcel.mockResolvedValue(workbookMock);

    const setHeaderMock = jest.fn();
    const endMock = jest.fn();

    const res = {
      setHeader: setHeaderMock,
      end: endMock,
    } as unknown as Response;

    await controller.exportCsv(res);

    expect(weatherService.exportExcel).toHaveBeenCalled();
    expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=weather_data.csv',
    );
    expect(writeMock).toHaveBeenCalledWith(res);
    expect(endMock).toHaveBeenCalled();
  });
});
