import { Certification as PrismaCertification, CV as PrismaCV, Education as PrismaEducation, Experience as PrismaExperience, Project as PrismaProject, SkillAssignment as PrismaSkillAssignment, StudentProfile as PrismaStudentProfile } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { StudentProfile } from "../../../../Domain/entities/student-profile.entity";
type PrismaStudentProfileFull = PrismaStudentProfile & {
    skills: PrismaSkillAssignment[];
    experiences: PrismaExperience[];
    projects: PrismaProject[];
    educations: PrismaEducation[];
    certifications: PrismaCertification[];
    cvs: PrismaCV[];
};
export declare class StudentProfileMapper implements IGenericMapper<StudentProfile, PrismaStudentProfileFull> {
    toDomain(raw: PrismaStudentProfileFull): StudentProfile;
    toPersistence(domain: StudentProfile): Omit<PrismaStudentProfile, 'createdAt' | 'updatedAt'>;
}
export {};
