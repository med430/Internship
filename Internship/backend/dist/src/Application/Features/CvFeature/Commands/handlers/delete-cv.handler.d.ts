import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCVCommand } from "../delete-cv.command";
import { ICVRepository } from "../../../../repositories/cv.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { FileStorageService } from "../../../../Services/FileStorageService/FileStorageService";
import { IApplicationRepository } from "../../../../repositories/application.repository";
export declare class DeleteCVHandler implements ICommandHandler<DeleteCVCommand> {
    private readonly cvRepo;
    private readonly studentRepo;
    private readonly appRepo;
    private readonly fileService;
    constructor(cvRepo: ICVRepository, studentRepo: IStudentProfileRepository, appRepo: IApplicationRepository, fileService: FileStorageService);
    execute(command: DeleteCVCommand): Promise<import("../../../../../Domain/entities/cv.entity").CV>;
}
