import {User} from "../../Domain/user.entity";

export interface IUserRepository {
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
}