import { IGenericMapper } from './generic.mapper';
import { Skill as SkillDomain } from '../../../../Domain/entities/skill.entity';
import { Skill as SkillDB } from '@prisma/client';

export class SkillPrismaMapper implements IGenericMapper<SkillDomain, SkillDB> {
  toDomain(skill: SkillDB): SkillDomain {
    return new SkillDomain(skill.id, skill.name);
  }

  toPersistence(domain: SkillDomain): SkillDB {
    return {
      id: domain.id,
      name: domain.name,
    };
  }
}
