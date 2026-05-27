export interface NotificationPayload {
    type: string
    [key: string]: unknown
}

export const INotificationEmitter = Symbol('INotificationEmitter')

export interface INotificationEmitter {
    sendToUser(userId: string, payload: NotificationPayload): void
}
