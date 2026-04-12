import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AdminUpdateInvestmentDto {
  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  returns?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  nextMilestone?: string;
}
