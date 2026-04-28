import {IGenericRepository} from "./generic.repository";
import {Project} from "../../Domain/entities/project.entity";


export abstract class IProjectRepository
    extends IGenericRepository<Project> {}