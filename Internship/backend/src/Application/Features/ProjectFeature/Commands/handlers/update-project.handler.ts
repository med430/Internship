import { CommandHandler } from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException
} from '@nestjs/common'


import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {UpdateProjectCommand} from "../update-project.command";
import {Project} from "../../../../../Domain/entities/project.entity";
import {IProjectRepository} from "../../../../repositories/project.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";


@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler extends GenericCommandHandler<
    UpdateProjectCommand,
    Project,
    Project
> {
    constructor(
        @Inject(IProjectRepository)
        private readonly repo: IProjectRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {
        super()
    }

    protected async map(cmd: UpdateProjectCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        const p = await this.repo.findById(cmd.id)
        if (!p) throw new NotFoundException('Project not found')

        // 🔐 ownership check
        if (p.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        p.title = cmd.title ?? p.title
        p.description = cmd.description ?? p.description
        p.technologies = cmd.technologies ?? p.technologies
        p.githubUrl = cmd.githubUrl ?? p.githubUrl
        p.demoUrl = cmd.demoUrl ?? p.demoUrl

        return p
    }

    protected async persist(entity: Project) {
        return this.repo.save(entity)
    }
}