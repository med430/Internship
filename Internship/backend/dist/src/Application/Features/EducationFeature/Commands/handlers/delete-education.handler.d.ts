import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteEducationCommand } from "../delete-education.command";
import { IEducationRepository } from "../../../../repositories/education.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class DeleteEducationHandler implements ICommandHandler<DeleteEducationCommand> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: IEducationRepository, studentRepo: IStudentProfileRepository);
    execute(cmd: DeleteEducationCommand): Promise<{
        message: string;
    }>;
}
