
import { SkillLevel } from '../enums/skill-level.enum'

export class SkillAssignment {
    constructor(
        public readonly id: string,
        public readonly skillId: number,
        public readonly studentProfileId: string,
        public level: SkillLevel
    ) {}
}