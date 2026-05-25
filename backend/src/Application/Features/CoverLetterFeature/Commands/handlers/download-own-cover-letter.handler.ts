import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common'
import { DownloadOwnCoverLetterCommand } from '../download-own-cover-letter.command'
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'

@CommandHandler(DownloadOwnCoverLetterCommand)
export class DownloadOwnCoverLetterHandler implements ICommandHandler<DownloadOwnCoverLetterCommand> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,
    ) {}

    async execute(command: DownloadOwnCoverLetterCommand): Promise<string> {
        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const letter = await this.letterRepo.findById(command.letterId)
        if (!letter || letter.deletedAt) throw new NotFoundException()

        if (letter.studentId !== profile.id) throw new ForbiddenException()

        return letter.fileUrl
    }
}