import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from 'src/users/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthMessagesHelper } from '../helpers/messages.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      if (requiredRoles.includes(UserRole.ADMIN)) {
        throw new ForbiddenException(AuthMessagesHelper.FORBIDDEN_ADMIN);
      }

      throw new ForbiddenException(AuthMessagesHelper.FORBIDDEN_RESOURCE);
    }

    return true;
  }
}
