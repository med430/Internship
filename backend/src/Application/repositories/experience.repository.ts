// Application/repositories/experience.repository.ts
import { Experience } from '../../Domain/entities/experience.entity'
import { IGenericRepository } from './generic.repository'

export interface IExperienceRepository extends IGenericRepository<Experience> {
    findByStudentProfileId(studentProfileId: string): Promise<Experience[]>
}
export const IExperienceRepository = Symbol('IExperienceRepository')