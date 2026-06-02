import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { InterviewSlotRespondedEvent } from '../../../../../Domain/events/interview-slot-responded.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'
import { InterviewSlotStatus } from '../../../../../Domain/enums/interview-slot-status.enum'
import { EmailService, buildConfirmationEmail } from '../../../../Services/EmailService/email.service'

@EventsHandler(InterviewSlotRespondedEvent)
export class InterviewSlotRespondedHandler implements IEventHandler<InterviewSlotRespondedEvent> {
    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
        private readonly emailService: EmailService,
    ) {}

    async handle(event: InterviewSlotRespondedEvent): Promise<void> {
        const { recipientUserId, slotId, status, offerTitle, startAt, endAt,
                studentEmail, studentName, recruiterEmail, recruiterName } = event

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

        this.notificationEmitter.sendToUser(recipientUserId, {
            id: saved.id,
            type: 'interview-slot-responded',
            title: saved.title,
            message: saved.message,
            link: saved.link,
            slotId,
            status,
        })

        if (isConfirmed && startAt && endAt) {
            const emailOpts = { offerTitle, startAt, endAt }
            const subject = `✅ Entretien confirmé — ${offerTitle}`

            if (studentEmail) {
                const html = buildConfirmationEmail({ recipientName: studentName ?? 'Candidat', role: 'student', ...emailOpts })
                await this.emailService.send(studentEmail, subject, html)
            }
            if (recruiterEmail) {
                const html = buildConfirmationEmail({ recipientName: recruiterName ?? 'Recruteur', role: 'recruiter', ...emailOpts })
                await this.emailService.send(recruiterEmail, subject, html)
            }
        }
    }
}
