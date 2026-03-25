import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace '*' with your actual frontend URL
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Triggered when a device connects
  handleConnection(client: Socket) {
    console.log(`🚀 Client connected: ${client.id}`);
  }

  // Triggered when a device disconnects
  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  /**
   * Room Management: joinChat
   * Allows a user to join a specific room based on the Chat ID
   */
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!chatId) return;
    client.join(chatId);
    console.log(`👥 Client ${client.id} joined room: ${chatId}`);
  }

  /**
   * Room Management: leaveChat
   * Clean up when a user exits a chat screen
   */
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!chatId) return;
    client.leave(chatId);
    console.log(`🏃 Client ${client.id} left room: ${chatId}`);
  }

  /**
   * Message Handling: sendMessage
   * Saves message to DB and broadcasts to everyone in the specific room
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; supabaseId: string; text: string },
  ) {
    try {
      // 1. Basic Validation
      if (!data.chatId || !data.supabaseId || !data.text) {
        throw new Error('Missing chatId, supabaseId, or text');
      }

      console.log('📩 Incoming message via socket:', data);

      // 2. Save to database using your Service
      // This method (already updated) finds the Mongo User by supabaseId,
      // creates the message, updates 'lastMessage' in Chat, and populates 'sender'
      const message = await this.chatService.sendMessage(
        data.supabaseId,
        data.chatId,
        data.text,
      );

      // 3. Emit the populated message to the specific room only
      // Event name 'newMessage' matches your Frontend listener
      this.server.to(data.chatId).emit('newMessage', message);
      
      // 4. Update the global chat list preview
      // This allows the main 'Chats' screen to update the last message text in real-time
      this.server.emit('chatUpdated', {
          chatId: data.chatId,
          lastMessage: message
      });

    } catch (error) {
      console.error('❌ Error in ChatGateway (sendMessage):', error.message);
      
      // Notify the sender that the message failed
      client.emit('error', { 
        event: 'sendMessage',
        message: 'Message could not be sent. User profile may be missing.' 
      });
    }
  }
}