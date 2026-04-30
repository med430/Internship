// upload-cv.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { UploadCVCommand } from '../upload-cv.command'
import { ICVRepository } from '../../../../repositories/cv.repository'
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository'
import { FileStorageService } from '../../../../Services/FileStorageService/FileStorageService'
import { CV } from '../../../../../Domain/entities/cv.entity'

@CommandHandler(UploadCVCommand)
export class UploadCVHandler implements ICommandHandler<UploadCVCommand> {

    constructor(
        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService
    ) {}

    async execute(command: UploadCVCommand) {
        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const fileUrl = await this.fileService.upload(command.file, 'cvs')

        const cv = new CV(
            randomUUID(),
            profile.id,
            fileUrl,
        )

        return this.cvRepo.save(cv)
    }
}