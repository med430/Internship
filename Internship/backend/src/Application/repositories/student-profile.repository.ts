import {StudentProfile} from "../../Domain/entities/student-profile.entity";
import { IGenericRepository } from './generic.repository';

export abstract class IStudentProfileRepository extends IGenericRepository<StudentProfile> {
    abstract create(data: { id: string; userId: string }): Promise<void>
    abstract findByUserId(userId: string): Promise<StudentProfile | null>
}