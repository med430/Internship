import { Skill } from './skill.entity';
import { SkillLevel } from "../enums/skill-level.enum";
export declare class SkillRequirement {
    readonly id: string;
    readonly skill: Skill;
    level: SkillLevel;
    constructor(id: string, skill: Skill, level: SkillLevel);
}
