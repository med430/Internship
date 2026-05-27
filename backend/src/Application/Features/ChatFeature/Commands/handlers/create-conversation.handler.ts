import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateConversationCommand } from '../create-conversation.command';
import { IConversationRepository } from '../../../../repositories/conversation.repository';
import { Conversation } from '../../../../../Domain/entities/conversation.entity';

@CommandHandler(CreateConversationCommand)
export class CreateConversationHandler implements ICommandHandler<CreateConversationCommand> {
    constructor(
        @Inject(IConversationRepository)
        private readonly conversationRepo: IConversationRepository,
    ) {}

    async execute(command: CreateConversationCommand): Promise<Conversation> {
        const allParticipants = Array.from(
            new Set([command.initiatorId, ...command.participantIds]),
        );

        const existing = await this.conversationRepo.findByParticipants(allParticipants);
        if (existing) throw new ConflictException('A conversation with these participants already exists');

        const conversation = new Conversation(
            '',
            allParticipants,
            null,
            null,
            new Date(),
        );

        return this.conversationRepo.save(conversation);
    }
}
