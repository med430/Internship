import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SendMessageCommand } from '../send-message.command';
import { IMessageRepository } from '../../../../repositories/message.repository';
import { IConversationRepository } from '../../../../repositories/conversation.repository';
import { Message } from '../../../../../Domain/entities/message.entity';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
    constructor(
        @Inject(IMessageRepository)
        private readonly messageRepo: IMessageRepository,
        @Inject(IConversationRepository)
        private readonly conversationRepo: IConversationRepository,
    ) {}

    async execute(command: SendMessageCommand): Promise<Message> {
        const conversation = await this.conversationRepo.findById(command.conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const now = new Date();
        const message = new Message(
            '',
            command.conversationId,
            command.senderId,
            command.senderName,
            command.content,
            [command.senderId],
            now,
            now,
        );

        const saved = await this.messageRepo.save(message);

        conversation.lastMessagePreview = command.content.slice(0, 80);
        conversation.lastMessageAt = now;
        await this.conversationRepo.save(conversation);

        return saved;
    }
}
