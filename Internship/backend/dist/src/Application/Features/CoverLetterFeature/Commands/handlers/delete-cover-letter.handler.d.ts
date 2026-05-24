import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCoverLetterCommand } from "../delete-cover-letter.command";
import { ICoverLetterRepository } from "../../../../repositories/coverletter.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { IApplicationRepository } from "../../../../repositories/application.repository";
import { FileStorageService } from "../../../../Services/FileStorageService/FileStorageService";
export declare class DeleteCoverLetterHandler implements ICommandHandler<DeleteCoverLetterCommand> {
    private readonly letterRepo;
    private readonly studentRepo;
    private readonly appRepo;
    private readonly fileService;
    constructor(letterRepo: ICoverLetterRepository, studentRepo: IStudentProfileRepository, appRepo: IApplicationRepository, fileService: FileStorageService);
    execute(command: DeleteCoverLetterCommand): Promise<import("../../../../../Domain/entities/coverletter.entity").CoverLetter>;
}
