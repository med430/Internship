import { Skill } from './skill.entity';
import {SkillLevel} from "../enums/skill-level.enum";

export class SkillRequirement {
  constructor(
    public id: string,
    public skill: Skill,
    public level: SkillLevel,
  ) {
  }
}