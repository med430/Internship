import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException, ForbiddenException, Inject } from '@nestjs/common'

import { DeleteOfferCommand } from '../delete-offer.command'
import { IOfferRepository } from '../../../../repositories/offer.repository'

@CommandHandler(DeleteOfferCommand)
export class DeleteOfferHandler implements ICommandHandler<DeleteOfferCommand> {

    constructor(
        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository
    ) {}

    async execute(command: DeleteOfferCommand) {

        const { offerId, userId } = command

        const offer = await this.offerRepo.findById(offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        if (offer.creatorId !== userId) {
            throw new ForbiddenException('Not allowed')
        }

        // 🔥 soft delete via repo
        await this.offerRepo.softDelete(offerId)

        return { success: true }
    }
}