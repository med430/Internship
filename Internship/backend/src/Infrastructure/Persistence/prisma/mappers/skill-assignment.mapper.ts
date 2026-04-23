import { IGenericMapper } from './generic.mapper';
import { SkillAssignment as Domain } from '../../../../Domain/entities/skill-assignment.entity';
import { Skill as SkillDomain } from '../../../../Domain/entities/skill.entity';
import { SkillAssignment as DB } from '@prisma/client';

export class SkillAssignmentPrismaMapper implements IGenericMapper<Domain, DB> {
  toDomain(data: DB): Domain {
    return new Domain(
      new SkillDomain(data.skillId, ''), // name optional (can be enriched later)
      data.level as any,
    );
  }

  toPersistence(domain: Domain): DB {
    return {
      id: undefined as any, // Prisma generates it
      skillId: domain.skill.id,
      level: domain.level,
      studentProfileId: null,
      offerId: '' as any,
    } as DB;
  }
}
