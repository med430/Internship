// Application/repositories/education.repository.ts
import { Education } from '../../Domain/entities/education.entity'
import { IGenericRepository } from './generic.repository'

export interface IEducationRepository extends IGenericRepository<Education> {
    findByStudentProfileId(studentProfileId: string): Promise<Education[]>
}
export const IEducationRepository = Symbol('IEducationRepository')