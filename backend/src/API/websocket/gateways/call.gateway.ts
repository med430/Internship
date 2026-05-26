import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PeerInfo {
    name: string;
    room: string;
}

@WebSocketGateway({
    cors: { origin: '*' },
})
export class CallGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private peers = new Map<string, PeerInfo>();

    private getRoom(client: Socket): string | null {
        const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
        return rooms[0] ?? null;
    }

    handleDisconnect(client: Socket) {
        const info = this.peers.get(client.id);
        if (info?.room) {
            client.to(info.room).emit('peer-left', { peerId: client.id });
        }
        this.peers.delete(client.id);
    }

    @SubscribeMessage('join-room')
    async handleJoin(
        @MessageBody() payload: { room: string; name: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { room, name } = payload;

        // Leave all current rooms first
        Array.from(client.rooms).forEach((r) => {
            if (r !== client.id) client.leave(r);
        });

        client.join(room);
        this.peers.set(client.id, { name, room });

        // Tell the new joiner who is already in the room
        const sockets = await this.server.in(room).fetchSockets();
        const existingPeers = sockets
            .filter((s) => s.id !== client.id)
            .map((s) => ({
                peerId: s.id,
                name: this.peers.get(s.id)?.name ?? 'Unknown',
            }));
        client.emit('existing-peers', existingPeers);

        // Notify existing members that the new client joined
        client.to(room).emit('peer-joined', { peerId: client.id, name });
        console.log(`Client ${client.id} (${name}) joined room ${room}`);
    }

    @SubscribeMessage('leave-room')
    handleLeave(@ConnectedSocket() client: Socket) {
        const room = this.getRoom(client);
        if (room) {
            client.to(room).emit('peer-left', { peerId: client.id });
            client.leave(room);
        }
        this.peers.delete(client.id);
    }

    @SubscribeMessage('text')
    handleText(
        @MessageBody() message: { text: string; sender: string; time: number },
        @ConnectedSocket() client: Socket,
    ) {
        const room = this.getRoom(client);
        if (room) {
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
            client.to(room).emit('video', client.id, data);
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
