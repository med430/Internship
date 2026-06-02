import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import { GetNotificationsQuery } from '../../../Application/Features/NotificationFeature/Queries/get-notifications.query'
import { MarkNotificationReadCommand } from '../../../Application/Features/NotificationFeature/Commands/mark-notification-read.command'
import { MarkAllNotificationsReadCommand } from '../../../Application/Features/NotificationFeature/Commands/mark-all-notifications-read.command'
import { DeleteNotificationCommand } from '../../../Application/Features/NotificationFeature/Commands/delete-notification.command'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @Get()
    getAll(@CurrentUser() user: { id: string; role?: string }) {
        return this.queryBus.execute(new GetNotificationsQuery(user.id, 50, user.role))
    }

    @Patch('read-all')
    markAllRead(@CurrentUser() user: { id: string }) {
        return this.commandBus.execute(new MarkAllNotificationsReadCommand(user.id))
    }

    @Patch(':id/read')
    markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.commandBus.execute(new MarkNotificationReadCommand(id, user.id))
    }

    @Delete(':id')
    delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.commandBus.execute(new DeleteNotificationCommand(id, user.id))
    }
}