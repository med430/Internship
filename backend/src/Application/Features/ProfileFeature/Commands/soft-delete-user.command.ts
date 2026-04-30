// Commands/soft-delete-user.command.ts
export class SoftDeleteUserCommand {
    constructor(
        public readonly userId: string
    ) {}
}