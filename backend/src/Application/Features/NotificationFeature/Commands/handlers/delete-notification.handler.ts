import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { DeleteNotificationCommand } from '../delete-notification.command'
import { INotificationRepository } from '../../../../repositories/notification.repository'

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationHandler implements ICommandHandler<DeleteNotificationCommand> {
    constructor(
        @Inject(INotificationRepository)
        private readonly repo: INotificationRepository,
    ) {}

    async execute(command: DeleteNotificationCommand): Promise<void> {
        await this.repo.softDelete(command.id, command.userId)
    }
}
