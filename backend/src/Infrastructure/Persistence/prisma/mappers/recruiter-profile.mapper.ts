// infrastructure/mappers/recruiter-profile.mapper.ts
import { Injectable } from '@nestjs/common'
import {
    RecruiterProfile as PrismaRecruiterProfile,
    Offer as PrismaOffer,
    SkillRequirement as PrismaSkillRequirement,
    Skill as PrismaSkill,
} from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { SkillRequirement } from '../../../../Domain/entities/skill-requirement'
import { Skill } from '../../../../Domain/entities/skill.entity'
import { OfferType } from '../../../../Domain/enums/offer-type.enum'
import { WorkMode } from '../../../../Domain/enums/workMode'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum'
import { RecruiterProfile } from '../../../../Domain/entities/recruiter-profile.entity'
import { Offer } from '../../../../Domain/entities/offer.entity'

type PrismaOfferFull = PrismaOffer & {
    skillRequirements: (PrismaSkillRequirement & { skill: PrismaSkill })[]
}

type PrismaRecruiterProfileFull = PrismaRecruiterProfile & {
    offers: PrismaOfferFull[]
}

@Injectable()
export class RecruiterProfileMapper implements IGenericMapper<RecruiterProfile, PrismaRecruiterProfileFull> {

    toDomain(raw: PrismaRecruiterProfileFull): RecruiterProfile {
        return new RecruiterProfile(
            raw.id,
            raw.userId,
            raw.company,
            raw.companyDescription ?? undefined,
            raw.website            ?? undefined,
            raw.offers.map(o => new Offer(
                o.id,
                o.recruiterProfileId,
                o.title,
                o.description,
                o.company,
                o.location,
                o.domain,
                o.isPaid,
                o.workMode as unknown as WorkMode,
                o.startDate,
                o.endDate,
                o.skillRequirements.map(sr => new SkillRequirement(
                    sr.id,
                    new Skill(sr.skill.id, sr.skill.name),
                    sr.level as unknown as SkillLevel,
                )),
                o.type as unknown as OfferType,
                o.createdAt,
                o.updatedAt,
                o.deletedAt ?? undefined,
            ))
        )
    }

    toPersistence(domain: RecruiterProfile) {
        return {
            id:                 domain.id,
            userId:             domain.userId,
            company:            domain.company,
            companyDescription: domain.companyDescription ?? null,
            website:            domain.website            ?? null,
        }
    }
}