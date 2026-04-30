// infrastructure/mappers/application.mapper.ts
import { Injectable } from '@nestjs/common'
import { Application as PrismaApplication } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { Application } from '../../../../Domain/entities/application.entity'
import { ApplicationStatus } from '../../../../Domain/enums/application-status.enum'

@Injectable()
export class ApplicationMapper implements IGenericMapper<Application, PrismaApplication> {
  toDomain(raw: PrismaApplication): Application {
    return new Application(
        raw.id,
        raw.studentId,
        raw.offerId,
        raw.cvId,
        raw.status as unknown as ApplicationStatus,
        raw.matchScore ?? 0,
        raw.coverLetterId ?? undefined,
        raw.createdAt,
        raw.updatedAt,
        raw.deletedAt ?? undefined,
    )
  }

  toPersistence(domain: Application) {
    return {
      id:            domain.id,
      studentId:     domain.studentId,
      offerId:       domain.offerId,
      cvId:          domain.cvId,
      status:        domain.status,
      matchScore:    domain.matchScore,
      coverLetterId: domain.coverLetterId ?? null,
      deletedAt:     domain.deletedAt     ?? null,
    }
  }
}