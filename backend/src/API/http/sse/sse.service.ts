import { Injectable } from '@nestjs/common'
import { Subject, Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'
import { INotificationEmitter, NotificationPayload } from '../../../Application/Services/NotificationEmitter/notification-emitter.interface'

export type SseMessage = NotificationPayload

@Injectable()
export class SseService implements INotificationEmitter {
    private readonly clients = new Map<string, Subject<{ data: NotificationPayload }>>()

    addClient(userId: string): Observable<{ data: NotificationPayload }> {
        this.clients.get(userId)?.complete()

        const subject = new Subject<{ data: NotificationPayload }>()
        this.clients.set(userId, subject)

        return subject.asObservable().pipe(
            finalize(() => {
                this.clients.delete(userId)
            }),
        )
    }

    sendToUser(userId: string, payload: NotificationPayload): void {
        this.clients.get(userId)?.next({ data: payload })
    }
}
