import { ICommandHandler } from "@nestjs/cqrs";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { ISkillAssignmentRepository } from "../../../../repositories/skill-assignment.repository";
import { RemoveSkillCommand } from "../remove-skill.command";
export declare class RemoveSkillHandler implements ICommandHandler<RemoveSkillCommand> {
    private readonly skillRepo;
    private readonly studentRepo;
    constructor(skillRepo: ISkillAssignmentRepository, studentRepo: IStudentProfileRepository);
    execute(command: RemoveSkillCommand): Promise<{
        message: string;
    }>;
}
