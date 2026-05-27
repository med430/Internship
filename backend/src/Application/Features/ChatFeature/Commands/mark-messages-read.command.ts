export class MarkMessagesReadCommand {
    constructor(
        public readonly conversationId: string,
        public readonly userId: string,
    ) {}
}
