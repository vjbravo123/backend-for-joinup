// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('sync')
  syncUser(@Req() req, @Body('name') name: string) {
    // req.user now contains the Supabase User object from SupabaseAuthGuard
    return this.authService.syncUser(req.user, name);
  }
}