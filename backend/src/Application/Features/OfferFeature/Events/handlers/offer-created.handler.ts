import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { OfferCreatedEvent } from '../../../../../Domain/events/offer-created.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@EventsHandler(OfferCreatedEvent)
export class OfferCreatedHandler implements IEventHandler<OfferCreatedEvent> {
    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: OfferCreatedEvent): Promise<void> {
        const { offerId, offerTitle, domain } = event
        const students = await this.studentRepo.findByDomain(domain)

        for (const student of students) {
            const saved = await this.notifRepo.save(new Notification(
                '', student.userId,
                'new-offer-in-domain',
                'New Offer Matching Your Interests',
                `A new offer "${offerTitle}" is available in ${domain}.`,
                '/services/jobmatcher',
                false, new Date(), null,
            ))

            this.notificationEmitter.sendToUser(student.userId, {
                id: saved.id,
                type: 'new-offer-in-domain',
                title: saved.title,
                message: saved.message,
                link: saved.link,
                offerId,
            })
        }
    }
}
