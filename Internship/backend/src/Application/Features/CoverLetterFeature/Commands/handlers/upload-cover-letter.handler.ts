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

@CommandHandler(UploadCoverLetterCommand)
export class UploadCoverLetterHandler
    implements ICommandHandler<UploadCoverLetterCommand> {

    constructor(
        @Inject(ICoverLetterRepository)
        private readonly letterRepo: ICoverLetterRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {}

    async execute(command: UploadCoverLetterCommand) {

        const profile = await this.studentRepo.findByUserId(command.userId)
        if (!profile) throw new NotFoundException('Profile not found')

        const letter = new CoverLetter(
            randomUUID(),
            profile.id,
            command.fileUrl
        )

        return this.letterRepo.save(letter)
    }
}