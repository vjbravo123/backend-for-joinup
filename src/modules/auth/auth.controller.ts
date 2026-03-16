import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Apply the Firebase guard so this endpoint REQUIRES a valid Firebase token
  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  syncUser(@Req() req, @Body('name') name: string) {
    // req.user is populated by the FirebaseAuthGuard (contains decoded Firebase token)
    return this.authService.syncUser(req.user, name);
  }
}