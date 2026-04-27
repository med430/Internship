// domain/entities/application.entity.ts

import { ApplicationStatus } from '../enums/application-status.enum'
import {Offer} from "./offer.entity";
import {StudentProfile} from "./student-profile.entity";
import {BaseEntity} from "./base.entity";

export class Application extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly offerId: string,
        public status: ApplicationStatus,
        public cvUrl: string,
        public matchScore: number,
        public coverLetterUrl?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt)
    }

}