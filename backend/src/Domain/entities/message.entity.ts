// Message is a lightweight record — not a rich domain entity.
// Business rules live in Conversation; Message is an append-only log entry.
export class Message {
    constructor(
        public readonly id: string,
        public readonly conversationId: string,
        public readonly senderId: string,
        public readonly senderName: string,
        public content: string,
        public readBy: string[],
        public readonly createdAt: Date,
        public updatedAt: Date,
    ) {}
}
