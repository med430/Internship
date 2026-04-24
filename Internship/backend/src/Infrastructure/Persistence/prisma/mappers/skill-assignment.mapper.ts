import { Injectable } from '@nestjs/common'
import { SkillAssignment as Domain } from '../../../../Domain/entities/skill-assignment.entity'
import { SkillAssignment as DB } from '@prisma/client'
import { SkillLevel } from '../../../../Domain/enums/skill-level.enum';

@Injectable()
export class SkillAssignmentPrismaMapper {

  toDomain(entity: DB): Domain {
    return new Domain(
        entity.id,
        entity.skillId,
        entity.studentProfileId ?? '',
        entity.level as SkillLevel
    )
  }

  toPersistence(domain: Domain) {
    return {
      id: domain.id,
      skillId: domain.skillId,
      studentProfileId: domain.studentProfileId ?? null,
      level: domain.level
    }
  }
}