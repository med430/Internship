import {User} from "../../../../Domain/entities/user.entity";

export class UserPrismaMapper {
    static toDomain(user: any): User {
        return new User(user.id, user.name, user.lastname, user.username, user.email, user.password, user.role);
    }

    static toPersistence(user: User) {
        return {
            id: user.id,
            firstName: user.name,
            lastName: user.lastname,
            username: user.username,
            email: user.email,
            password: user.passwordHash,
            role: user.role,
        };
    }
}