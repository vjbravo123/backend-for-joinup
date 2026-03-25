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
      name: createActivityDto.title, // Pass the activity name here
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
  // 1. Get Mongo User ID from Supabase ID
  const user = await this.getMongoUser(supabaseId);
  const userId = user._id as Types.ObjectId;

  // 2. Find the activity first to check status
  const activity = await this.activityModel.findById(activityId);
  if (!activity) throw new NotFoundException('Activity not found');

  // 3. Validation: Check if already joined
  const alreadyJoined = activity.participants.some(
    (p) => p.toString() === userId.toString(),
  );

  if (alreadyJoined) {
    // If already joined, return existing data so frontend can still navigate to chat
    return {
      ...activity.toObject(),
      chatId: activity.chat, 
    };
  }

  // 4. Validation: Check if activity is full
  if (activity.participantsJoined >= activity.maxParticipants) {
    throw new BadRequestException('Activity is full');
  }

  // 5. Update Activity (Atomic Update)
  // $addToSet ensures no duplicate IDs, $inc increments the counter safely
  const updatedActivity = await this.activityModel.findByIdAndUpdate(
    activityId,
    {
      $addToSet: { participants: userId },
      $inc: { participantsJoined: 1 },
    },
    { new: true }, // Returns the modified document
  ).populate('host', 'name avatar');

  if (!updatedActivity) throw new NotFoundException('Activity not found');

  // 6. Update the associated Chat
  // Add the user to the chat members array
  const chat = await this.chatModel.findByIdAndUpdate(
    updatedActivity.chat,
    { $addToSet: { members: userId } },
    { new: true }
  );

  // 7. Return combined data
  // We explicitly return chatId so the frontend result.chatId is valid
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