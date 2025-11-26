import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthMessagesHelper } from '../helpers/messages.helper';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: AuthMessagesHelper.EMAIL_INVALID })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: AuthMessagesHelper.PASSWORD_MIN_LENGTH })
  password: string;
}
