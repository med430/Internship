import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { InterviewSlotProposedEvent } from '../../../../../Domain/events/interview-slot-proposed.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@EventsHandler(InterviewSlotProposedEvent)
export class InterviewSlotProposedHandler implements IEventHandler<InterviewSlotProposedEvent> {
    constructor(
        private readonly sseService: SseService,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: InterviewSlotProposedEvent): Promise<void> {
        const { recipientUserId, slotId, offerTitle, startAt } = event

        const dateStr = new Date(startAt).toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        const title = 'Interview date proposed'
        const message = `A new interview date has been proposed for "${offerTitle}" on ${dateStr}`

        const saved = await this.notifRepo.save(new Notification(
            '', recipientUserId, 'interview-slot-proposed',
            title, message, '/services/calendar',
            false, new Date(), null,
        ))

        this.sseService.sendToUser(recipientUserId, {
            id: saved.id,
            type: 'interview-slot-proposed',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            slotId,
        })
    }
}
