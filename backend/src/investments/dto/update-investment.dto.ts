import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateInvestmentDto {
  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  returns?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  equity?: number;

  @IsOptional()
  @IsString()
  nextMilestone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
