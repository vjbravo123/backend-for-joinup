import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('chats')
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMyChats(@Req() req) {
    return this.chatService.getUserChats(req.user.id);
  }

  @Post('direct')
  async openDirectChat(@Req() req, @Body('recipientId') recipientId: string) {
    return this.chatService.findOrCreateDirectChat(req.user.id, recipientId);
  }

  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(chatId);
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Req() req,
    @Param('chatId') chatId: string,
    @Body('text') text: string,
  ) {
    return this.chatService.sendMessage(req.user.id, chatId, text);
  }
}