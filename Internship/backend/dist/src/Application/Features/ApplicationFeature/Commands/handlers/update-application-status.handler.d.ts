import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateApplicationStatusCommand } from '../update-application-status.command';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { IApplicationRepository } from "../../../../repositories/application.repository";
export declare class UpdateApplicationStatusHandler implements ICommandHandler<UpdateApplicationStatusCommand> {
    private readonly appRepo;
    private readonly offerRepo;
    private readonly recruiterRepo;
    constructor(appRepo: IApplicationRepository, offerRepo: IOfferRepository, recruiterRepo: IRecruiterProfileRepository);
    execute(command: UpdateApplicationStatusCommand): Promise<import("../../../../../Domain/entities/application.entity").Application>;
}
