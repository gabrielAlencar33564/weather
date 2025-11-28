import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponse } from './entities/auth.responses';
import { UserMessagesHelper } from 'src/users/helpers';
import { ApiUnauthorizedResponse } from 'common/swagger/error-response.decorator';

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Realiza autenticação e retorna token JWT' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login realizado com sucesso',
      type: LoginResponse,
    }),

    ApiUnauthorizedResponse(UserMessagesHelper.INVALID_CREDENTIALS),
  );
}
