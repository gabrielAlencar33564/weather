import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.schema';

export class UserEntity {
  @ApiProperty({ example: '67464abc123...' })
  _id: string;

  @ApiProperty({ example: 'Test GDASH' })
  name: string;

  @ApiProperty({ example: 'test@gmail.com' })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Nível de permissão',
  })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

class MetaData {
  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  last_page: number;

  @ApiProperty({ example: 1 })
  current_page: number;
}

export class UserPaginationResponse {
  @ApiProperty({ type: [UserEntity] })
  data: UserEntity[];

  @ApiProperty({ type: MetaData })
  meta: MetaData;
}
