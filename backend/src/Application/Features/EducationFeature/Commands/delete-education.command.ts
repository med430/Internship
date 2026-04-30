export class DeleteEducationCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string
    ) {}
}