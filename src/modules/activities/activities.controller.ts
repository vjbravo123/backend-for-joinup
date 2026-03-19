import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // Secure this route!
  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Body() createActivityDto: CreateActivityDto, @Req() req: any) {
    // req.user.sub contains the logged-in user's ObjectId
    const hostId = req.user.sub;

    return this.activitiesService.create(createActivityDto, hostId);
  }

  // Protect the GET routes as well so only logged in users can view the feed
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub; // From Firebase Guard
    return this.activitiesService.joinActivity(id, userId);
  }
}
