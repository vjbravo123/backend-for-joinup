import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(createActivityDto: CreateActivityDto, hostId: string): Promise<Activity> {
    const newActivity = await this.activityModel.create({
      ...createActivityDto,
      host: hostId,
      participantsJoined: 1, // Host counts as the first participant
    });
    
    return newActivity;
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