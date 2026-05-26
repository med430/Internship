export class GetMessagesQuery {
    constructor(
        public readonly conversationId: string,
        public readonly limit: number = 50,
        public readonly before?: Date,
    ) {}
}
