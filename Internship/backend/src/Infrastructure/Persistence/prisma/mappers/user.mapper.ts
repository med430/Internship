import {User} from "../../../../Domain/entities/user.entity";
import { Role } from "@prisma/client";
import { Role as UserRole } from "../../../../Domain/enums/role.enum";
import { IGenericMapper } from './generic.mapper';
import { User as UserDB } from "@prisma/client"

export class UserPrismaMapper implements IGenericMapper<User, UserDB> {
    toDomain(user: UserDB): User {
        return new User(user.id, user.name, user.lastname, user.username, user.email, user.passwordHash, user.role as UserRole);
    }

    toPersistence(user: User): UserDB {
        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role as Role,
            createdAt: user.createdAt as Date,
            updatedAt: user.updatedAt as Date,
            deletedAt: user.deletedAt as Date,
        } as UserDB;
    }
}