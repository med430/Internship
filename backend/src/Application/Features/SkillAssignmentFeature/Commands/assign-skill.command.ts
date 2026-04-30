import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";

export class AssignSkillCommand {
    constructor(
        public readonly userId: string,
        public readonly skillId: number,
        public readonly level: SkillLevel
    ) {}
}