import { ProfileView } from '../../Domain/entities/profile-view.entity'
import { IGenericRepository } from './generic.repository'

export abstract class IProfileViewRepository extends IGenericRepository<ProfileView> {
    abstract findByRecruiter(recruiterUserId: string, limit?: number): Promise<ProfileView[]>
    abstract findByStudentProfile(studentProfileId: string, limit?: number): Promise<ProfileView[]>
}
