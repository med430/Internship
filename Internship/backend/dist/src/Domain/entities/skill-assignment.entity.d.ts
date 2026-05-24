import { SkillLevel } from '../enums/skill-level.enum';
export declare class SkillAssignment {
    readonly id: string;
    readonly skillId: number;
    readonly studentProfileId: string;
    level: SkillLevel;
    constructor(id: string, skillId: number, studentProfileId: string, level: SkillLevel);
}
