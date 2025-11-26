import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserMessagesHelper } from '../users/helpers/messages.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(UserMessagesHelper.INVALID_CREDENTIALS);
    }

    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
