import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { ApplicationStatusChangedEvent } from '../../../../../Domain/events/application-status-changed.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'

@EventsHandler(ApplicationStatusChangedEvent)
export class ApplicationStatusChangedHandler implements IEventHandler<ApplicationStatusChangedEvent> {
    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: ApplicationStatusChangedEvent): Promise<void> {
        const { studentUserId, applicationId, offerTitle, status } = event
        const isAccepted = status === ApplicationStatus.ACCEPTED
        const title = isAccepted ? 'Application Accepted!' : 'Application Update'
        const message = isAccepted
            ? `Congratulations! Your application for "${offerTitle}" has been accepted.`
            : `Your application for "${offerTitle}" has been rejected.`

        const saved = await this.notifRepo.save(new Notification(
            '', studentUserId, 'application-status-changed',
            title, message, '/services/jobmatcher',
            false, new Date(), null,
        ))

        this.notificationEmitter.sendToUser(studentUserId, {
            id: saved.id,
            type: 'application-status-changed',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            applicationId,
            status,
        })
    }
}