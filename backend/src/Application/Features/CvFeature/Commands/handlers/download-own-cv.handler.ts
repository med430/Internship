import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common'
import { DownloadOwnCVCommand } from '../download-own-cv.command'
import { ICVRepository } from '../../../../repositories/cv.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@CommandHandler(DownloadOwnCVCommand)
export class DownloadOwnCVHandler implements ICommandHandler<DownloadOwnCVCommand> {

    constructor(
        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(command: DownloadOwnCVCommand): Promise<string> {
        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const cv = await this.cvRepo.findById(command.cvId)
        if (!cv || cv.deletedAt) throw new NotFoundException()

        if (cv.studentId !== profile.id) throw new ForbiddenException()

        return cv.fileUrl
    }
}