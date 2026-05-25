import { Injectable } from '@nestjs/common'
import { OfferBookmark as PrismaOfferBookmark } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { OfferBookmark } from '../../../../Domain/entities/offer-bookmark.entity'

@Injectable()
export class OfferBookmarkMapper implements IGenericMapper<OfferBookmark, PrismaOfferBookmark> {
    toDomain(raw: PrismaOfferBookmark): OfferBookmark {
        return new OfferBookmark(
            raw.id,
            raw.studentId,
            raw.offerId,
            raw.createdAt,
            raw.removedAt ?? undefined,
        )
    }

    toPersistence(domain: OfferBookmark): PrismaOfferBookmark {
        return {
            id:        domain.id,
            studentId: domain.studentId,
            offerId:   domain.offerId,
            createdAt: domain.createdAt,
            removedAt: domain.removedAt ?? null,
        }
    }
}
