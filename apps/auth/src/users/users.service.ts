import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './models/user.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.find({});
  }

  async create({ email, password }: CreateUserDto) {
    await this.validateEmail(email);

    const user = new User({
      email,
      password: await bcrypt.hash(password, 10),
    });

    return this.usersRepository.create(user);
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.findOneAndUpdate({ id }, updateUserDto);
  }

  async delete(id: number) {
    return this.usersRepository.findOneAndDelete({ id });
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async validateEmail(email: string) {
    try {
      await this.usersRepository.findOne({ email });
    } catch (_) {
      return;
    }

    throw new UnprocessableEntityException('Email already exists.');
  }
}
