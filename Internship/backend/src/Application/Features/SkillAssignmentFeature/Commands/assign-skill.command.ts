// assign-skill.command.ts
export class AssignSkillCommand {
    constructor(
        public readonly userId: string,
        public readonly skillId: number,
        public readonly level: string
    ) {}
}