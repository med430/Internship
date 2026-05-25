import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class CallGateway {
    @WebSocketServer()
    server: Server;

    private getRoom(client: Socket): string | null {
        const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
        return rooms[0] ?? null;
    }

    @SubscribeMessage('join-room')
    handleJoin(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {
        // Leave all current rooms first
        Array.from(client.rooms).forEach((r) => {
            if (r !== client.id) client.leave(r);
        });

        client.join(room);
        // Notify others in the room someone joined
        client.to(room).emit('peer-joined', { peerId: client.id });
        console.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage('leave-room')
    handleLeave(@ConnectedSocket() client: Socket) {
        const room = this.getRoom(client);
        if (room) {
            client.to(room).emit('peer-left', { peerId: client.id });
            client.leave(room);
        }
    }

    @SubscribeMessage('text')
    handleText(
        @MessageBody() message: { text: string; sender: string; time: number },
        @ConnectedSocket() client: Socket,
    ) {
        const room = this.getRoom(client);
        if (room) {
            // Broadcast to room including sender
            this.server.to(room).emit('text', message);
        }
    }

    @SubscribeMessage('audio')
    handleAudio(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: Buffer,
    ) {
        const room = this.getRoom(client);
        if (room) {
            // Send to everyone else in the room, not back to sender
            client.to(room).emit('audio', data);
        }
    }

    @SubscribeMessage('video')
    handleVideo(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: Buffer,
    ) {
        const room = this.getRoom(client);
        if (room) {
            client.to(room).emit('video', data);
        }
    }

    @SubscribeMessage('call-signal')
    handleSignal(
        @ConnectedSocket() client: Socket,
        @MessageBody() signal: { type: string; payload?: unknown },
    ) {
        const room = this.getRoom(client);
        if (room) {
            client.to(room).emit('call-signal', {
                ...signal,
                peerId: client.id,
            });
        }
    }
}