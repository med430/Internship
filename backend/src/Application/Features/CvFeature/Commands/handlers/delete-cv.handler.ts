import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {BadRequestException, ForbiddenException, Inject, NotFoundException} from '@nestjs/common'
import {DeleteCVCommand} from "../delete-cv.command";
import {ICVRepository} from "../../../../repositories/cv.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";
import {IApplicationRepository} from "../../../../repositories/application.repository";
@CommandHandler(DeleteCVCommand)
export class DeleteCVHandler implements ICommandHandler<DeleteCVCommand> {

    constructor(
        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

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

        // 🔥 empêcher suppression si utilisé
        const isUsed = await this.appRepo.existsByCvId(cv.id)
        if (isUsed) {
            throw new BadRequestException('CV is used in applications')
        }

        await this.fileService.delete(cv.fileUrl)

        cv.deletedAt = new Date()
        return this.cvRepo.save(cv)
    }
}