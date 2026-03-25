import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Get Mongo User ID from Supabase ID
  async getMongoUser(supabaseId: string) {
    const user = await this.userModel.findOne({ supabaseId });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // List all chats a user is part of (Direct & Group)
  async getUserChats(supabaseId: string) {
    const user = await this.getMongoUser(supabaseId);
    return this.chatModel
      .find({ members: user._id })
      .populate('activity', 'title image')
      .populate('members', 'name avatar')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 })
      .exec();
  }

  // Create or Get a Direct Chat between two users
  async findOrCreateDirectChat(supabaseId: string, recipientId: string) {
    const user = await this.getMongoUser(supabaseId);
    const recipientObjectId = new Types.ObjectId(recipientId);

    // Check if a direct chat already exists between these two
    let chat = await this.chatModel.findOne({
      type: 'direct',
      members: { $all: [user._id, recipientObjectId] },
    });

    if (!chat) {
      chat = await this.chatModel.create({
        type: 'direct',
        members: [user._id, recipientObjectId],
      });
    }
    return chat;
  }


 // Your existing sendMessage is already great for Sockets!
  async sendMessage(supabaseId: string, chatId: string, text: string) {
    const user = await this.getMongoUser(supabaseId);
    
    const message = await this.messageModel.create({
      chatId: new Types.ObjectId(chatId),
      sender: user._id,
      text,
    });

    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: user._id,
        createdAt: new Date(),
      },
    });

    return message.populate('sender', 'name avatar');
  }

  // Get messages for a specific chat
  async getMessages(chatId: string) {
    return this.messageModel
      .find({ chatId: new Types.ObjectId(chatId) })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 }) // Oldest to newest
      .exec();
  }
}