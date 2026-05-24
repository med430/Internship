import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { UpdateProjectCommand } from "../update-project.command";
import { Project } from "../../../../../Domain/entities/project.entity";
import { IProjectRepository } from "../../../../repositories/project.repository";
import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
export declare class UpdateProjectHandler extends GenericCommandHandler<UpdateProjectCommand, Project, Project> {
    private readonly repo;
    private readonly studentRepo;
    constructor(repo: IProjectRepository, studentRepo: IStudentProfileRepository);
    protected map(cmd: UpdateProjectCommand): Promise<Project>;
    protected persist(entity: Project): Promise<Project>;
}
