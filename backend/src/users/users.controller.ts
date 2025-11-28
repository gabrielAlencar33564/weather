import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from './user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard, OwnershipGuard } from 'src/auth/guards';
import {
  ApiUserCreate,
  ApiUserDelete,
  ApiUserFindAll,
  ApiUserFindOne,
  ApiUserUpdate,
} from './users.swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiUserCreate()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiUserFindAll()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.usersService.findAll(limit, offset);
  }

  @ApiUserFindOne()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiUserUpdate()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiUserDelete()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
