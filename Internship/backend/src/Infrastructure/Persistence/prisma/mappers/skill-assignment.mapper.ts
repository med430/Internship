// infrastructure/mappers/skill-assignment.mapper.ts
import { Injectable } from '@nestjs/common'
import { SkillAssignment as PrismaSkillAssignment } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {SkillAssignment} from "../../../../Domain/entities/skill-assignment.entity";
import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";

@Injectable()
export class SkillAssignmentMapper implements IGenericMapper<SkillAssignment, PrismaSkillAssignment> {
  toDomain(raw: PrismaSkillAssignment): SkillAssignment {
    return new SkillAssignment(
        raw.id,
        raw.skillId,
        raw.studentProfileId!,
        raw.level as SkillLevel,
    )
  }

  toPersistence(domain: SkillAssignment) {
    return {
      id:               domain.id,
      skillId:          domain.skillId,
      studentProfileId: domain.studentProfileId,
      level:            domain.level as unknown as any,
    }
  }
}