// src/modules/chat/schemas/message.schema.ts
import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 'text', enum: ['text', 'system'] })
  type: string; // 'system' messages like "User joined the group"
}