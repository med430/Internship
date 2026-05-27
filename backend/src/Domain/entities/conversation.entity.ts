import { BaseEntity } from './base.entity';

export class Conversation extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly participantIds: string[],
        public lastMessagePreview: string | null,
        public lastMessageAt: Date | null,
        createdAt?: Date,
        updatedAt?: Date,
    ) {
        super(createdAt, updatedAt);
    }
}
