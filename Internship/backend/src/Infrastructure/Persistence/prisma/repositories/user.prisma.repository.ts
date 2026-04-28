// infrastructure/repositories/user.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UserMapper } from '../mappers/user.mapper'
import {GenericRepository} from "./generic.repositories";
import {IUserRepository} from "../../../../Application/repositories/user.repository";
import {User} from "../../../../Domain/entities/user.entity";

@Injectable()
export class UserRepositoryImpl
    extends GenericRepository<User, any>
    implements IUserRepository {

  constructor(
      prisma: PrismaService,
      mapper: UserMapper
  ) {
    super(prisma, 'user', mapper)
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { email }
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { username }
    })
    return result ? this.mapper.toDomain(result) : null
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  async update(user: User): Promise<User> {
    const result = await this.prisma.user.update({
      where: { id: user.id },
      data: this.mapper.toPersistence(user)
    })
    return this.mapper.toDomain(result)
  }
}