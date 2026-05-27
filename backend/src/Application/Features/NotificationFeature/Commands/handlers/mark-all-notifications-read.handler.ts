import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { MarkAllNotificationsReadCommand } from '../mark-all-notifications-read.command'
import { INotificationRepository } from '../../../../repositories/notification.repository'

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler implements ICommandHandler<MarkAllNotificationsReadCommand> {
    constructor(
        @Inject(INotificationRepository)
        private readonly repo: INotificationRepository,
    ) {}

    async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
        await this.repo.markAllRead(command.userId)
    }
}
