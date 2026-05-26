import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { OfferImpressionMapper } from '../mappers/offer-impression.mapper'
import { IOfferImpressionRepository } from '../../../../Application/repositories/offer-impression.repository'
import { OfferImpression } from '../../../../Domain/entities/offer-impression.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class OfferImpressionRepositoryImpl
    extends GenericRepository<OfferImpression, any>
    implements IOfferImpressionRepository {

    constructor(prisma: PrismaService, mapper: OfferImpressionMapper) {
        super(prisma, 'offerImpression', mapper)
    }

    async createBatch(impressions: OfferImpression[]): Promise<number> {
        if (impressions.length === 0) return 0
        const result = await this.prisma.offerImpression.createMany({
            data: impressions.map(i => ({
                id:        i.id,
                studentId: i.studentId,
                offerId:   i.offerId,
                shownAt:   i.shownAt,
                position:  i.position ?? null,
            })),
            skipDuplicates: true,
        })
        return result.count
    }

    async deleteOlderThan(cutoff: Date): Promise<number> {
        const result = await this.prisma.offerImpression.deleteMany({
            where: { shownAt: { lt: cutoff } },
        })
        return result.count
    }
}
