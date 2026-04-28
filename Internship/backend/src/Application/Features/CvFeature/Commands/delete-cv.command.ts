// delete-cv.command.ts
export class DeleteCVCommand {
    constructor(
        public readonly userId: string,
        public readonly cvId: string
    ) {}
}