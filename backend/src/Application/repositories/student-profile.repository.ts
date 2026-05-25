// repositories/student-profile.repository.ts
import { StudentProfile } from '../../Domain/entities/student-profile.entity'
import { IGenericRepository } from './generic.repository'

export interface IStudentProfileRepository extends IGenericRepository<StudentProfile> {
    findByUserId(userId: string): Promise<StudentProfile | null>
    findByDomain(domain: string): Promise<StudentProfile[]>
    update(profile: StudentProfile): Promise<StudentProfile>
}

export const IStudentProfileRepository = Symbol('IStudentProfileRepository')