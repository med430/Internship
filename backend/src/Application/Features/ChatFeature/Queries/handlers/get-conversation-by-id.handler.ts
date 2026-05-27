import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { GetConversationByIdQuery } from '../get-conversation-by-id.query'
import { IConversationRepository } from '../../../../repositories/conversation.repository'
import { Conversation } from '../../../../../Domain/entities/conversation.entity'

@QueryHandler(GetConversationByIdQuery)
export class GetConversationByIdHandler implements IQueryHandler<GetConversationByIdQuery> {
    constructor(
        @Inject(IConversationRepository)
        private readonly conversationRepo: IConversationRepository,
    ) {}

    async execute(query: GetConversationByIdQuery): Promise<Conversation> {
        const conversation = await this.conversationRepo.findById(query.conversationId)
        if (!conversation) throw new NotFoundException('Conversation not found')
        return conversation
    }
}
