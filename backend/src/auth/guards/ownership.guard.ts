import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../users/user.schema';
import { AuthMessagesHelper } from '../helpers/messages.helper';
import { IUserPayload } from '../auth.interface';

interface AuthenticatedRequest extends Request {
  user?: IUserPayload;
  params: {
    id: string;
  };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    const targetId = request.params.id;

    if (!user || !targetId) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.userId === targetId) {
      return true;
    }

    throw new ForbiddenException(AuthMessagesHelper.FORBIDDEN_RESOURCE);
  }
}
