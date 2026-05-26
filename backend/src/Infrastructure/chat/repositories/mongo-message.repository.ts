import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMessageRepository } from '../../../Application/repositories/message.repository';
import { Message } from '../../../Domain/entities/message.entity';
import { MessageDocument } from '../schemas/message.schema';

@Injectable()
export class MongoMessageRepository implements IMessageRepository {
    constructor(
        @InjectModel(MessageDocument.name)
        private readonly model: Model<MessageDocument>,
    ) {}

    private toDomain(doc: MessageDocument): Message {
        return new Message(
            doc._id.toString(),
            doc.conversationId,
            doc.senderId,
            doc.senderName,
            doc.content,
            doc.readBy,
            (doc as any).createdAt,
            (doc as any).updatedAt,
        );
    }

    async save(message: Message): Promise<Message> {
        const created = await this.model.create({
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            readBy: message.readBy,
        });
        return this.toDomain(created);
    }

    async findByConversation(conversationId: string, limit: number, before?: Date): Promise<Message[]> {
        const filter: any = { conversationId };
        if (before) filter.createdAt = { $lt: before };

        const docs = await this.model
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Return in ascending order (oldest first)
        return docs
            .reverse()
            .map(d => this.toDomain(d as unknown as MessageDocument));
    }

    async markAsRead(conversationId: string, userId: string): Promise<void> {
        await this.model.updateMany(
            { conversationId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } },
        );
    }

    async deleteByConversation(conversationId: string): Promise<void> {
        await this.model.deleteMany({ conversationId });
    }
}
