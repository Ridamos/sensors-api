import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmokeSensor } from './entities/smoke-sensor.entity.js';
import { CreateSmokeSensorDto } from './dto/create-smoke-sensor.dto.js';
import { UpdateSmokeSensorDto } from './dto/update-smoke-sensor.dto.js';

/** Типові пороги тривоги залежно від одиниць виміру */
const DEFAULT_THRESHOLD: Record<string, number> = {
  ppm: 300,
  '%/m': 4,
};

// Скільки останніх показань віддавати клієнту.
const LAST_RECORDS = 50;

@Injectable()
export class SmokeSensorsService {
  // Замість масиву в пам'яті — репозиторій таблиці "smoke-sensors".
  constructor(
    @InjectRepository(SmokeSensor)
    private readonly smokeSensorRepository: Repository<SmokeSensor>,
  ) {}

  async create(dto: CreateSmokeSensorDto): Promise<SmokeSensor> {
    const threshold = dto.threshold ?? DEFAULT_THRESHOLD[dto.unit];
    const record = this.smokeSensorRepository.create({
      ...dto,
      threshold,
      // Правило з лаб. №1. У базу записується вже готовий результат.
      alarm: dto.value >= threshold,
    });
    return await this.smokeSensorRepository.save(record);
  }

  async findAll(): Promise<SmokeSensor[]> {
    const records = await this.smokeSensorRepository.find({
      order: { createdAt: 'DESC' },
      take: LAST_RECORDS,
    });
    return records.reverse(); // від старих до нових, як чекає клієнт
  }

  /** Лише показання в стані тривоги: SELECT … WHERE "alarm" = true */
  async findAlarms(): Promise<SmokeSensor[]> {
    const records = await this.smokeSensorRepository.find({
      where: { alarm: true },
      order: { createdAt: 'DESC' },
      take: LAST_RECORDS,
    });
    return records.reverse();
  }

  async findOne(id: string): Promise<SmokeSensor> {
    const sensor = await this.smokeSensorRepository.findOneBy({ id });
    if (!sensor)
      throw new NotFoundException(`smoke sensor with id ${id} not found`);
    return sensor;
  }

  async update(id: string, dto: UpdateSmokeSensorDto): Promise<SmokeSensor> {
    const sensor = await this.findOne(id);
    Object.assign(sensor, dto);
    sensor.timestamp = new Date(); // нове показання — новий час
    sensor.alarm = sensor.value >= sensor.threshold; // перераховуємо тривогу
    return await this.smokeSensorRepository.save(sensor);
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.smokeSensorRepository.remove(sensor);
  }
}
