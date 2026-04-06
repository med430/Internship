import { IGenericRepository } from './generic.repository'
import {User} from "../../Domain/entities/user.entity";

export abstract class IUserRepository extends IGenericRepository<User> {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findByUsername(username: string): Promise<User | null>;
}