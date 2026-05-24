import { Education as PrismaEducation } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Education } from "../../../../Domain/entities/education.entity";
export declare class EducationMapper implements IGenericMapper<Education, PrismaEducation> {
    toDomain(raw: PrismaEducation): Education;
    toPersistence(domain: Education): Omit<PrismaEducation, 'createdAt' | 'updatedAt'>;
}
