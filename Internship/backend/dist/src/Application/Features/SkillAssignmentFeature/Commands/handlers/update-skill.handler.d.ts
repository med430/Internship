import { ICommandHandler } from "@nestjs/cqrs";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { ISkillAssignmentRepository } from "../../../../repositories/skill-assignment.repository";
import { UpdateSkillCommand } from "../update-skill.command";
export declare class UpdateSkillHandler implements ICommandHandler<UpdateSkillCommand> {
    private readonly skillRepo;
    private readonly studentRepo;
    constructor(skillRepo: ISkillAssignmentRepository, studentRepo: IStudentProfileRepository);
    execute(command: UpdateSkillCommand): Promise<import("../../../../../Domain/entities/skill-assignment.entity").SkillAssignment>;
}
