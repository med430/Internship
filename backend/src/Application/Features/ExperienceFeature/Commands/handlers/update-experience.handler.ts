import { CommandHandler } from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException
} from '@nestjs/common'

import {Experience} from "../../../../../Domain/entities/experience.entity";
import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {IExperienceRepository} from "../../../../repositories/experience.repository";
import {UpdateExperienceCommand} from "../update-experience.command";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";


@CommandHandler(UpdateExperienceCommand)
export class UpdateExperienceHandler extends GenericCommandHandler<
    UpdateExperienceCommand,
    Experience,
    Experience
> {
    constructor(
        @Inject(IExperienceRepository)
        private readonly repo: IExperienceRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {
        super()
    }

    protected async map(cmd: UpdateExperienceCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        const e = await this.repo.findById(cmd.id)
        if (!e) throw new NotFoundException('Experience not found')

        // 🔐 ownership check
        if (e.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        e.company = cmd.company ?? e.company
        e.role = cmd.role ?? e.role
        e.startDate = cmd.startDate ?? e.startDate
        e.endDate = cmd.endDate ?? e.endDate
        e.description = cmd.description ?? e.description

        return e
    }

    protected async persist(entity: Experience) {
        return this.repo.save(entity)
    }
}