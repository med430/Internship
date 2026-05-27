import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { ApplicationWithdrawnEvent } from '../../../../../Domain/events/application-withdrawn.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@EventsHandler(ApplicationWithdrawnEvent)
export class ApplicationWithdrawnHandler implements IEventHandler<ApplicationWithdrawnEvent> {
    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: ApplicationWithdrawnEvent): Promise<void> {
        const { recruiterUserId, applicationId, offerTitle } = event

        const saved = await this.notifRepo.save(new Notification(
            '', recruiterUserId,
            'application-withdrawn',
            'Application Withdrawn',
            `A candidate withdrew their application for "${offerTitle}".`,
            '/services/admin',
            false, new Date(), null,
        ))

        this.notificationEmitter.sendToUser(recruiterUserId, {
            id: saved.id,
            type: 'application-withdrawn',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            applicationId,
        })
    }
}
