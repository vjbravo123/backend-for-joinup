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
    // 1. Try to find the user by their exact Firebase UID
    let user = await this.userModel.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // FIX: Add ": any[]" so TypeScript knows this array accepts objects
      const orConditions: any[] =[]; 
      
      if (firebaseUser.email) orConditions.push({ email: firebaseUser.email });
      if (firebaseUser.phone_number) orConditions.push({ phone: firebaseUser.phone_number });

      if (orConditions.length > 0) {
        user = await this.userModel.findOne({ $or: orConditions });
      }

      if (user) {
        // MERGE ACCOUNTS: Update their existing MongoDB record with the new Firebase UID
        user.firebaseUid = firebaseUser.uid;
        
        // If they didn't have a name before, grab the Google name
        if (!user.name || user.name === 'New User') {
          user.name = nameFromClient || firebaseUser.name || user.name;
        }
        await user.save();
      } else {
        // COMPLETELY NEW USER: Create a new record
        user = await this.userModel.create({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phone_number || undefined,
          name: nameFromClient || firebaseUser.name || 'New User',
        });
      }
    }

    // Return the data to React Native Redux
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