import { Skill } from './skill.entity'
import { SkillLevel } from '../enums/skill-level.enum'

export class SkillAssignment {
    constructor(
        public skill: Skill,
        public level: SkillLevel // 🔥 PAS optionnel
    ) {}
  public id = () => this.skill.id;
}