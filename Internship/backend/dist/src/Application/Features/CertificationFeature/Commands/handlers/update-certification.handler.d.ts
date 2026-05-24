import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { UpdateCertificationCommand } from "../update-certification.command";
import { Certification } from "../../../../../Domain/entities/certification.entity";
import { ICertificationRepository } from "../../../../repositories/certification.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class UpdateCertificationHandler extends GenericCommandHandler<UpdateCertificationCommand, Certification, Certification> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: ICertificationRepository, studentRepo: IStudentProfileRepository);
    protected map(cmd: UpdateCertificationCommand): Promise<Certification>;
    protected persist(entity: Certification): Promise<Certification>;
}
