import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { OfferViewMapper } from '../mappers/offer-view.mapper'
import { IOfferViewRepository } from '../../../../Application/repositories/offer-view.repository'
import { OfferView } from '../../../../Domain/entities/offer-view.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class OfferViewRepositoryImpl
    extends GenericRepository<OfferView, any>
    implements IOfferViewRepository {

    constructor(prisma: PrismaService, mapper: OfferViewMapper) {
        super(prisma, 'offerView', mapper)
    }

    async findByStudent(studentId: string, limit = 100): Promise<OfferView[]> {
        const rows = await this.prisma.offerView.findMany({
            where: { studentId },
            orderBy: { viewedAt: 'desc' },
            take: limit,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async findByOffer(offerId: string, limit = 100): Promise<OfferView[]> {
        const rows = await this.prisma.offerView.findMany({
            where: { offerId },
            orderBy: { viewedAt: 'desc' },
            take: limit,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async countByStudentAndOffer(studentId: string, offerId: string): Promise<number> {
        return this.prisma.offerView.count({ where: { studentId, offerId } })
    }

    // Single grouped query — returns a Map keyed by offerId so the re-rank pass can look up counts in O(1).
    async countByStudent(studentId: string): Promise<Map<string, number>> {
        const groups = await this.prisma.offerView.groupBy({
            by: ['offerId'],
            where: { studentId },
            _count: { _all: true },
        })
        return new Map(groups.map(g => [g.offerId, g._count._all]))
    }

    async deleteOlderThan(cutoff: Date): Promise<number> {
        const result = await this.prisma.offerView.deleteMany({
            where: { viewedAt: { lt: cutoff } },
        })
        return result.count
    }
}
