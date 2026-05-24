import { BaseEntity } from "./base.entity";
export declare class Recommendation extends BaseEntity {
    readonly id: string;
    readonly recruiterId: string;
    readonly studentId: string;
    readonly description: string;
    constructor(id: string, recruiterId: string, studentId: string, description: string, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
