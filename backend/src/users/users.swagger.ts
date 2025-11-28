import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserEntity, UserPaginationResponse } from './entities/user.responses';
import { UserMessagesHelper } from './helpers';
import { AuthMessagesHelper } from 'src/auth/helpers/messages.helper';
import {
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from 'common/swagger/error-response.decorator';

export function ApiAuthProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse(AuthMessagesHelper.UNAUTHORIZED_TOKEN),
  );
}

export function ApiUserCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Cadastra um novo usuário' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Usuário criado',
      type: UserEntity,
    }),

    ApiConflictResponse(UserMessagesHelper.EMAIL_EXIST),
    ApiBadRequestResponse([
      UserMessagesHelper.EMAIL_INVALID,
      UserMessagesHelper.PASSWORD_MIN_LENGTH,
    ]),
  );
}

export function ApiUserFindAll() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Lista todos os usuários (Admin)' }),
    ApiResponse({ status: HttpStatus.OK, type: UserPaginationResponse }),

    ApiForbiddenResponse(AuthMessagesHelper.FORBIDDEN_ADMIN),

    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'offset', required: false, example: 0 }),
  );
}

export function ApiUserFindOne() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Busca usuário por ID (Dono ou Admin)' }),
    ApiResponse({ status: HttpStatus.OK, type: UserEntity }),

    ApiNotFoundResponse(UserMessagesHelper.USER_NOT_FOUND),
    ApiForbiddenResponse(AuthMessagesHelper.FORBIDDEN_RESOURCE),

    ApiParam({ name: 'id', description: 'ID do usuário' }),
  );
}

export function ApiUserUpdate() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Atualiza usuário (Dono ou Admin)' }),
    ApiResponse({ status: HttpStatus.OK, type: UserEntity }),

    ApiConflictResponse(UserMessagesHelper.EMAIL_EXIST),
    ApiForbiddenResponse(AuthMessagesHelper.FORBIDDEN_RESOURCE),
    ApiNotFoundResponse(UserMessagesHelper.USER_NOT_FOUND),

    ApiParam({ name: 'id', description: 'ID do usuário' }),
  );
}

export function ApiUserDelete() {
  return applyDecorators(
    ApiAuthProtected(),
    ApiOperation({ summary: 'Remove um usuário (Dono ou Admin)' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Usuário removido' }),

    ApiNotFoundResponse(UserMessagesHelper.USER_NOT_FOUND),
    ApiForbiddenResponse(AuthMessagesHelper.FORBIDDEN_RESOURCE),

    ApiParam({ name: 'id', description: 'ID do usuário' }),
  );
}
