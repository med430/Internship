import { Skill } from './skill.entity'
import { SkillLevel } from '../enums/skill-level.enum'
import { StudentProfile } from './student-profile.entity';

export class SkillAssignment {
    constructor(
        public readonly id: string,
        public readonly skillId: number,
        public readonly studentProfileId: string,
        public level: SkillLevel
    ) {}
}