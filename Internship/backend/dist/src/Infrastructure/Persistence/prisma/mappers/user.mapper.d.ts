import { User as PrismaUser } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { User } from "../../../../Domain/entities/user.entity";
export declare class UserMapper implements IGenericMapper<User, PrismaUser> {
    toDomain(raw: PrismaUser): User;
    toPersistence(domain: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'>;
}
