import { Skill } from './skill.entity'
import { SkillLevel } from '../enums/skill-level.enum'
import { StudentProfile } from './student-profile.entity';

export class SkillAssignment {
    constructor(
      public id: string,
        public skillId: number,
        public studentProfileId: string,
        public level: SkillLevel // 🔥 PAS optionnel
    ) {}
}