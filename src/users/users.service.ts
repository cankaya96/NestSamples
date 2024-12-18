import { Injectable, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const normalizedEmail = createUserDto.email.toLowerCase();

      // Check if email exists using raw SQL
      const existingUser = await this.prisma.$queryRaw`
        SELECT id FROM "User" WHERE LOWER(email) = LOWER(${normalizedEmail})
      `;

      if (existingUser && (existingUser as any[]).length > 0) {
        this.logger.warn(`Attempt to create user with existing email: ${normalizedEmail}`);
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      const newUser = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: createUserDto.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return newUser;
    } catch (error) {
      this.logger.error('Failed to create user:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user'
      );
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  update(id: number, updateUserDto: Partial<CreateUserDto>) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
