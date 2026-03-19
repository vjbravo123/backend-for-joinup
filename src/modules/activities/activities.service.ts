import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User, UserDocument } from '../auth/schemas/user.schema'; // Import User schema

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>, // Inject User Model

     @InjectModel('Chat') private chatModel: Model<any>
  ) {}

  async create(createActivityDto: CreateActivityDto, hostId: string): Promise<Activity> {
    // 1. Create the Activity first
    const newActivity = new this.activityModel({
      ...createActivityDto,
      host: hostId,
      participants: [hostId],
      participantsJoined: 1,
    });

    // 2. Create the associated Group Chat
    const newChat = await this.chatModel.create({
      activity: newActivity._id,
      members: [hostId],
      lastMessage: { text: 'Group created', createdAt: new Date() }
    });

    // 3. Link chat to activity
    newActivity.chat = newChat._id;
    return newActivity.save();
  }

    async joinActivity(activityId: string, firebaseUid: string) {
    // 1. Find the user in our DB using the Firebase UID
    const user = await this.userModel.findOne({ firebaseUid });
    if (!user) throw new NotFoundException('User not found in database');

    const userId = user._id; // This is the real 24-character MongoDB ObjectId

    // 2. Find the activity
    const activity = await this.activityModel.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');

    // 3. Validation checks
    if (activity.participantsJoined >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    // Check if already joined (comparing ObjectIds correctly)
    const alreadyJoined = activity.participants.some(p => p.toString() === userId.toString());
    if (alreadyJoined) {
      throw new BadRequestException('Already joined');
    }

    // 4. Update Activity: Add user to participants
    activity.participants.push(userId);
    activity.participantsJoined += 1;
    await activity.save();

    // 5. Update Chat: Add user to members
    await this.chatModel.findByIdAndUpdate(activity.chat, {
      $addToSet: { members: userId },
    });

    return activity;
  }

  async findAll(): Promise<Activity[]> {
    // Fetch all activities, sort by newest first, and populate the host's basic details
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

