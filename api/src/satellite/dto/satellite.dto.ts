import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySatelliteDto {
  @IsOptional()
  @IsString()
  mineId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

export class AssignVerificationDto {
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
