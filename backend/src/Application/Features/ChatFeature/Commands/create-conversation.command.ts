export class CreateConversationCommand {
    constructor(
        public readonly initiatorId: string,
        public readonly participantIds: string[],
    ) {}
}
