import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendMessageCommand } from '../../../Application/Features/ChatFeature/Commands/send-message.command';
import { MarkMessagesReadCommand } from '../../../Application/Features/ChatFeature/Commands/mark-messages-read.command';
import { GetConversationByIdQuery } from '../../../Application/Features/ChatFeature/Queries/get-conversation-by-id.query';
import { Message } from '../../../Domain/entities/message.entity';
import { Conversation } from '../../../Domain/entities/conversation.entity';

interface ChatPayload {
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
}

interface TypingPayload {
    conversationId: string;
    senderId: string;
    senderName: string;
}

interface ReadPayload {
    conversationId: string;
    userId: string;
}

@WebSocketGateway({
    namespace: 'chat',
    cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private subscriptions = new Map<string, Set<string>>();

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    handleDisconnect(client: Socket) {
        this.subscriptions.delete(client.id);
    }

    @SubscribeMessage('register-user')
    handleRegisterUser(
        @MessageBody() payload: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (payload?.userId) {
            client.join(`user:${payload.userId}`);
        }
    }

    @SubscribeMessage('join-conversation')
    handleJoin(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId } = payload;
        client.join(`conv:${conversationId}`);

        if (!this.subscriptions.has(client.id)) {
            this.subscriptions.set(client.id, new Set());
        }
        this.subscriptions.get(client.id)!.add(conversationId);
    }

    @SubscribeMessage('leave-conversation')
    handleLeave(
        @MessageBody() payload: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId } = payload;
        client.leave(`conv:${conversationId}`);
        this.subscriptions.get(client.id)?.delete(conversationId);
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @MessageBody() payload: ChatPayload,
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId, content, senderId, senderName } = payload;

        let saved: Message;
        let conversation: Conversation;

        try {
            [saved, conversation] = await Promise.all([
                this.commandBus.execute<SendMessageCommand, Message>(
                    new SendMessageCommand(conversationId, senderId, senderName, content),
                ),
                this.queryBus.execute<GetConversationByIdQuery, Conversation>(
                    new GetConversationByIdQuery(conversationId),
                ),
            ]);
        } catch {
            client.emit('error', { message: 'Conversation not found' });
            return;
        }

        this.server.to(`conv:${conversationId}`).emit('new-message', saved);

        for (const participantId of conversation.participantIds) {
            this.server.to(`user:${participantId}`).emit('new-message', saved);
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() payload: TypingPayload,
        @ConnectedSocket() client: Socket,
    ) {
        client.to(`conv:${payload.conversationId}`).emit('user-typing', {
            senderId: payload.senderId,
            senderName: payload.senderName,
        });
    }

    @SubscribeMessage('mark-read')
    async handleMarkRead(
        @MessageBody() payload: ReadPayload,
        @ConnectedSocket() _client: Socket,
    ) {
        await this.commandBus.execute(
            new MarkMessagesReadCommand(payload.conversationId, payload.userId),
        );
        this.server.to(`conv:${payload.conversationId}`).emit('messages-read', {
            conversationId: payload.conversationId,
            userId: payload.userId,
        });
    }
}
