import {SkillLevel} from "../../../../Domain/enums/skill-level.enum";

export class UpdateSkillCommand {
    constructor(
        public readonly userId: string,
        public readonly assignmentId: string,
        public readonly level: SkillLevel
    ) {}
}