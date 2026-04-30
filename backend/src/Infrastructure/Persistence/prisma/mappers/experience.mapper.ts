// infrastructure/mappers/experience.mapper.ts
import { Injectable } from '@nestjs/common'
import { Experience as PrismaExperience } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {Experience} from "../../../../Domain/entities/experience.entity";

@Injectable()
export class ExperienceMapper implements IGenericMapper<Experience, PrismaExperience> {
    toDomain(raw: PrismaExperience): Experience {
        return new Experience(
            raw.id,
            raw.studentProfileId,
            raw.company,
            raw.role,
            raw.startDate,
            raw.endDate      ?? undefined,
            raw.description  ?? undefined,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt    ?? undefined,
        )
    }

    toPersistence(domain: Experience): Omit<PrismaExperience, 'createdAt' | 'updatedAt'> {
        return {
            id:               domain.id,
            studentProfileId: domain.studentProfileId,
            company:          domain.company,
            role:             domain.role,
            startDate:        domain.startDate,
            endDate:          domain.endDate     ?? null,
            description:      domain.description ?? null,
            deletedAt:        domain.deletedAt   ?? null,
        }
    }
}