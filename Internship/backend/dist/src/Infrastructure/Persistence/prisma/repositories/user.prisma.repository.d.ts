import { PrismaService } from '../prisma.service';
import { UserMapper } from '../mappers/user.mapper';
import { GenericRepository } from "./generic.repositories";
import { IUserRepository } from "../../../../Application/repositories/user.repository";
import { User } from "../../../../Domain/entities/user.entity";
export declare class UserRepositoryImpl extends GenericRepository<User, any> implements IUserRepository {
    constructor(prisma: PrismaService, mapper: UserMapper);
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    softDelete(id: string): Promise<void>;
    update(user: User): Promise<User>;
}
