// src/modules/chat/schemas/chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  activity: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  @Prop({
    type: {
      text: String,
      sender: { type: Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  })
  lastMessage: any;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);