import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the guard

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // Secure this route!
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createActivityDto: CreateActivityDto, @Req() req: any) {
    // req.user.sub contains the logged-in user's ObjectId
    const hostId = req.user.sub; 
    
    return this.activitiesService.create(createActivityDto, hostId);
  }

  // Protect the GET routes as well so only logged in users can view the feed
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }
}