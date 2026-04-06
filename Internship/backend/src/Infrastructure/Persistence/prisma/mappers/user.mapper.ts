import {User} from "../../../../Domain/entities/user.entity";
import { Role } from "@prisma/client";
import { Role as UserRole } from "../../../../Domain/enums/role.enum";

export class UserPrismaMapper {
    static toDomain(user: any): User {
        return new User(user.id, user.name, user.lastname, user.username, user.email, user.passwordHash, user.role as UserRole);
    }

    static toPersistence(user: User) {
        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role as Role,
        };
    }
}