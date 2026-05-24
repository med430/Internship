import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository";
import { GenericCommandHandler } from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import { CreateProjectCommand } from "../create-project.command";
import { Project } from "../../../../../Domain/entities/project.entity";
import { IProjectRepository } from "../../../../repositories/project.repository";
export declare class CreateProjectHandler extends GenericCommandHandler<CreateProjectCommand, Project, Project> {
    private readonly studentRepo;
    private readonly repo;
    constructor(studentRepo: IStudentProfileRepository, repo: IProjectRepository);
    protected map(cmd: CreateProjectCommand): Promise<Project>;
    protected persist(entity: Project): Promise<Project>;
}
