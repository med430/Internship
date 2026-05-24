import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { UpdateEducationCommand } from "../update-education.command";
import { Education } from "../../../../../Domain/entities/education.entity";
import { IEducationRepository } from "../../../../repositories/education.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class UpdateEducationHandler extends GenericCommandHandler<UpdateEducationCommand, Education, Education> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: IEducationRepository, studentRepo: IStudentProfileRepository);
    protected map(cmd: UpdateEducationCommand): Promise<Education>;
    protected persist(entity: Education): Promise<Education>;
}
