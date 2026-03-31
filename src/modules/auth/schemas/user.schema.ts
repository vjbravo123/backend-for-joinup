// src/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
class SocialLinks {
  @Prop() instagram?: string;
  @Prop() linkedin?: string;
  @Prop() twitter?: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  supabaseId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  // from OLD schema
  @Prop({ unique: true, sparse: true })
  phone?: string;

  // from NEW schema
  @Prop()
  dob?: Date;

  @Prop({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  gender?: string;

  @Prop({ default: 'https://randomuser.me/api/portraits/men/32.jpg' })
  avatar: string;

  // NEW schema multi image support
  @Prop({ type: [String], default: [] })
  gallery: string[];

  // merged bio default (kept new version)
  @Prop({ default: 'New explorer' })
  bio: string;

  // NEW schema profile fields
  @Prop()
  jobTitle?: string;

  @Prop()
  company?: string;

  @Prop()
  education?: string;

  @Prop()
  hometown?: string;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: SocialLinks, default: {} })
  socialLinks: SocialLinks;

  // common field
  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: 0 })
  joinedCount: number;

  @Prop({ default: 0 })
  hostedCount: number;

  // NEW schema
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 'free', enum: ['free', 'premium', 'gold'] })
  membershipType: string;

  @Prop({ default: 0 })
  profileCompletion: number;
}

export const UserSchema = SchemaFactory.createForClass(User);