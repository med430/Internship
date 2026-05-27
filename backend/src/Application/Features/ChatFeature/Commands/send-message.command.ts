export class SendMessageCommand {
    constructor(
        public readonly conversationId: string,
        public readonly senderId: string,
        public readonly senderName: string,
        public readonly content: string,
    ) {}
}
