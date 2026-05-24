import { Experience as PrismaExperience } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Experience } from "../../../../Domain/entities/experience.entity";
export declare class ExperienceMapper implements IGenericMapper<Experience, PrismaExperience> {
    toDomain(raw: PrismaExperience): Experience;
    toPersistence(domain: Experience): Omit<PrismaExperience, 'createdAt' | 'updatedAt'>;
}
