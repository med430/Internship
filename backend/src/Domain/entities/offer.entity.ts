import { OfferType } from "../enums/offer-type.enum";
import { BaseEntity } from "./base.entity";
import { SkillRequirement } from './skill-requirement';
import {WorkMode} from "../enums/workMode";

export class Offer extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly recruiterProfileId: string,

        public title: string,
        public description: string,

        public company: string,
        public location: string,

        public domain: string,
        public isPaid: boolean,
        public workMode: WorkMode,
        public startDate: Date,
        public endDate: Date,

        public skillRequirements: SkillRequirement[],
        public type: OfferType,

        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,

        // Recommendation-critical fields (M0 schema additions)
        public applicationDeadline?: Date,
        public positionsCount: number = 1,
        public stipendMin?: number,
        public stipendMax?: number,
        public languagesRequired: string[] = [],
    ) {
        super(createdAt, updatedAt, deletedAt);
    }
}
