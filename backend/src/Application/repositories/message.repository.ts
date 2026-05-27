import { Message } from '../../Domain/entities/message.entity';

export interface IMessageRepository {
    save(message: Message): Promise<Message>;
    findByConversation(conversationId: string, limit: number, before?: Date): Promise<Message[]>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    deleteByConversation(conversationId: string): Promise<void>;
}

export const IMessageRepository = Symbol('IMessageRepository');
