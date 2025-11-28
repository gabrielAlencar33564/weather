import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY...',
    description: 'Token JWT para autenticação nas rotas protegidas',
  })
  token: string;
}
