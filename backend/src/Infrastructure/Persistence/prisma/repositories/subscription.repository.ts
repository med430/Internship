import { Injectable } from '@nestjs/common'
import { GenericRepository } from './generic.repositories'
import { Subscription } from '../../../../Domain/entities/subscription.entity'
import { ISubscriptionRepository } from '../../../../Application/repositories/subscription.repository'
import { PrismaService } from '../prisma.service'
import { SubscriptionMapper } from '../mappers/subscription.mapper'

@Injectable()
export class SubscriptionRepositoryImpl extends GenericRepository<Subscription, any> implements ISubscriptionRepository {
    constructor(prisma: PrismaService, private readonly subMapper: SubscriptionMapper) {
        super(prisma, 'subscription', subMapper)
    }

    async findByStudentProfileId(studentProfileId: string): Promise<Subscription | null> {
        const result = await (this.prisma['subscription'] as any).findUnique({
            where: { studentId: studentProfileId },
        })
        return result ? this.subMapper.toDomain(result) : null
    }
}