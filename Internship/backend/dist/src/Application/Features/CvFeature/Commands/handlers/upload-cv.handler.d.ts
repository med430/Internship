import { ICommandHandler } from '@nestjs/cqrs';
import { UploadCVCommand } from '../upload-cv.command';
import { ICVRepository } from '../../../../repositories/cv.repository';
import { IStudentProfileRepository } from '../../../../repositories/student-profile.repository';
import { FileStorageService } from '../../../../Services/FileStorageService/FileStorageService';
import { CV } from '../../../../../Domain/entities/cv.entity';
export declare class UploadCVHandler implements ICommandHandler<UploadCVCommand> {
    private readonly cvRepo;
    private readonly studentRepo;
    private readonly fileService;
    constructor(cvRepo: ICVRepository, studentRepo: IStudentProfileRepository, fileService: FileStorageService);
    execute(command: UploadCVCommand): Promise<CV>;
}
