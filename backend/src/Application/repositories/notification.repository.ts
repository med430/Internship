import { Notification } from '../../Domain/entities/notification.entity'

export interface INotificationRepository {
    save(notification: Notification): Promise<Notification>
    findByUserId(userId: string, limit?: number): Promise<Notification[]>
    markRead(id: string, userId: string): Promise<void>
    markAllRead(userId: string): Promise<void>
    softDelete(id: string, userId: string): Promise<void>
}

export const INotificationRepository = Symbol('INotificationRepository')
