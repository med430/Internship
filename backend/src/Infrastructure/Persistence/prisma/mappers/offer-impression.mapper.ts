import { Injectable } from '@nestjs/common'
import { OfferImpression as PrismaOfferImpression } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { OfferImpression } from '../../../../Domain/entities/offer-impression.entity'

@Injectable()
export class OfferImpressionMapper implements IGenericMapper<OfferImpression, PrismaOfferImpression> {
    toDomain(raw: PrismaOfferImpression): OfferImpression {
        return new OfferImpression(
            raw.id,
            raw.studentId,
            raw.offerId,
            raw.shownAt,
            raw.position ?? undefined,
        )
    }

    toPersistence(domain: OfferImpression): PrismaOfferImpression {
        return {
            id:        domain.id,
            studentId: domain.studentId,
            offerId:   domain.offerId,
            shownAt:   domain.shownAt,
            position:  domain.position ?? null,
        }
    }
}
