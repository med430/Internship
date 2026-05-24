import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateOfferCommand } from '../update-offer.command';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
export declare class UpdateOfferHandler implements ICommandHandler<UpdateOfferCommand> {
    private readonly offerRepo;
    private readonly skillRepo;
    private readonly recruiterRepo;
    constructor(offerRepo: IOfferRepository, skillRepo: ISkillRepository, recruiterRepo: IRecruiterProfileRepository);
    execute(cmd: UpdateOfferCommand): Promise<import("../../../../../Domain/entities/offer.entity").Offer>;
}
