// repositories/user.repository.ts
import { User } from '../../Domain/entities/user.entity'
import { IGenericRepository } from './generic.repository'

export interface IUserRepository extends IGenericRepository<User, string> {
    findByEmail(email: string): Promise<User | null>
    findByUsername(username: string): Promise<User | null>
    softDelete(id: string): Promise<void>
    update(user: User): Promise<User>
}

export const IUserRepository = Symbol('IUserRepository')