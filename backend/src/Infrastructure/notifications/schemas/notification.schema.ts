import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class NotificationDocument extends Document {
    @Prop({ required: true }) userId: string
    @Prop({ required: true }) type: string
    @Prop({ required: true }) title: string
    @Prop({ required: true }) message: string
    @Prop({ type: String, default: null }) link: string | null
    @Prop({ default: false }) isRead: boolean
    @Prop({ type: Date, default: null }) deletedAt: Date | null
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationDocument)

NotificationSchema.index({ userId: 1, createdAt: -1 })
