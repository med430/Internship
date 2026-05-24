import { ICommandHandler } from '@nestjs/cqrs';
import { UploadCoverLetterCommand } from "../upload-cover-letter.command";
import { ICoverLetterRepository } from "../../../../repositories/coverletter.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { CoverLetter } from "../../../../../Domain/entities/coverletter.entity";
import { FileStorageService } from "../../../../Services/FileStorageService/FileStorageService";
export declare class UploadCoverLetterHandler implements ICommandHandler<UploadCoverLetterCommand> {
    private readonly letterRepo;
    private readonly studentRepo;
    private readonly fileService;
    constructor(letterRepo: ICoverLetterRepository, studentRepo: IStudentProfileRepository, fileService: FileStorageService);
    execute(command: UploadCoverLetterCommand): Promise<CoverLetter>;
}
