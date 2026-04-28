// repositories/recruiter-profile.repository.ts
import { RecruiterProfile } from '../../Domain/entities/recruiter-profile.entity'
import { IGenericRepository } from './generic.repository'

export interface IRecruiterProfileRepository extends IGenericRepository<RecruiterProfile> {
    findByUserId(userId: string): Promise<RecruiterProfile | null>
    update(profile: RecruiterProfile): Promise<RecruiterProfile>
}

export const IRecruiterProfileRepository = Symbol('IRecruiterProfileRepository')