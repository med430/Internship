import { CommandHandler } from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException
} from '@nestjs/common'

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";

import {UpdateEducationCommand} from "../update-education.command";
import {Education} from "../../../../../Domain/entities/education.entity";
import {IEducationRepository} from "../../../../repositories/education.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
@CommandHandler(UpdateEducationCommand)
export class UpdateEducationHandler extends GenericCommandHandler<
    UpdateEducationCommand,
    Education,
    Education
> {
    constructor(
        @Inject(IEducationRepository)
        private readonly repo: IEducationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {
        super()
    }

    protected async map(cmd: UpdateEducationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        const e = await this.repo.findById(cmd.id)
        if (!e) throw new NotFoundException('Education not found')

        // 🔐 ownership check
        if (e.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        e.school = cmd.school ?? e.school
        e.degree = cmd.degree ?? e.degree
        e.field = cmd.field ?? e.field
        e.startDate = cmd.startDate ?? e.startDate
        e.endDate = cmd.endDate ?? e.endDate
        e.description = cmd.description ?? e.description

        return e
    }

    protected async persist(entity: Education) {
        return this.repo.save(entity)
    }

    // bump the parent profile so the embedding worker re-syncs this student
    protected async afterPersist(_result: Education, cmd: UpdateEducationCommand): Promise<void> {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (profile) await this.studentRepo.update(profile)
    }
}