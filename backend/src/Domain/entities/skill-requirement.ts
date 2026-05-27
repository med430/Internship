import { Skill } from './skill.entity';
import {SkillLevel} from "../enums/skill-level.enum";

export class SkillRequirement {
  constructor(
      public readonly id: string,
      public readonly skill: Skill,
      public level: SkillLevel,
      public mandatory: boolean = true,
  ) {}
}
