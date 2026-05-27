import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConversationRepository } from '../../../Application/repositories/conversation.repository';
import { Conversation } from '../../../Domain/entities/conversation.entity';
import { ConversationDocument } from '../schemas/conversation.schema';

@Injectable()
export class MongoConversationRepository implements IConversationRepository {
    constructor(
        @InjectModel(ConversationDocument.name)
        private readonly model: Model<ConversationDocument>,
    ) {}

    private toDomain(doc: ConversationDocument): Conversation {
        return new Conversation(
            doc._id.toString(),
            doc.participantIds,
            doc.lastMessagePreview,
            doc.lastMessageAt,
            (doc as any).createdAt,
            (doc as any).updatedAt,
        );
    }

    async findById(id: string): Promise<Conversation | null> {
        const doc = await this.model.findById(id).lean();
        if (!doc) return null;
        return this.toDomain(doc as unknown as ConversationDocument);
    }

    async findByParticipant(userId: string): Promise<Conversation[]> {
        const docs = await this.model
            .find({ participantIds: userId })
            .sort({ lastMessageAt: -1 })
            .lean();
        return docs.map(d => this.toDomain(d as unknown as ConversationDocument));
    }

    async findByParticipants(participantIds: string[]): Promise<Conversation | null> {
        const sorted = [...participantIds].sort();
        const doc = await this.model
            .findOne({ participantIds: { $all: sorted, $size: sorted.length } })
            .lean();
        if (!doc) return null;
        return this.toDomain(doc as unknown as ConversationDocument);
    }

    async save(conversation: Conversation): Promise<Conversation> {
        if (!conversation.id) {
            const created = await this.model.create({
                participantIds: conversation.participantIds,
                lastMessagePreview: conversation.lastMessagePreview,
                lastMessageAt: conversation.lastMessageAt,
            });
            return this.toDomain(created);
        }

        const updated = await this.model.findByIdAndUpdate(
            conversation.id,
            {
                lastMessagePreview: conversation.lastMessagePreview,
                lastMessageAt: conversation.lastMessageAt,
            },
            { new: true },
        );
        return this.toDomain(updated!);
    }

    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id);
    }
}
