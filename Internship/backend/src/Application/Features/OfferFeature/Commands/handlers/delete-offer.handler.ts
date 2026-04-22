// application/handlers/offer/delete-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import {DeleteOfferCommand} from "../delete-offer.command";
import {IOfferRepository} from "../../../../repositories/offer.repository";
@CommandHandler(DeleteOfferCommand)
export class DeleteOfferHandler implements ICommandHandler<DeleteOfferCommand> {

    constructor(private offerRepo: IOfferRepository) {}

    async execute(command: DeleteOfferCommand) {

        const { offerId, userId } = command

        const offer = await this.offerRepo.findById(offerId)
        if (!offer) throw new NotFoundException('Offer not found')

        if (offer.creatorId !== userId) {
            throw new ForbiddenException('Not allowed')
        }


        offer.deletedAt = new Date()

        return this.offerRepo.save(offer)
    }
}