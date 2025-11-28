import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';

type SwaggerMessageExample = string | string[];

const getErrorSchema = (
  statusCode: HttpStatus,
  message: SwaggerMessageExample,
  error: string,
): ApiResponseOptions => ({
  status: statusCode,
  description: error,
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: statusCode },
      message: {
        type: typeof message === 'string' ? 'string' : 'array',
        example: message,
      },
      error: { type: 'string', example: error },
    },
  },
});

const ApiDecorator = (options: ApiResponseOptions): MethodDecorator => {
  return applyDecorators(ApiResponse(options)) as MethodDecorator;
};

export const ApiConflictResponse = (message: string): MethodDecorator => {
  return ApiDecorator(getErrorSchema(HttpStatus.CONFLICT, message, 'Conflict'));
};

export const ApiForbiddenResponse = (message: string): MethodDecorator => {
  return ApiDecorator(
    getErrorSchema(HttpStatus.FORBIDDEN, message, 'Forbidden'),
  );
};

export const ApiNotFoundResponse = (message: string): MethodDecorator => {
  return ApiDecorator(
    getErrorSchema(HttpStatus.NOT_FOUND, message, 'Not Found'),
  );
};

export function ApiUnauthorizedResponse(message: string): MethodDecorator {
  return ApiResponse(
    getErrorSchema(HttpStatus.UNAUTHORIZED, message, 'Unauthorized'),
  );
}

export const ApiBadRequestResponse = (
  messageExamples: string[],
): MethodDecorator => {
  return ApiDecorator(
    getErrorSchema(HttpStatus.BAD_REQUEST, messageExamples, 'Bad Request'),
  );
};

export const ApiInternalServerErrorResponse = (
  message: string,
): MethodDecorator => {
  return ApiDecorator(
    getErrorSchema(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      'Internal Server Error',
    ),
  );
};
