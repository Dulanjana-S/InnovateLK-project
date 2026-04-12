import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsObject,
  IsDate,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  patentNumber: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  innovatorName: string;

  @IsString()
  @IsNotEmpty()
  innovatorCountry: string;

  @IsDate()
  @Type(() => Date)
  filingDate: Date;

  @IsIn(['Active', 'Pending', 'Granted', 'Expired', 'Rejected'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  fundingRequired: string;

  @IsString()
  @IsNotEmpty()
  investmentStage: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  technicalDetails?: {
    abstract?: string;
    claims?: string[];
    specifications?: string;
    drawings?: string[];
    priorArt?: string[];
  };

  @IsObject()
  @IsOptional()
  commercialization?: {
    marketSize?: string;
    targetMarket?: string[];
    competitors?: string[];
    uniqueSellingPoint?: string;
    revenueModel?: string;
    timeline?: string;
  };

  @IsArray()
  @IsOptional()
  documents?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
