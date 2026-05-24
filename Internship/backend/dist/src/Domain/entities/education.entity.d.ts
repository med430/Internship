import { BaseEntity } from "./base.entity";
export declare class Education extends BaseEntity {
    readonly id: string;
    readonly studentProfileId: string;
    school: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date | undefined;
    description?: string | undefined;
    constructor(id: string, studentProfileId: string, school: string, degree: string, field: string, startDate: Date, endDate?: Date | undefined, description?: string | undefined, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
