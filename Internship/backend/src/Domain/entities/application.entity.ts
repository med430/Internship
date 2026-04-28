import {BaseEntity} from "./base.entity";
import {ApplicationStatus} from "../enums/application-status.enum";

export class Application extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,

        public readonly cvId: string,


        public status: ApplicationStatus,
        public matchScore: number,
        public readonly coverLetterId?: string,

        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt)
    }
}