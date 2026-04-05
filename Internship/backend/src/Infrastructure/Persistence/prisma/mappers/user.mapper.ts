import {User} from "../../../../Domain/user.entity";

export class UserPrismaMapper {
    static toDomain(user: any): User {
        return new User(user.id, user.firstName, user.lastName, user.username, user.email, user.password, user.role);
    }

    static toPersistence(user: User) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role,
        };
    }
}