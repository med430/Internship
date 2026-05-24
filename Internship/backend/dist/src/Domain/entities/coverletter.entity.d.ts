import { BaseEntity } from "./base.entity";
export declare class CoverLetter extends BaseEntity {
    readonly id: string;
    readonly studentId: string;
    fileUrl: string;
    constructor(id: string, studentId: string, fileUrl: string, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
