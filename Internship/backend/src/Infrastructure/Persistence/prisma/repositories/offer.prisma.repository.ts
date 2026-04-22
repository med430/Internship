import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { GenericRepository } from './generic.repositories'
import { Offer } from '../../../../Domain/entities/offer.entity'
import { Offer as OfferDB } from '@prisma/client'
import { OfferPrismaMapper } from '../mappers/offer.mapper'
import { IOfferRepository } from '../../../../Application/repositories/offer.repository'

@Injectable()
export class OfferRepository
    extends GenericRepository<Offer, OfferDB>
    implements IOfferRepository
{
    constructor(
        prisma: PrismaService,
        mapper: OfferPrismaMapper
    ) {
        super(prisma, 'offer', mapper)
    }

    async findByCreator(creatorId: string): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where: { creatorId, deletedAt: null }
        })

        return results.map(r => this.mapper.toDomain(r))
    }
    async update(offer: Offer): Promise<Offer> {
        const data = this.mapper.toPersistence(offer)

        const result = await this.prisma.offer.update({
            where: { id: offer.id },
            data,
        })

        return this.mapper.toDomain(result)
    }
    async softDelete(id: string): Promise<void> {
        await this.prisma.offer.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })
    }
}