import { SkillAssignment } from './skill-assignment.entity';
import { OfferType } from "../enums/offer-type.enum";
import { BaseEntity } from "./base.entity";

export class Offer extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly creatorId: string,

        public title: string,
        public description: string,

        public company: string,
        public location: string,

        public domain: string,

        public startDate: Date,
        public endDate: Date,

        public requiredSkills: SkillAssignment[],
        public type: OfferType,

        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt);
    }
}