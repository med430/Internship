import { SkillLevel } from "../../../../Domain/enums/skill-level.enum";
export declare class AssignSkillCommand {
    readonly userId: string;
    readonly skillId: number;
    readonly level: SkillLevel;
    constructor(userId: string, skillId: number, level: SkillLevel);
}
