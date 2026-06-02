import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject, NotFoundException,
} from '@nestjs/common'
import {IExperienceRepository} from "../../../../repositories/experience.repository";

import {DeleteExperienceCommand} from "../delete-experience.command";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";

@CommandHandler(DeleteExperienceCommand)
export class DeleteExperienceHandler
    implements ICommandHandler<DeleteExperienceCommand> {

    constructor(
        @Inject(IExperienceRepository)
        private readonly repo: IExperienceRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(cmd: DeleteExperienceCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        const exp = await this.repo.findById(cmd.id)
        if (!exp || exp.deletedAt) throw new NotFoundException()

        if (exp.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        exp.deletedAt = new Date()

        await this.repo.save(exp)

        // bump the parent profile so the embedding worker re-syncs this student
        await this.studentRepo.update(profile)

        return { message: 'Experience deleted' }
    }
}