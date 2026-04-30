import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException, ForbiddenException, Inject } from '@nestjs/common'

import { DeleteOfferCommand } from '../delete-offer.command'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
@CommandHandler(DeleteOfferCommand)
export class DeleteOfferHandler implements ICommandHandler<DeleteOfferCommand> {

    constructor(
        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository
    ) {}

    async execute(cmd: DeleteOfferCommand) {

        const offer = await this.offerRepo.findById(cmd.offerId)
        if (!offer || offer.deletedAt) throw new NotFoundException()

        const recruiter = await this.recruiterRepo.findByUserId(cmd.userId)
        if (!recruiter) throw new ForbiddenException()

        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException()
        }

        offer.deletedAt = new Date()
        offer.updatedAt = new Date()

        return this.offerRepo.save(offer)
    }
}