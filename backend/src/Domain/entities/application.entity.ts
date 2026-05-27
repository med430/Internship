import {BaseEntity} from "./base.entity";
import {ApplicationStatus} from "../enums/application-status.enum";

export class Application extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,

        public cvId: string,


        public status: ApplicationStatus,
        public matchScore: number,
        public coverLetterId?: string,

        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt)
    }
}