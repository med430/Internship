import {User} from "../../Domain/entities/user.entity";

export abstract class IUserRepository {
    abstract findByUsername(username: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract save(user: User): Promise<User>;
}