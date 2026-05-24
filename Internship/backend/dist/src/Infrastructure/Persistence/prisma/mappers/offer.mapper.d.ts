import { Offer as PrismaOffer, SkillRequirement as PrismaSkillRequirement, Skill as PrismaSkill, WorkMode as PrismaWorkMode, OfferType as PrismaOfferType } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Offer } from "../../../../Domain/entities/offer.entity";
type PrismaOfferFull = PrismaOffer & {
    skillRequirements: (PrismaSkillRequirement & {
        skill: PrismaSkill;
    })[];
};
import { SkillLevel as PrismaSkillLevel } from '@prisma/client';
export declare class OfferMapper implements IGenericMapper<Offer, PrismaOfferFull> {
    toDomain(raw: PrismaOfferFull): Offer;
    toPersistence(domain: Offer): {
        id: string;
        recruiterProfileId: string;
        title: string;
        description: string;
        company: string;
        location: string;
        domain: string;
        isPaid: boolean;
        workMode: PrismaWorkMode;
        startDate: Date;
        endDate: Date;
        type: PrismaOfferType;
        deletedAt: Date | null;
        skillRequirements: {
            create: {
                id: string;
                skillId: number;
                level: PrismaSkillLevel;
            }[];
        };
    };
}
export {};
