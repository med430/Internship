import { OfferType } from '../../../../Domain/enums/offer-type.enum';
import { WorkMode } from '../../../../Domain/enums/workMode';
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum';
declare class SkillRequirementDTO {
    skillId: number;
    level: SkillLevel;
}
export declare class CreateOfferDTO {
    title: string;
    description: string;
    company: string;
    location: string;
    domain: string;
    isPaid: boolean;
    workMode: WorkMode;
    startDate: string;
    endDate: string;
    type: OfferType;
    requiredSkills: SkillRequirementDTO[];
}
export {};
