import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { OfferDeletedEvent } from '../../../../../Domain/events/offer-deleted.event'
import { INotificationEmitter } from '../../../../Services/NotificationEmitter/notification-emitter.interface'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@EventsHandler(OfferDeletedEvent)
export class OfferDeletedHandler implements IEventHandler<OfferDeletedEvent> {
    constructor(
        @Inject(INotificationEmitter)
        private readonly notificationEmitter: INotificationEmitter,
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
        @Inject(INotificationRepository)
        private readonly notifRepo: INotificationRepository,
    ) {}

    async handle(event: OfferDeletedEvent): Promise<void> {
        const { offerId, offerTitle } = event
        const applications = await this.appRepo.findByOffer(offerId)

        for (const application of applications) {
            const student = await this.studentRepo.findById(application.studentId)
            if (!student) continue

            const saved = await this.notifRepo.save(new Notification(
                '', student.userId,
                'offer-deleted',
                'Offer No Longer Available',
                `The offer "${offerTitle}" has been removed by the recruiter.`,
                '/services/jobmatcher',
                false, new Date(), null,
            ))

            this.notificationEmitter.sendToUser(student.userId, {
                id: saved.id,
                type: 'offer-deleted',
                title: saved.title,
                message: saved.message,
                link: saved.link,
                offerId,
                applicationId: application.id,
            })
        }
    }
}
