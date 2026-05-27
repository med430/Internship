import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { MarkNotificationReadCommand } from '../mark-notification-read.command'
import { INotificationRepository } from '../../../../repositories/notification.repository'

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
    constructor(
        @Inject(INotificationRepository)
        private readonly repo: INotificationRepository,
    ) {}

    async execute(command: MarkNotificationReadCommand): Promise<void> {
        await this.repo.markRead(command.id, command.userId)
    }
}