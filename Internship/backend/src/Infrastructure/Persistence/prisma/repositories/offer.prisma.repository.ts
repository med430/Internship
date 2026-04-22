import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GenericRepository } from './generic.repositories';
import { Offer as OfferDomain } from '../../../../Domain/entities/offer.entity';
import { Offer as OfferDB } from '@prisma/client';
import { OfferPrismaMapper } from '../mappers/offer.mapper';

@Injectable()
export class OfferRepository extends GenericRepository<OfferDomain, OfferDB> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: OfferPrismaMapper,
  ) {
    const modelName: keyof PrismaService = 'offer';
    super(prisma, modelName, mapper);
  }

  // 🔥 custom queries (CQRS READ optimization ready)

  async findByCreator(creatorId: string): Promise<OfferDomain[]> {
    const results = await this.prisma.offer.findMany({
      where: { creatorId },
    });

    return results.map((r) => this.mapper.toDomain(r));
  }

  async findWithApplications(id: string) {
    const result = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        applications: true,
        requiredSkills: true,
      },
    });

    return result ? this.mapper.toDomain(result as any) : null;
  }
}
