import { RecruiterProfile as PrismaRecruiterProfile, Offer as PrismaOffer, SkillRequirement as PrismaSkillRequirement, Skill as PrismaSkill } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { RecruiterProfile } from '../../../../Domain/entities/recruiter-profile.entity';
type PrismaOfferFull = PrismaOffer & {
    skillRequirements: (PrismaSkillRequirement & {
        skill: PrismaSkill;
    })[];
};
type PrismaRecruiterProfileFull = PrismaRecruiterProfile & {
    offers: PrismaOfferFull[];
};
export declare class RecruiterProfileMapper implements IGenericMapper<RecruiterProfile, PrismaRecruiterProfileFull> {
    toDomain(raw: PrismaRecruiterProfileFull): RecruiterProfile;
    toPersistence(domain: RecruiterProfile): {
        id: string;
        userId: string;
        company: string;
        companyDescription: string | null;
        website: string | null;
    };
}
export {};
