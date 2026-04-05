import { Role } from '../enums/role.enum'
import {BaseEntity} from "./base.entity";

export class User extends BaseEntity {
    constructor(
        public readonly id: string,
        public email: string,
        public name: string,
        public lastname: string,
        public username: string,
        public passwordHash: string,
        public roles: Role,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

}