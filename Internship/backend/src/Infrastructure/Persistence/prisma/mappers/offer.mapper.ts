import { Offer } from '../../../../Domain/entities/offer.entity'
import { SkillAssignment } from '../../../../Domain/entities/skill-assignment.entity'
import { SkillPrismaMapper } from './skill.mapper'
import { Injectable } from '@nestjs/common'
import { IGenericMapper } from './generic.mapper';
import { Offer as Domain } from '../../../../Domain/entities/offer.entity';
import { Offer as DB } from '@prisma/client';

@Injectable()
export class OfferPrismaMapper implements IGenericMapper<Domain, DB> {
  constructor(private skillMapper: SkillPrismaMapper) {}

  toDomain(entity: any): Offer {
    const skillRequirements = entity.skillRequirements
      ? entity.skillRequirements.map(
          (rs) =>
            this.skillMapper.toDomain(rs.skill),
        )
      : [];

    return new Offer(
      entity.id,
      entity.recruiterProfileId, // 🔥 FIX

      entity.title,
      entity.description,

      entity.company,
      entity.location,
      entity.domain,

      entity.startDate,
      entity.endDate,

      skillRequirements,
      entity.type,

      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt ?? undefined,
    );
  }
  toPersistence(entity: Offer) {
    return {
      id: entity.id,

      recruiterProfileId: entity.recruiterProfileId, // 🔥 FIX

      title: entity.title,
      description: entity.description,
      company: entity.company,
      location: entity.location,
      domain: entity.domain,
      startDate: entity.startDate,
      endDate: entity.endDate,
      skillRequirements: entity.skillRequirements,
      type: entity.type,

      createdAt: entity.createdAt,
      updatedAt: new Date(),
      deletedAt: entity.deletedAt ?? null,
    } as unknown as DB;
  }
}