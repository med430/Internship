import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { INotificationRepository } from '../../../Application/repositories/notification.repository'
import { Notification } from '../../../Domain/entities/notification.entity'
import { NotificationDocument } from '../schemas/notification.schema'

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
    constructor(
        @InjectModel(NotificationDocument.name)
        private readonly model: Model<NotificationDocument>,
    ) {}

    private toDomain(doc: NotificationDocument): Notification {
        return new Notification(
            (doc._id as any).toString(),
            doc.userId,
            doc.type,
            doc.title,
            doc.message,
            doc.link,
            doc.isRead,
            (doc as any).createdAt,
            doc.deletedAt,
        )
    }

    async save(notification: Notification): Promise<Notification> {
        const created = await this.model.create({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            isRead: false,
            deletedAt: null,
        })
        return this.toDomain(created)
    }

    async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
        const docs = await this.model
            .find({ userId, deletedAt: null })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
        return docs.map(d => this.toDomain(d as unknown as NotificationDocument))
    }

    async markRead(id: string, userId: string): Promise<void> {
        await this.model.updateOne({ _id: id, userId }, { isRead: true })
    }

    async markAllRead(userId: string): Promise<void> {
        await this.model.updateMany({ userId, isRead: false, deletedAt: null }, { isRead: true })
    }

    async softDelete(id: string, userId: string): Promise<void> {
        await this.model.updateOne({ _id: id, userId }, { deletedAt: new Date() })
    }
}