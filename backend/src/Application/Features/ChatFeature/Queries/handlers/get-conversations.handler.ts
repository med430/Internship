import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetConversationsQuery } from '../get-conversations.query';
import { IConversationRepository } from '../../../../repositories/conversation.repository';
import { Conversation } from '../../../../../Domain/entities/conversation.entity';

@QueryHandler(GetConversationsQuery)
export class GetConversationsHandler implements IQueryHandler<GetConversationsQuery> {
    constructor(
        @Inject(IConversationRepository)
        private readonly conversationRepo: IConversationRepository,
    ) {}

    async execute(query: GetConversationsQuery): Promise<Conversation[]> {
        return this.conversationRepo.findByParticipant(query.userId);
    }
}
