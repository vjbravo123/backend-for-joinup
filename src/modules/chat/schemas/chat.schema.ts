import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: String, enum: ['direct', 'group'], required: true })
  type: string;

   @Prop() // Added for Group Chat names
  name?: string;
  
  // Optional: Only present if type is 'group'
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: false })
  activity?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  members: Types.ObjectId[];

  @Prop({
    type: {
      text: String,
      sender: { type: Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
    _id: false
  })
  lastMessage?: {
    text: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);