export class DeleteProjectCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string
    ) {}
}