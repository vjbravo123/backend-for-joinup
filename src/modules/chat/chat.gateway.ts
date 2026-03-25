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
  @MessageBody() data: { chatId: string; supabaseId: string; text: string },
) {
  try {
    console.log('📩 Received message via socket:', data);

    const message = await this.chatService.sendMessage(
      data.supabaseId, // This must match the field name sent from frontend
      data.chatId,
      data.text,
    );

    // Broadcast to the room
    this.server.to(data.chatId).emit('newMessage', message);
    
    // Update chat list preview
    this.server.emit('chatUpdated', {
        chatId: data.chatId,
        lastMessage: message
    });
  } catch (error) {
    console.error('❌ Error in socket sendMessage:', error.message);
    // Optionally emit an error back to the sender
    client.emit('error', { message: 'Failed to send message' });
  }
}
}