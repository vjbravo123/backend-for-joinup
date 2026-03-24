// src/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  supabaseId: string; // Updated from firebaseUid

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop({ default: 'https://randomuser.me/api/portraits/men/32.jpg' })
  avatar: string;

  @Prop({ default: 'Always down for a weekend trek or a quick cricket match.' })
  bio: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: 0 })
  joinedCount: number;

  @Prop({ default: 0 })
  hostedCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);