import { Skill } from './skill.entity';
import { SkillLevel } from '@prisma/client';

export class SkillRequirement {
  constructor(
    public id: string,
    public skill: Skill,
    public level: SkillLevel,
  ) {
  }
}