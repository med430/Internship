import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AssignSkillCommand} from "../assign-skill.command";
import {BadRequestException, Inject, NotFoundException} from "@nestjs/common";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {ISkillAssignmentRepository} from "../../../../repositories/skill-assignment.repository";
import {randomUUID} from "crypto";
import { SkillLevel } from '../../../../../Domain/enums/skill-level.enum';
import { ISkillRepository } from '../../../../repositories/skill.repository';
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

        const exists = await this.skillRepo.findByStudentAndSkill(
            profile.id,
            command.skillId
        )

        if (exists) {
            throw new BadRequestException('Skill already assigned')
        }

        return this.skillRepo.save({
          id: randomUUID(),
          skillId: command.skillId,
          studentProfileId: profile.id,
          level: command.level as SkillLevel,
        });
    }
}