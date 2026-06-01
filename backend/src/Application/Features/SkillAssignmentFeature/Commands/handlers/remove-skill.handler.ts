import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AssignSkillCommand} from "../assign-skill.command";
import {BadRequestException, ForbiddenException, Inject, NotFoundException} from "@nestjs/common";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {ISkillAssignmentRepository} from "../../../../repositories/skill-assignment.repository";
import { UpdateSkillCommand } from "../update-skill.command";
import {RemoveSkillCommand} from "../remove-skill.command";
@CommandHandler(RemoveSkillCommand)
export class RemoveSkillHandler implements ICommandHandler<RemoveSkillCommand> {

    constructor(
        @Inject(ISkillAssignmentRepository)
        private readonly skillRepo: ISkillAssignmentRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: RemoveSkillCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const skill = await this.skillRepo.findById(command.assignmentId)
        if (!skill) throw new NotFoundException()

        if (skill.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        await this.skillRepo.delete(command.assignmentId)
        // Bump StudentProfile.updatedAt so the embedding worker re-syncs this student.
        await this.studentRepo.update(profile)

        return { message: 'Skill removed' }
    }
}