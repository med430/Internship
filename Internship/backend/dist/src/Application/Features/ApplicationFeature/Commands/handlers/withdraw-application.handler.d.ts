import { ICommandHandler } from '@nestjs/cqrs';
import { WithdrawApplicationCommand } from '../withdraw-application.command';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { IApplicationRepository } from "../../../../repositories/application.repository";
export declare class WithdrawApplicationHandler implements ICommandHandler<WithdrawApplicationCommand> {
    private readonly appRepo;
    private readonly studentRepo;
    constructor(appRepo: IApplicationRepository, studentRepo: IStudentProfileRepository);
    execute(command: WithdrawApplicationCommand): Promise<import("../../../../../Domain/entities/application.entity").Application>;
}
