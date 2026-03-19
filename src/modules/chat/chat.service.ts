import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async getUserChats(userId: string) {
    return this.chatModel
      .find({ members: userId })
      .populate('activity', 'title image') 
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 })
      .exec();
  }
}