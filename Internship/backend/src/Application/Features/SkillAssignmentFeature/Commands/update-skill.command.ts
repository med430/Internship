// update-skill.command.ts
export class UpdateSkillCommand {
    constructor(
        public readonly userId: string,
        public readonly assignmentId: string,
        public readonly level: string
    ) {}
}