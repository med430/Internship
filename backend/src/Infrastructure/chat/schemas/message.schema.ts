import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MessageDocument extends Document {
    @Prop({ required: true })
    conversationId: string;

    @Prop({ required: true })
    senderId: string;

    @Prop({ required: true })
    senderName: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: [String], default: [] })
    readBy: string[];
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

// Fast pagination: find messages in a conversation sorted by time
MessageSchema.index({ conversationId: 1, createdAt: -1 });
