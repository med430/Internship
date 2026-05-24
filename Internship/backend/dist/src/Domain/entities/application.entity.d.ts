import { BaseEntity } from "./base.entity";
import { ApplicationStatus } from "../enums/application-status.enum";
export declare class Application extends BaseEntity {
    readonly id: string;
    readonly studentId: string;
    readonly offerId: string;
    readonly cvId: string;
    status: ApplicationStatus;
    matchScore: number;
    readonly coverLetterId?: string | undefined;
    constructor(id: string, studentId: string, offerId: string, cvId: string, status: ApplicationStatus, matchScore: number, coverLetterId?: string | undefined, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
