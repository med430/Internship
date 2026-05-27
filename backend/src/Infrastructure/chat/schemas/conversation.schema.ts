import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ConversationDocument extends Document {
    @Prop({ type: [String], required: true })
    participantIds: string[];

    @Prop({ type: String, default: null })
    lastMessagePreview: string | null;

    @Prop({ type: Date, default: null })
    lastMessageAt: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationDocument);

// Index for fast lookup by participant
ConversationSchema.index({ participantIds: 1 });
