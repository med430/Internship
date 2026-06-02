import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject, NotFoundException,
} from '@nestjs/common'
import {DeleteCertificationCommand} from "../delete-certification.command";
import {ICertificationRepository} from "../../../../repositories/certification.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
@CommandHandler(DeleteCertificationCommand)
export class DeleteCertificationHandler
    implements ICommandHandler<DeleteCertificationCommand> {

    constructor(
        @Inject(ICertificationRepository)
        private readonly repo: ICertificationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(cmd: DeleteCertificationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        const cert = await this.repo.findById(cmd.id)
        if (!cert || cert.deletedAt) throw new NotFoundException()

        if (cert.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        cert.deletedAt = new Date()

        await this.repo.save(cert)

        // bump the parent profile so the embedding worker re-syncs this student
        await this.studentRepo.update(profile)

        return { message: 'Certification deleted' }
    }
}