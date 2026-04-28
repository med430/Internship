import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'


import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {UpdateProjectCommand} from "../update-project.command";
import {Project} from "../../../../../Domain/entities/project.entity";
import {IProjectRepository} from "../../../../repositories/project.repository";



@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler extends GenericCommandHandler<
    UpdateProjectCommand,
    Project,
    Project
> {
    constructor(
        @Inject(IProjectRepository)
        private repo: IProjectRepository
    ) { super() }

    protected async map(cmd: UpdateProjectCommand) {
        const p = await this.repo.findById(cmd.id)
        if (!p) throw new NotFoundException()

        p.title = cmd.dto.title ?? p.title
        p.description = cmd.dto.description ?? p.description
        p.technologies = cmd.dto.technologies ?? p.technologies
        p.githubUrl = cmd.dto.githubUrl ?? p.githubUrl
        p.demoUrl = cmd.dto.demoUrl ?? p.demoUrl

        return p
    }

    protected async persist(entity: Project) {
        return this.repo.save(entity)
    }
}