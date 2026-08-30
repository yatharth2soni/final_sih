import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  question!: string;

  @IsOptional()
  @IsEnum(['en', 'hi'])
  language?: 'en' | 'hi';

  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}

export class AiSummarizeDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsEnum(['en', 'hi'])
  language?: 'en' | 'hi';
}

export class AiAnalyzeInspectionDto {
  @IsOptional()
  @IsUUID()
  inspectionId?: string;

  @IsNotEmpty()
  inspectionData!: any;

  @IsOptional()
  @IsEnum(['en', 'hi'])
  language?: 'en' | 'hi';
}

export class AiExplainRiskDto {
  @IsString()
  @IsNotEmpty()
  mineName!: string;

  @IsNotEmpty()
  score!: number;

  @IsString()
  @IsNotEmpty()
  band!: string;

  @IsOptional()
  factors?: any;

  @IsOptional()
  @IsEnum(['en', 'hi'])
  language?: 'en' | 'hi';
}

export class AiRecommendActionDto {
  @IsString()
  @IsNotEmpty()
  violationTitle!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  severity!: string;

  @IsOptional()
  @IsEnum(['en', 'hi'])
  language?: 'en' | 'hi';
}

export class AiClassifyDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

