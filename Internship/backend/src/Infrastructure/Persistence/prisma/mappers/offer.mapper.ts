import { IGenericMapper } from './generic.mapper';
import { Offer as OfferDomain } from '../../../../Domain/entities/offer.entity';
import { Offer as OfferDB } from '@prisma/client';
import { OfferType } from '../../../../Domain/enums/offer-type.enum';
import { SkillAssignment } from '../../../../Domain/entities/skill-assignment.entity';

export class OfferPrismaMapper implements IGenericMapper<OfferDomain, OfferDB> {
  toDomain(offer: OfferDB): OfferDomain {
    return new OfferDomain(
      offer.id,

      '', // ⚠️ creatorId (not in DB yet)

      offer.title,
      offer.description,

      '', // company (not in DB yet)
      '', // location (not in DB yet)
      '', // domain (not in DB yet)

      new Date(), // startDate (placeholder)
      new Date(), // endDate (placeholder)

      [] as SkillAssignment[], // requiredSkills

      offer.type as OfferType,

      offer.createdAt,
      offer.updatedAt,
      offer.deletedAt ?? undefined,
    );
  }

  toPersistence(domain: OfferDomain): OfferDB {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      type: domain.type,

      createdAt: domain.createdAt as Date,
      updatedAt: domain.updatedAt as Date,
      deletedAt: domain.deletedAt as Date | null,
    } as OfferDB;
  }
}
