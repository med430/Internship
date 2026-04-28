// infrastructure/mappers/offer.mapper.ts
import { Injectable } from '@nestjs/common'
import {
  Offer as PrismaOffer,
  SkillRequirement as PrismaSkillRequirement,
  Skill as PrismaSkill,
  WorkMode as PrismaWorkMode,   // ← import depuis Prisma
  OfferType as PrismaOfferType, // ← import depuis Prisma
} from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {Offer} from "../../../../Domain/entities/offer.entity";
import {WorkMode} from "../../../../Domain/enums/workMode";
import {SkillRequirement} from "../../../../Domain/entities/skill-requirement";
import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";
import {Skill} from "../../../../Domain/entities/skill.entity";
import {OfferType} from "../../../../Domain/enums/offer-type.enum";

type PrismaOfferFull = PrismaOffer & {
  skillRequirements: (PrismaSkillRequirement & { skill: PrismaSkill })[]
}
import {
SkillLevel as PrismaSkillLevel,
} from '@prisma/client'
@Injectable()
export class OfferMapper implements IGenericMapper<Offer, PrismaOfferFull> {
  toDomain(raw: PrismaOfferFull): Offer {
    return new Offer(
        raw.id,
        raw.recruiterProfileId,
        raw.title,
        raw.description,
        raw.company,
        raw.location,
        raw.domain,
        raw.isPaid,
        raw.workMode as unknown as WorkMode,   // ← double cast
        raw.startDate,
        raw.endDate,
        raw.skillRequirements.map(sr => new SkillRequirement(
            sr.id,
            new Skill(sr.skill.id, sr.skill.name),
            sr.level as unknown as SkillLevel,
        )),
        raw.type as unknown as OfferType,      // ← double cast
        raw.createdAt,
        raw.updatedAt,
        raw.deletedAt ?? undefined,
    )
  }

  toPersistence(domain: Offer) {
    return {
      id:                 domain.id,
      recruiterProfileId: domain.recruiterProfileId,
      title:              domain.title,
      description:        domain.description,
      company:            domain.company,
      location:           domain.location,
      domain:             domain.domain,
      isPaid:             domain.isPaid,
      workMode:           domain.workMode as unknown as PrismaWorkMode,
      startDate:          domain.startDate,
      endDate:            domain.endDate,
      type:               domain.type as unknown as PrismaOfferType,
      deletedAt:          domain.deletedAt ?? null,

      // ← ajouter
      skillRequirements: {
        create: domain.skillRequirements.map(sr => ({
          id:      sr.id,
          skillId: sr.skill.id,
          level:   sr.level as unknown as PrismaSkillLevel,
        }))
      }
    }
  }
}