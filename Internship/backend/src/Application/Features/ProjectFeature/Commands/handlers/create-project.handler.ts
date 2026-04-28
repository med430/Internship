import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {randomUUID} from "crypto";
import {CreateProjectCommand} from "../create-project.command";
import {Project} from "../../../../../Domain/entities/project.entity";
import {IProjectRepository} from "../../../../repositories/project.repository";

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler extends GenericCommandHandler<
    CreateProjectCommand,
    Project,
    Project
> {
    constructor(
        @Inject(IStudentProfileRepository)
        private studentRepo: IStudentProfileRepository,

        @Inject(IProjectRepository)
        private repo: IProjectRepository
    ) { super() }

    protected async map(cmd: CreateProjectCommand) {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        return new Project(
            randomUUID(),
            profile.id,
            cmd.dto.title,
            cmd.dto.description,
            cmd.dto.technologies,
            cmd.dto.githubUrl,
            cmd.dto.demoUrl
        )
    }

    protected async persist(entity: Project) {
        return this.repo.save(entity)
    }
}