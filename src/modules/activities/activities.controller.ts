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
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'; // Updated Guard

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(SupabaseAuthGuard) // Use Supabase Guard
  @Post()
  async create(@Body() createActivityDto: CreateActivityDto, @Req() req: any) {
    // Supabase user ID is in req.user.id
    const supabaseId = req.user.id;
    return this.activitiesService.create(createActivityDto, supabaseId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: any) {
    const supabaseId = req.user.id; // Use .id
    return this.activitiesService.joinActivity(id, supabaseId);
  }
}