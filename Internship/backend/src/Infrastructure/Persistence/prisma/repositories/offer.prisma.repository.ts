import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { GenericRepository } from './generic.repositories'
import { Offer } from '../../../../Domain/entities/offer.entity'
import { Offer as OfferDB } from '@prisma/client'
import { OfferPrismaMapper } from '../mappers/offer.mapper'
import { IOfferRepository } from '../../../../Application/repositories/offer.repository'
@Injectable()
export class OfferRepository
    extends GenericRepository<Offer, any>
    implements IOfferRepository
{
    constructor(
        protected readonly prisma: PrismaService,
        protected readonly mapper: OfferPrismaMapper
    ) {
        super(prisma, 'offer', mapper)
    }

    async save(entity: Offer): Promise<Offer> {
        const data = this.mapper.toPersistence(entity)

        const result = await this.prisma.offer.create({
            data: {
                ...data,

                skillRequirements: {
                    create: entity.skillRequirements.map(rs => ({
                        level: rs.level,
                        skill: {
                            connect: { id: rs.skill.id },
                        },
                    })),
                },
            },

            include: {
                skillRequirements: {
                    include: { skill: true },
                },
            },
        })

        return this.mapper.toDomain(result)
    }

    async update(entity: Offer): Promise<Offer> {
        const data = this.mapper.toPersistence(entity)

        const result = await this.prisma.offer.update({
            where: { id: entity.id },

            data: {
                ...data,

                skillRequirements: {
                    deleteMany: {},

                    create: entity.skillRequirements.map(rs => ({
                        level: rs.level,
                        skill: {
                            connect: { id: rs.skill.id },
                        },
                    })),
                },
            },

            include: {
                skillRequirements: {
                    include: { skill: true },
                },
            },
        })

        return this.mapper.toDomain(result)
    }

    async findByRecruiterProfileId(recruiterProfileId: string): Promise<Offer[]> {
        const results = await this.prisma.offer.findMany({
            where: {
                recruiterProfileId,
                deletedAt: null
            },
            include: {
                skillRequirements: {
                    include: { skill: true },
                },
            },
        })

        return results.map(r => this.mapper.toDomain(r))
    }

    async softDelete(id: string): Promise<void> {
        await this.prisma.offer.update({
            where: { id },
            data: { deletedAt: new Date() },
        })
    }
}