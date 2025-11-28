import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserMessagesHelper } from '../helpers/messages.helper';

export class CreateUserDto {
  @ApiProperty({
    example: 'Test GDASH',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'E-mail para login (deve ser único)',
  })
  @IsEmail({}, { message: UserMessagesHelper.EMAIL_INVALID })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: UserMessagesHelper.PASSWORD_MIN_LENGTH,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: UserMessagesHelper.PASSWORD_MIN_LENGTH })
  password: string;
}
