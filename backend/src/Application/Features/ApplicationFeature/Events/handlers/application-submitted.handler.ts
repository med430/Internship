import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { ApplicationSubmittedEvent } from '../../../../../Domain/events/application-submitted.event'
import { SseService } from '../../../../../API/http/sse/sse.service'

@EventsHandler(ApplicationSubmittedEvent)
export class ApplicationSubmittedHandler
    implements IEventHandler<ApplicationSubmittedEvent> {

    constructor(private readonly sseService: SseService) {}

    handle(event: ApplicationSubmittedEvent): void {
        const { recruiterUserId, applicationId, offerTitle } = event

        this.sseService.sendToUser(recruiterUserId, {
            type: 'application-submitted',
            title: 'New Application Received',
            message: `A new candidate applied to "${offerTitle}".`,
            applicationId,
        })
    }
}