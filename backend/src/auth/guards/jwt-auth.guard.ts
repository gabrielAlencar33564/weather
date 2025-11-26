import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthMessagesHelper } from '../helpers/messages.helper';
import { IUserPayload } from '../auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = IUserPayload>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw (
        err || new UnauthorizedException(AuthMessagesHelper.UNAUTHORIZED_TOKEN)
      );
    }

    return user;
  }
}
