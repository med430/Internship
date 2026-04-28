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
// offer.repository.ts (impl)
@Injectable()
export class OfferRepositoryImpl
    extends GenericRepository<Offer, any>
    implements IOfferRepository {

    protected readonly includeOptions = {
        skillRequirements: {
            include: { skill: true }
        }
    }

    constructor(prisma: PrismaService, mapper: OfferMapper) {
        super(prisma, 'offer', mapper)
    }

    // ← surcharge save pour gérer create ET update
    async save(entity: Offer): Promise<Offer> {
        const { skillRequirements, ...data } = this.mapper.toPersistence(entity)

        const result = await this.prisma.offer.upsert({
            where:  { id: entity.id },
            create: { ...data, skillRequirements },
            update: {
                ...data,
                skillRequirements: {
                    deleteMany: { offerId: entity.id },
                    create:     skillRequirements.create,
                }
            },
            include: this.includeOptions
        })

        return this.mapper.toDomain(result)
    }

    async findById(id: string): Promise<Offer | null> {
        const result = await this.prisma.offer.findUnique({
            where:   { id },
            include: this.includeOptions
        })
        return result ? this.mapper.toDomain(result) : null
    }

    async findAll(): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where:   { deletedAt: null },
            include: this.includeOptions
        })
        return results.map(r => this.mapper.toDomain(r))
    }

    async findByRecruiter(recruiterId: string): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where:   { recruiterProfileId: recruiterId, deletedAt: null },
            include: this.includeOptions
        })
        return results.map(r => this.mapper.toDomain(r))
    }
}