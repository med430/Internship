// delete-cover-letter.command.ts
export class DeleteCoverLetterCommand {
    constructor(
        public readonly userId: string,
        public readonly letterId: string
    ) {}
}