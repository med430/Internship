import { Project } from '../../Domain/entities/project.entity';
import { IGenericRepository } from './generic.repository';
export interface IProjectRepository extends IGenericRepository<Project> {
}
export declare const IProjectRepository: unique symbol;
