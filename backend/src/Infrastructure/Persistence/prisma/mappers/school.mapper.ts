import { Injectable } from '@nestjs/common'
import { School as PrismaSchool } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { School } from '../../../../Domain/entities/school.entity'

@Injectable()
export class SchoolMapper implements IGenericMapper<School, PrismaSchool> {
    toDomain(raw: PrismaSchool): School {
        return new School(
            raw.id,
            raw.name,
            raw.fullName,
            raw.city,
            raw.type ?? undefined,
            raw.website ?? undefined,
        )
    }

    toPersistence(domain: School): Omit<PrismaSchool, 'id'> & { id?: number } {
        return {
            id:       domain.id || undefined,
            name:     domain.name,
            fullName: domain.fullName,
            city:     domain.city,
            type:     domain.type ?? null,
            website:  domain.website ?? null,
        }
    }
}
