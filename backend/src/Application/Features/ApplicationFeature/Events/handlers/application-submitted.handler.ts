import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { ApplicationSubmittedEvent } from '../../../../../Domain/events/application-submitted.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@EventsHandler(ApplicationSubmittedEvent)
export class ApplicationSubmittedHandler implements IEventHandler<ApplicationSubmittedEvent> {
    constructor(
        private readonly sseService: SseService,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: ApplicationSubmittedEvent): Promise<void> {
        const { recruiterUserId, applicationId, offerTitle } = event

        const saved = await this.notifRepo.save(new Notification(
            '', recruiterUserId,
            'application-submitted',
            'New Application Received',
            `A new candidate applied to "${offerTitle}".`,
            '/services/admin',
            false, new Date(), null,
        ))

        this.sseService.sendToUser(recruiterUserId, {
            id: saved.id,
            type: 'application-submitted',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            applicationId,
        })
    }
}
