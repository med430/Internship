import { StudentProfile } from '../../Domain/entities/student-profile.entity';
import { IGenericRepository } from './generic.repository';
export interface IStudentProfileRepository extends IGenericRepository<StudentProfile> {
    findByUserId(userId: string): Promise<StudentProfile | null>;
    update(profile: StudentProfile): Promise<StudentProfile>;
}
export declare const IStudentProfileRepository: unique symbol;
