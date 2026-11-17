import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export const SMOKE_UNITS = ['ppm', '%/m'] as const;

export class CreateSmokeSensorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200) // довжина колонки sensorName у базі
  sensorName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200) // довжина колонки location у базі
  location: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0) // концентрація не може бути від'ємною
  value: number;

  @IsNotEmpty()
  @IsIn(SMOKE_UNITS)
  unit: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  threshold?: number; // якщо не передали — береться за замовчуванням
}
