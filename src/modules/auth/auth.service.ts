// auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, phone, password } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      // The default values for avatar, bio, etc., are automatically applied by the schema
    });

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const { emailOrPhone, password } = loginDto;

    // Find user by email OR phone
    const user = await this.userModel.findOne({
      $or:[{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  // Helper method to generate JWT
  private generateToken(user: UserDocument) {
    // FIX 1: Explicitly call .toString() on _id so it's a plain string. 
    // This prevents the JWT service from crashing when parsing a Mongoose ObjectId.
    const payload = { sub: user._id.toString(), email: user.email };
    
    return {
      message: 'Authentication successful',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(), // Convert ObjectId to string here as well
        name: user.name,
        email: user.email,
        phone: user.phone,
        // FIX 2: Return extended profile properties so Redux receives them
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests,
        joinedCount: user.joinedCount,
        hostedCount: user.hostedCount,
      },
    };
  }
}