import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Chat') private chatModel: Model<any>
  ) {}

  // Helper to find Mongo User by Supabase ID
  private async getMongoUser(supabaseId: string) {
    // Note: Ensure your User schema has a field 'supabaseId'
    const user = await this.userModel.findOne({ supabaseId });
    if (!user) throw new NotFoundException('User profile not found in database');
    return user;
  }

  async create(createActivityDto: CreateActivityDto, supabaseId: string): Promise<Activity> {
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id;

    // 1. Create the Activity with Mongo ObjectId
    const newActivity = new this.activityModel({
      ...createActivityDto,
      host: userId,
      participants: [userId],
      participantsJoined: 1,
    });

    // 2. Create the associated Group Chat
    const newChat = await this.chatModel.create({
      activity: newActivity._id,
      members: [userId],
      lastMessage: { text: 'Group created', createdAt: new Date() }
    });

    newActivity.chat = newChat._id;
    return newActivity.save();
  }

  async joinActivity(activityId: string, supabaseId: string) {
    // 1. Find the user in our DB using the Supabase ID
    const user = await this.getMongoUser(supabaseId);
    const userId = user._id;

    // 2. Find the activity
    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    // 3. Validation checks
    if (activity.participantsJoined >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    const alreadyJoined = activity.participants.some(p => p.toString() === userId.toString());
    if (alreadyJoined) {
      throw new BadRequestException('Already joined');
    }

    // 4. Update Activity
    activity.participants.push(userId);
    activity.participantsJoined += 1;
    await activity.save();

    // 5. Update Chat
    await this.chatModel.findByIdAndUpdate(activity.chat, {
      $addToSet: { members: userId },
    });

    return activity;
  }

  async findAll(): Promise<Activity[]> {
    return this.activityModel
      .find()
      .populate('host', 'name avatar') 
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).populate('host', 'name avatar').exec();
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }
}