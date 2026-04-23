import { Injectable } from '@nestjs/common';
import { Application as Domain } from '../../../../Domain/entities/application.entity';
import { Application as DB } from '@prisma/client';
import { ApplicationStatus } from '../../../../Domain/enums/application-status.enum';

@Injectable()
export class ApplicationPrismaMapper {
  toDomain(entity: DB): Domain {
    return new Domain(
      entity.id,
      entity.studentId,
      entity.offerId,
      entity.status as ApplicationStatus,
      entity.cvUrl,
      entity.matchScore,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt ?? undefined,
    );
  }

  toPersistence(domain: Domain): DB {
    return {
      id: domain.id,
      studentId: domain.studentId,
      offerId: domain.offerId,
      status: domain.status,
      cvUrl: domain.cvUrl,
      matchScore: domain.matchScore,

      createdAt: domain.createdAt!,
      updatedAt: domain.updatedAt!,
      deletedAt: domain.deletedAt ?? null,
    } as DB;
  }
}
