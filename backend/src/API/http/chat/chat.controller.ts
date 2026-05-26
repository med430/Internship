import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { SupabaseUser } from '../decorators/supabase-user.decorator';
import type { ResolvedUser } from '../../../Application/Services/AuthBridge/supabase-auth-bridge.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationCommand } from '../../../Application/Features/ChatFeature/Commands/create-conversation.command';
import { SendMessageCommand } from '../../../Application/Features/ChatFeature/Commands/send-message.command';
import { GetConversationsQuery } from '../../../Application/Features/ChatFeature/Queries/get-conversations.query';
import { GetMessagesQuery } from '../../../Application/Features/ChatFeature/Queries/get-messages.query';
import { IUserRepository } from '../../../Application/repositories/user.repository';

@Controller('chat')
@UseGuards(SupabaseAuthGuard)
export class ChatController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,
    ) {}

    // GET /chat/users  — returns all active users except the caller (for the new-conversation picker)
    @Get('users')
    async getUsers(@SupabaseUser() user: ResolvedUser) {
        const all = await this.userRepo.findAll();
        return all
            .filter((u) => u.id !== user.id && !u.deletedAt)
            .map((u) => ({
                id: u.id,
                name: [u.name, u.lastname].filter(Boolean).join(' ') || u.email,
                email: u.email,
                avatarUrl: u.avatarUrl ?? null,
            }));
    }

    // POST /chat/conversations
    @Post('conversations')
    createConversation(
        @Body() dto: CreateConversationDto,
        @SupabaseUser() user: ResolvedUser,
    ) {
        return this.commandBus.execute(
            new CreateConversationCommand(user.id, dto.participantIds),
        );
    }

    // GET /chat/conversations
    @Get('conversations')
    getConversations(@SupabaseUser() user: ResolvedUser) {
        return this.queryBus.execute(new GetConversationsQuery(user.id));
    }

    // GET /chat/conversations/:id/messages?limit=50&before=<ISO>
    @Get('conversations/:id/messages')
    getMessages(
        @Param('id') conversationId: string,
        @Query('limit') limit?: string,
        @Query('before') before?: string,
    ) {
        return this.queryBus.execute(
            new GetMessagesQuery(
                conversationId,
                limit ? parseInt(limit, 10) : 50,
                before ? new Date(before) : undefined,
            ),
        );
    }

    // POST /chat/conversations/:id/messages
    @Post('conversations/:id/messages')
    sendMessage(
        @Param('id') conversationId: string,
        @Body() dto: SendMessageDto,
        @SupabaseUser() user: ResolvedUser,
    ) {
        return this.commandBus.execute(
            new SendMessageCommand(conversationId, user.id, user.email, dto.content),
        );
    }
}
