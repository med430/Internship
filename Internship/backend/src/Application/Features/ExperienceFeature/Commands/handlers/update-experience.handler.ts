import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import {Experience} from "../../../../../Domain/entities/experience.entity";
import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {IExperienceRepository} from "../../../../repositories/experience.repository";
import {UpdateExperienceCommand} from "../update-experience.command";



@CommandHandler(UpdateExperienceCommand)
export class UpdateExperienceHandler extends GenericCommandHandler<
    UpdateExperienceCommand,
    Experience,
    Experience
> {
    constructor(
        @Inject(IExperienceRepository)
        private repo: IExperienceRepository
    ) { super() }

    protected async map(cmd: UpdateExperienceCommand) {
        const e = await this.repo.findById(cmd.id)
        if (!e) throw new NotFoundException()

        e.company = cmd.dto.company ?? e.company
        e.role = cmd.dto.role ?? e.role
        e.startDate = cmd.dto.startDate ?? e.startDate
        e.endDate = cmd.dto.endDate ?? e.endDate
        e.description = cmd.dto.description ?? e.description

        return e
    }

    protected async persist(entity: Experience) {
        return this.repo.save(entity)
    }
}