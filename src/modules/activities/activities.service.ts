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
    @InjectModel('Chat') private chatModel: Model<any>,
  ) {}

  // Helper to find Mongo User by Supabase ID
  private async getMongoUser(supabaseId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ supabaseId });
    if (!user)
      throw new NotFoundException('User profile not found in database');
    return user;
  }

  async create(
    createActivityDto: CreateActivityDto,
    supabaseId: string,
  ): Promise<any> { // Changed return type to any to allow chatId injection
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id as Types.ObjectId;

    // 1. Create the Activity
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

    // 3. Link Chat to Activity
    newActivity.chat = newChat._id;
    const savedActivity = await newActivity.save();

    // 4. Return activity + chatId so frontend navigation works
    return {
      ...savedActivity.toObject(),
      chatId: newChat._id,
    };
  }

  async joinActivity(activityId: string, supabaseId: string): Promise<any> {
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id as Types.ObjectId;

    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    // Validation checks
    if (activity.participantsJoined >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    const alreadyJoined = activity.participants.some(
      (p) => p.toString() === userId.toString(),
    );

    if (alreadyJoined) {
      // If already joined, just return the data with chatId so frontend can navigate
      return {
        ...activity.toObject(),
        chatId: activity.chat,
      };
    }

    // 4. Update Activity (Atomic)
    const updatedActivity = await this.activityModel.findByIdAndUpdate(
      activityId,
      {
        $addToSet: { participants: userId },
        $inc: { participantsJoined: 1 },
      },
      { new: true },
    );

    if (!updatedActivity) throw new NotFoundException('Activity not found');

    // 5. Update Chat (Add user to members array)
    // We look for the chat by the activity link
    const chat = await this.chatModel.findOneAndUpdate(
      { activity: activityId },
      { $addToSet: { members: userId } },
      { new: true }
    );

    // 6. Return updated activity + chatId for the frontend 'result.chatId'
    return {
      ...updatedActivity.toObject(),
      chatId: chat?._id || updatedActivity.chat,
    };
  }

  async findAll(): Promise<Activity[]> {
    return this.activityModel
      .find()
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel
      .findById(id)
      .populate('host', 'name avatar')
      .exec();
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }
}