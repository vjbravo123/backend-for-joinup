import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // Ensure 'Chat' is registered in your ActivitiesModule
    @InjectModel('Chat') private chatModel: Model<any>, 
  ) {}

  private async getMongoUser(supabaseId: string) {
    const user = await this.userModel.findOne({ supabaseId });
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  async create(createActivityDto: CreateActivityDto, supabaseId: string) {
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id;

    // 1. Initialize Activity
    const newActivity = new this.activityModel({
      ...createActivityDto,
      host: userId,
      participants: [userId],
      participantsJoined: 1,
    });

    // 2. Create the associated Group Chat
    const newChat = await this.chatModel.create({
      type: 'group',
      activity: newActivity._id,
      members: [userId],
      lastMessage: { text: 'Group created', createdAt: new Date() },
    });

    // 3. Link Chat to Activity and Save
    newActivity.chat = newChat._id;
    const savedActivity = await newActivity.save();

    // Return with chatId for the frontend
    return {
      ...savedActivity.toObject(),
      chatId: newChat._id,
    };
  }

  async joinActivity(activityId: string, supabaseId: string) {
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id;

    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    // Validation
    if (activity.participantsJoined >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    const isAlreadyJoined = activity.participants.some(
      (p) => p.toString() === userId.toString(),
    );

    if (isAlreadyJoined) {
      // If already joined, just return the existing data so frontend can navigate
      return {
        ...activity.toObject(),
        chatId: activity.chat,
      };
    }

    // 4. Update Activity (Atomic update is safer)
    const updatedActivity = await this.activityModel.findByIdAndUpdate(
      activityId,
      {
        $addToSet: { participants: userId },
        $inc: { participantsJoined: 1 },
      },
      { new: true },
    );

    // 5. Update Chat (Add member)
    // If for some reason activity.chat is missing, find it by activity ID
    let chat = await this.chatModel.findOneAndUpdate(
      { activity: activityId },
      { $addToSet: { members: userId } },
      { new: true }
    );

    // Fallback: Create chat if it somehow didn't exist
    if (!chat) {
      chat = await this.chatModel.create({
        type: 'group',
        activity: activityId,
        members: [...updatedActivity.participants],
      });
      updatedActivity.chat = chat._id;
      await updatedActivity.save();
    }

    // Return the activity object PLUS the explicit chatId for the frontend
    return {
      ...updatedActivity.toObject(),
      chatId: chat._id,
    };
  }
}