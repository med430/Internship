import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {IUserRepository} from "../../../../Application/repositories/user.repository";
import {User} from "../../../../Domain/entities/user.entity";
import { UserPrismaMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  findByUsername(username: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  save(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) return null;

    return UserPrismaMapper.toDomain(user);
  }
}