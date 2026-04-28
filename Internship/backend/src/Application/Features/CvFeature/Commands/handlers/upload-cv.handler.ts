import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException
} from '@nestjs/common'
import {DeleteCVCommand} from "../delete-cv.command";
import {ICVRepository} from "../../../../repositories/cv.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";

@CommandHandler(DeleteCVCommand)
export class DeleteCVHandler
    implements ICommandHandler<DeleteCVCommand> {

    constructor(
        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService
    ) {}

    async execute(command: DeleteCVCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException()

        const cv = await this.cvRepo.findById(command.cvId)
        if (!cv || cv.deletedAt) throw new NotFoundException()

        if (cv.studentId !== profile.id) {
            throw new ForbiddenException()
        }

        // 🔥 supprimer fichier physique
        await this.fileService.delete(cv.fileUrl)

        // 🔥 SOFT DELETE
        cv.deletedAt = new Date()

        return this.cvRepo.save(cv)
    }
}