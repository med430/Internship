import { Role } from '../enums/role.enum';
import { BaseEntity } from "./base.entity";
export declare class User extends BaseEntity {
    readonly id: string;
    email: string;
    name: string;
    lastname: string;
    username: string;
    passwordHash: string;
    role: Role;
    phone?: string | undefined;
    avatarUrl?: string | undefined;
    constructor(id: string, email: string, name: string, lastname: string, username: string, passwordHash: string, role: Role, phone?: string | undefined, avatarUrl?: string | undefined, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
