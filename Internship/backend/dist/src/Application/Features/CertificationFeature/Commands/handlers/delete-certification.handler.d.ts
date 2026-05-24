import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCertificationCommand } from "../delete-certification.command";
import { ICertificationRepository } from "../../../../repositories/certification.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class DeleteCertificationHandler implements ICommandHandler<DeleteCertificationCommand> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: ICertificationRepository, studentRepo: IStudentProfileRepository);
    execute(cmd: DeleteCertificationCommand): Promise<{
        message: string;
    }>;
}
