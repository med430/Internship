import { ICommandHandler } from '@nestjs/cqrs';
import { ApplyToOfferCommand } from '../apply-offer.command';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { IApplicationRepository } from '../../../../repositories/application.repository';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { Application } from '../../../../../Domain/entities/application.entity';
import { ICoverLetterRepository } from "../../../../repositories/coverletter.repository";
import { ICVRepository } from "../../../../repositories/cv.repository";
export declare class ApplyToOfferHandler implements ICommandHandler<ApplyToOfferCommand> {
    private readonly appRepo;
    private readonly offerRepo;
    private readonly studentRepo;
    private readonly cvRepo;
    private readonly letterRepo;
    constructor(appRepo: IApplicationRepository, offerRepo: IOfferRepository, studentRepo: IStudentProfileRepository, cvRepo: ICVRepository, letterRepo: ICoverLetterRepository);
    execute(command: ApplyToOfferCommand): Promise<Application>;
}
