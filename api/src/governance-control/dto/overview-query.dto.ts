import { IsOptional, IsString, IsDateString } from 'class-validator';

export class OverviewQueryDto {
  @IsOptional()
  @IsString()
  mineId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
