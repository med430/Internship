import { Conversation } from '../../Domain/entities/conversation.entity';

export interface IConversationRepository {
    findById(id: string): Promise<Conversation | null>;
    findByParticipant(userId: string): Promise<Conversation[]>;
    findByParticipants(participantIds: string[]): Promise<Conversation | null>;
    save(conversation: Conversation): Promise<Conversation>;
    delete(id: string): Promise<void>;
}

export const IConversationRepository = Symbol('IConversationRepository');
