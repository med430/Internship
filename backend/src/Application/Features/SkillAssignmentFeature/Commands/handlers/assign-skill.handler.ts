import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AssignSkillCommand} from "../assign-skill.command";
import {BadRequestException, Inject, NotFoundException} from "@nestjs/common";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {ISkillAssignmentRepository} from "../../../../repositories/skill-assignment.repository";
import {randomUUID} from "crypto";
import { ISkillRepository } from '../../../../repositories/skill.repository';
import {SkillAssignment} from "../../../../../Domain/entities/skill-assignment.entity";
@CommandHandler(AssignSkillCommand)
export class AssignSkillHandler implements ICommandHandler<AssignSkillCommand> {

    constructor(
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(ISkillAssignmentRepository)
        private readonly skillRepo: ISkillAssignmentRepository,

        @Inject(ISkillRepository)
        private readonly skillRepository: ISkillRepository
    ) {}

    async execute(command: AssignSkillCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const skill = await this.skillRepository.findById(command.skillId)
        if (!skill) throw new NotFoundException('Skill not found')

        const exists = await this.skillRepo.findByStudentAndSkill(
            profile.id,
            command.skillId
        )

        if (exists) {
            throw new BadRequestException('Skill already assigned')
        }

        const assignment = await this.skillRepo.save(
            new SkillAssignment(
                randomUUID(),
                command.skillId,
                profile.id,
                command.level
            )
        )
        // Bump StudentProfile.updatedAt so the embedding worker re-syncs this student
        // (a SkillAssignment insert doesn't touch the parent row on its own).
        await this.studentRepo.update(profile)
        return assignment
    }
}