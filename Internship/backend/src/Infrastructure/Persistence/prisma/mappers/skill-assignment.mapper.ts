import { Injectable } from '@nestjs/common'
import { SkillAssignment as Domain } from '../../../../Domain/entities/skill-assignment.entity'
import { SkillAssignment as DB } from '@prisma/client'

@Injectable()
export class SkillAssignmentPrismaMapper {

  toDomain(entity: DB): Domain {
    return new Domain(
        entity.id,
        entity.skillId,
        entity.studentProfileId ?? undefined,
        entity.offerId ?? undefined,
        entity.level
    )
  }

  toPersistence(domain: Domain) {
    return {
      id: domain.id,
      skillId: domain.skillId,
      studentProfileId: domain.studentProfileId ?? null,
      offerId: domain.offerId ?? null,
      level: domain.level
    }
  }
}