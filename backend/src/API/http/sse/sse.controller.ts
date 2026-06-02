import { Controller, Sse, UseGuards } from '@nestjs/common'
import { Observable } from 'rxjs'
import { SseService, SseMessage } from './sse.service'
import { SseAuthGuard } from '../guards/sse-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'

@Controller()
export class SseController {
    constructor(private readonly sseService: SseService) {}

    @Sse('notifications/stream')
    @UseGuards(SseAuthGuard)
    stream(@CurrentUser() user: { id: string }): Observable<{ data: SseMessage }> {
        return this.sseService.addClient(user.id)
    }
}