import { ICommandHandler } from "@nestjs/cqrs";
import { AssignSkillCommand } from "../assign-skill.command";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { ISkillAssignmentRepository } from "../../../../repositories/skill-assignment.repository";
import { ISkillRepository } from '../../../../repositories/skill.repository';
import { SkillAssignment } from "../../../../../Domain/entities/skill-assignment.entity";
export declare class AssignSkillHandler implements ICommandHandler<AssignSkillCommand> {
    private readonly studentRepo;
    private readonly skillRepo;
    private readonly skillRepository;
    constructor(studentRepo: IStudentProfileRepository, skillRepo: ISkillAssignmentRepository, skillRepository: ISkillRepository);
    execute(command: AssignSkillCommand): Promise<SkillAssignment>;
}
