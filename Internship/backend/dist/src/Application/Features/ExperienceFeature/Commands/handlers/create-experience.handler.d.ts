import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { CreateExperienceCommand } from "../create-experience.command";
import { Experience } from "../../../../../Domain/entities/experience.entity";
import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { IExperienceRepository } from "../../../../repositories/experience.repository";
export declare class CreateExperienceHandler extends GenericCommandHandler<CreateExperienceCommand, Experience, Experience> {
    private readonly studentRepo;
    private readonly repo;
    constructor(studentRepo: IStudentProfileRepository, repo: IExperienceRepository);
    protected map(cmd: CreateExperienceCommand): Promise<Experience>;
    protected persist(entity: Experience): Promise<Experience>;
}
