import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'
import {UploadCoverLetterCommand} from "../upload-cover-letter.command";
import {ICoverLetterRepository} from "../../../../repositories/coverletter.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {CoverLetter} from "../../../../../Domain/entities/coverletter.entity";
import {randomUUID} from "crypto";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";
@CommandHandler(UploadCoverLetterCommand)
export class UploadCoverLetterHandler implements ICommandHandler<UploadCoverLetterCommand> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(FileStorageService)                          // ← ajouter
        private readonly fileService: FileStorageService    // ← ajouter
    ) {}

    async execute(command: UploadCoverLetterCommand) {
        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const fileUrl = await this.fileService.upload(command.file, 'letters')  // ← ajouter

        const letter = new CoverLetter(
            randomUUID(),
            profile.id,
            fileUrl           // ← était command.fileUrl
        )

        return this.letterRepo.save(letter)
    }
}