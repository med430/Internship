export class DeleteExperienceCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string
    ) {}
}