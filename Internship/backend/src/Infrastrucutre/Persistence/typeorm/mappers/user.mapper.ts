import {UserOrmEntity} from "../entities/user.orm-entity";
import {User} from "../../../../Domain/user.entity";

export class UserMapper {
    static toDomain(entity: UserOrmEntity): User {
        return new User(
            entity.id,
            entity.username,
            entity.email,
            entity.password,
            entity.role
        );
    }

    static toOrm(user: User): UserOrmEntity {
        const entity = new UserOrmEntity();
        entity.id = user.id;
        entity.username = user.username;
        entity.email = user.email;
        entity.password = user.password;
        entity.role = user.role;
        return entity;
    }
}