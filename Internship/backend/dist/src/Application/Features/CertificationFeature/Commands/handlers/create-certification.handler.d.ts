import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { CreateCertificationCommand } from "../create-certification.command";
import { Certification } from "../../../../../Domain/entities/certification.entity";
import { ICertificationRepository } from "../../../../repositories/certification.repository";
export declare class CreateCertificationHandler extends GenericCommandHandler<CreateCertificationCommand, Certification, Certification> {
    private readonly studentRepo;
    private readonly repo;
    constructor(studentRepo: IStudentProfileRepository, repo: ICertificationRepository);
    protected map(cmd: CreateCertificationCommand): Promise<Certification>;
    protected persist(entity: Certification): Promise<Certification>;
}
