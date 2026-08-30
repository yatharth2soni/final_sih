import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateCapaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsDateString()
  @IsOptional()
  dueAt?: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;
}
