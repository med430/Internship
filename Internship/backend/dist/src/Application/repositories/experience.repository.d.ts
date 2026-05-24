import { Experience } from '../../Domain/entities/experience.entity';
import { IGenericRepository } from './generic.repository';
export interface IExperienceRepository extends IGenericRepository<Experience> {
}
export declare const IExperienceRepository: unique symbol;
