import { Experience } from "../../../../../Domain/entities/experience.entity";
import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { IExperienceRepository } from "../../../../repositories/experience.repository";
import { UpdateExperienceCommand } from "../update-experience.command";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class UpdateExperienceHandler extends GenericCommandHandler<UpdateExperienceCommand, Experience, Experience> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: IExperienceRepository, studentRepo: IStudentProfileRepository);
    protected map(cmd: UpdateExperienceCommand): Promise<Experience>;
    protected persist(entity: Experience): Promise<Experience>;
}
