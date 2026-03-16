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
    let user = await this.userModel.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      const orConditions: any[] =[];
      
      if (firebaseUser.email) orConditions.push({ email: firebaseUser.email });
      if (firebaseUser.phone_number) orConditions.push({ phone: firebaseUser.phone_number });

      if (orConditions.length > 0) {
        user = await this.userModel.findOne({ $or: orConditions });
      }

      if (user) {
        // MERGE ACCOUNTS
        user.firebaseUid = firebaseUser.uid;
        if (!user.name || user.name === 'New User') {
          user.name = nameFromClient || firebaseUser.name || user.name;
        }
        await user.save();
      } else {
        // COMPLETELY NEW USER: Build payload dynamically to avoid passing null/undefined
        const newUserPayload: any = {
          firebaseUid: firebaseUser.uid,
          name: nameFromClient || firebaseUser.name || 'New User',
        };

        // Only add email/phone to payload if they actually exist
        if (firebaseUser.email) {
          newUserPayload.email = firebaseUser.email;
        }
        if (firebaseUser.phone_number) {
          newUserPayload.phone = firebaseUser.phone_number;
        }

        user = await this.userModel.create(newUserPayload);
      }
    }

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