import { IGenericRepository } from './generic.repository'
import {StudentProfile} from "../../Domain/entities/student-profile.entity";

export abstract class IStudentProfileRepository extends IGenericRepository<StudentProfile> {
    abstract findByUserId(userId: string): Promise<StudentProfile | null>
}