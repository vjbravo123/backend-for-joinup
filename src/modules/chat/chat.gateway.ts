import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' }, // Adjust for production
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; senderId: string; text: string },
  ) {
    const message = await this.chatService.sendMessage(
      data.senderId,
      data.chatId,
      data.text,
    );

    // Emit the message to everyone in the room (including sender)
    this.server.to(data.chatId).emit('newMessage', message);
    
    // Also emit an update to the chat list (for the 'last message' preview)
    this.server.emit('chatUpdated', {
        chatId: data.chatId,
        lastMessage: message
    });
  }
}