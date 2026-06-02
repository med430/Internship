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
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IProjectRepository)
        private readonly repo: IProjectRepository
    ) {
        super()
    }

    protected async map(cmd: CreateProjectCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        return new Project(
            randomUUID(),
            profile.id,
            cmd.title,
            cmd.description,
            cmd.technologies,
            cmd.githubUrl,
            cmd.demoUrl
        )
    }

    protected async persist(entity: Project) {
        return this.repo.save(entity)
    }

    // bump the parent profile so the embedding worker re-syncs this student
    protected async afterPersist(_result: Project, cmd: CreateProjectCommand): Promise<void> {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (profile) await this.studentRepo.update(profile)
    }
}