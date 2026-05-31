import { Injectable } from '@nestjs/common'
import { OfferView as PrismaOfferView } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { OfferView } from '../../../../Domain/entities/offer-view.entity'

@Injectable()
export class OfferViewMapper implements IGenericMapper<OfferView, PrismaOfferView> {
    toDomain(raw: PrismaOfferView): OfferView {
        return new OfferView(
            raw.id,
            raw.studentId,
            raw.offerId,
            raw.viewedAt,
            raw.durationMs ?? undefined,
            raw.source ?? undefined,
            raw.position ?? undefined,
        )
    }

    toPersistence(domain: OfferView): PrismaOfferView {
        return {
            id:         domain.id,
            studentId:  domain.studentId,
            offerId:    domain.offerId,
            viewedAt:   domain.viewedAt,
            durationMs: domain.durationMs ?? null,
            source:     domain.source ?? null,
            position:   domain.position ?? null,
        }
    }
}
