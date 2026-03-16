import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async syncUser(firebaseUser: any, nameFromClient?: string) {
    // 1. Check if user already exists in DB
    let user = await this.userModel.findOne({ firebaseUid: firebaseUser.uid });

    // 2. If not, this is a new signup! Create the user.
    if (!user) {
      user = await this.userModel.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        phone: firebaseUser.phone_number || undefined,
        // Use name from frontend (for new phone/email signups) or fallback to Firebase Google name
        name: nameFromClient || firebaseUser.name || 'New User',
      });
    }

    // Return the user data to be stored in Redux
    return {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
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