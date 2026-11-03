import { PartialType } from '@nestjs/mapped-types';
import { CreateSmokeSensorDto } from './create-smoke-sensor.dto.js';

export class UpdateSmokeSensorDto extends PartialType(CreateSmokeSensorDto) {}
