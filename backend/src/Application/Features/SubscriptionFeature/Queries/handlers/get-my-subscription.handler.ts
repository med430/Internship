import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'

import { GetMySubscriptionQuery } from '../get-my-subscription.query'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { ISubscriptionRepository } from '../../../../repositories/subscription.repository'
import { PrismaService } from '../../../../../Infrastructure/Persistence/prisma/prisma.service'
import { SubscriptionType } from '../../../../../Domain/enums/subscription-type.enum'

export interface SubscriptionStatusResult {
    type: SubscriptionType
}

@QueryHandler(GetMySubscriptionQuery)
export class GetMySubscriptionHandler implements IQueryHandler<GetMySubscriptionQuery, SubscriptionStatusResult> {

    constructor(
        @Inject(IStudentProfileRepository)
        private readonly profileRepo: IStudentProfileRepository,

        @Inject(ISubscriptionRepository)
        private readonly subscriptionRepo: ISubscriptionRepository,

        private readonly prisma: PrismaService,
    ) {}

    async execute(query: GetMySubscriptionQuery): Promise<SubscriptionStatusResult> {
        const publicProfile = await this.prisma.publicSessionProfile.findUnique({
            where: { sessionKey: query.userId },
            select: { subscription: true, subscriptionEndDate: true },
        })

        if (this.isLegacyPremium(publicProfile?.subscription, publicProfile?.subscriptionEndDate)) {
            return { type: SubscriptionType.PAID }
        }

        const profile = await this.profileRepo.findByUserId(query.userId)
        if (!profile) return { type: SubscriptionType.FREE }

        try {
            const subscription = await this.subscriptionRepo.findByStudentProfileId(profile.id)
            if (subscription?.type === SubscriptionType.PAID) {
                return { type: SubscriptionType.PAID }
            }
        } catch {
            // Legacy installs do not have the Stripe-backed subscription table yet.
        }

        return { type: SubscriptionType.FREE }
    }

    private isLegacyPremium(
        subscription?: string | null,
        subscriptionEndDate?: Date | null,
    ): boolean {
        if (subscription !== 'Achiever' && subscription !== 'Expert') {
            return false
        }

        if (!subscriptionEndDate) {
            return true
        }

        return subscriptionEndDate.getTime() > Date.now()
    }
}
