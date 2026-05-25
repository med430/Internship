import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs'
import { NotFoundException, ForbiddenException, Inject } from '@nestjs/common'

import { DeleteOfferCommand } from '../delete-offer.command'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import { IApplicationRepository } from '../../../../repositories/application.repository'
import { OfferDeletedEvent } from '../../../../../Domain/events/offer-deleted.event'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'

@CommandHandler(DeleteOfferCommand)
export class DeleteOfferHandler implements ICommandHandler<DeleteOfferCommand> {

    constructor(
        private readonly eventBus: EventBus,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,
    ) {}

    async execute(cmd: DeleteOfferCommand) {

        const offer = await this.offerRepo.findById(cmd.offerId)
        if (!offer || offer.deletedAt) throw new NotFoundException()

        const recruiter = await this.recruiterRepo.findByUserId(cmd.userId)
        if (!recruiter) throw new ForbiddenException()

        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException()
        }

        const activeApplications = await this.appRepo.findByOffer(offer.id)
        const activeIds = activeApplications
            .filter(a => a.status === ApplicationStatus.SUBMITTED || a.status === ApplicationStatus.IN_REVIEW)
            .map(a => a.id)

        offer.deletedAt = new Date()
        offer.updatedAt = new Date()

        const saved = await this.offerRepo.save(offer)

        if (activeIds.length > 0) {
            this.eventBus.publish(new OfferDeletedEvent(offer.id, offer.title, activeIds))
        }

        return saved
    }
}