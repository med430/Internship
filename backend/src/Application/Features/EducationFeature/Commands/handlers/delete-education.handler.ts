import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject, NotFoundException,
} from '@nestjs/common'
import {DeleteEducationCommand} from "../delete-education.command";
import {IEducationRepository} from "../../../../repositories/education.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";

@CommandHandler(DeleteEducationCommand)
export class DeleteEducationHandler
    implements ICommandHandler<DeleteEducationCommand> {

    constructor(
        @Inject(IEducationRepository)
        private readonly repo: IEducationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(cmd: DeleteEducationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        const edu = await this.repo.findById(cmd.id)
        if (!edu || edu.deletedAt) throw new NotFoundException()

        if (edu.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        edu.deletedAt = new Date()

        await this.repo.save(edu)

        return { message: 'Education deleted' }
    }
}