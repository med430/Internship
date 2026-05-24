import { ICommandHandler } from '@nestjs/cqrs';
import { IExperienceRepository } from "../../../../repositories/experience.repository";
import { DeleteExperienceCommand } from "../delete-experience.command";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class DeleteExperienceHandler implements ICommandHandler<DeleteExperienceCommand> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: IExperienceRepository, studentRepo: IStudentProfileRepository);
    execute(cmd: DeleteExperienceCommand): Promise<{
        message: string;
    }>;
}
