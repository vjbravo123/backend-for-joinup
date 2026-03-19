// src/modules/activities/schemas/activity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string; // Added for detail page

  @Prop({ default: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18' })
  image: string; // Added for detail page

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  time: string; 

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[]; // List of user IDs

  @Prop({ default: 1 })
  participantsJoined: number;

  @Prop({ required: true })
  maxParticipants: number;

  @Prop({ default: 'Free' })
  price: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  host: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat' }) // Link to the chat
  chat: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);