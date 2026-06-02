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
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IExperienceRepository)
        private readonly repo: IExperienceRepository
    ) {
        super()
    }

    protected async map(cmd: CreateExperienceCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        return new Experience(
            randomUUID(),
            profile.id,
            cmd.company,
            cmd.role,
            cmd.startDate,
            cmd.endDate,
            cmd.description
        )
    }

    protected async persist(entity: Experience) {
        return this.repo.save(entity)
    }

    // bump the parent profile so the embedding worker re-syncs this student
    protected async afterPersist(_result: Experience, cmd: CreateExperienceCommand): Promise<void> {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (profile) await this.studentRepo.update(profile)
    }
}