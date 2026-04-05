import { IGenericRepository } from './generic.repository'
import {User} from "../../Domain/entities/user.entity";

export interface IUserRepository extends IGenericRepository<User> {
    findByEmail(email: string): Promise<User | null>
    findByUsername(username: string): Promise<User | null>
}