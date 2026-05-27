import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMessagesQuery } from '../get-messages.query';
import { IMessageRepository } from '../../../../repositories/message.repository';
import { Message } from '../../../../../Domain/entities/message.entity';

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
    constructor(
        @Inject(IMessageRepository)
        private readonly messageRepo: IMessageRepository,
    ) {}

    async execute(query: GetMessagesQuery): Promise<Message[]> {
        return this.messageRepo.findByConversation(query.conversationId, query.limit, query.before);
    }
}
