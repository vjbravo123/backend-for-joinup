import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty() // ADD THIS
  @IsString()
  description: string;

  @IsOptional() // ADD THIS (matching your schema)
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsNumber()
  maxParticipants: number;

  @IsOptional()
  @IsString()
  price?: string;
}