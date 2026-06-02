import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject, Logger } from '@nestjs/common'
import { RecommendationsRecomputedEvent } from '../../../../../Domain/events/recommendations-recomputed.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { IUserRepository } from '../../../../repositories/user.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'
import { Role } from '../../../../../Domain/enums/role.enum'

@EventsHandler(RecommendationsRecomputedEvent)
export class RecommendationsRecomputedHandler implements IEventHandler<RecommendationsRecomputedEvent> {
    private readonly logger = new Logger(RecommendationsRecomputedHandler.name)

    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
    ) {}

    async handle(event: RecommendationsRecomputedEvent): Promise<void> {
        const studentUserIds = [...new Set(event.studentUserIds)].filter(Boolean)

        for (const studentUserId of studentUserIds) {
            try {
                // Only students receive recommendation notifications
                const user = await this.userRepo.findById(studentUserId)
                if (!user || user.role !== Role.STUDENT) continue

                const saved = await this.notifRepo.save(new Notification(
                    '',
                    studentUserId,
                    'recommendations-recomputed',
                    'Recommendations refreshed',
                    'Your job matches were updated. Open Job Matcher to see the latest ranking.',
                    '/services/jobmatcher',
                    false,
                    event.recomputedAt,
                    null,
                ))

                this.notificationEmitter.sendToUser(studentUserId, {
                    id: saved.id,
                    type: 'recommendations-recomputed',
                    title: saved.title,
                    message: saved.message,
                    link: saved.link,
                    offersConsidered: event.offersConsidered,
                    pairsWritten: event.pairsWritten,
                    trigger: event.trigger,
                    recomputedAt: event.recomputedAt.toISOString(),
                })
            } catch (err) {
                this.logger.warn(
                    `failed to notify student ${studentUserId} after recommendation recompute: ${(err as Error).message}`,
                )
            }
        }
    }
}
