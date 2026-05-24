import { PrismaService } from '../prisma.service';
import { StudentProfileMapper } from '../mappers/student-profile.mapper';
import { GenericRepository } from "./generic.repositories";
import { IStudentProfileRepository } from "../../../../Application/repositories/student-profile.repository";
import { StudentProfile } from "../../../../Domain/entities/student-profile.entity";
export declare class StudentProfileRepositoryImpl extends GenericRepository<StudentProfile, any> implements IStudentProfileRepository {
    protected readonly includeOptions: {
        skills: boolean;
        experiences: boolean;
        projects: boolean;
        educations: boolean;
        certifications: boolean;
        cvs: boolean;
    };
    constructor(prisma: PrismaService, mapper: StudentProfileMapper);
    findById(id: string): Promise<StudentProfile | null>;
    findByUserId(userId: string): Promise<StudentProfile | null>;
    update(profile: StudentProfile): Promise<StudentProfile>;
}
