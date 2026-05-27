import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'

import { GetMySubscriptionQuery } from '../get-my-subscription.query'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { ISubscriptionRepository } from '../../../../repositories/subscription.repository'
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
    ) {}

    async execute(query: GetMySubscriptionQuery): Promise<SubscriptionStatusResult> {
        const profile = await this.profileRepo.findByUserId(query.userId)
        if (!profile) return { type: SubscriptionType.FREE }

        const subscription = await this.subscriptionRepo.findByStudentProfileId(profile.id)
        return { type: subscription?.type ?? SubscriptionType.FREE }
    }
}
