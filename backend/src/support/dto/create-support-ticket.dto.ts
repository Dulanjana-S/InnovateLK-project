import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportTicketDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(160)
  subject: string;

  @IsString()
  @MaxLength(4000)
  message: string;

  @IsOptional()
  @IsEnum(['normal', 'high'])
  priority?: 'normal' | 'high';
}
