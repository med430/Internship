// infrastructure/repositories/offer.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { OfferMapper } from '../mappers/offer.mapper'
import {IOfferRepository} from "../../../../Application/repositories/offer.repository";
import {Offer} from "../../../../Domain/entities/offer.entity";
import {GenericRepository} from "./generic.repositories";

const OFFER_INCLUDE = {
    skillRequirements: {
        include: { skill: true }
    }
} as const

@Injectable()
export class OfferRepositoryImpl
    extends GenericRepository<Offer, any>
    implements IOfferRepository {

    constructor(prisma: PrismaService, mapper: OfferMapper) {
        super(prisma, 'offer', mapper)
    }

    async findById(id: string): Promise<Offer | null> {
        const result = await this.prisma.offer.findUnique({
            where: { id },
            include: OFFER_INCLUDE
        })
        return result ? this.mapper.toDomain(result) : null
    }

    async findAll(): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where: { deletedAt: null },
            include: OFFER_INCLUDE
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByRecruiter(recruiterId: string): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where: { recruiterProfileId: recruiterId, deletedAt: null },
            include: OFFER_INCLUDE
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}