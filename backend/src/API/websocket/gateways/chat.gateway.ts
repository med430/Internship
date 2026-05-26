import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IMessageRepository } from '../../../Application/repositories/message.repository';
import { IConversationRepository } from '../../../Application/repositories/conversation.repository';
import { Message } from '../../../Domain/entities/message.entity';

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

    // socket.id → set of conversationIds the socket is listening to
    private subscriptions = new Map<string, Set<string>>();

    constructor(
        @Inject(IMessageRepository)
        private readonly messageRepo: IMessageRepository,
        @Inject(IConversationRepository)
        private readonly conversationRepo: IConversationRepository,
    ) {}

    handleDisconnect(client: Socket) {
        this.subscriptions.delete(client.id);
    }

    // Client subscribes to a conversation room to receive real-time messages
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

    // Send a message via WebSocket (alternative to REST POST)
    @SubscribeMessage('send-message')
    async handleSendMessage(
        @MessageBody() payload: ChatPayload,
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId, content, senderId, senderName } = payload;

        const conversation = await this.conversationRepo.findById(conversationId);
        if (!conversation) {
            client.emit('error', { message: 'Conversation not found' });
            return;
        }

        const now = new Date();
        const message = new Message('', conversationId, senderId, senderName, content, [senderId], now, now);
        const saved = await this.messageRepo.save(message);

        // Update conversation preview
        conversation.lastMessagePreview = content.slice(0, 80);
        conversation.lastMessageAt = now;
        await this.conversationRepo.save(conversation);

        // Broadcast to everyone in the room (including sender)
        this.server.to(`conv:${conversationId}`).emit('new-message', saved);
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() payload: TypingPayload,
        @ConnectedSocket() client: Socket,
    ) {
        // Broadcast typing indicator to others in the room
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
        await this.messageRepo.markAsRead(payload.conversationId, payload.userId);
        this.server.to(`conv:${payload.conversationId}`).emit('messages-read', {
            conversationId: payload.conversationId,
            userId: payload.userId,
        });
    }
}
