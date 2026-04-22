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

    async execute(command: DeleteOfferCommand) {

        const { offerId, userId } = command

        const offer = await this.offerRepo.findById(offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        // 🔐 récupérer recruiter profile
        const recruiterProfile = await this.recruiterRepo.findByUserId(userId)

        if (!recruiterProfile) {
            throw new ForbiddenException('No recruiter profile')
        }

        if (offer.recruiterProfileId !== recruiterProfile.id) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 soft delete
        await this.offerRepo.softDelete(offerId)

        return { success: true }
    }
}