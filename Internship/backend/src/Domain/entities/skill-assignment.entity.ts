import { Skill } from './skill.entity'
import { SkillLevel } from '../enums/skill-level.enum'
import { StudentProfile } from './student-profile.entity';

export class SkillAssignment {
    constructor(
      public id: string,
        public skill: Skill,
        public studentProfile: StudentProfile,
        public level: SkillLevel // 🔥 PAS optionnel
    ) {}
}