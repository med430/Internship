import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { MarkMessagesReadCommand } from '../mark-messages-read.command'
import { IMessageRepository } from '../../../../repositories/message.repository'

@CommandHandler(MarkMessagesReadCommand)
export class MarkMessagesReadHandler implements ICommandHandler<MarkMessagesReadCommand> {
    constructor(
        @Inject(IMessageRepository)
        private readonly messageRepo: IMessageRepository,
    ) {}

    async execute(command: MarkMessagesReadCommand): Promise<void> {
        await this.messageRepo.markAsRead(command.conversationId, command.userId)
    }
}
