import { IsBoolean, IsOptional } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
