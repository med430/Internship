import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { ApplicationStatusChangedEvent } from '../../../../../Domain/events/application-status-changed.event'
import { SseService } from '../../../../../API/http/sse/sse.service'
import { ApplicationStatus } from '../../../../../Domain/enums/application-status.enum'

@EventsHandler(ApplicationStatusChangedEvent)
export class ApplicationStatusChangedHandler
    implements IEventHandler<ApplicationStatusChangedEvent> {

    constructor(private readonly sseService: SseService) {}

    handle(event: ApplicationStatusChangedEvent): void {
        const { studentUserId, applicationId, offerTitle, status } = event
        const isAccepted = status === ApplicationStatus.ACCEPTED

        this.sseService.sendToUser(studentUserId, {
            type: 'application-status-changed',
            title: isAccepted ? 'Application Accepted!' : 'Application Update',
            message: isAccepted
                ? `Congratulations! Your application for "${offerTitle}" has been accepted.`
                : `Your application for "${offerTitle}" has been rejected.`,
            applicationId,
            status,
        })
    }
}