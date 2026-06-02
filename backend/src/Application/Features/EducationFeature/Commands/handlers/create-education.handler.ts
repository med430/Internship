import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {randomUUID} from "crypto";
import {CreateEducationCommand} from "../create-education.command";
import {Education} from "../../../../../Domain/entities/education.entity";
import {IEducationRepository} from "../../../../repositories/education.repository";
@CommandHandler(CreateEducationCommand)
export class CreateEducationHandler extends GenericCommandHandler<
    CreateEducationCommand,
    Education,
    Education
> {
    constructor(
        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IEducationRepository)
        private readonly repo: IEducationRepository
    ) {
        super()
    }

    protected async map(cmd: CreateEducationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        return new Education(
            randomUUID(),
            profile.id,
            cmd.school,
            cmd.degree,
            cmd.field,
            cmd.startDate,
            cmd.endDate,
            cmd.description
        )
    }

    protected async persist(entity: Education) {
        return this.repo.save(entity)
    }

    // bump the parent profile so the embedding worker re-syncs this student
    protected async afterPersist(_result: Education, cmd: CreateEducationCommand): Promise<void> {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (profile) await this.studentRepo.update(profile)
    }
}