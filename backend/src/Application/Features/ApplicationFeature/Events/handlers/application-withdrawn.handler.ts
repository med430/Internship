import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { ApplicationWithdrawnEvent } from '../../../../../Domain/events/application-withdrawn.event'
import { SseService } from '../../../../../API/http/sse/sse.service'

@EventsHandler(ApplicationWithdrawnEvent)
export class ApplicationWithdrawnHandler
    implements IEventHandler<ApplicationWithdrawnEvent> {

    constructor(private readonly sseService: SseService) {}

    handle(event: ApplicationWithdrawnEvent): void {
        const { recruiterUserId, applicationId, offerTitle } = event

        this.sseService.sendToUser(recruiterUserId, {
            type: 'application-withdrawn',
            title: 'Application Withdrawn',
            message: `A candidate withdrew their application for "${offerTitle}".`,
            applicationId,
        })
    }
}