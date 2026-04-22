import { Offer as OfferDB } from '@prisma/client'
import { Offer } from '../../../../Domain/entities/offer.entity'
import { IGenericMapper } from './generic.mapper'
import { OfferType as PrismaOfferType } from '@prisma/client'
import { OfferType as DomainOfferType } from '../../../../Domain/enums/offer-type.enum'

export class OfferPrismaMapper implements IGenericMapper<Offer, OfferDB> {

    toDomain(entity: OfferDB): Offer {
        return new Offer(
            entity.id,
            entity.creatorId,
            entity.title,
            entity.description,
            entity.company,
            entity.location,
            entity.domain,
            entity.startDate,
            entity.endDate,
            [],
            entity.type as unknown as DomainOfferType,
            entity.createdAt,
            entity.updatedAt ?? undefined,      // 🔥 FIX
            entity.deletedAt ?? undefined       // 🔥 FIX
        )
    }
    toPersistence(entity: Offer): OfferDB {
        return {
            id: entity.id,
            creatorId: entity.creatorId,
            title: entity.title,
            description: entity.description,
            company: entity.company,
            location: entity.location,
            domain: entity.domain,
            startDate: entity.startDate,
            endDate: entity.endDate,
            type: entity.type as unknown as PrismaOfferType, // 🔥 FIX
            createdAt: entity.createdAt!,
            updatedAt: entity.updatedAt!,
            deletedAt: entity.deletedAt ?? null
        } as OfferDB
    }
}