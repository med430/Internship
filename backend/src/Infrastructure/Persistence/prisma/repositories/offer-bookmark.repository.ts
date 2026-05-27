import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { OfferBookmarkMapper } from '../mappers/offer-bookmark.mapper'
import { IOfferBookmarkRepository } from '../../../../Application/repositories/offer-bookmark.repository'
import { OfferBookmark } from '../../../../Domain/entities/offer-bookmark.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class OfferBookmarkRepositoryImpl
    extends GenericRepository<OfferBookmark, any>
    implements IOfferBookmarkRepository {

    constructor(prisma: PrismaService, mapper: OfferBookmarkMapper) {
        super(prisma, 'offerBookmark', mapper)
    }

    async save(entity: OfferBookmark): Promise<OfferBookmark> {
        const result = await this.prisma.offerBookmark.upsert({
            where: { studentId_offerId: { studentId: entity.studentId, offerId: entity.offerId } },
            create: {
                id:        entity.id,
                studentId: entity.studentId,
                offerId:   entity.offerId,
                createdAt: entity.createdAt,
                removedAt: entity.removedAt ?? null,
            },
            update: {
                createdAt: entity.createdAt,
                removedAt: entity.removedAt ?? null,
            },
        })
        return this.mapper.toDomain(result)
    }

    async findActiveByStudent(studentId: string): Promise<OfferBookmark[]> {
        const rows = await this.prisma.offerBookmark.findMany({
            where: { studentId, removedAt: null },
            orderBy: { createdAt: 'desc' },
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async findByStudentAndOffer(studentId: string, offerId: string): Promise<OfferBookmark | null> {
        const row = await this.prisma.offerBookmark.findUnique({
            where: { studentId_offerId: { studentId, offerId } },
        })
        return row ? this.mapper.toDomain(row) : null
    }

    async softRemove(studentId: string, offerId: string): Promise<void> {
        await this.prisma.offerBookmark.updateMany({
            where: { studentId, offerId, removedAt: null },
            data:  { removedAt: new Date() },
        })
    }
}
