import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemperatureSensorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200) // довжина колонки sensorName у базі
  sensorName: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20) // довжина колонки unit у базі
  unit: string;

  // Необов'язковий час вимірювання, напр. "2026-10-11T09:30:00Z".
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp?: Date;
}
