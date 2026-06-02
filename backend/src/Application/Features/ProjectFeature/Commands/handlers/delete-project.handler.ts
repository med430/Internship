import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException,
} from '@nestjs/common'

import {DeleteProjectCommand} from "../delete-project.command";
import {IProjectRepository} from "../../../../repositories/project.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
    implements ICommandHandler<DeleteProjectCommand> {

    constructor(
        @Inject(IProjectRepository)
        private readonly repo: IProjectRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(cmd: DeleteProjectCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        const project = await this.repo.findById(cmd.id)
        if (!project) throw new NotFoundException()

        if (project.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        await this.repo.delete(cmd.id)

        // bump the parent profile so the embedding worker re-syncs this student
        await this.studentRepo.update(profile)

        return { message: 'Deleted' }
    }
}
