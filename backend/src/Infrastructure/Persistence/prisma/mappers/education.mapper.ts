// infrastructure/mappers/education.mapper.ts
import { Injectable } from '@nestjs/common'
import { Education as PrismaEducation } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {Education} from "../../../../Domain/entities/education.entity";

@Injectable()
export class EducationMapper implements IGenericMapper<Education, PrismaEducation> {
    toDomain(raw: PrismaEducation): Education {
        return new Education(
            raw.id,
            raw.studentProfileId,
            raw.school,
            raw.degree,
            raw.field,
            raw.startDate,
            raw.endDate     ?? undefined,
            raw.description ?? undefined,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt   ?? undefined,
        )
    }

    toPersistence(domain: Education): Omit<PrismaEducation, 'createdAt' | 'updatedAt'> {
        return {
            id:               domain.id,
            studentProfileId: domain.studentProfileId,
            school:           domain.school,
            degree:           domain.degree,
            field:            domain.field,
            startDate:        domain.startDate,
            endDate:          domain.endDate     ?? null,
            description:      domain.description ?? null,
            deletedAt:        domain.deletedAt   ?? null,
        }
    }
}