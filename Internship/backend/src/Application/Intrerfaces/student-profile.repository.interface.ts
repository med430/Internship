import { IGenericRepository } from './generic.repository.interface'
import {StudentProfile} from "../../Domain/entities/student-profile.entity";

export interface IStudentProfileRepository extends IGenericRepository<StudentProfile> {
    findByUserId(userId: string): Promise<StudentProfile | null>
}