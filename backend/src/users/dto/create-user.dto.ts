import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserMessagesHelper } from '../helpers/messages.helper';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: UserMessagesHelper.EMAIL_INVALID })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: UserMessagesHelper.PASSWORD_MIN_LENGTH })
  password: string;
}
