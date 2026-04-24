// remove-skill.command.ts
export class RemoveSkillCommand {
    constructor(
        public readonly userId: string,
        public readonly assignmentId: string
    ) {}
}