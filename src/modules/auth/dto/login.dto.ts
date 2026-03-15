import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  emailOrPhone: string; // Users can login with either

  @IsNotEmpty()
  @IsString()
  password: string;
}