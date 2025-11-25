import {
  Injectable,
  OnModuleInit,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserMessagesHelper, UserLoggerHelper } from './helpers';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const adminPass = process.env.DEFAULT_ADMIN_PASS || '123456';

    const existingAdmin = await this.userModel.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log(UserLoggerHelper.SEED_ADMIN_START);

      const hashedPassword = await bcrypt.hash(adminPass, 10);

      await this.userModel.create({
        name: 'Admin GDASH',
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(UserLoggerHelper.SEED_ADMIN_SUCCESS);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException(UserMessagesHelper.EMAIL_EXIST);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(UserMessagesHelper.USER_NOT_FOUND);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    const data = { ...updateUserDto };

    if (data.email) {
      const userWithSameEmail = await this.userModel.findOne({
        email: data.email,
      });

      if (userWithSameEmail && userWithSameEmail._id.toString() !== id) {
        throw new ConflictException(UserMessagesHelper.EMAIL_EXIST);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(UserMessagesHelper.USER_NOT_FOUND);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(UserMessagesHelper.USER_NOT_FOUND);
    }
  }
}
