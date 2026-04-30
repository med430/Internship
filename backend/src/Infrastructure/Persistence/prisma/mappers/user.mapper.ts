// infrastructure/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common'
import { User as PrismaUser } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {User} from "../../../../Domain/entities/user.entity";
import {Role} from "../../../../Domain/enums/role.enum";

@Injectable()
export class UserMapper implements IGenericMapper<User, PrismaUser> {
    toDomain(raw: PrismaUser): User {
        return new User(
            raw.id,
            raw.email,
            raw.name,
            raw.lastname,
            raw.username,
            raw.passwordHash,
            raw.role as Role,
            raw.phone      ?? undefined,
            raw.avatarUrl  ?? undefined,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt  ?? undefined,
        )
    }

    toPersistence(domain: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
        return {
            id:           domain.id,
            email:        domain.email,
            name:         domain.name,
            lastname:     domain.lastname,
            username:     domain.username,
            passwordHash: domain.passwordHash,
            role:         domain.role,
            phone:        domain.phone      ?? null,
            avatarUrl:    domain.avatarUrl  ?? null,
            deletedAt:    domain.deletedAt  ?? null,
        }
    }
}