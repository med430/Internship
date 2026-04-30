import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    BadRequestException,
    ForbiddenException,
    Inject, NotFoundException,
} from '@nestjs/common'
import {DeleteCoverLetterCommand} from "../delete-cover-letter.command";
import {ICoverLetterRepository} from "../../../../repositories/coverletter.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {IApplicationRepository} from "../../../../repositories/application.repository";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";
@CommandHandler(DeleteCoverLetterCommand)
export class DeleteCoverLetterHandler
    implements ICommandHandler<DeleteCoverLetterCommand> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService
    ) {}

    async execute(command: DeleteCoverLetterCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const letter = await this.letterRepo.findById(command.letterId)
        if (!letter || letter.deletedAt) throw new NotFoundException()

        if (letter.studentId !== profile.id) {
            throw new ForbiddenException()
        }

        // 🔥 empêcher suppression si utilisée
        const isUsed = await this.appRepo.existsByCoverLetterId(letter.id)
        if (isUsed) {
            throw new BadRequestException('Letter is used in applications')
        }

        // 🔥 supprimer fichier
        await this.fileService.delete(letter.fileUrl)

        // 🔥 soft delete
        letter.deletedAt = new Date()

        return this.letterRepo.save(letter)
    }
}