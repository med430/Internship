import { Injectable } from '@nestjs/common'
import { Subject, Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'

export interface SseMessage {
    type: string
    [key: string]: unknown
}

@Injectable()
export class SseService {
    private readonly clients = new Map<string, Subject<{ data: SseMessage }>>()

    addClient(userId: string): Observable<{ data: SseMessage }> {
        this.clients.get(userId)?.complete()

        const subject = new Subject<{ data: SseMessage }>()
        this.clients.set(userId, subject)

        return subject.asObservable().pipe(
            finalize(() => {
                this.clients.delete(userId)
            }),
        )
    }

    sendToUser(userId: string, message: SseMessage): void {
        this.clients.get(userId)?.next({ data: message })
    }
}
