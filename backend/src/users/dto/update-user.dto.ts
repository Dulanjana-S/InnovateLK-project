import { IsString, IsOptional, IsObject, IsBoolean, IsArray } from 'class-validator';

class UserPreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}

class UserProfileDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsArray()
  @IsOptional()
  industries?: string[];

  @IsString()
  @IsOptional()
  investmentRange?: string;

  @IsString()
  @IsOptional()
  manufacturingCapacity?: string;

  @IsArray()
  @IsOptional()
  expertise?: string[];
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsObject()
  @IsOptional()
  preferences?: UserPreferencesDto;

  @IsObject()
  @IsOptional()
  profile?: UserProfileDto;
}
