import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { CancelSubscriptionCommand } from '../cancel-subscription.command'
import { ISubscriptionRepository } from '../../../../repositories/subscription.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { Subscription } from '../../../../../Domain/entities/subscription.entity'
import { SubscriptionType } from '../../../../../Domain/enums/subscription-type.enum'

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {

    constructor(
        @Inject(IStudentProfileRepository)
        private readonly profileRepo: IStudentProfileRepository,

        @Inject(ISubscriptionRepository)
        private readonly subscriptionRepo: ISubscriptionRepository,
    ) {}

    async execute(command: CancelSubscriptionCommand): Promise<Subscription> {
        const { userId } = command

        const profile = await this.profileRepo.findByUserId(userId)
        if (!profile) throw new NotFoundException(`No student profile found for user ${userId}`)

        const existing = await this.subscriptionRepo.findByStudentProfileId(profile.id)

        const subscription = new Subscription(
            existing?.id ?? randomUUID(),
            profile.id,
            SubscriptionType.FREE,
        )

        return this.subscriptionRepo.save(subscription)
    }
}
