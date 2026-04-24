import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {IUserRepository} from "../../../../Application/repositories/user.repository";
import {User} from "../../../../Domain/entities/user.entity";
import { UserPrismaMapper } from '../mappers/user.mapper';
import { GenericRepository } from './generic.repositories';
import { User as UserDB } from "@prisma/client";

@Injectable()
export class UserRepository extends GenericRepository<User, UserDB> implements IUserRepository {
  constructor(
    protected readonly prisma: PrismaService,
    protected mapper: UserPrismaMapper,
  ) {
    const modelName: keyof PrismaService = "user";
    super(prisma, modelName, mapper);
  }
  async findByUsername(username: string): Promise<User | null> {
    const user_db: UserDB | null = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user_db) {
      return null;
    }

    return this.mapper.toDomain(user_db);
  }
  async findByEmail(email: string): Promise<User | null> {
    const user_db: UserDB | null = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user_db) {
      return null;
    }

    return this.mapper.toDomain(user_db);
  }
  async update(user: User): Promise<User> {
    const result = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        passwordHash: user.passwordHash,
        deletedAt: user.deletedAt
      }
    })

    return this.mapper.toDomain(result)
  }
}