import { BaseEntity } from "./base.entity";
export declare class Experience extends BaseEntity {
    readonly id: string;
    readonly studentProfileId: string;
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date | undefined;
    description?: string | undefined;
    constructor(id: string, studentProfileId: string, company: string, role: string, startDate: Date, endDate?: Date | undefined, description?: string | undefined, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
