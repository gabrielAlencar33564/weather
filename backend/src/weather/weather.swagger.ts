import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiProduces,
  ApiExcludeEndpoint,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  WeatherInsightResponse,
  WeatherPaginationResponse,
} from './entities/weather.responses';
import { WeatherMessagesHelper } from './helpers';
import { AuthMessagesHelper } from 'src/auth/helpers/messages.helper';
import {
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from 'common/swagger/error-response.decorator';

export function ApiAuthProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse(AuthMessagesHelper.UNAUTHORIZED_TOKEN),
  );
}

export function ApiWeatherCreate() {
  return applyDecorators(ApiExcludeEndpoint());
}

export function ApiWeatherFindAll() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Lista histórico climático paginado' }),
    ApiResponse({ status: HttpStatus.OK, type: WeatherPaginationResponse }),

    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'offset', required: false, example: 0 }),
  );
}

export function ApiWeatherInsights() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Gera análise inteligente baseada no histórico' }),
    ApiResponse({ status: HttpStatus.OK, type: WeatherInsightResponse }),

    ApiNotFoundResponse(WeatherMessagesHelper.CITY_NOT_FOUND),
  );
}

export function ApiWeatherExport(type: 'xlsx' | 'csv') {
  const mimeType =
    type === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: `Exporta dados para ${type.toUpperCase()}` }),
    ApiProduces(mimeType),
    ApiResponse({
      status: HttpStatus.OK,
      description: `Arquivo ${type.toUpperCase()} gerado`,
      schema: { type: 'string', format: 'binary' },
    }),
  );
}
