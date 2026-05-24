import { OfferType } from "../enums/offer-type.enum";
import { BaseEntity } from "./base.entity";
import { SkillRequirement } from './skill-requirement';
import { WorkMode } from "../enums/workMode";
export declare class Offer extends BaseEntity {
    readonly id: string;
    readonly recruiterProfileId: string;
    title: string;
    description: string;
    company: string;
    location: string;
    domain: string;
    isPaid: boolean;
    workMode: WorkMode;
    startDate: Date;
    endDate: Date;
    skillRequirements: SkillRequirement[];
    type: OfferType;
    constructor(id: string, recruiterProfileId: string, title: string, description: string, company: string, location: string, domain: string, isPaid: boolean, workMode: WorkMode, startDate: Date, endDate: Date, skillRequirements: SkillRequirement[], type: OfferType, createdAt?: Date, updatedAt?: Date, deletedAt?: Date);
}
