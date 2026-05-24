import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteOfferCommand } from '../delete-offer.command';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
export declare class DeleteOfferHandler implements ICommandHandler<DeleteOfferCommand> {
    private readonly offerRepo;
    private readonly recruiterRepo;
    constructor(offerRepo: IOfferRepository, recruiterRepo: IRecruiterProfileRepository);
    execute(cmd: DeleteOfferCommand): Promise<import("../../../../../Domain/entities/offer.entity").Offer>;
}
