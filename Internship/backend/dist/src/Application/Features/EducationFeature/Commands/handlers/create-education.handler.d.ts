import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { CreateEducationCommand } from "../create-education.command";
import { Education } from "../../../../../Domain/entities/education.entity";
import { IEducationRepository } from "../../../../repositories/education.repository";
export declare class CreateEducationHandler extends GenericCommandHandler<CreateEducationCommand, Education, Education> {
    private readonly studentRepo;
    private readonly repo;
    constructor(studentRepo: IStudentProfileRepository, repo: IEducationRepository);
    protected map(cmd: CreateEducationCommand): Promise<Education>;
    protected persist(entity: Education): Promise<Education>;
}
