import {StudentProfile} from "../../Domain/entities/student-profile.entity";

export abstract class IStudentProfileRepository {
    abstract create(data: { id: string; userId: string }): Promise<void>
    abstract findByUserId(userId: string): Promise<StudentProfile | null>
}