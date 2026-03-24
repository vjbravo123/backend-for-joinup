// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async syncUser(supabaseUser: any, nameFromClient?: string) {
    // 1. Try to find by Supabase ID
    let user = await this.userModel.findOne({ supabaseId: supabaseUser.id });

    if (!user) {
      // 2. Try to merge via Email or Phone if they exist
      const orConditions: any[] = [];
      if (supabaseUser.email) orConditions.push({ email: supabaseUser.email });
      if (supabaseUser.phone) orConditions.push({ phone: supabaseUser.phone });

      if (orConditions.length > 0) {
        user = await this.userModel.findOne({ $or: orConditions });
      }

      if (user) {
        // Link existing record to this new Supabase ID
        user.supabaseId = supabaseUser.id;
        if (!user.name || user.name === 'New User') {
          user.name = nameFromClient || supabaseUser.user_metadata?.full_name || user.name;
        }
        await user.save();
      } else {
        // 3. Create brand new user
        user = await this.userModel.create({
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          phone: supabaseUser.phone,
          name: nameFromClient || supabaseUser.user_metadata?.full_name || 'New User',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        });
      }
    }

    return {
      id: user._id.toString(),
      supabaseId: user.supabaseId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
      joinedCount: user.joinedCount,
      hostedCount: user.hostedCount,
    };
  }
}