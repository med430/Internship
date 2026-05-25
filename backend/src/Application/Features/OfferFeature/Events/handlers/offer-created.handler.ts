import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { OfferCreatedEvent } from '../../../../../Domain/events/offer-created.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@EventsHandler(OfferCreatedEvent)
export class OfferCreatedHandler implements IEventHandler<OfferCreatedEvent> {

    constructor(
        private readonly sseService: SseService,
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async handle(event: OfferCreatedEvent): Promise<void> {
        const { offerId, offerTitle, domain } = event

        const students = await this.studentRepo.findByDomain(domain)

        for (const student of students) {
            this.sseService.sendToUser(student.userId, {
                type: 'new-offer-in-domain',
                title: 'New Offer Matching Your Interests',
                message: `A new offer "${offerTitle}" is available in ${domain}.`,
                offerId,
            })
        }
    }
}