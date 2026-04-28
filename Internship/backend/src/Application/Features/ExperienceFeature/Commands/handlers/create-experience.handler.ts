import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"
import {CreateExperienceCommand} from "../create-experience.command";
import {Experience} from "../../../../../Domain/entities/experience.entity";
import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {IExperienceRepository} from "../../../../repositories/experience.repository";
import {randomUUID} from "crypto";


@CommandHandler(CreateExperienceCommand)
export class CreateExperienceHandler extends GenericCommandHandler<
    CreateExperienceCommand,
    Experience,
    Experience
> {
    constructor(
        @Inject(IStudentProfileRepository)
        private studentRepo: IStudentProfileRepository,

        @Inject(IExperienceRepository)
        private repo: IExperienceRepository
    ) { super() }

    protected async map(cmd: CreateExperienceCommand) {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        return new Experience(
            randomUUID(),
            profile.id,
            cmd.dto.company,
            cmd.dto.role,
            cmd.dto.startDate,
            cmd.dto.endDate,
            cmd.dto.description
        )
    }

    protected async persist(entity: Experience) {
        return this.repo.save(entity)
    }
}