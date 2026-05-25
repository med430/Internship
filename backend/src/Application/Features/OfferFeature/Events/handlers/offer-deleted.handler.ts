import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { OfferDeletedEvent } from '../../../../../Domain/events/offer-deleted.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@EventsHandler(OfferDeletedEvent)
export class OfferDeletedHandler implements IEventHandler<OfferDeletedEvent> {

    constructor(
        private readonly sseService: SseService,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async handle(event: OfferDeletedEvent): Promise<void> {
        const { offerId, offerTitle } = event

        const applications = await this.appRepo.findByOffer(offerId)

        for (const application of applications) {
            const student = await this.studentRepo.findById(application.studentId)
            if (!student) continue

            this.sseService.sendToUser(student.userId, {
                type: 'offer-deleted',
                title: 'Offer No Longer Available',
                message: `The offer "${offerTitle}" has been removed by the recruiter.`,
                offerId,
                applicationId: application.id,
            })
        }
    }
}
