import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { InterviewSlotRespondedEvent } from '../../../../../Domain/events/interview-slot-responded.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'
import { InterviewSlotStatus } from '../../../../../Domain/enums/interview-slot-status.enum'

@EventsHandler(InterviewSlotRespondedEvent)
export class InterviewSlotRespondedHandler implements IEventHandler<InterviewSlotRespondedEvent> {
    constructor(
        private readonly sseService: SseService,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: InterviewSlotRespondedEvent): Promise<void> {
        const { recipientUserId, slotId, status, offerTitle } = event

        const isConfirmed = status === InterviewSlotStatus.CONFIRMED
        const title = isConfirmed ? 'Interview confirmed!' : 'Interview date declined'
        const message = isConfirmed
            ? `The candidate confirmed the interview for "${offerTitle}"`
            : `The candidate declined the proposed date for "${offerTitle}" and may have sent a counter-proposal`

        const saved = await this.notifRepo.save(new Notification(
            '', recipientUserId, 'interview-slot-responded',
            title, message, '/services/calendar',
            false, new Date(), null,
        ))

        this.sseService.sendToUser(recipientUserId, {
            id: saved.id,
            type: 'interview-slot-responded',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            slotId,
            status,
        })
    }
}