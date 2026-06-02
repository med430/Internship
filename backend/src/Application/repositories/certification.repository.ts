// Application/repositories/certification.repository.ts
import { Certification } from '../../Domain/entities/certification.entity'
import { IGenericRepository } from './generic.repository'

export interface ICertificationRepository extends IGenericRepository<Certification> {
    findByStudentProfileId(studentProfileId: string): Promise<Certification[]>
}
export const ICertificationRepository = Symbol('ICertificationRepository')