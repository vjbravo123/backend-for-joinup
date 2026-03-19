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
  // 1. Try to find by Firebase UID first
  let user = await this.userModel.findOne({ firebaseUid: firebaseUser.uid });

  if (!user) {
    // 2. If not found by UID, try to find by Email or Phone to merge accounts
    const orConditions: any[] = [];
    if (firebaseUser.email) orConditions.push({ email: firebaseUser.email });
    if (firebaseUser.phone_number) orConditions.push({ phone: firebaseUser.phone_number });

    if (orConditions.length > 0) {
      user = await this.userModel.findOne({ $or: orConditions });
    }

    if (user) {
      // Found existing user via email/phone, link the Firebase UID
      user.firebaseUid = firebaseUser.uid;
      // Only update name if the current one is placeholder
      if (!user.name || user.name === 'New User') {
        user.name = nameFromClient || firebaseUser.name || user.name;
      }
      await user.save();
    } else {
      // 3. Truly new user
      const newUserPayload: any = {
        firebaseUid: firebaseUser.uid,
        name: nameFromClient || firebaseUser.name || 'New User',
        avatar: firebaseUser.picture || 'https://randomuser.me/api/portraits/men/32.jpg'
      };

      if (firebaseUser.email) newUserPayload.email = firebaseUser.email;
      if (firebaseUser.phone_number) newUserPayload.phone = firebaseUser.phone_number;

      user = await this.userModel.create(newUserPayload);
    }
  }

  // Return consistent object
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