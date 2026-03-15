import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './jwt.strategy'; // <-- 1. Import the strategy

@Module({
  imports:[
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule, // <-- 2. Import PassportModule
    JwtModule.register({ // <-- 3. Register JwtModule
      secret: 'my_super_secret_key', // MUST MATCH the secretOrKey in JwtStrategy!
      signOptions: { expiresIn: '7d' }, // Token expires in 7 days
    }),
  ],
  controllers:[AuthController],
  providers:[
    AuthService, 
    JwtStrategy // <-- 4. ADD IT HERE! This tells Passport that the 'jwt' strategy exists
  ],
  exports: [AuthService], // Optional: good practice if other modules need auth methods
})
export class AuthModule {}