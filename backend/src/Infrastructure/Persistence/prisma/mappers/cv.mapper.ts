// infrastructure/mappers/cv.mapper.ts
import { Injectable } from '@nestjs/common'
import { CV as PrismaCV } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { CV } from '../../../../Domain/entities/cv.entity'

@Injectable()
export class CVMapper implements IGenericMapper<CV, PrismaCV> {
    toDomain(raw: PrismaCV): CV {
        return new CV(
            raw.id,
            raw.studentId,
            raw.fileUrl,
            raw.createdAt,
            raw.updatedAt,
            raw.deletedAt ?? undefined,
        )
    }

    toPersistence(domain: CV) {
        return {
            id:        domain.id,
            studentId: domain.studentId,
            fileUrl:   domain.fileUrl,
            deletedAt: domain.deletedAt ?? null,
        }
    }
}