import { ICommandHandler } from '@nestjs/cqrs';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { Offer } from '../../../../../Domain/entities/offer.entity';
import { CreateOfferCommand } from "../create-offer.command";
export declare class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {
    private readonly offerRepo;
    private readonly skillRepo;
    private readonly recruiterRepo;
    constructor(offerRepo: IOfferRepository, skillRepo: ISkillRepository, recruiterRepo: IRecruiterProfileRepository);
    execute(cmd: CreateOfferCommand): Promise<Offer>;
}
