import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Weather } from '../weather.schema';
import { WeatherLoggerHelper, WeatherMessagesHelper } from '../helpers';

export interface IAiAnalysisResult {
  insight: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class WeatherAiService {
  private client: GoogleGenAI;
  private readonly logger = new Logger(WeatherAiService.name);

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async analyzeHistory(logs: Weather[]): Promise<IAiAnalysisResult> {
    if (!logs || logs.length === 0) {
      return {
        insight: WeatherMessagesHelper.INSUFFICIENT_DATA,
        severity: 'low',
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      this.logger.warn(WeatherLoggerHelper.GEMINI_KEY_MISSING);
      return this.generateFallbackAnalysis(logs);
    }

    this.logger.log(WeatherLoggerHelper.AI_START(logs.length));

    const dataContext = logs.map((l) => ({
      data: l.createdAt,
      temp: l.temperature,
      hum: l.humidity,
      vento: l.wind_speed,
      chuva_prob: l.rain_probability,
    }));

    const prompt = `
      Atue como um meteorologista sênior.
      Analise este histórico: ${JSON.stringify(dataContext)}
      Retorne APENAS um JSON: { "insight": "...", "severity": "low"|"medium"|"high"|"critical" }
    `;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' },
      });

      const jsonString = this.cleanJsonString(response.text);

      if (!jsonString) {
        throw new Error(WeatherLoggerHelper.AI_EMPTY_RESPONSE);
      }

      this.logger.log(WeatherLoggerHelper.AI_SUCCESS);
      return JSON.parse(jsonString) as IAiAnalysisResult;
    } catch (error) {
      this.logger.error(
        WeatherLoggerHelper.AI_CONNECTION_ERROR,
        error instanceof Error ? error.message : error,
      );
      this.logger.log(WeatherLoggerHelper.FALLBACK_ACTIVATED);

      return this.generateFallbackAnalysis(logs);
    }
  }

  private cleanJsonString(input?: string): string {
    return input
      ? input
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
      : '';
  }

  private generateFallbackAnalysis(logs: Weather[]): IAiAnalysisResult {
    const current = logs[0];
    const history = logs.slice(1);

    const avgTemp =
      history.length > 0
        ? history.reduce((acc, curr) => acc + curr.temperature, 0) /
          history.length
        : current.temperature;

    const tempDiff = current.temperature - avgTemp;
    const insightParts: string[] = [];
    let severity: IAiAnalysisResult['severity'] = 'low';

    if (current.rain_probability > 80 && current.condition_code >= 95) {
      insightParts.push(WeatherMessagesHelper.FALLBACK_STORM);
      severity = 'high';
    } else if (current.rain_probability > 60) {
      insightParts.push(WeatherMessagesHelper.FALLBACK_RAIN);
      severity = 'medium';
    }

    if (current.temperature > 35) {
      insightParts.push(WeatherMessagesHelper.FALLBACK_HEAT_CRITICAL);
      severity = 'critical';
    } else if (current.temperature > 30) {
      insightParts.push(WeatherMessagesHelper.FALLBACK_HEAT_WARNING);
      if (severity === 'low') severity = 'medium';
    } else if (current.temperature < 10) {
      insightParts.push(WeatherMessagesHelper.FALLBACK_COLD);
      if (severity === 'low') severity = 'medium';
    }

    if (Math.abs(tempDiff) >= 3) {
      insightParts.push(WeatherMessagesHelper.formatTrendMessage(tempDiff));
    }

    const finalInsight =
      insightParts.length > 0
        ? insightParts.join(' ')
        : WeatherMessagesHelper.FALLBACK_NORMAL;

    return {
      insight: finalInsight,
      severity: severity,
    };
  }
}
