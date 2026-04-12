import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class AdminModeratePatentDto {
  @IsOptional()
  @IsIn(['pending_review', 'approved', 'rejected'])
  moderationStatus?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsIn(['Active', 'Pending', 'Granted', 'Expired', 'Rejected'])
  status?: string;
}
