import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthMessagesHelper } from '../helpers/messages.helper';

export class LoginDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'E-mail do usuário' })
  @IsNotEmpty()
  @IsEmail({}, { message: AuthMessagesHelper.EMAIL_INVALID })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha de acesso',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: AuthMessagesHelper.PASSWORD_MIN_LENGTH })
  password: string;
}
