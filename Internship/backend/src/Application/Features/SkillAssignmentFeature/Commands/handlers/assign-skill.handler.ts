import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AssignSkillCommand} from "../assign-skill.command";
import {BadRequestException, Inject, NotFoundException} from "@nestjs/common";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {ISkillAssignmentRepository} from "../../../../repositories/skill-assignment.repository";
import {randomUUID} from "crypto";
@CommandHandler(AssignSkillCommand)
export class AssignSkillHandler implements ICommandHandler<AssignSkillCommand> {

    constructor(
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(ISkillAssignmentRepository)
        private readonly skillRepo: ISkillAssignmentRepository
    ) {}

    async execute(command: AssignSkillCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const exists = await this.skillRepo.findByStudentAndSkill(
            profile.id,
            command.skillId
        )

        if (exists) {
            throw new BadRequestException('Skill already assigned')
        }

        return this.skillRepo.create({
            id: randomUUID(),
            studentProfileId: profile.id,
            skillId: command.skillId,
            level: command.level
        })
    }
}