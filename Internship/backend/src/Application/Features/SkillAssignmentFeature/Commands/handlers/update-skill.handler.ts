import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AssignSkillCommand} from "../assign-skill.command";
import {BadRequestException, ForbiddenException, Inject, NotFoundException} from "@nestjs/common";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {SkillAssignmentRepository} from "../../../../repositories/skill-assignment.repository";
import { UpdateSkillCommand } from "../update-skill.command";
@CommandHandler(UpdateSkillCommand)
export class UpdateSkillHandler implements ICommandHandler<UpdateSkillCommand> {

    constructor(
        @Inject(SkillAssignmentRepository)
        private readonly skillRepo: SkillAssignmentRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: UpdateSkillCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const skill = await this.skillRepo.findById(command.assignmentId)
        if (!skill) throw new NotFoundException()

        // 🔐 ownership check
        if (skill.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        return this.skillRepo.updateLevel(
            command.assignmentId,
            command.level
        )
    }
}