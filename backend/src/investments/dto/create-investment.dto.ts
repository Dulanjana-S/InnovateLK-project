import { IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateInvestmentDto {
  @IsMongoId()
  patentId: string;

  @IsNumber()
  @Min(0)
  amount: number;

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
