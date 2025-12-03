import {
  WeatherAiService,
  IAiAnalysisResult,
} from '../services/weather-ai.service';
import { Weather } from '../weather.schema';
import { WeatherMessagesHelper } from '../helpers';

describe('WeatherAiService', () => {
  let service: WeatherAiService;

  beforeEach(() => {
    service = new WeatherAiService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('deve retornar insight de dados insuficientes quando logs estiverem vazios', async () => {
    const resultado = await service.analyzeHistory([]);

    const esperado: IAiAnalysisResult = {
      insight: WeatherMessagesHelper.INSUFFICIENT_DATA,
      severity: 'low',
    };

    expect(resultado).toEqual(esperado);
  });

  it('deve usar análise de fallback quando GEMINI_API_KEY não estiver definida', async () => {
    const logAtual: Weather = {
      city: 'Palmeiras - BA',
      temperature: 36,
      humidity: 70,
      wind_speed: 20,
      condition_code: 95,
      rain_probability: 90,
      location: {
        lat: '-12.5',
        lon: '-41.5',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Weather;

    const historico: Weather[] = [
      logAtual,
      {
        city: 'Palmeiras - BA',
        temperature: 32,
        humidity: 65,
        wind_speed: 18,
        condition_code: 80,
        rain_probability: 40,
        location: {
          lat: '-12.5',
          lon: '-41.5',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Weather,
    ];

    const resultado = await service.analyzeHistory(historico);

    expect(resultado.insight).toContain(WeatherMessagesHelper.FALLBACK_STORM);
    expect(resultado.insight).toContain(
      WeatherMessagesHelper.FALLBACK_HEAT_CRITICAL,
    );
    expect(['medium', 'high', 'critical']).toContain(resultado.severity);
  });

  it('deve limpar corretamente uma string JSON com marcações de bloco em cleanJsonString', () => {
    const textoSujo = '```json\n{"insight":"Teste","severity":"low"}\n```';

    const serviceComHelper = service as unknown as {
      cleanJsonString(input?: string): string;
    };

    const resultado = serviceComHelper.cleanJsonString(textoSujo);

    expect(resultado).toBe('{"insight":"Teste","severity":"low"}');
  });
});
