import { SkillLevel } from "../../../../Domain/enums/skill-level.enum";
export declare class UpdateSkillCommand {
    readonly userId: string;
    readonly assignmentId: string;
    readonly level: SkillLevel;
    constructor(userId: string, assignmentId: string, level: SkillLevel);
}
