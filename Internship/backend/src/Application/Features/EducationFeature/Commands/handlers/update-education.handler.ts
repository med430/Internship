import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";

import {UpdateEducationCommand} from "../update-education.command";
import {Education} from "../../../../../Domain/entities/education.entity";
import {IEducationRepository} from "../../../../repositories/education.repository";

@CommandHandler(UpdateEducationCommand)
export class UpdateEducationHandler extends GenericCommandHandler<
    UpdateEducationCommand,
    Education,
    Education
> {
    constructor(
        @Inject(IEducationRepository)
        private repo: IEducationRepository
    ) { super() }

    protected async map(cmd: UpdateEducationCommand) {
        const e = await this.repo.findById(cmd.id)
        if (!e) throw new NotFoundException()

        e.school = cmd.dto.school ?? e.school
        e.degree = cmd.dto.degree ?? e.degree
        e.field = cmd.dto.field ?? e.field
        e.startDate = cmd.dto.startDate ?? e.startDate
        e.endDate = cmd.dto.endDate ?? e.endDate
        e.description = cmd.dto.description ?? e.description

        return e
    }

    protected async persist(entity: Education) {
        return this.repo.save(entity)
    }
}