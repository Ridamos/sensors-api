import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SmokeSensor } from './entities/smoke-sensor.entity.js';
import { CreateSmokeSensorDto } from './dto/create-smoke-sensor.dto.js';
import { UpdateSmokeSensorDto } from './dto/update-smoke-sensor.dto.js';

/** Типові пороги тривоги залежно від одиниць виміру */
const DEFAULT_THRESHOLD: Record<string, number> = {
  ppm: 300,
  '%/m': 4,
};

@Injectable()
export class SmokeSensorsService {
  private sensors: SmokeSensor[] = [];

  create(dto: CreateSmokeSensorDto): SmokeSensor {
    const threshold = dto.threshold ?? DEFAULT_THRESHOLD[dto.unit];
    const sensor: SmokeSensor = {
      ...dto,
      id: uuidv4(),
      timestamp: new Date(),
      threshold,
      alarm: dto.value >= threshold,
    };
    this.sensors.push(sensor);
    return sensor;
  }

  findAll(): SmokeSensor[] {
    return this.sensors;
  }

  /** Лише ті давачі, що зараз у стані тривоги */
  findAlarms(): SmokeSensor[] {
    return this.sensors.filter((s) => s.alarm);
  }

  findOne(id: string): SmokeSensor {
    const sensor = this.sensors.find((s) => s.id === id);
    if (!sensor)
      throw new NotFoundException(`smoke sensor with id ${id} not found`);
    return sensor;
  }

  update(id: string, dto: UpdateSmokeSensorDto): SmokeSensor {
    const sensor = this.findOne(id);
    Object.assign(sensor, dto);
    sensor.timestamp = new Date(); // нове показання — новий час
    sensor.alarm = sensor.value >= sensor.threshold; // перераховуємо тривогу
    return sensor;
  }

  remove(id: string): void {
    const sensor = this.findOne(id);
    this.sensors = this.sensors.filter((s) => s.id !== sensor.id);
  }
}
